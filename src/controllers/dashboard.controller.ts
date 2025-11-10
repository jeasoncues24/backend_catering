import { Request, Response } from "express";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// --------------------- Utils numéricos ---------------------
const toNum = (v: any) =>
  v && typeof v?.toNumber === "function" ? v.toNumber() : Number(v ?? 0);

// ===================== TZ helpers (America/Lima, UTC-5) =====================
// Construidos con Intl.DateTimeFormat.formatToParts para no depender del TZ del host.

function getLimaYMD(instantUtc: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instantUtc);
  const y = Number(parts.find(p => p.type === "year")!.value);
  const m = Number(parts.find(p => p.type === "month")!.value); // 1..12
  const d = Number(parts.find(p => p.type === "day")!.value);   // 1..31
  return { y, m, d };
}

// 00:00 Lima => 05:00Z del mismo día
function startOfDayLimaUTC(instantUtc: Date) {
  const { y, m, d } = getLimaYMD(instantUtc);
  return new Date(Date.UTC(y, m - 1, d, 5, 0, 0, 0));
}

// 23:59:59.999 Lima => (siguiente día 05:00Z) - 1ms
function endOfDayLimaUTC(instantUtc: Date) {
  const { y, m, d } = getLimaYMD(instantUtc);
  const nextStart = new Date(Date.UTC(y, m - 1, d + 1, 5, 0, 0, 0));
  return new Date(nextStart.getTime() - 1);
}

// Inicio de mes (día 1 00:00 Lima) en UTC
function startOfMonthLimaUTC(instantUtc: Date) {
  const { y, m } = getLimaYMD(instantUtc);
  return new Date(Date.UTC(y, m - 1, 1, 5, 0, 0, 0));
}

// Sumar meses en calendario Lima (devuelve 00:00 Lima del nuevo mes en UTC)
function addMonthsLimaUTC(instantUtc: Date, months: number) {
  const { y, m } = getLimaYMD(instantUtc);
  return new Date(Date.UTC(y, (m - 1) + months, 1, 5, 0, 0, 0));
}

// Resuelve rango; si vienen from/to, SIEMPRE los interpreta como días Lima completos.
function resolveDateRangeTZLima(inputFrom?: string | string[], inputTo?: string | string[]) {
  const fromStr = Array.isArray(inputFrom) ? inputFrom[0] : inputFrom;
  const toStr = Array.isArray(inputTo) ? inputTo[0] : inputTo;

  if (fromStr && toStr) {
    // Parsear fechas como YYYY-MM-DD en zona Lima
    const [yFrom, mFrom, dFrom] = fromStr.split('-').map(Number);
    const [yTo, mTo, dTo] = toStr.split('-').map(Number);
    
    if (isNaN(yFrom!) || isNaN(mFrom!) || isNaN(dFrom!) || isNaN(yTo!) || isNaN(mTo!) || isNaN(dTo!)) {
      throw new Error("Parámetros de fecha inválidos. Usa formato YYYY-MM-DD.");
    }
    
    // 00:00 Lima del día 'from' => +5 UTC
    const fromUtc = new Date(Date.UTC(yFrom!, mFrom! - 1, dFrom, 5, 0, 0, 0));
    // 23:59:59.999 Lima del día 'to' => siguiente día a las 05:00 UTC - 1ms
    const toUtcPlus1ms = new Date(Date.UTC(yTo!, mTo! - 1, dTo! + 1, 5, 0, 0, 0));
    const toUtc = new Date(toUtcPlus1ms.getTime() - 1);

    const duration = toUtc.getTime() - fromUtc.getTime() + 1;
    const prevFromUtc = new Date(fromUtc.getTime() - duration);
    const prevToUtc = new Date(fromUtc.getTime() - 1);

    return {
      fromUtc,
      toUtcPlus1ms,
      prevFromUtc,
      prevToUtcPlus1ms: new Date(prevToUtc.getTime() + 1),
      echo: { 
        from: fromUtc, 
        to: toUtc, 
        prevFrom: prevFromUtc, 
        prevTo: prevToUtc 
      },
    };
  }

  // Sin parámetros: HOY en Lima
  const nowUtc = new Date();
  const { y, m, d } = getLimaYMD(nowUtc);
  
  // 00:00 de hoy en Lima
  const fromUtc = new Date(Date.UTC(y, m - 1, d, 5, 0, 0, 0));
  // 23:59:59.999 de hoy en Lima (mañana 05:00 UTC)
  const toUtcPlus1ms = new Date(Date.UTC(y, m - 1, d + 1, 5, 0, 0, 0));
  const toUtc = new Date(toUtcPlus1ms.getTime() - 1);

  const duration = toUtc.getTime() - fromUtc.getTime() + 1;
  const prevFromUtc = new Date(fromUtc.getTime() - duration);
  const prevToUtc = new Date(fromUtc.getTime() - 1);

  return {
    fromUtc,
    toUtcPlus1ms,
    prevFromUtc,
    prevToUtcPlus1ms: new Date(prevFromUtc.getTime() + duration),
    echo: { 
      from: fromUtc, 
      to: toUtc, 
      prevFrom: prevFromUtc, 
      prevTo: prevToUtc 
    },
  };
}

