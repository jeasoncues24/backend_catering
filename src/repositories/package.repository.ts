import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../config/db";



export const addPackage = async ( packageData: { name: string; description: string; quantity_person: number; price_person: Decimal; event_id: string; local_id: string; isGift: number, establishment_id: string } ) => { 


    const totalPackages = new Decimal(packageData.price_person).mul(packageData.quantity_person);

    return await prisma.packageService.create({
        data: {
            name: packageData.name,
            price_person: packageData.price_person,
            description: packageData.description,
            quantity_person: packageData.quantity_person,
            event_id: packageData.event_id,
            local_id: packageData.local_id,
            isGift: packageData.isGift,
            establishment_id: packageData.establishment_id,
            status: 1,
            total_package: totalPackages
        }
    })

}

export const getPackagesByEstablishment = async ( establishment_id: string ) => {
    return await prisma.packageService.findMany({
        where: {
            establishment_id: establishment_id
        },
        include: {
            localEvent: {
                select: {
                    name: true,
                    price_aprox: true
                }
            },
            event: {
                select: {
                    name: true,
                }
            }
        }
    });
}

export const informationPackage = async ( id: string ) => {
    return await prisma.packageService.findFirst({
        where: {
            id
        },
        include: {
          localEvent: {
            select: {
              name: true,
              price_aprox: true,
              capacity: true,
              reference: true, 
              ubication: true,
              characteristics: true
            }
          }
        }
    })
}


export const detailForProforma = async (id: string) => {
  return await prisma.packageService.findUnique({
    where: { id },
    include: {
      // Productos del paquete
      packageForProduct: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              description: true,
              image: true,
              price: true,
              stock: true,
            },
          },
        },
      },

      // Servicios del paquete
      packageForService: {
        include: {
          service: {
            select: {
              id: true,
              name: true,
              image: true,
              price: true,
            },
          },
        },
      },

      // Regalo del paquete
      packageServiceGift: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
          service: {
            select: {
              id: true,
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });
};



export const getPackageById = async ( id: string ) => {
    return await prisma.packageService.findFirst({
        where: {
            id,
            status: 1
        }
    })
}

export const updatePackageDetails = async ( id: string ) => {
    return await prisma.packageService.update({
        where: {
            id
        },
        data: {
            isDetail: 1
        }
    })
}


export const addPackageForService = async ( packageServices: { packageId: string; serviceId: string }[] ) => {
    if (!Array.isArray(packageServices) || packageServices.length === 0) {
        throw new Error("No hay servicios de paquete para agregar");
    }

    return await prisma.packageForService.createMany({
        data: packageServices,
        skipDuplicates: true,
    });
}

export const addPackageForProduct = async ( packageProducts: { packageId: string; productId: string }[] ) => {
    if ( !Array.isArray(packageProducts) || packageProducts.length === 0 ) {
        throw new Error("No hay productos de paquete para agregar");
    }

    return await prisma.packageForProduct.createMany({
        data: packageProducts,
        skipDuplicates: true
    })
}


export const addPackageGifts = async ( gifts: any[] ) => {
    return await prisma.packageServiceGift.createMany({
        data: gifts.map(gift => ({
            package_id: gift.package_id,
            product_id: gift.product_id || null,
            service_id: gift.service_id || null,
            status: 1,
        })),
        skipDuplicates: true
    })
}