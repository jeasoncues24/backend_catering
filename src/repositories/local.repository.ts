import { prisma } from "../config/db"

export const listLocales = async( establishment_id: string ) => {
    return await prisma.localEvent.findMany({
        where: {
            establishment_id: establishment_id
        }
    })
}

export const listLocalesActives = async ( establishment_id: string ) => {
    return await prisma.localEvent.findMany({
        where: {        
            establishment_id: establishment_id,
            status: 1
        }
    })
}


export const addLocal = async(name: string, capacity: number, description: string, characteristics: string[], ubication: string, reference: string, price_aprox: number, establishment_id: string) => {
    return await prisma.localEvent.create({
        data: {
            name,
            capacity,
            description,
            characteristics,
            ubication,
            reference,
            price_aprox,
            establishment_id
        }
    })
}