// ===================== Series =====================

function buildHourlySeries(
  fromUtc: Date,
  toUtcPlus1ms: Date,
  sales: { createdAt: Date; total: Prisma.Decimal | number | null }[],
) {
  // Etiqueta por hora local Lima: "HH:00"
  const buckets = new Map<string, number>();
  const start = new Date(fromUtc);
  start.setUTCMinutes(0, 0, 0);

  for (let t = start.getTime(); t < toUtcPlus1ms.getTime(); t += 3600_000) {
    const label = new Date(t).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Lima",
    });
    if (!buckets.has(label)) buckets.set(label, 0);
  }

  for (const s of sales) {
    const label = new Date(s.createdAt).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "America/Lima",
    });
    if (buckets.has(label)) {
      buckets.set(label, (buckets.get(label) ?? 0) + toNum(s.total));
    }
  }

  return Array.from(buckets.entries()).map(([hour, ventas]) => ({ hour, ventas }));
}

// ===================== Controlador =====================

export const summaryReportController = async (req: Request, res: Response) => {
  try {
    // Acepta ambos por el typo común
    const establishmentIdRaw = (req.query.establihsmentId ?? req.query.establishmentId) as string | undefined;
    const tz = (req.query.tz as string) || "America/Lima";
    if (!establishmentIdRaw) {
      return res.status(400).json({ status: false, message: "Falta 'establishmentId' en query." });
    }
    const establishmentId = String(establishmentIdRaw);

    // ============ DEBUG: Ver TODAS las ventas primero ============
    console.log("\n========================================");
    console.log("🔍 DEBUGGING - TODAS LAS VENTAS");
    console.log("========================================");
    
    const allSales = await prisma.sale.findMany({
      where: { 
        establishment_id: establishmentId,
        status: 2
      },
      select: { 
        id: true, 
        total: true, 
        createdAt: true 
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`📊 Total ventas con status=2: ${allSales.length}`);
    console.log("\nÚltimas 10 ventas:");
    allSales.forEach((s, idx) => {
      const limaDate = new Date(s.createdAt).toLocaleString("es-PE", {
        timeZone: "America/Lima",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
      console.log(`  ${idx + 1}. ID: ${s.id}`);
      console.log(`     Fecha UTC: ${s.createdAt.toISOString()}`);
      console.log(`     Fecha Lima: ${limaDate}`);
      console.log(`     Total: S/ ${toNum(s.total)}`);
      console.log("");
    });

    // Rango (en UTC), usando to exclusivo
    const { fromUtc, toUtcPlus1ms, prevFromUtc, prevToUtcPlus1ms, echo } = resolveDateRangeTZLima(
      req.query.from as any,
      req.query.to as any,
    );

    // ============ DEBUG: Rango de búsqueda ============
    console.log("========================================");
    console.log("📅 RANGO DE BÚSQUEDA");
    console.log("========================================");
    console.log("Parámetros recibidos:");
    console.log(`  from: ${req.query.from || '(no especificado - usa HOY)'}`);
    console.log(`  to: ${req.query.to || '(no especificado - usa HOY)'}`);
    console.log("\nRango calculado (UTC):");
    console.log(`  fromUtc: ${fromUtc.toISOString()}`);
    console.log(`  toUtcPlus1ms: ${toUtcPlus1ms.toISOString()}`);
    console.log("\nRango en hora Lima:");
    console.log(`  Desde: ${fromUtc.toLocaleString("es-PE", { timeZone: "America/Lima" })}`);
    console.log(`  Hasta: ${new Date(toUtcPlus1ms.getTime() - 1).toLocaleString("es-PE", { timeZone: "America/Lima" })}`);
    console.log(`  Establishment ID: ${establishmentId}`);
    console.log("========================================\n");

    // Contar ventas en el rango
    const debugCount = await prisma.sale.count({
      where: { 
        establishment_id: establishmentId, 
        status: 2, 
        createdAt: { gte: fromUtc, lt: toUtcPlus1ms } 
      },
    });
    console.log(`✅ Ventas encontradas en el rango: ${debugCount}\n`);

    // Si no hay ventas, mostrar las más cercanas
    if (debugCount === 0 && allSales.length > 0) {
      console.log("⚠️  No se encontraron ventas en el rango especificado.");
      console.log("💡 Sugerencia: Verifica las fechas arriba. La venta más reciente es:");
      if (allSales[0]) {
        const limaRecent = new Date(allSales[0].createdAt).toLocaleString("es-PE", {
          timeZone: "America/Lima"
        });
        console.log(`   ${limaRecent} (${allSales[0].createdAt.toISOString()})`);
      }
      console.log("");
    }

    // ---------------- Ventas (status=2) rango y periodo previo ----------------
    const [salesRange, salesPrev] = await Promise.all([
      prisma.sale.findMany({
        where: {
          establishment_id: establishmentId,
          status: 2, // pagado
          createdAt: { gte: fromUtc, lt: toUtcPlus1ms },
        },
        select: { id: true, total: true, createdAt: true },
      }),
      prisma.sale.findMany({
        where: {
          establishment_id: establishmentId,
          status: 2,
          createdAt: { gte: prevFromUtc, lt: prevToUtcPlus1ms },
        },
        select: { id: true, total: true, createdAt: true },
      }),
    ]);

    const totalVentas = salesRange.reduce((acc, s) => acc + toNum(s.total), 0);
    const totalPrev = salesPrev.reduce((acc, s) => acc + toNum(s.total), 0);
    const changePct = totalPrev > 0 ? ((totalVentas - totalPrev) / totalPrev) * 100 : (totalVentas > 0 ? 100 : 0);

    console.log(`💰 Total ventas período actual: S/ ${totalVentas.toFixed(2)}`);
    console.log(`💰 Total ventas período anterior: S/ ${totalPrev.toFixed(2)}`);
    console.log(`📈 Cambio: ${changePct >= 0 ? '+' : ''}${changePct.toFixed(1)}%\n`);

    // ---------------- Stock total ----------------
    const products = await prisma.product.findMany({
      where: { establishment_id: establishmentId, status: 1 },
      select: { stock: true },
    });
    const stockTotal = products.reduce((acc, p) => acc + (p.stock ?? 0), 0);

    // ---------------- Clientes activos ----------------
    const clientesActivos = await prisma.client.count({
      where: { establishment_id: establishmentId, status: 1 },
    });

    // ---------------- Eventos en rango (Agenda) ----------------
    const agendas = await prisma.agenda.findMany({
      where: {
        status: { in: [1, 2] }, // Confirmado o Pendiente
        event_date: { gte: fromUtc, lt: toUtcPlus1ms },
        sale: { establishment_id: establishmentId, status: 2 }, // venta pagada
      },
      select: { id: true, event_date: true, sale_id: true },
    });
    const eventosEnRango = agendas.length;

    // ---------------- Serie por hora (ventas) ----------------
    const performanceData = buildHourlySeries(fromUtc, toUtcPlus1ms, salesRange);

    // ---------------- Serie mensual (últimos 5 meses dentro de la ventana) ----------------
    const monthWindowFromUtc = startOfMonthLimaUTC(addMonthsLimaUTC(fromUtc, -5));

    const agendasForMonths = await prisma.agenda.findMany({
      where: {
        status: { in: [1, 2] },
        sale: { establishment_id: establishmentId, status: 2 },
        event_date: { gte: monthWindowFromUtc, lt: toUtcPlus1ms },
      },
      select: { id: true, event_date: true },
    });

    const monthKey = (d: Date) => {
      const lima = new Date(d.toLocaleString("en-US", { timeZone: "America/Lima" }));
      return `${lima.getFullYear()}-${lima.getMonth()}`;
    };

    const monthEventos = new Map<string, number>();
    for (const a of agendasForMonths) {
      const key = monthKey(new Date(a.event_date));
      monthEventos.set(key, (monthEventos.get(key) ?? 0) + 1);
    }

    const salesForMonths = await prisma.sale.findMany({
      where: {
        establishment_id: establishmentId,
        status: 2,
        createdAt: { gte: monthWindowFromUtc, lt: toUtcPlus1ms },
      },
      select: { total: true, createdAt: true },
    });

    const monthIngresos = new Map<string, number>();
    for (const s of salesForMonths) {
      const key = monthKey(new Date(s.createdAt));
      monthIngresos.set(key, (monthIngresos.get(key) ?? 0) + toNum(s.total));
    }

    const meses = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
    const allKeys = Array.from(new Set([...monthIngresos.keys(), ...monthEventos.keys()]))
      .map(k => {
        const [y, m] = k.split("-").map(Number);
        return { key: k, year: y, m };
      })
      .sort((a: any, b: any) => (a.year - b.year) || (a.m - b.m))
      .slice(-5);

    const monthlyChartData = allKeys.map(({ key, m }) => ({
      month: meses[m!],
      eventos: monthEventos.get(key) ?? 0,
      ingresos: Math.round(monthIngresos.get(key) ?? 0),
    }));

    // ---------------- Desglose de stock por categoría (en %) ----------------
    const productsWithCategory = await prisma.product.findMany({
      where: { establishment_id: establishmentId, status: 1 },
      select: { stock: true, category: { select: { name: true } } },
    });

    const stockByCategory = new Map<string, number>();
    let stockSum = 0;
    for (const p of productsWithCategory) {
      const cat = p.category?.name ?? "Sin categoría";
      const qty = p.stock ?? 0;
      stockByCategory.set(cat, (stockByCategory.get(cat) ?? 0) + qty);
      stockSum += qty;
    }
    const stockData = Array.from(stockByCategory.entries()).map(([name, qty]) => ({
      name,
      value: stockSum > 0 ? Math.round((qty / stockSum) * 100) : 0,
    }));

    // ---------------- KPIs ----------------
    const allKpiData = [
      {
        label: "Total de ventas",
        value: totalVentas.toLocaleString("es-PE"),
        change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(0)}%`,
        icon: "DollarSign",
        color: "bg-green-100 text-green-600",
      },
      {
        label: "Stock Total",
        value: stockTotal.toLocaleString("es-PE"),
        change: "",
        icon: "Package",
        color: "bg-blue-100 text-blue-600",
      },
      {
        label: "Eventos en rango",
        value: eventosEnRango.toString(),
        change: "",
        icon: "ShoppingCart",
        color: "bg-green-100 text-green-600",
      },
      {
        label: "Clientes Activos",
        value: clientesActivos.toString(),
        change: "",
        icon: "Users",
        color: "bg-purple-100 text-purple-600",
      },
    ];

    console.log("✅ Respuesta generada exitosamente\n");

    return res.status(200).json({
      status: true,
      range: {
        from: echo.from.toISOString(),
        to: echo.to.toISOString(),
        prevFrom: echo.prevFrom.toISOString(),
        prevTo: echo.prevTo.toISOString(),
        tz,
      },
      kpis: {
        totalVentas: {
          label: "Total en ventas",
          value: `S/ ${totalVentas.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(0)}%`,
        },
        allKpiData,
      },
      charts: {
        performanceData,   // [{ hour: "HH:00", ventas }]
        monthlyChartData,  // últimos 5 meses presentes
        stockData,         // porcentajes por categoría
      },
    });
  } catch (error: any) {
    console.error("❌ ERROR:", error);
    return res.status(500).json({
      status: false,
      message: error?.message ?? String(error),
    });
  }
};