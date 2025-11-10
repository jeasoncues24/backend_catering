import { Request, Response } from 'express'
import { assignProductToEventService, getAvailableProductsService, getEventInventoryService, updateProductInventoryService } from '../services/logistic.service'
import { prisma } from '../config/db'


interface ColaboradorServicePayload {
    colaboradorId: string;
    agendaId: string;
    serviceId: string;
}

export const createColaboradorServiceController = async (req: Request, res: Response) => {
  try {
    const reservations: ColaboradorServicePayload[] = req.body;

    if (!reservations || reservations.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Se requiere una lista de asignaciones (reservations) para crear"
      });
    }

    const isValid = reservations.every(r => r.colaboradorId && r.agendaId && r.serviceId);

    if (!isValid) {
        return res.status(400).json({
            status: false,
            message: "Cada asignación debe incluir colaboradorId, agendaId y serviceId"
        });
    }

    const dataToInsert = reservations.map(r => ({
        colaboradorId: r.colaboradorId,
        agendaId: r.agendaId,
        serviceId: r.serviceId,
        status: 1, 
    }));

    // Ejecuta la inserción masiva
    const result = await prisma.eventColaboradorService.createMany({
        data: dataToInsert,
        skipDuplicates: true,
    });

    return res.status(201).json({
      status: true,
      data: result,
      message: `${result.count} colaboradores asignados al servicio con éxito.`
    });

  } catch (error: any) {
    console.error('Error al crear asignaciones de colaborador:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error interno al procesar la asignación de colaboradores"
    });
  }
}


export const getAllEventsController = async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({
        status: false,
        message: 'El ID del establecimiento es requerido'
      });
    }

    const events = await prisma.agenda.findMany({
      where: {
        sale: {
          establishment_id: establishmentId
        },
        status: { in: [1, 2, 4] } // 1: Confirmado, 2: Pendiente, 4: Completada
      },
      include: {
        sale: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true
              }
            },
            cotizacion: {
              select: {
                quantity_person: true,
                total: true,
                packageService: {
                  select: {
                    event: {
                      select: {
                        name: true,
                        type: true
                      }
                    },
                    localEvent: {
                      select: {
                        name: true,
                        ubication: true
                      }
                    }
                  }
                }
              }
            },
            salePayment: {
              select: {
                amount: true,
                payment_date: true,
                status: true
              }
            }
          }
        },
        EventColaboradorService: {
          where: { status: 1 },
          select: {
            id: true,
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        event_date: 'asc'
      }
    });

    // Transformar datos para el frontend
    const transformedEvents = events.map(event => {
      // Calcular total pagado
      const totalPaid = event.sale?.salePayment?.reduce((sum, payment) => {
        return sum + (payment.status === 1 ? Number(payment.amount) : 0);
      }, 0) || 0;

      const total = Number(event.sale?.cotizacion?.total || 0);
      const pending = total - totalPaid;

      return {
        id: event.id,
        name: event.sale?.cotizacion?.packageService?.event?.name || 'Sin nombre',
        client: event.sale?.client?.name || 'Sin cliente',
        email: event.sale?.client?.email || '',
        phone: event.sale?.client?.phone || '',
        date: event.event_date,
        time: event.event_time_start,
        pax: event.guests_count || event.sale?.cotizacion?.quantity_person || 0,
        status: event.status,
        operation_status: event.operation_status,
        total: total,
        paid: totalPaid,
        pending: pending,
        location: event.sale?.cotizacion?.packageService?.localEvent?.name || event.location || 'Por definir',
        event_type: event.event_type,
        // Encargado (primer colaborador asignado)
        manager: event.EventColaboradorService?.[0]?.user?.name || 'Sin asignar',
        managerEmail: event.EventColaboradorService?.[0]?.user?.email || ''
      };
    });

    return res.status(200).json({
      status: true,
      data: transformedEvents
    });

  } catch (error: any) {
    console.error('Error al obtener eventos:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al obtener eventos'
    });
  }
};


