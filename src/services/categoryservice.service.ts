import { getEstablishmentByIdRepository } from "../repositories/branches.repository";
import { addCategoryServiceRepository, deleteCategoryServiceRepository, getCategoryServiceById, getCategoryServiceByName, listCategoriesServiceRepository, findCategoryServiceByNameExcludingId, updateCategoryServiceById, countServicesByCategoryId, listActiveCategoriesServiceRepository } from "../repositories/categoryservice.repository";
import { getCollaboratorById } from "../repositories/user.repository";


export const addCategoryServiceS = async ( data: { name: string, description: string, establishment_id: string, status: number }) => {
    if ( !data.name || !data.description || !data.establishment_id || !data.status ) {
        throw new Error("Los campos son obligatorios, vuelve a intentarlo.");
    }

    // Validar de que la sucursal exista y este activa
    const validateEstablishment = await getEstablishmentByIdRepository(data.establishment_id);

    if ( !validateEstablishment ) {
        throw new Error("La sucursal no existe o esta inactiva.");
    }

    // Validar de que no existe esa categoria de servicio
    const validateCategory = await getCategoryServiceByName(data.name, data.establishment_id);

    if ( validateCategory ) {
        throw new Error("Ya existe una categoria con ese nombre en esta sucursal.");
    }

    // Guardar la categoria
    const newCategory = await addCategoryServiceRepository(data);

    return newCategory;

}

export const listCategoryServiceS = async ( establishment_id: string ) => {

    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio");
    }

    // Validar de que la sucursal exista y este activa
    const validateEstablishment = await getEstablishmentByIdRepository(establishment_id);

    if ( !validateEstablishment ) {
        throw new Error("La sucursal no existe o esta inactiva.");
    }

    const listCategories = await listCategoriesServiceRepository(establishment_id);
    return listCategories;
    
}

export const deleteCategoryServiceS = async ( id: string ) => {
    if ( !id ) {
        throw new Error("El id de la categoria servicio es obligatorio");
    }

    // Validar de que el id exista
    const validateId = await getCategoryServiceById(id);
    if ( !validateId ) {
        throw new Error("No existe el id a eliminar, vuelve a intentarlo");
    }

    // Validar que no tenga servicios asociados
    const serviceCount = await countServicesByCategoryId(id);
    if (serviceCount > 0) {
        throw new Error("No se puede eliminar la categoría porque tiene servicios asociados.");
    }

    const deleteCategory = await deleteCategoryServiceRepository(id);
    return deleteCategory;
}

export const updateCategoryServiceS = async ( id: string, data: { name: string, description: string, status: number }) => {
    if ( !id ) {
        throw new Error("El id de la categoria servicio es obligatorio")
    }

    // Validar de que el id exista
    const validateId = await getCategoryServiceById(id);
    if ( !validateId ) {
        throw new Error("No existe el id a actualizar, vuelve a intentarlo");
    }

    // Validar que no exista otra categoría con ese nombre
    if (data.name) {
        const exists = await findCategoryServiceByNameExcludingId(data.name, id);
        if (exists) {
            throw new Error("Ya existe una categoría con ese nombre");
        }
    }

    const updateCategory = await updateCategoryServiceById(id, data);
    return updateCategory;
}

export const listActiveCategoriesServiceS = async (establishment_id: string) => {
    if (!establishment_id) {
        throw new Error("El id de la sucursal es obligatorio");
    }
    // Validar que la sucursal exista y esté activa
    const validateEstablishment = await getEstablishmentByIdRepository(establishment_id);
    if (!validateEstablishment) {
        throw new Error("La sucursal no existe o está inactiva.");
    }
    return await listActiveCategoriesServiceRepository(establishment_id);
};


