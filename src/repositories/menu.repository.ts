import { prisma } from "../config/db"

export const addTypeMenu = async ( establishmentId: string, name: string, price: any ) => {
    return await prisma.typeComponentMenu.create({
        data: {
            establishmentId,
            name, 
            price
        }
    })
}


export const getByNameTypeMenu = async ( establishmentId: string, name: string ) => {
    return await prisma.typeComponentMenu.findFirst({
        where: {
            establishmentId,
            name
        }
    })
}


export const listTypeMenu = async ( establishmentId: string ) => {
    return await prisma.typeComponentMenu.findMany({
        where: {
            establishmentId
        }
    })
}

export const listStructureMenu = async ( establishmentId: string ) => {
    return await prisma.structureMenu.findMany({
        where: {
            establishment_id: establishmentId
        }
    })
}

export const listBuildYourMenu = async ( establishmentId: string ) => {
    return await prisma.buildYourMenu.findMany({
        where: {
            establishmentId
        },
        include: {
            structureMenu: {
                select: {
                    name: true
                }
            },
            typeComponentMenu: {
                select: {
                    name: true
                }
            },
            product: {
                select: { 
                    name: true
                }
            }
        }
    })
}



export const addStructureMenu = async ( name: string, order: number, status: number, establishmentId: string ) => {
    return await prisma.structureMenu.create({
        data: {
            name, 
            order,
            status,
            establishment_id: establishmentId
        }
    })
}


export const addBuildYourMenu = async ( type_component_menu_id: string, structure_menu_id: string, product_id: string, status: number, establishmentId: string ) => {
    return await prisma.buildYourMenu.create({
        data: {
            type_component_menu_id,
            structureMenuId: structure_menu_id,
            product_id,
            status,
            establishmentId       
        }
    })
}

export const getByNameStructureMenu = async ( name: string, establishmentId: string ) => {
    return await prisma.structureMenu.findFirst({
        where: {
            name, 
            establishment_id: establishmentId
        }
    })
}