// Obtener inventario requerido para un evento
export const getEventInventoryController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params

    if (!agendaId) {
      return res.status(400).json({
        status: false,
        message: "El ID de la agenda es requerido"
      })
    }

    const inventory = await getEventInventoryService(agendaId)

    return res.status(200).json({
      status: true,
      data: inventory.data
    })
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al obtener el inventario del evento"
    })
  }
}

export const listColaboradorServiceController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params;
    
    const { serviceId } = req.query; 

    if (!agendaId) {
      return res.status(400).json({
        status: false,
        message: "El ID de la agenda es requerido"
      });
    }

    const colaboradorServiceAmarrado = await prisma.eventColaboradorService.findMany({
      where: {
        agendaId: agendaId,
        ...(serviceId && { serviceId: String(serviceId) }),
      },
    
    });

    return res.status(200).json({
      status: true,
      data: colaboradorServiceAmarrado,
    });

  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al obtener los servicios del evento"
    });
  }
}

export const listAvailableColaboradoresController = async (req: Request, res: Response) => {
  try {
    const { agendaId, serviceId, establishmentId } = req.query; 

    if (!agendaId || !serviceId || !establishmentId) {
      return res.status(400).json({
        status: false,
        message: "Los IDs de agenda, servicio y establecimiento son requeridos."
      });
    }

    // Obtener datos de la agenda
    const agenda = await prisma.agenda.findUnique({
      where: { id: String(agendaId) },
      select: { 
        id: true, 
        event_date: true,
        event_time_start: true,
        event_time_end: true 
      }
    });

    if (!agenda) {
      return res.status(404).json({
        status: false,
        message: "Agenda no encontrada"
      });
    }

    // Buscar agendas que se solapen en la misma fecha
    const overlappingAgendas = await prisma.agenda.findMany({
      where: {
        id: { not: String(agendaId) }, // Excluir la agenda actual
        event_date: agenda.event_date,
        status: 1,
      },
      select: {
        id: true,
        EventColaboradorService: {
          where: { status: 1 },
          select: {
            colaboradorId: true
          }
        }
      }
    });

    // Extraer IDs de colaboradores ocupados en OTROS eventos
    const busyInOtherEvents = overlappingAgendas.flatMap(
      agenda => agenda.EventColaboradorService.map(ecs => ecs.colaboradorId)
    );

    // Obtener colaboradores YA asignados a ESTE servicio en ESTA agenda
    const assignedToThisService = await prisma.eventColaboradorService.findMany({
      where: {
        agendaId: String(agendaId),
        serviceId: String(serviceId),
        status: 1
      },
      select: {
        colaboradorId: true,
        id: true,
      }
    });

    const assignedColaboradorIds = assignedToThisService.map(
      (record) => record.colaboradorId
    );

    // Buscar TODOS los colaboradores que tienen la competencia para este servicio
    const allQualifiedColaboradores = await prisma.user.findMany({
      where: {
        role_id: { in: [2, 3, 4, 6] },
        establishment_id: String(establishmentId),
        status: 1,
        
        // Debe tener la competencia para este servicio
        ColaboradorService: {
          some: {
            serviceId: String(serviceId),
            status: 1
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        collaborator: {
          select: {
            specialties: true,
            description: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Clasificar colaboradores
    const colaboradores = allQualifiedColaboradores.map(colab => {
      const isAssigned = assignedColaboradorIds.includes(colab.id);
      const isBusyInOtherEvent = busyInOtherEvents.includes(colab.id);
      
      return {
        ...colab,
        isAssigned: isAssigned, // Ya asignado a ESTE servicio
        isBusy: isBusyInOtherEvent && !isAssigned, // Ocupado en otro evento
        isAvailable: !isAssigned && !isBusyInOtherEvent // Disponible
      };
    });

    // IMPORTANTE: Retornar la estructura que espera tu frontend
    return res.status(200).json({
      status: true,
      data: {
        // Todos los colaboradores calificados con su estado
        all: colaboradores,
        // Solo los IDs de los asignados (para compatibilidad)
        assigned: assignedColaboradorIds,
      },
      meta: {
        total: colaboradores.length,
        assigned: assignedColaboradorIds.length,
        available: colaboradores.filter(c => c.isAvailable).length,
        busy: colaboradores.filter(c => c.isBusy).length,
        agendaDate: agenda.event_date,
      }
    });

  } catch (error: any) {
    console.error("Error al obtener la disponibilidad de colaboradores:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al obtener la disponibilidad de colaboradores"
    });
  }
}

export const checkColaboradorAvailability = async (req: Request, res: Response) => {
  try {
    const { colaboradorId, agendaId } = req.params;

    if ( !colaboradorId || !agendaId ) {
      return res.status(400).json({
        status: false,
        message: 'El colaborador id y agenda id son obligatorios'
      })
    }

    const isAssigned = await prisma.eventColaboradorService.findFirst({
      where: {
        colaboradorId,
        agendaId,
        status: 1
      }
    });

    return res.status(200).json({
      status: true,
      available: !isAssigned,
      message: isAssigned 
        ? "Colaborador ya asignado a un servicio en esta agenda" 
        : "Colaborador disponible"
    });

  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message
    });
  }
}

export const listAssignedColaboradoresController = async (req: Request, res: Response) => {
  try {
    const { agendaId, serviceId } = req.query; 

    if (!agendaId || !serviceId) {
      return res.status(400).json({
        status: false,
        message: "Los IDs de agenda y servicio son requeridos para obtener las asignaciones."
      });
    }

    // Consulta la tabla de asignaciones EventColaboradorService
    const assignedColaboradores = await prisma.eventColaboradorService.findMany({
      where: {
        agendaId: String(agendaId),
        serviceId: String(serviceId),
      },
      select: {
        colaboradorId: true,
      },
    });

    return res.status(200).json({
      status: true,
      data: assignedColaboradores,
    });

  } catch (error: any) {
    console.error("Error al obtener las asignaciones de colaboradores:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al obtener las asignaciones de colaboradores"
    });
  }
}


export const getEventByIdController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params

    if (!agendaId) {
      return res.status(400).json({
        status: false,
        message: "El ID de la agenda es requerido"
      })
    }

    const event = await prisma.agenda.findUnique({
      where: {
        id: agendaId
      },
      include: {
        sale: {
          include: {
            client: true,
            cotizacion: {
              include: {
                packageService: {
                  include: {
                    event: true,
                    localEvent: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!event) {
      return res.status(404).json({
        status: false,
        message: "Evento no encontrado"
      })
    }

    return res.status(200).json({
      status: true,
      data: event
    })
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al obtener el evento"
    })
  }
}

// Actualizar cantidad asignada de un producto
export const updateProductInventoryController = async (req: Request, res: Response) => {
  try {
    const { inventoryId } = req.params
    const { quantity_assigned, warehouse_id, notes } = req.body

    if (!inventoryId) {
      return res.status(400).json({
        status: false,
        message: "El ID del inventario es requerido"
      })
    }

    const updated = await updateProductInventoryService(
      inventoryId,
      quantity_assigned,
      warehouse_id,
      notes
    )

    return res.status(200).json({
      status: true,
      data: updated,
      message: "Inventario actualizado correctamente"
    })
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al actualizar el inventario"
    })
  }
}

// Obtener productos disponibles en almacenes
export const getAvailableProductsController = async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params

    if (!establishmentId) {
      return res.status(400).json({
        status: false,
        message: "El ID del establecimiento es requerido"
      })
    }

    const products = await getAvailableProductsService(establishmentId)

    return res.status(200).json({
      status: true,
      data: products
    })
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al obtener productos disponibles"
    })
  }
}

// Asignar producto a evento desde almacén
export const assignProductToEventController = async (req: Request, res: Response) => {
  try {
    const { agendaId, productId, quantity, warehouseId } = req.body

    if (!agendaId || !productId || !quantity) {
      return res.status(400).json({
        status: false,
        message: "Agenda, producto y cantidad son requeridos"
      })
    }

    const assigned = await assignProductToEventService({
      agendaId,
      productId,
      quantity,
      warehouseId
    })

    return res.status(201).json({
      status: true,
      data: assigned,
      message: "Producto asignado correctamente"
    })
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al asignar producto"
    })
  }
}


