import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const addCotizacionController = async (req: Request, res: Response) => {
  try {
    const {
      clientName,
      clientEmail,
      clientPhone,
      establishmentId,
      budgetPerPerson,
      numberOfGuests,
      totalEstimate,
      eventDate,
      eventDateType,
      eventTimeOfDay,
      eventType,
      notes,
      packageId,
      status,
      packageData,
      menu
    } = req.body;

    if (
      !clientName ||
      !clientEmail ||
      !clientPhone ||
      !establishmentId ||
      !packageId
    ) {
      return res.status(400).json({
        status: false,
        message: "Faltan campos obligatorios en la solicitud.",
      });
    }

    let client = await prisma.client.findFirst({
      where: { email: clientEmail, establishment_id: establishmentId },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          establishment_id: establishmentId,
        },
      });
    }

    const cotizacion = await prisma.cotizacion.create({
      data: {
        package_id: packageId,
        client_id: client.id,
        establishment_id: establishmentId,
        event_date: eventDate,
        type_date_event: eventDateType?.toUpperCase() || "TENTATIVA",
        event_time_day: eventTimeOfDay || "dia",
        quantity_person: numberOfGuests,
        price_person: Number(budgetPerPerson),
        local_event: packageData?.local_id || "",
        total: Number(totalEstimate),
        notes: notes || "",
        status: 1,
      },
    });

    if (packageData?.editedProducts?.length > 0) {
      await Promise.all(
        packageData.editedProducts.map(async (p: any) => {
          const productId = p.productId || p.product?.id || p.id;

          const exists = await prisma.product.findUnique({
            where: { id: productId },
          });

          if (!exists) {
            throw new Error(`Producto no existe en BD: ${productId}`);
          }

          await prisma.cotizacionProduct.create({
            data: {
              cotizacion_id: cotizacion.id,
              product_id: productId,
              quantity: p.quantity || 1,
              price: p.price || p.product?.price || 0,
            },
          });
        })
      );
    }

    if (packageData?.editedServices?.length > 0) {
      await Promise.all(
        packageData.editedServices.map(async (s: any) => {
          const serviceId = s.serviceId || s.service?.id || s.id;

          const exists = await prisma.service.findUnique({
            where: { id: serviceId },
          });

          if (!exists) {
            throw new Error(`Servicio no existe en BD: ${serviceId}`);
          }

          await prisma.cotizacionService.create({
            data: {
              cotizacion_id: cotizacion.id,
              service_id: s.id,
              quantity: s.quantity || 1,
              price: s.price || 0,
            },
          });
        })
      );
    }

    if (menu && Object.keys(menu).length > 0) {
      const promises = Object.entries(menu as Record<string, any[]>).flatMap(
        ([structureMenuId, products]) =>
          (products as any[]).map(async (product) => {
            console.log({ structureMenuId, product });
            let build = await prisma.buildYourMenu.findFirst({
              where: {
                structureMenuId,
                product_id: product.id,
                establishmentId,
              },
            });


            if (!build) {
              const typeComponent = await prisma.typeComponentMenu.findFirst({
                where: { establishmentId },
              });

              if (!typeComponent) {
                throw new Error("Tipo de componente de menú no encontrado");
              }

              build = await prisma.buildYourMenu.create({
                data: {
                  structureMenuId,
                  product_id: product.id,
                  establishmentId,
                  type_component_menu_id: typeComponent.id,
                },
              });

            }

            await prisma.cotizacionMenu.create({
              data: {
                cotizacion_id: cotizacion.id,
                build_your_menu_id: build.id,
                quantity: 1,
                price: 0,
              },
            });
          })
      );

      await Promise.all(promises);
    }


    return res.status(201).json({
      status: true,
      message: "Cotización registrada correctamente",
      data: { cotizacionId: cotizacion.id, clientId: client.id },
    });
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      status: false,
      message: "Error interno al crear la cotización",
    });
  }
};


export const listCotizacionesController = async (req: Request, res: Response) => {
  try {
    const { establihsmentId } = req.params;
    const cotizaciones = await prisma.cotizacion.findMany({
      where: { establishment_id: establihsmentId! },
      include: {
        client: true,
        packageService: {
          include: {
            event: true 
          }
        }
      }
    });
    return res.status(200).json({
      status: true,
      data: cotizaciones,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error interno al obtener las cotizaciones",
    });
  }
};

export const getCotizacionDetailController = async ( req: Request, res: Response ) => {
   try {
    const { cotizacionId } = req.params;
    const cotizacion = await prisma.cotizacion.findMany({
      where: { id: cotizacionId! },
      include: {
        client: true,
        packageService: {
          include: {
            event: true 
          }
        },
        cotizacionProducts: {
          include: {
            product: true
          }
        },
        cotizacionServices: {
          include: {
            service: true
          }
        },
        cotizacionMenu: {
          include: {
            buildYourMenu: {
              include: {
                product: true,
                structureMenu: true
              }
            }
          }
        }
      }
    });
    return res.status(200).json({
      status: true,
      data: cotizacion,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Error interno al obtener la cotizacion",
    });
  }
}

