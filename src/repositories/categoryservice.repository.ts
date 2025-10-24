import { prisma } from "../config/db"


export const getCategoryServiceByName = async(name: string, establishment_id: string ) => {

    return await prisma.serviceCategory.findFirst({
        where: {
            name,
            establishment_id
        }
    })

}


export const addCategoryServiceRepository = async( data: { name: string, description: string, establishment_id: string, status: number }) => {
    return await prisma.serviceCategory.create({
        data: {
            name: data.name,
            description: data.description,
            establishment_id: data.establishment_id,
            status: data.status
        }
    })
}

export const listCategoriesServiceRepository = async(establishment_id: string) => {
    return await prisma.serviceCategory.findMany({
        where: {
            establishment_id
        }
    })
}

export const getCategoryServiceById = async ( id: string ) => {
    return await prisma.serviceCategory.findFirst({
        where: {
            id
        }
    })
}


export const deleteCategoryServiceRepository = async ( id: string ) => {
    return await prisma.serviceCategory.delete({
        where: { id }
    })
}

export const findCategoryServiceByNameExcludingId = async (name: string, id: string) => {
    return await prisma.serviceCategory.findFirst({
        where: {
            name,
            NOT: { id }
        }
    });
};

export const updateCategoryServiceById = async (id: string, data: { name?: string, description?: string, status?: number }) => {
    return await prisma.serviceCategory.update({
        where: { id },
        data
    });
};

export const countServicesByCategoryId = async (categoryId: string) => {
    return await prisma.service.count({
        where: {
            category_id: categoryId
        }
    });
};

export const listActiveCategoriesServiceRepository = async (establishment_id: string) => {
    return await prisma.serviceCategory.findMany({
        where: {
            establishment_id,
            status: 1
        }
    });
};