/**
 * VERIFICAR GUÍAS EXISTENTES
 * Endpoint: GET /logistics/guides/:agendaId
 * Verifica si existen guías de despacho (salida) y retorno para una agenda
 */
export const checkExistingGuidesController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params;

    if (!agendaId) {
      return res.status(400).json({
        status: false,
        message: 'El id de la agenda es obligatorio'
      });
    }

    // Verificar que la agenda existe
    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId },
      select: { 
        id: true, 
        operation_status: true,
        sale: {
          select: {
            establishment_id: true
          }
        }
      }
    });

    if (!agenda) {
      return res.status(404).json({
        status: false,
        message: "Agenda no encontrada"
      });
    }

    const establishmentId = agenda.sale?.establishment_id;

    // Buscar guías asociadas a productos del evento
    // Primero, obtener los productos del evento
    const eventProducts = await prisma.eventInventory.findMany({
      where: {
        agenda_id: agendaId,
        status: { in: [2, 3] } // 2: Asignado, 3: Completado
      },
      select: {
        product_id: true,
        warehouse_id: true
      }
    });

    const productIds = [...new Set(eventProducts.map(ep => ep.product_id))];

    // Buscar guías de SALIDA (type_guide = 2) que contengan estos productos
    const dispatchGuides = await prisma.guidesWarehouse.findMany({
      where: {
        establishmentId: establishmentId!,
        type_guide: 2, // Salida
        GuidesDetails: {
          some: {
            product_id: { in: productIds }
          }
        }
      },
      include: {
        GuidesDetails: {
          where: {
            product_id: { in: productIds }
          },
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            },
            warehouse: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        provider: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Buscar guías de RETORNO (type_guide = 1) que contengan estos productos
    const returnGuides = await prisma.guidesWarehouse.findMany({
      where: {
        establishmentId: establishmentId!,
        type_guide: 1, // Entrada (retorno)
        GuidesDetails: {
          some: {
            product_id: { in: productIds }
          }
        }
      },
      include: {
        GuidesDetails: {
          where: {
            product_id: { in: productIds }
          },
          include: {
            product: {
              select: {
                id: true,
                name: true
              }
            },
            warehouse: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        provider: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular totales
    const dispatchTotal = dispatchGuides.reduce((sum, guide) => 
      sum + guide.GuidesDetails.reduce((detailSum, detail) => 
        detailSum + detail.quantity, 0
      ), 0
    );

    const returnTotal = returnGuides.reduce((sum, guide) => 
      sum + guide.GuidesDetails.reduce((detailSum, detail) => 
        detailSum + detail.quantity, 0
      ), 0
    );

    return res.status(200).json({
      status: true,
      data: {
        dispatch_guide: dispatchGuides.length > 0 ? {
          exists: true,
          guides: dispatchGuides.map(g => ({
            id: g.id,
            number: g.number_guide,
            date: g.date_guide,
            provider: g.provider?.name,
            items_count: g.GuidesDetails.length,
            total_quantity: g.GuidesDetails.reduce((sum, d) => sum + d.quantity, 0)
          })),
          latest: dispatchGuides[0] || null
        } : null,
        
        return_guide: returnGuides.length > 0 ? {
          exists: true,
          guides: returnGuides.map(g => ({
            id: g.id,
            number: g.number_guide,
            date: g.date_guide,
            provider: g.provider?.name,
            items_count: g.GuidesDetails.length,
            total_quantity: g.GuidesDetails.reduce((sum, d) => sum + d.quantity, 0)
          })),
          latest: returnGuides[0] || null
        } : null,

        summary: {
          has_dispatch: dispatchGuides.length > 0,
          has_return: returnGuides.length > 0,
          dispatch_count: dispatchGuides.length,
          return_count: returnGuides.length,
          total_dispatched: dispatchTotal,
          total_returned: returnTotal,
          pending_return: dispatchTotal - returnTotal,
          operation_status: agenda.operation_status
        }
      }
    });

  } catch (error: any) {
    console.error("Error al verificar guías existentes:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al verificar las guías existentes"
    });
  }
};


export const startOperationController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params;

    if ( !agendaId ) {
      return res.status(400).json({
        status: false,
        message: 'El id de la agenda es obligatorio'
      })
    }

    // Validar que la agenda existe
    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId },
      include: {
        sale: {
          include: {
            saleProduct: true,
            saleService: true,
          }
        }
      }
    });

    if (!agenda) {
      return res.status(404).json({
        status: false,
        message: "Agenda no encontrada"
      });
    }

    // Actualizar el estado de operación de la agenda
    await prisma.agenda.update({
      where: { id: agendaId },
      data: {
        operation_status: "PICKING",
        operation_started_at: new Date(),
      }
    });

    // Si necesitas crear registros de EventInventory automáticamente:
    const saleProducts = agenda.sale?.saleProduct || [];
    
    for (const sp of saleProducts) {
      // Verificar si ya existe un registro de inventario
      const existing = await prisma.eventInventory.findFirst({
        where: {
          agenda_id: agendaId,
          product_id: sp.product_id
        }
      });

      if (!existing) {
        await prisma.eventInventory.create({
          data: {
            agenda_id: agendaId,
            product_id: sp.product_id,
            quantity_required: sp.quantity,
            quantity_assigned: 0,
            status: 1, // Pendiente
          }
        });
      }
    }

    return res.status(200).json({
      status: true,
      message: "Operación iniciada correctamente",
      data: {
        agendaId,
        operation_status: "PICKING"
      }
    });

  } catch (error: any) {
    console.error("Error al iniciar operación:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al iniciar la operación"
    });
  }
};


