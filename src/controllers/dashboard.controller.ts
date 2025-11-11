import { Request, Response } from "express";
import { prisma } from "../config/db";

// ============ HELPER FUNCTIONS ============

const toNum = (val: any): number => {
  // 1. Si es un número nativo de JS
  if (typeof val === 'number') return val;

  // 2. Si es un objeto Decimal (o similar) de Prisma, lo convertimos a string y luego a float.
  // Esto asume que el objeto tiene un método toString().
  if (val && typeof val === 'object' && typeof val.toString === 'function') {
    return parseFloat(val.toString()) || 0;
  }
  
  // 3. Si es un string (para campos directos de la BD que no son Decimal)
  if (typeof val === 'string') return parseFloat(val) || 0;
  
  // 4. Cualquier otra cosa
  return 0;
};

/**
 * Convierte una fecha de Lima (YYYY-MM-DD) al inicio/fin del día
 * IMPORTANTE: Las fechas en la BD están guardadas en hora Lima, NO en UTC
 */
function limaDateToDBFormat(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Crear fecha directamente como está en la BD (hora Lima sin conversión)
  // Usamos Date.UTC pero interpretamos que es hora Lima
  return new Date(Date.UTC(year!, month! - 1, day!, 0, 0, 0, 0));
}

/**
 * Obtiene el inicio del mes para una fecha
 */
function startOfMonth(date: Date): Date {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}

/**
 * Suma meses a una fecha
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setUTCMonth(result.getUTCMonth() + months);
  return result;
}

/**
 * Resuelve el rango de fechas
 * Las fechas en BD están en hora Lima (sin zona horaria real)
 */
function resolveDateRange(from?: string, to?: string) {
  // Obtener fecha actual en Lima
  const nowUtc = new Date();
  const limaStr = nowUtc.toLocaleString("en-US", { timeZone: "America/Lima" });
  const nowLima = new Date(limaStr);
  
  const todayStr = `${nowLima.getFullYear()}-${String(nowLima.getMonth() + 1).padStart(2, "0")}-${String(nowLima.getDate()).padStart(2, "0")}`;

  const fromStr = from || todayStr;
  const toStr = to || todayStr;

  // Convertir a formato de BD (hora Lima directa)
  const fromDate = limaDateToDBFormat(fromStr);
  const toDate = limaDateToDBFormat(toStr);
  
  // Fin del día = inicio del día siguiente
  const toDatePlus1Day = new Date(toDate.getTime() + 86400000);

  // Calcular periodo anterior
  const diffMs = toDate.getTime() - fromDate.getTime();
  const diffDays = Math.floor(diffMs / 86400000) + 1;
  
  const prevFromDate = new Date(fromDate.getTime() - (diffDays * 86400000));
  const prevToDatePlus1Day = fromDate;

  return {
    fromDate,
    toDatePlus1Day,
    prevFromDate,
    prevToDatePlus1Day,
    echo: {
      from: fromDate,
      to: toDate,
      prevFrom: prevFromDate,
      prevTo: new Date(prevToDatePlus1Day.getTime() - 1),
    },
  };
}

/**
 * Construye serie horaria de ventas
 */
function buildHourlySeries(fromDate: Date, toDatePlus1Day: Date, sales: any[]) {
  const hourlyMap = new Map<number, number>();
  
  for (const sale of sales) {
    const saleDate = new Date(sale.createdAt);
    const hour = saleDate.getUTCHours(); // Las fechas ya están en hora Lima
    
    hourlyMap.set(hour, (hourlyMap.get(hour) || 0) + toNum(sale.total));
  }

  const result = [];
  for (let h = 0; h < 24; h++) {
    result.push({
      hour: `${h.toString().padStart(2, "0")}:00`,
      ventas: Math.round(hourlyMap.get(h) || 0),
    });
  }

  return result;
}

// ============ CONTROLLERS ============

