import { TypeEvent } from "@prisma/client";
import { addTypeEvent, listAllActivesTypesEvent, listAllTypesEvent } from "../repositories/events.repository";

export const listAllTypesEventsService = async(establishment_id: string) => {
    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio")
    }

    return await listAllTypesEvent(establishment_id);
}

export const listAllActivesTypesEventsService = async(establishment_id: string) => {
    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio")
    }
    return await listAllActivesTypesEvent(establishment_id);
}

export const addTypeEventService = async ( data: { name: string, description: string, status: number, isIgv: number, type: string, establishmentId: string  }) => {
    if ( !data.name || !data.isIgv || !data.type || !data.establishmentId ) {
        throw new Error("Los campos son obligatorios")
    }

    return await addTypeEvent({
        ...data, 
        type: data.type as TypeEvent
    })
}