/**
 * PASO 3: LOADED -> IN_EVENT
 * Confirmar que la carga está lista
 */
export const confirmLoadedController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params;

    if ( !agendaId ) {
      return res.status(400).json({
        status: false,
        message: 'El id de la agenda es obligatorio'
      })
    }

    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId }
    });

    if (!agenda) {
      return res.status(404).json({
        status: false,
        message: "Agenda no encontrada"
      });
    }

    // Simplemente cambiar el estado (o registrar un timestamp)
    // Si tuvieras un modelo Operation, actualizarías aquí

    return res.status(200).json({
      status: true,
      message: "Carga confirmada",
      data: {
        agendaId,
        operation_status: "LOADED"
      }
    });

  } catch (error: any) {
    console.error("Error al confirmar carga:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al confirmar la carga"
    });
  }
};

/**
 * PASO 4: IN_EVENT
 * Marcar que el evento está en curso
 */
export const markInEventController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params;

    if ( !agendaId ) {
      return res.status(400).json({
        status: false,
        message: 'El id de la agenda es obligatorio'
      })
    }

    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId }
    });

    if (!agenda) {
      return res.status(404).json({
        status: false,
        message: "Agenda no encontrada"
      });
    }

    // Marcar que el evento está en progreso
    await prisma.agenda.update({
      where: {
        id: agenda.id
      },
      data: {
        operation_status: "IN_EVENT"
      }
    })

    return res.status(200).json({
      status: true,
      message: "Evento marcado como en curso",
      data: {
        agendaId,
        operation_status: "IN_EVENT"
      }
    });

  } catch (error: any) {
    console.error("Error al marcar evento en curso:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al marcar el evento"
    });
  }
};