export const summaryReportController = async (req: Request, res: Response) => {
  try {
    const establishmentIdRaw = (req.query.establihsmentId ?? req.query.establishmentId) as string | undefined;
    const tz = (req.query.tz as string) || "America/Lima";
    
    if (!establishmentIdRaw) {
      return res.status(400).json({ 
        status: false, 
        message: "Falta 'establishmentId' en query." 
      });
    }
    
    const establishmentId = String(establishmentIdRaw);

    const { fromDate, toDatePlus1Day, prevFromDate, prevToDatePlus1Day, echo } = resolveDateRange(
      req.query.from as any,
      req.query.to as any,
    );

    // Ventas del período
    const [salesRange, salesPrev] = await Promise.all([
      prisma.sale.findMany({
        where: {
          establishment_id: establishmentId,
          status: 2,
          createdAt: { gte: fromDate, lt: toDatePlus1Day },
        },
        select: { id: true, total: true, createdAt: true },
      }),
      prisma.sale.findMany({
        where: {
          establishment_id: establishmentId,
          status: 2,
          createdAt: { gte: prevFromDate, lt: prevToDatePlus1Day },
        },
        select: { id: true, total: true, createdAt: true },
      }),
    ]);

    const totalVentas = salesRange.reduce((acc: any, s: any) => acc + toNum(s.total), 0);
    const totalPrev = salesPrev.reduce((acc: any, s: any) => acc + toNum(s.total), 0);
    const changePct = totalPrev > 0 
      ? ((totalVentas - totalPrev) / totalPrev) * 100 
      : (totalVentas > 0 ? 100 : 0);

    // Stock total
    const products = await prisma.product.findMany({
      where: { establishment_id: establishmentId, status: 1 },
      select: { stock: true },
    });
    const stockTotal = products.reduce((acc: any, p: any) => acc + (p.stock ?? 0), 0);

    // Clientes activos
    const clientesActivos = await prisma.client.count({
      where: { establishment_id: establishmentId, status: 1 },
    });

    // Eventos en rango
    const agendas = await prisma.agenda.findMany({
      where: {
        status: { in: [1, 2] },
        event_date: { gte: fromDate, lt: toDatePlus1Day },
        sale: { establishment_id: establishmentId, status: 2 },
      },
      select: { id: true, event_date: true, sale_id: true },
    });
    const eventosEnRango = agendas.length;

    // Serie por hora
    const performanceData = buildHourlySeries(fromDate, toDatePlus1Day, salesRange);

    // Serie mensual (últimos 5 meses)
    const monthWindowFrom = startOfMonth(addMonths(fromDate, -5));

    const agendasForMonths = await prisma.agenda.findMany({
      where: {
        status: { in: [1, 2] },
        sale: { establishment_id: establishmentId, status: 2 },
        event_date: { gte: monthWindowFrom, lt: toDatePlus1Day },
      },
      select: { id: true, event_date: true },
    });

    const monthKey = (d: Date) => {
      return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
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
        createdAt: { gte: monthWindowFrom, lt: toDatePlus1Day },
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

    // Stock por categoría
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

    // KPIs
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
        performanceData,
        monthlyChartData,
        stockData,
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

export const getKPIsController = async (req: Request, res: Response) => {
  try {
    const establishmentId = req.query.establishmentId as string;
    
    if (!establishmentId) {
      return res.status(400).json({ 
        status: false, 
        message: "Falta 'establishmentId'" 
      });
    }

    const { fromDate, toDatePlus1Day, prevFromDate, prevToDatePlus1Day } = 
      resolveDateRange(
        req.query.from as string,
        req.query.to as string
      );

    const [salesRange, salesPrev, products, clientes, agendas] = await Promise.all([
      prisma.sale.findMany({
        where: {
          establishment_id: establishmentId,
          status: 2,
          createdAt: { gte: fromDate, lt: toDatePlus1Day },
        },
        select: { total: true },
      }),
      prisma.sale.findMany({
        where: {
          establishment_id: establishmentId,
          status: 2,
          createdAt: { gte: prevFromDate, lt: prevToDatePlus1Day },
        },
        select: { total: true },
      }),
      prisma.product.findMany({
        where: { establishment_id: establishmentId, status: 1 },
        select: { stock: true },
      }),
      prisma.client.count({
        where: { establishment_id: establishmentId, status: 1 },
      }),
      prisma.agenda.findMany({
        where: {
          status: { in: [1, 2] },
          event_date: { gte: fromDate, lt: toDatePlus1Day },
          sale: { establishment_id: establishmentId, status: 2 },
        },
      }),
    ]);

    const totalVentas = salesRange.reduce((acc: any, s: any) => acc + toNum(s.total), 0);
    const totalPrev = salesPrev.reduce((acc: any, s: any) => acc + toNum(s.total), 0);
    const changePct = totalPrev > 0 
      ? ((totalVentas - totalPrev) / totalPrev) * 100 
      : (totalVentas > 0 ? 100 : 0);

    const stockTotal = products.reduce((acc: any, p: any) => acc + (p.stock ?? 0), 0);

    return res.status(200).json({
      status: true,
      kpis: {
        totalVentas: {
          label: "Total en ventas",
          value: `S/ ${totalVentas.toLocaleString("es-PE", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          change: `${changePct >= 0 ? "+" : ""}${changePct.toFixed(0)}%`,
        },
        allKpiData: [
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
            value: agendas.length.toString(),
            change: "",
            icon: "ShoppingCart",
            color: "bg-green-100 text-green-600",
          },
          {
            label: "Clientes Activos",
            value: clientes.toString(),
            change: "",
            icon: "Users",
            color: "bg-purple-100 text-purple-600",
          },
        ],
      },
    });
  } catch (error: any) {
    console.error("Error en getKPIsController:", error);
    return res.status(500).json({
      status: false,
      message: error?.message ?? String(error),
    });
  }
};

export const getChartsController = async (req: Request, res: Response) => {
  try {
    const establishmentId = req.query.establishmentId as string;
    
    if (!establishmentId) {
      return res.status(400).json({ 
        status: false, 
        message: "Falta 'establishmentId'" 
      });
    }

    const { fromDate, toDatePlus1Day } = resolveDateRange(
      req.query.from as string,
      req.query.to as string
    );

    const monthWindowFrom = startOfMonth(addMonths(fromDate, -5));

    const [salesRange, productsWithCategory, agendasForMonths, salesForMonths] = await Promise.all([
      prisma.sale.findMany({
        where: {
          establishment_id: establishmentId,
          status: 2,
          createdAt: { gte: fromDate, lt: toDatePlus1Day },
        },
        select: { total: true, createdAt: true },
      }),
      prisma.product.findMany({
        where: { establishment_id: establishmentId, status: 1 },
        select: { stock: true, category: { select: { name: true } } },
      }),
      prisma.agenda.findMany({
        where: {
          status: { in: [1, 2] },
          sale: { establishment_id: establishmentId, status: 2 },
          event_date: { gte: monthWindowFrom, lt: toDatePlus1Day },
        },
        select: { id: true, event_date: true },
      }),
      prisma.sale.findMany({
        where: {
          establishment_id: establishmentId,
          status: 2,
          createdAt: { gte: monthWindowFrom, lt: toDatePlus1Day },
        },
        select: { total: true, createdAt: true },
      }),
    ]);

    const performanceData = buildHourlySeries(fromDate, toDatePlus1Day, salesRange);

    const monthKey = (d: Date) => {
      return `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    };

    const monthEventos = new Map<string, number>();
    for (const a of agendasForMonths) {
      const key = monthKey(new Date(a.event_date));
      monthEventos.set(key, (monthEventos.get(key) ?? 0) + 1);
    }

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

    return res.status(200).json({
      status: true,
      charts: {
        performanceData,
        monthlyChartData,
        stockData,
      },
    });
  } catch (error: any) {
    console.error("Error en getChartsController:", error);
    return res.status(500).json({
      status: false,
      message: error?.message ?? String(error),
    });
  }
};