import { getEstablishmentByIdRepository } from "../repositories/branches.repository";
import { addProvider, listAllProviders, listProvidersActives } from "../repositories/provider.repository";

export const listAllProviderService = async ( establishment_id: string ) => {
    if ( !establishment_id ) {
         throw new Error("El id de la sucursal es obligatorio")
    }

    
    const establishment = await getEstablishmentByIdRepository(establishment_id);

    if ( !establishment ) {
        throw new Error("La sucursal no existe");
    }


    return await listAllProviders(establishment_id)
}

export const listProviderActivesService = async ( establishment_id: string ) => {
    if ( !establishment_id ) {
         throw new Error("El id de la sucursal es obligatorio")
    }

    
    const establishment = await getEstablishmentByIdRepository(establishment_id);

    if ( !establishment ) {
        throw new Error("La sucursal no existe");
    }


    return await listProvidersActives(establishment_id)
}


export const addProviderService = async ( data: { name:string, bussines_name:string, identification:string, email:string, phone:string, status: number, establishmentId:string  }) => {
    if ( !data.name || !data.bussines_name || !data.identification || !data.email || !data.phone || !data.establishmentId ) {
        throw new Error("Los campos son obligatorios.")
    }

    return await addProvider(data);

}