// Actualizar createDispatchGuideController
export const createDispatchGuideController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params;
    const { providerId, items, notes } = req.body;

    if (!agendaId) {
      return res.status(400).json({
        status: false,
        message: 'El id de la agenda es obligatorio'
      });
    }

    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId },
      include: {
        sale: {
          select: { establishment_id: true }
        }
      }
    });

    if (!agenda) {
      return res.status(404).json({
        status: false,
        message: "Agenda no encontrada"
      });
    }

    const guideNumber = `GS-${Date.now()}`;

    const guide = await prisma.guidesWarehouse.create({
      data: {
        establishmentId: agenda.sale?.establishment_id || req.body.establishmentId,
        userId: req.body.userId,
        date_guide: new Date().toISOString(),
        type_guide: 2,
        number_guide: guideNumber,
        provider_id: providerId,
      }
    });

    if (items && items.length > 0) {
      for (const item of items) {
        await prisma.guidesDetails.create({
          data: {
            establishmentId: agenda.sale?.establishment_id || req.body.establishmentId,
            userId: req.body.userId,
            date: new Date().toISOString(),
            quantity: item.quantity,
            cost: item.cost || 0,
            product_id: item.productId,
            warehouse_id: req.body.warehouseId,
            guideId: guide.id,
            status: 1
          }
        });

        await prisma.eventInventory.updateMany({
          where: {
            agenda_id: agendaId,
            product_id: item.productId
          },
          data: {
            quantity_assigned: item.quantity,
            warehouse_id: req.body.warehouseId,
            status: 2,
          }
        });

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity
            }
          }
        });
      }
    }

    // ACTUALIZAR EL ESTADO DE LA AGENDA
    await prisma.agenda.update({
      where: { id: agendaId },
      data: {
        operation_status: "LOADED" // Automáticamente pasa a LOADED
      }
    });

    return res.status(200).json({
      status: true,
      message: "Guía de salida creada correctamente",
      data: {
        guideId: guide.id,
        guideNumber: guide.number_guide,
        operation_status: "LOADED"
      }
    });

  } catch (error: any) {
    console.error("Error al crear guía de salida:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al crear la guía de salida"
    });
  }
};