export const convertCotizacionToSaleController = async (req: Request, res: Response) => {
  try {
    const { quoteId } = req.params as { quoteId: string };

    // Buscar cotización con sus líneas
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: quoteId },
      include: {
        client: true,
        establishment: true,
        cotizacionProducts: { include: { product: true } },
        cotizacionServices: { include: { service: true } },
        cotizacionMenu: {
          include: {
            buildYourMenu: { include: { product: true, structureMenu: true } },
          },
        },
      },
    });

    if (!cotizacion) {
      return res.status(404).json({ status: false, message: "Cotización no encontrada" });
    }

    // Evitar conversión duplicada
    const existing = await prisma.sale.findFirst({ where: { cotizacion_id: quoteId } });
    if (existing) {
      return res.status(409).json({ status: false, message: "La cotización ya fue convertida a venta" });
    }

    // Calcular totales
    const sumLines = (arr: { quantity: number; price: any }[]) =>
      arr.reduce((acc, it) => acc + Number(it.price) * (it.quantity || 1), 0);

    const subTotalProducts = sumLines(cotizacion.cotizacionProducts);
    const subTotalServices = sumLines(cotizacion.cotizacionServices);
    const subTotalMenus = sumLines(cotizacion.cotizacionMenu);
    const sub_total = Number((subTotalProducts + subTotalServices + subTotalMenus).toFixed(2));
    const discount = 0;
    const tax_total = 0;
    const total = Number(cotizacion.total);

    const sale = await prisma.$transaction(async (tx) => {
      const createdSale = await tx.sale.create({
        data: {
          cotizacion_id: cotizacion.id,
          client_id: cotizacion.client_id,
          establishment_id: cotizacion.establishment_id,
          notes: cotizacion.notes || "",
          sub_total,
          discount,
          tax_total,
          total,
          status: 1,
        },
      });

      if (cotizacion.cotizacionProducts?.length) {
        const items = cotizacion.cotizacionProducts.map((p) => ({
          sale_id: createdSale.id,
          product_id: p.product_id,
          description: p.product?.name || "Producto",
          quantity: p.quantity || 1,
          unit_price: Number(p.price),
          discount: 0,
          tax_rate: 0,
          tax_amount: 0,
          line_total: Number((Number(p.price) * (p.quantity || 1)).toFixed(2)),
          status: 1,
        }));
        await tx.saleProduct.createMany({ data: items });
      }

      if (cotizacion.cotizacionServices?.length) {
        const items = cotizacion.cotizacionServices.map((s) => ({
          sale_id: createdSale.id,
          service_id: s.service_id,
          description: s.service?.name || "Servicio",
          quantity: s.quantity || 1,
          unit_price: Number(s.price),
          discount: 0,
          tax_rate: 0,
          tax_amount: 0,
          line_total: Number((Number(s.price) * (s.quantity || 1)).toFixed(2)),
          status: 1,
        }));
        await tx.saleService.createMany({ data: items });
      }

      if (cotizacion.cotizacionMenu?.length) {
        const items = cotizacion.cotizacionMenu.map((m) => ({
          sale_id: createdSale.id,
          build_your_menu_id: m.build_your_menu_id,
          description:
            m.buildYourMenu?.product?.name || m.buildYourMenu?.structureMenu?.name || "Menú",
          quantity: m.quantity || 1,
          price: Number(m.price),
          line_total: Number((Number(m.price) * (m.quantity || 1)).toFixed(2)),
          status: 1,
        }));
        await tx.saleMenu.createMany({ data: items });
      }

      // Opcional: marcar cotización como convertida (status 2)
      try {
        await tx.cotizacion.update({ where: { id: cotizacion.id }, data: { status: 4 } });
      } catch (_) {}

      return createdSale;
    });

    return res.status(201).json({
      status: true,
      message: "Cotización convertida a venta correctamente",
      data: { saleId: sale.id },
    });
  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message || "Error interno al convertir la cotización",
    });
  }
};


export const updateStatusCotizacionController = async( req: Request, res: Response) => {
  try {
    const { quoteId } = req.params as { quoteId: string };
    const { status } = req.body;

    // Buscar cotización con sus líneas
    const cotizacion = await prisma.cotizacion.findUnique({
      where: { id: quoteId },
      include: {
        client: true,
        establishment: true,
        cotizacionProducts: { include: { product: true } },
        cotizacionServices: { include: { service: true } },
        cotizacionMenu: {
          include: {
            buildYourMenu: { include: { product: true, structureMenu: true } },
          },
        },
      },
    });

    if (!cotizacion) {
      return res.status(404).json({ status: false, message: "Cotización no encontrada" });
    }

    // actualizar estado 
    const resp = await prisma.cotizacion.update({
      where: { id: quoteId },
      data: {
        status: status
      }
    })

    if ( !resp ) {
      return res.status(500).json({status: false, message: "Ocurrio un error inesperado."})
    }

    return res.status(200).json({
      status: true, 
      message: "Se actualizo la cotizacion correctamente."
    })

  } catch ( error: any ) {
    return res.status(500).json({
      status: false,
      message: error?.message || "Error interno al convertir la cotización",
    });
  }
}
