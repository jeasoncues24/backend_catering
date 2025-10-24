import { prisma } from "../config/db"
import { Service } from "../interfaces/service.interface"


export const getServiceByName = async (name: string, establishment_id: string) => {
    return await prisma.service.findFirst({
        where: {
            name,
            establishment_id
        }
    })
}

export const createServiceProduct = async (data: {
  productId: string;
  serviceId: string;
  status: number;
}) => {
  const amarre =  await prisma.productService.create({
    data: {
      productId: data.productId,
      serviceId: data.serviceId,
      status: data.status,
    },
  });

  if ( amarre ) {
    await prisma.service.update({
        where: {
            id: data.serviceId
        },
        data: {
            isProducts: 1
        }
    })
  }

  return amarre
};


export const addServiceRepository = async ( data: Partial<any>) => {
    return await prisma.service.create({
        data: {
            name: data.name!,
            duration: Number(data.duration),
            price: Number(data.price),
            category_id: data.category_id!,
            establishment_id: data.establishment_id!,
            image: data.image,
            status: Number(data.status)
        }
    })
}


export const getServicesListRepository = async ( establishment_id: string ) => {
    return await prisma.service.findMany({
        where: {
            establishment_id
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
}

export const getServiceById = async ( id: string ) => {
    return await prisma.service.findFirst({
        where: {
            id
        }
    })
}

export const deleteServiceById = async ( id: string ) => {
    return await prisma.service.delete({
        where: {
            id
        }
    })
}

export const listActivesServicesByEstablishment = async ( establishment_id: string ) => {
    return await prisma.service.findMany({
        where: {
            establishment_id,
            status: 1
        }
    })
}

export const updateServiceById = async ( id: string, data: Partial<Service> ) => {
    return await prisma.service.update({
        where: { id },
        data
    });
}

export const listServicesForQuotes = async ( establishment_id: string, category_id: string ) => {
    const whereClause: any = {
        establishment_id: establishment_id,
        status: 1
    }

    if ( category_id !== "" ) {
        whereClause.category_id = category_id
    }

    const servicesAll = await prisma.service.findMany({
        where: whereClause
    });

    return servicesAll;
}