// Similar para createReturnGuideController
export const createReturnGuideController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params;
    const { providerId, items, notes } = req.body;

    if (!agendaId) {
      return res.status(400).json({
        status: false,
        message: 'El id de la agenda es obligatorio'
      });
    }

    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId },
      include: {
        sale: {
          select: { establishment_id: true }
        }
      }
    });

    if (!agenda) {
      return res.status(404).json({
        status: false,
        message: "Agenda no encontrada"
      });
    }

    const guideNumber = `GR-${Date.now()}`;

    const guide = await prisma.guidesWarehouse.create({
      data: {
        establishmentId: agenda.sale?.establishment_id || req.body.establishmentId,
        userId: req.body.userId,
        date_guide: new Date().toISOString(),
        type_guide: 1,
        number_guide: guideNumber,
        provider_id: providerId,
      }
    });

    if (items && items.length > 0) {
      for (const item of items) {
        await prisma.guidesDetails.create({
          data: {
            establishmentId: agenda.sale?.establishment_id || req.body.establishmentId,
            userId: req.body.userId,
            date: new Date().toISOString(),
            quantity: item.quantity,
            cost: item.cost || 0,
            product_id: item.productId,
            warehouse_id: item.warehouseId,
            guideId: guide.id,
            status: 1
          }
        });

        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity
            }
          }
        });

        await prisma.eventInventory.updateMany({
          where: {
            agenda_id: agendaId,
            product_id: item.productId
          },
          data: {
            status: 3,
          }
        });
      }
    }

    // ACTUALIZAR EL ESTADO DE LA AGENDA
    await prisma.agenda.update({
      where: { id: agendaId },
      data: {
        operation_status: "RECONCILE" // Automáticamente pasa a RECONCILE
      }
    });

    return res.status(200).json({
      status: true,
      message: "Guía de retorno creada correctamente",
      data: {
        guideId: guide.id,
        guideNumber: guide.number_guide,
        operation_status: "RECONCILE"
      }
    });

  } catch (error: any) {
    console.error("Error al crear guía de retorno:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al crear la guía de retorno"
    });
  }
};

