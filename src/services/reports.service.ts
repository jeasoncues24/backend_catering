// services/reports.service.ts
import { prisma } from '../config/db';

/**
 * REPORTE DE STOCK POR CATEGORÍA
 */
export const getStockReportService = async (establishmentId: string) => {
  try {
    // Obtener productos agrupados por categoría
    const categories = await prisma.productCategory.findMany({
      where: {
        establishment_id: establishmentId,
        status: 1
      },
      include: {
        products: {
          where: {
            status: 1
          },
          select: {
            id: true,
            stock: true,
            price: true,
            eventInventory: {
              where: {
                status: { in: [1, 2] }, // Pendiente o Asignado
                agenda: {
                  status: 1 // Solo eventos confirmados
                }
              },
              select: {
                quantity_assigned: true
              }
            }
          }
        }
      }
    });

    const report = categories.map(category => {
      const total = category.products.reduce((sum, p) => sum + p.stock, 0);
      
      // Calcular reservado (asignado a eventos)
      const reserved = category.products.reduce((sum, p) => {
        const productReserved = p.eventInventory.reduce((pSum, inv) => 
          pSum + inv.quantity_assigned, 0);
        return sum + productReserved;
      }, 0);

      const available = total - reserved;
      
      // Calcular valor total
      const value = category.products.reduce((sum, p) => 
        sum + (p.stock * p.price), 0);

      return {
        category: category.name,
        total,
        available,
        reserved,
        value
      };
    });

    return report;
  } catch (error) {
    throw error;
  }
};

/**
 * REPORTE DE EVENTOS REALIZADOS
 */
export const getEventsReportService = async (
  establishmentId: string, 
  startDate?: string, 
  endDate?: string
) => {
  try {
    const whereCondition: any = {
      sale: {
        establishment_id: establishmentId
      },
      status: { in: [1, 4] } // Confirmado o Completada
    };

    if (startDate && endDate) {
      whereCondition.event_date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const events = await prisma.agenda.findMany({
      where: whereCondition,
      include: {
        sale: {
          include: {
            client: {
              select: {
                name: true
              }
            },
            cotizacion: {
              select: {
                total: true,
                packageService: {
                  select: {
                    event: {
                      select: {
                        name: true,
                        type: true
                      }
                    }
                  }
                }
              }
            },
            saleProduct: {
              select: {
                id: true
              }
            },
            saleService: {
              select: {
                id: true
              }
            }
          }
        }
      },
      orderBy: {
        event_date: 'desc'
      },
      take: 50 // Últimos 50 eventos
    });

    const report = events.map(event => ({
      date: event.event_date,
      type: event.sale?.cotizacion?.packageService?.event?.type || 'N/A',
      eventName: event.sale?.cotizacion?.packageService?.event?.name || 'Sin nombre',
      client: event.sale?.client?.name || 'Sin cliente',
      items: (event.sale?.saleProduct?.length || 0) + (event.sale?.saleService?.length || 0),
      revenue: Number(event.sale?.cotizacion?.total || 0),
      status: event.status
    }));

    return report;
  } catch (error) {
    throw error;
  }
};

/**
 * TOP EVENTOS MÁS SOLICITADOS
 */
export const getTopEventsService = async (establishmentId: string) => {
  try {
    const events = await prisma.agenda.findMany({
      where: {
        sale: {
          establishment_id: establishmentId
        },
        status: { in: [1, 4] }
      },
      include: {
        sale: {
          include: {
            cotizacion: {
              select: {
                packageService: {
                  select: {
                    event: {
                      select: {
                        type: true,
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Agrupar por tipo de evento
    const eventTypes: Record<string, number> = {};
    
    events.forEach(event => {
      const type = event.sale?.cotizacion?.packageService?.event?.type || 'Otros';
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });

    const total = events.length;

    // Convertir a array y calcular porcentajes
    const report = Object.entries(eventTypes)
      .map(([event, count]) => ({
        event,
        count,
        percentage: Math.round((count / total) * 100)
      }))
      .sort((a, b) => b.count - a.count);

    return report;
  } catch (error) {
    throw error;
  }
};

/**
 * TOP SERVICIOS
 */
export const getTopServicesService = async (establishmentId: string) => {
  try {
    const services = await prisma.saleService.findMany({
      where: {
        sale: {
          establishment_id: establishmentId,
          status: 1
        },
        status: 1
      },
      include: {
        service: {
          select: {
            name: true
          }
        }
      }
    });

    // Agrupar por servicio
    const serviceGroups: Record<string, { count: number; revenue: number }> = {};

    services.forEach(saleService => {
      const serviceName = saleService.service.name;
      if (!serviceGroups[serviceName]) {
        serviceGroups[serviceName] = { count: 0, revenue: 0 };
      }
      serviceGroups[serviceName].count += saleService.quantity;
      serviceGroups[serviceName].revenue += Number(saleService.line_total);
    });

    // Convertir a array y ordenar
    const report = Object.entries(serviceGroups)
      .map(([service, data]) => ({
        service,
        count: data.count,
        revenue: data.revenue
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10

    return report;
  } catch (error) {
    throw error;
  }
};

/**
 * TOP CLIENTES
 */
export const getTopClientsService = async (establishmentId: string) => {
  try {
    const sales = await prisma.sale.findMany({
      where: {
        establishment_id: establishmentId,
        status: 1
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Agrupar por cliente
    const clientGroups: Record<string, { 
      clientId: string; 
      name: string; 
      events: number; 
      revenue: number 
    }> = {};

    sales.forEach(sale => {
      if (sale.client) {
        const clientId = sale.client.id;
        if (!clientGroups[clientId]) {
          clientGroups[clientId] = {
            clientId,
            name: sale.client.name,
            events: 0,
            revenue: 0
          };
        }
        clientGroups[clientId].events += 1;
        clientGroups[clientId].revenue += Number(sale.total);
      }
    });

    // Convertir a array y ordenar
    const report = Object.values(clientGroups)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10

    return report;
  } catch (error) {
    throw error;
  }
};

/**
 * RESUMEN GENERAL DE REPORTES
 */
export const getReportsSummaryService = async (establishmentId: string) => {
  try {
    // Total de eventos
    const totalEvents = await prisma.agenda.count({
      where: {
        sale: {
          establishment_id: establishmentId
        },
        status: { in: [1, 4] }
      }
    });

    // Eventos del mes actual
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const eventsThisMonth = await prisma.agenda.count({
      where: {
        sale: {
          establishment_id: establishmentId
        },
        status: { in: [1, 4] },
        event_date: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      }
    });

    // Total de clientes
    const totalClients = await prisma.client.count({
      where: {
        establishment_id: establishmentId,
        status: 1
      }
    });

    // Ingresos totales
    const sales = await prisma.sale.aggregate({
      where: {
        establishment_id: establishmentId,
        status: 1
      },
      _sum: {
        total: true
      }
    });

    // Valor del stock
    const products = await prisma.product.findMany({
      where: {
        establishment_id: establishmentId,
        status: 1
      },
      select: {
        stock: true,
        price: true
      }
    });

    const stockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);

    return {
      totalEvents,
      eventsThisMonth,
      totalClients,
      totalRevenue: Number(sales._sum.total || 0),
      stockValue
    };
  } catch (error) {
    throw error;
  }
};