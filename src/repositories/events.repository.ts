import { TypeEvent } from "@prisma/client"
import { prisma } from "../config/db"

export const listAllTypesEvent = async ( establishment_id: string ) => {
    return await prisma.event.findMany({
        where: {
            establishment_id
        }
    })
}

export const listAllActivesTypesEvent = async ( establishment_id: string ) => {
    return await prisma.event.findMany({
        where: {
            establishment_id,
            status: 1
        }
    })
}

export const addTypeEvent = async ( data: { name: string, description: string, status: number, isIgv: number, type: TypeEvent, establishmentId: string  }) => {

    // Validar que la sucursal este activa y exista
    const establishment = await prisma.establishment.findFirst({
        where: {
            id: data.establishmentId,
            status: 1
        }
    })

    if ( !establishment ) {
        throw new Error("La sucursal no existe o no esta activa")
    }

    // Validar que el evento no haya sido ingresado anteriormente (PARA NO REPETIR NOMBRES)
    const exists = await prisma.event.count({
        where: {
            name: data.name,
            establishment_id: establishment.id,
            status: 1,
        },
    });

    if (exists > 0) {
        throw new Error("El evento ya ha sido registrado, no se puede repetir el mismo nombre");
    }

    return await prisma.event.create({
        data: {
            establishment_id: establishment.id,
            status: 1,
            name: data.name,
            description: data.description,
            isIgv: Number(data.isIgv),
            type: data.type
        }
    })
}