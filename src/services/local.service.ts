import { addLocal, listLocales, listLocalesActives } from "../repositories/local.repository";

export const listLocalesService = async ( establishment_id: string ) => {
    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio");
    }

    return await listLocales(establishment_id);
}

export const listLocalesActivesService = async ( establishment_id: string ) => {
    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio");
    }

    return await listLocalesActives(establishment_id);
}



export const addLocalService = async ( name: string, capacity: number, description: string, characteristics: string[], ubication: string, reference: string, price_aprox: number, establishment_id: string ) => {
    if ( !name || !capacity || !characteristics || !ubication || !reference || !price_aprox ) {
        throw new Error("Los campos son obligatorios")
    }

    return await addLocal( name, capacity, description, characteristics, ubication, reference, price_aprox, establishment_id)
}