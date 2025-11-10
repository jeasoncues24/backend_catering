import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listWarehouseController = async ( req: Request, res: Response ) => {
    try {
        const { establishmentId } = req.params

        if ( !establishmentId ) {
            return res.status(404).json({
                status: false, 
                message: 'El id de la sucursal es obligatorio'
            })
        }

        const warehouses = await prisma.warehouse.findMany({
            where: {
                establishmentId
            }
        })

        return res.status(200).json({
            status: true,
            data: warehouses
        })


    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}

export const informationGuideController = async ( req: Request, res: Response ) => {
    try {
        const { guideId } = req.params

        if ( !guideId ) {
            return res.status(404).json({
                status: false, 
                message: 'El id de la guia es obligatorio'
            })
        }

        const guide = await prisma.guidesWarehouse.findMany({
            where: {
                id: guideId
            },
            include: {
                provider: {
                    select: {
                        name: true
                    }
                },
                GuidesDetails: {
                    select: {
                        quantity: true,
                        cost: true,
                        date: true,
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
                }        
            }
        })

        return res.status(200).json({
            status: true,
            data: guide
        })


    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}

export const listTypesGuidesController = async ( req: Request, res: Response ) => {
    try {
        const { establishmentId } = req.params

        if ( !establishmentId ) {
            return res.status(404).json({
                status: false, 
                message: 'El id de la sucursal es obligatorio'
            })
        }

        const warehouses = await prisma.guidesWarehouse.findMany({
            where: {
                establishmentId
            },
            include: {
                provider: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return res.status(200).json({
            status: true,
            data: warehouses
        })


    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}

export const addWarehouseController = async ( req: Request, res: Response ) => {
    try {
        const { establishmentId, name, ubication, status } = req.body

        if ( !establishmentId || !name || !ubication || !status ) {
            return res.status(404).json({
                status: false, 
                message: 'Los campos son obligatorios, vuelve a intentarlo.'
            })
        }


        // VER QUE NO EXISTA CON ESE NOMBRE EL ALMACEN 
        const warehouse = await prisma.warehouse.findFirst({
            where: {
                establishmentId,
                name
            }
        })

        if ( warehouse ) {
            return res.status(400).json({
                status: true,
                message: 'El almacen ya existe en la sucursal'
            })
        }

        const resp = await prisma.warehouse.create({
            data: {
                establishmentId,
                name,
                ubication,
                status: parseInt(status)
            }
        })


        return res.status(201).json({
            status: true,
            data: resp
        })


    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}


export const addTypesGuidesController = async ( req: Request, res: Response ) => {
    try {

        const { establishmentId, userId, date_guide, type_guide, number_guide, provider_id } = req.body

        if ( !establishmentId || !userId || !date_guide  ) {
            return res.status(404).json({
                status: false, 
                message: 'Los campos son obligatorios, vuelve a intentarlo.'
            })
        }


        const typeGuide = await prisma.guidesWarehouse.create({
            data: {
                establishmentId,
                userId,
                date_guide,
                type_guide,
                number_guide,
                provider_id
            }
        })

        return res.status(201).json({
            status: true,
            data: typeGuide
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}


export const addDetailGuideController = async ( req: Request, res: Response ) => {
    try {
        const { guideId } = req.params;
        const details = req.body;

        // Validar que se recibió un array
        if (!Array.isArray(details) || details.length === 0) {
            return res.status(400).json({
                status: false,
                message: 'Debes enviar al menos un detalle de guía'
            });
        }

        // Validar que la guía existe
        const guideExists = await prisma.guidesWarehouse.findUnique({
            where: { id: guideId! }
        });

        if (!guideExists) {
            return res.status(404).json({
                status: false,
                message: 'La guía no existe'
            });
        }

        // Validar campos requeridos
        for (const detail of details) {
            if (!detail.establishmentId || !detail.userId || !detail.date || 
                !detail.quantity || !detail.cost || !detail.product_id || !detail.warehouse_id) {
                return res.status(400).json({
                    status: false,
                    message: 'Todos los campos son requeridos en cada detalle'
                });
            }

            // Validar que el producto existe
            const productExists = await prisma.product.findUnique({
                where: { id: detail.product_id }
            });

            if (!productExists) {
                return res.status(404).json({
                    status: false,
                    message: `El producto con ID ${detail.product_id} no existe`
                });
            }

            // Validar que el almacén existe
            const warehouseExists = await prisma.warehouse.findUnique({
                where: { id: detail.warehouse_id }
            });

            if (!warehouseExists) {
                return res.status(404).json({
                    status: false,
                    message: `El almacén con ID ${detail.warehouse_id} no existe`
                });
            }
        }

        // Usar transacción para asegurar que todos los detalles se guarden o ninguno
        const result = await prisma.$transaction(async (tx) => {
            // Crear todos los detalles
            const createdDetails = await tx.guidesDetails.createMany({
                data: details.map((detail: any) => ({
                    establishmentId: detail.establishmentId,
                    userId: detail.userId,
                    date: detail.date,
                    quantity: parseInt(detail.quantity),
                    cost: parseFloat(detail.cost),
                    product_id: detail.product_id,
                    warehouse_id: detail.warehouse_id,
                    status: 1,
                    guideId: guideId!
                }))
            });

            // Opcional: Actualizar el stock de los productos
            for (const detail of details) {
                // Si es tipo 1 (ingreso) sumar, si es tipo 2 (salida) restar
                const operation = guideExists.type_guide === 1 ? 'increment' : 'decrement';
                
                await tx.product.update({
                    where: { id: detail.product_id },
                    data: {
                        stock: {
                            [operation]: parseInt(detail.quantity)
                        }
                    }
                });
            }

            return createdDetails;
        });

        return res.status(201).json({
            status: true,
            message: 'Detalles de guía agregados exitosamente',
            data: {
                count: result.count
            }
        });

    } catch ( error ) {
        console.error('Error en addDetailGuideController:', error);
        return res.status(500).json({
            status: false,
            message: `Error al agregar detalles: ${ error }`
        });
    }
}