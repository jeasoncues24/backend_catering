import { getEstablishmentByIdRepository } from "../repositories/branches.repository";
import { addCategoryProductRepository, getCategoryProductByName, listActiveCategoriesProducts, listCategoriesProductRepository } from "../repositories/categoryproduct.repository";

export const addCategoryProductService = async ( data: { name: string, description: string, establishment_id: string, status: number }) => {
    if ( !data.name || !data.description || !data.establishment_id || !data.status ) {
        throw new Error("Los campos son obligatorios, vuelve a intentarlo.");
    }

    const validateEstablishment = await getEstablishmentByIdRepository(data.establishment_id);

    if ( !validateEstablishment ) {
        throw new Error("La sucursal no existe o esta inactiva.");
    }

    // Validar de que no existe esa categoria de servicio
    const validateCategory = await getCategoryProductByName(data.name, data.establishment_id);

    if ( validateCategory ) {
        throw new Error("Ya existe una categoria con ese nombre en esta sucursal.");
    }

    const newCategory = await addCategoryProductRepository(data);

    return newCategory;

}

export const listCategoryProductService = async ( establishment_id: string ) => {

    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio");
    }

    // Validar de que la sucursal exista y este activa
    const validateEstablishment = await getEstablishmentByIdRepository(establishment_id);

    if ( !validateEstablishment ) {
        throw new Error("La sucursal no existe o esta inactiva.");
    }

    const listCategories = await listCategoriesProductRepository(establishment_id);
    return listCategories;
    
}


export const listCategoryProductsActiveService = async (establishment_id: string) => {
    if (!establishment_id) {
        throw new Error("El id de la sucursal es obligatorio");
    }
    // Validar que la sucursal exista y esté activa
    const validateEstablishment = await getEstablishmentByIdRepository(establishment_id);
    if (!validateEstablishment) {
        throw new Error("La sucursal no existe o está inactiva.");
    }
    return await listActiveCategoriesProducts(establishment_id);
};


