import { addBuildYourMenu, addStructureMenu, addTypeMenu, getByNameStructureMenu, getByNameTypeMenu, listBuildYourMenu, listStructureMenu, listTypeMenu } from "../repositories/menu.repository"

export const addTypeMenuService = async ( establishmentId: string, name: string, price: any ) => {
    if ( !establishmentId || !name ) {
        throw new Error("Los campos son obligatorios")
    }

    // Validar de que no exista el nombre de tipo de menu en la sucursal.
    const isExistTypeMenu = await getByNameTypeMenu(establishmentId, name);

    if ( isExistTypeMenu ) {
        throw new Error("El tipo de menú ya existe en la sucursal.")
    }

    return await addTypeMenu(establishmentId, name, price)
}


export const listTypeMenuService = async ( establishmentId: string ) => {
    if ( !establishmentId ) {
        throw new Error("El id de la sucursal es obligatoria");
    }

    return await listTypeMenu(establishmentId)
}


export const listStructureMenuService = async ( establishmentId: string ) => {
    if ( !establishmentId ) {
        throw new Error("El id de la sucursal es obligatoria");
    }

    return await listStructureMenu(establishmentId)
} 

export const listBuildYourMenuService = async ( establishmentId: string ) => {
    if ( !establishmentId ) {
        throw new Error("El id de la sucursal es obligatoria");
    }

    return await listBuildYourMenu(establishmentId)
}

export const addStructureMenuService = async ( name: string, order: number, status: number, establishmentId: string ) => {  
    if ( !establishmentId || !name ) {
        throw new Error("Los campos son obligatorios")
    }

    // Validar de que no exista la estructura de menu en la sucursal
    const isExistStructureMenu = await getByNameStructureMenu(name, establishmentId);

    if ( isExistStructureMenu ) {
        throw new Error("La estructura de menu ya existe en la sucursal.")
    }

    return await addStructureMenu(name, order, status, establishmentId);
}


export const addBuildYourMenuService = async ( type_component_menu_id: string, structure_menu_id: string, product_id: string, status: number, establishmentId: string ) => {
    if ( !establishmentId || !type_component_menu_id || !structure_menu_id || !product_id ) {
        throw new Error("Los campos son obligatorios")
    }

    return await addBuildYourMenu(type_component_menu_id, structure_menu_id, product_id, status, establishmentId);

}

