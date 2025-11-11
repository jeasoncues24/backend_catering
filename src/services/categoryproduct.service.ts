import { getEstablishmentByIdRepository } from "../repositories/branches.repository";
import { addCategoryProductRepository, countProductsByCategoryId, deleteCategoryProductRepository, findCategoryProductByNameExcludingId, getCategoryProductById, getCategoryProductByName, listActiveCategoriesProducts, listCategoriesProductRepository, updateCategoryProductById } from "../repositories/categoryproduct.repository";

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

export const deleteCategoryProductS = async ( id: string ) => {
    if ( !id ) {
        throw new Error("El id de la categoria servicio es obligatorio");
    }


    // Validar que no tenga servicios asociados
    const serviceCount = await countProductsByCategoryId(id);
    if (serviceCount > 0) {
        throw new Error("No se puede eliminar la categoría porque tiene productos asociados.");
    }

    const deleteCategory = await deleteCategoryProductRepository(id);
    return deleteCategory;
}

export const updateCategoryProductS = async ( id: string, data: { name: string, description: string, status: number }) => {
    if ( !id ) {
        throw new Error("El id de la categoria servicio es obligatorio")
    }

    // Validar de que el id exista
    const validateId = await getCategoryProductById(id);
    if ( !validateId ) {
        throw new Error("No existe el id a actualizar, vuelve a intentarlo");
    }

    // Validar que no exista otra categoría con ese nombre
    if (data.name) {
        const exists = await findCategoryProductByNameExcludingId(data.name, id);
        if (exists) {
            throw new Error("Ya existe una categoría con ese nombre");
        }
    }

    const updateCategory = await updateCategoryProductById(id, data);
    return updateCategory;
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


