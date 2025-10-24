import { getEstablishmentByIdRepository } from "../repositories/branches.repository";
import { addProduct, getProductByName, getProductsListRepository } from "../repositories/product.repository";

export const addProductService = async ( data: Partial<any> ) => {

    if ( !data.name  ||  !data.establishment_id || !data.status ) {
        throw new Error("Debe enviar los campos obligatorios.");
    }

    // Validar de que el nombre no exista
    const isProdct = await getProductByName(data.name, data.establishment_id);

    if ( isProdct ) {
        throw new Error("El producto ya existe en la sucursal.")
    }

    const newProduct = await addProduct(data)
    return newProduct;
    
}


export const getProductsListS = async ( establishment_id: string ) => {

    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio");
    }

    // Validar de que el id de la sucursal exista y este activa
    const establishment_idExist = await getEstablishmentByIdRepository(establishment_id);

    if ( !establishment_idExist ) {
        throw new Error("La sucursal no existe o no esta activa");
    }

    return await getProductsListRepository(establishment_id);

}