/**
 * PASO 6: RETURNING -> CLOSED
 * Conciliar y cerrar la operación
 */
export const reconcileAndCloseController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params;

    if ( !agendaId ) {
      return res.status(400).json({
        status: false,
        message: 'El id de la agenda es obligatorio'
      })
    }

    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId },
      include: {
        eventInventory: true
      }
    });

    if (!agenda) {
      return res.status(404).json({
        status: false,
        message: "Agenda no encontrada"
      });
    }

    // Verificar que todos los items tengan guías de salida y retorno
    const pendingItems = agenda.eventInventory.filter(item => item.status !== 3);

    if (pendingItems.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Hay items pendientes de retorno. Complete todas las guías primero.",
        data: {
          pendingCount: pendingItems.length
        }
      });
    }

    // Aquí podrías hacer la conciliación:
    // - Comparar cantidad salida vs cantidad retornada
    // - Registrar faltantes/sobrantes
    // - Generar reporte de conciliación

    // Actualizar estado de la agenda a "Cerrado"
    await prisma.agenda.update({
      where: { id: agendaId },
      data: {
        status: 3, // Podrías usar 3 para "Cerrado/Completado"
        operation_status: "CLOSED",
        operation_closed_at: new Date()
      }
    });

    return res.status(200).json({
      status: true,
      message: "Operación cerrada correctamente",
      data: {
        agendaId,
        operation_status: "CLOSED",
        summary: {
          totalItems: agenda.eventInventory.length,
          completedItems: agenda.eventInventory.length,
        }
      }
    });

  } catch (error: any) {
    console.error("Error al cerrar operación:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al cerrar la operación"
    });
  }
};

/**
 * EXTRA: Obtener el estado actual de la operación
 */
export const getOperationStatusController = async (req: Request, res: Response) => {
  try {
    const { agendaId } = req.params;

    if ( !agendaId ) {
      return res.status(400).json({
        status: false,
        message: 'El id de la agenda es obligatorio'
      })
    }

    const agenda = await prisma.agenda.findUnique({
      where: { id: agendaId },
      include: {
        eventInventory: {
          include: {
            product: true,
            warehouse: true
          }
        },
        EventColaboradorService: {
          include: {
            user: true,
            service: true
          }
        }
      }
    });

    if (!agenda) {
      return res.status(404).json({
        status: false,
        message: "Agenda no encontrada"
      });
    }

    // Determinar el estado actual basado en los datos
    let operation_status = "PLANNED";
    
    const hasInventory = agenda.eventInventory.length > 0;
    const hasAssignedItems = agenda.eventInventory.some(item => item.status === 2);
    const allCompleted = agenda.eventInventory.every(item => item.status === 3);

    if (allCompleted && agenda.status === 3) {
      operation_status = "CLOSED";
    } else if (hasAssignedItems) {
      operation_status = "LOADED";
    } else if (hasInventory) {
      operation_status = "PICKING";
    }

    return res.status(200).json({
      status: true,
      data: {
        agendaId,
        operation_status,
        inventory: agenda.eventInventory,
        colaboradores: agenda.EventColaboradorService
      }
    });

  } catch (error: any) {
    console.error("Error al obtener estado de operación:", error);
    return res.status(500).json({
      status: false,
      message: error?.message || "Error al obtener el estado"
    });
  }
};