import { prisma } from "../config/db"


export const getCategoryProductByName = async(name: string, establishment_id: string ) => {

    return await prisma.productCategory.findFirst({
        where: {
            name,
            establishment_id
        }
    })

}


export const addCategoryProductRepository = async( data: { name: string, description: string, establishment_id: string, status: number }) => {
    return await prisma.productCategory.create({
        data: {
            name: data.name,
            description: data.description,
            establishment_id: data.establishment_id,
            status: data.status
        }
    })
}

export const listCategoriesProductRepository = async(establishment_id: string) => {
    return await prisma.productCategory.findMany({
        where: {
            establishment_id
        }
    })
}

export const listActiveCategoriesProducts = async (establishment_id: string) => {
    return await prisma.productCategory.findMany({
        where: {
            establishment_id,
            status: 1
        }
    });
};

export const countProductsByCategoryId = async (categoryId: string) => {
    return await prisma.product.count({
        where: {
            category_id: categoryId
        }
    });
};


export const deleteCategoryProductRepository = async ( id: string ) => {
    return await prisma.productCategory.delete({
        where: { id }
    })
}


export const getCategoryProductById = async ( id: string ) => {
    return await prisma.productCategory.findFirst({
        where: {
            id
        }
    })
}

export const findCategoryProductByNameExcludingId = async (name: string, id: string) => {
    return await prisma.productCategory.findFirst({
        where: {
            name,
            NOT: { id }
        }
    });
};

export const updateCategoryProductById = async (id: string, data: { name?: string, description?: string, status?: number }) => {
    return await prisma.productCategory.update({
        where: { id },
        data
    });
};
