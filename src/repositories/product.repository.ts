import { prisma } from "../config/db"


export const getProductByName = async (name: string, establishment_id: string) => {
    return await prisma.product.findFirst({
        where: {
            name,
            establishment_id
        }
    })
}


export const addProduct = async ( data: Partial<any>) => {
    return await prisma.product.create({
        data: {
            name: data.name!,
            price: Number(data.price),
            category_id: data.category_id!,
            establishment_id: data.establishment_id!,
            image: data.image,
            status: Number(data.status),
            type: data.type,
            color: data.color,
            label: data.label,
            is_Company: Number(data.is_Company)
        }
    })
}


export const getProductsListRepository = async ( establishment_id: string ) => {
    return await prisma.product.findMany({
        where: {
            establishment_id
        },
        include: {
            category: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    })
}