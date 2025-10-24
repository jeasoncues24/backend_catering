import { prisma } from "../config/db"

export const listAllProviders = async ( establishment_id: string ) => {
    return await prisma.provider.findMany({
        where: {
            establishment_id
        }
    })
}

export const listProvidersActives = async ( establishment_id: string ) => {
    return await prisma.provider.findMany({
        where: {
            establishment_id,
            status: 1
        }
    })
}

export const addProvider = async(data: { name: string, bussines_name: string, identification: string, email: string, phone: string, status: number, establishmentId: string  }) => {
    return await prisma.provider.create({
        data: {
            name: data.name,
            bussines_name: data.bussines_name,
            identification: data.identification,
            email: data.email,
            phone: data.phone,
            status: data.status,
            establishment_id: data.establishmentId
        }
    })
}