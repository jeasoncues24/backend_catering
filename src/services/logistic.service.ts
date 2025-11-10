import { prisma } from "../config/db"


export const getEventInventoryService = async (agendaId: string) => {
  // 1) Trae agenda + venta con relaciones necesarias
  const agenda = await prisma.agenda.findFirst({
    where: { id: agendaId, status: { not: 0 } },
    include: {
      localEvent: {
        select: {
          name: true
        }
      },
      sale: {
        include: {
          client: true,
          saleProduct: {
            include: { product: { include: { category: true } } },
          },
          saleService: {
            include: { service: { include: { category: true } } },
          },
          saleMenu: {
            include: {
              buildYourMenu: {
                include: {
                  product: { include: { category: true } },
                  typeComponentMenu: true,
                  structureMenu: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!agenda) return { status: true, data: [] as any[] };

  const saleProducts = agenda.sale?.saleProduct ?? [];
  const productIds = saleProducts.map((sp) => sp.product_id);

  // 2) Asignaciones (reservas) de ESTE evento desde EventInventory
  const eventAssignments = await prisma.eventInventory.findMany({
    where: { agenda_id: agendaId, status: 1 }, // 1: Pendiente/Activa; ajusta si usas 2:Asignado, 3:Completado para reservas
    include: {
      product: { include: { category: true } },
      warehouse: true,
    },
  });

  // 3) Reservas en TODOS los eventos (para calcular disponible global)
  const allActiveAssignments = await prisma.eventInventory.findMany({
    where: {
      status: 1,               // mismas reglas que arriba para "activo"
      product_id: { in: productIds },
    },
    select: {
      product_id: true,
      quantity_assigned: true,
    },
  });

  // 4) Reducir los arreglos a mapas
  type Ware = { id: string; name: string; qty: number };

  const assignedThisEventMap: Record<string, { total: number; warehouses: Ware[] }> = {};
  for (const row of eventAssignments) {
    const pid = row.product_id;
    const qty = row.quantity_assigned ?? 0;
    const wId = row.warehouse_id ?? "unknown";
    const wName = row.warehouse?.name ?? "Sin almacén";

    if (!assignedThisEventMap[pid]) assignedThisEventMap[pid] = { total: 0, warehouses: [] };
    assignedThisEventMap[pid].total += qty;

    const ex = assignedThisEventMap[pid].warehouses.find((w) => w.id === wId);
    if (ex) ex.qty += qty;
    else assignedThisEventMap[pid].warehouses.push({ id: wId, name: wName, qty });
  }

  const reservedAllMap: Record<string, number> = {};
  for (const row of allActiveAssignments) {
    reservedAllMap[row.product_id] = (reservedAllMap[row.product_id] ?? 0) + (row.quantity_assigned ?? 0);
  }

  // 5) Construir inventario de productos para UI
  const inventoryProducts = saleProducts.map((sp) => {
    const required = Number(sp.quantity) || 0;

    const productStock = Number(sp.product?.stock ?? 0); // stock total del producto
    const reservedAll = reservedAllMap[sp.product_id] ?? 0; // reservado en TODOS los eventos
    const available = Math.max(productStock - reservedAll, 0); // disponible para asignar

    console.log({productStock})

    console.log({ reservedAll })
    console.log({ available })

    const thisEvent = assignedThisEventMap[sp.product_id];
    const assignedToEvent = thisEvent?.total ?? 0;
    const warehouses = thisEvent?.warehouses ?? [];

    const status =
      available === 0 ? "none" : available < required ? "low" : "ok";

    return {
      id: sp.id,
      type: "product" as const,
      product_id: sp.product_id,
      name: sp.product?.name || sp.description || "Producto sin nombre",
      category: sp.product?.category?.name || "Sin categoría",
      image: sp.product?.image ?? null,
      quantity_required: required,                // vendido
      quantity_available: available,              // stock disponible (stock - reservas activas)
      quantity_assigned_to_event: assignedToEvent,// lo que ya reservaste para este evento
      warehouses,                                 // detalle por almacén del evento (si quieres mostrar desde dónde)
      status,                                     // ok | low | none
      notes: sp.description ?? null,
    };
  });

  // 6) Servicios (no llevan stock/almacén en tu schema)
  const inventoryServices = (agenda.sale?.saleService ?? []).map((ss) => ({
    id: ss.id,
    type: "service" as const,
    service_id: ss.service_id,
    name: ss.service?.name || ss.description || "Servicio sin nombre",
    category: ss.service?.category?.name || "Sin categoría",
    image: ss.service?.image ?? null,
    quantity_required: Number(ss.quantity) || 0,
    quantity_available: 0,
    quantity_assigned_to_event: 0,
    warehouses: [] as Ware[],
    status: "none" as const,
    notes: ss.description ?? null,
  }));

  // 7) Menú (no descuenta stock por sí solo; si quisieras, deberías mapearlo a Product)
  const inventoryMenus = (agenda.sale?.saleMenu ?? []).map((sm) => ({
    id: sm.id,
    type: "menu" as const,
    description: sm.description || "Ítem de menú",
    quantity_required: Number(sm.quantity) || 0,
    quantity_available: 0,
    quantity_assigned_to_event: 0,
    warehouses: [] as Ware[],
    status: "none" as const,
    buildYourMenu: {
      id: sm.buildYourMenu.id,
      product_id: sm.buildYourMenu.product_id,
      type_component_menu_id: sm.buildYourMenu.type_component_menu_id,
      structureMenuId: sm.buildYourMenu.structureMenuId,
      product_name: sm.buildYourMenu.product?.name ?? null,
      category: sm.buildYourMenu.product?.category?.name ?? null,
    },
  }));

  const enriched = {
    ...agenda,
    inventory: {
      products: inventoryProducts,
      services: inventoryServices,
      menus: inventoryMenus,
    },
  };

  return { status: true, data: [enriched] };
};

export const updateProductInventoryService = async (
  inventoryId: string,
  quantity_assigned: number,
  warehouse_id?: string,
  notes?: string
) => {
  const inventory = await prisma.eventInventory.findUnique({
    where: { id: inventoryId }
  })

  if (!inventory) {
    throw new Error("Inventario no encontrado")
  }

  // Determinar el estado basado en las cantidades
  let status = 1 // Pendiente
  if (quantity_assigned >= inventory.quantity_required) {
    status = 3 // Completado
  } else if (quantity_assigned > 0) {
    status = 2 // Asignado parcialmente
  }

  // CORRECCIÓN: Construir el objeto data condicionalmente
  const updateData: any = {
    quantity_assigned,
    status
  }

  // Solo agregar warehouse_id si tiene valor
  if (warehouse_id !== undefined) {
    updateData.warehouse_id = warehouse_id
  }

  // Solo agregar notes si tiene valor
  if (notes !== undefined) {
    updateData.notes = notes
  }

  const updated = await prisma.eventInventory.update({
    where: { id: inventoryId },
    data: updateData,
    include: {
      product: true,
      warehouse: true
    }
  })

  return updated
}

export const getAvailableProductsService = async (establishmentId: string) => {
  const warehouses = await prisma.warehouse.findMany({
    where: {
      establishmentId,
      status: 1
    },
    include: {
      GuidesDetails: {
        where: {
          status: 1
        },
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    }
  })

  // Agrupar productos por almacén con stock disponible
  const productsWithStock = warehouses.map((warehouse: any) => ({
    warehouse_id: warehouse.id,
    warehouse_name: warehouse.name,
    products: warehouse.GuidesDetails.reduce((acc: any[], detail: any) => {
      const existingProduct = acc.find(p => p.product_id === detail.product_id)
      
      if (existingProduct) {
        existingProduct.quantity += detail.quantity
      } else {
        acc.push({
          product_id: detail.product_id,
          product_name: detail.product.name,
          category: detail.product.category.name,
          quantity: detail.quantity,
          product_details: detail.product
        })
      }
      
      return acc
    }, [])
  }))

  return productsWithStock
}

export const assignProductToEventService = async ({
  agendaId,
  productId,
  quantity,
  warehouseId
}: {
  agendaId: string
  productId: string
  quantity: number
  warehouseId?: string
}) => {
  // Verificar si ya existe el registro
  const existing = await prisma.eventInventory.findFirst({
    where: {
      agenda_id: agendaId,
      product_id: productId
    }
  })

  if (existing) {
    // Construir objeto de actualización condicionalmente
    const updateData: any = {
      quantity_required: existing.quantity_required + quantity
    }

    if (warehouseId !== undefined) {
      updateData.warehouse_id = warehouseId
    }

    return await prisma.eventInventory.update({
      where: { id: existing.id },
      data: updateData,
      include: {
        product: true,
        warehouse: true
      }
    })
  }

  // Crear nuevo - construir data condicionalmente
  const createData: any = {
    agenda_id: agendaId,
    product_id: productId,
    quantity_required: quantity,
    status: 1
  }

  if (warehouseId !== undefined) {
    createData.warehouse_id = warehouseId
  }

  const created = await prisma.eventInventory.create({
    data: createData,
    include: {
      product: true,
      warehouse: true
    }
  })

  return created
}