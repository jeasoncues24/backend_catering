import { prisma } from "../config/db"
import { Establishment } from "../interfaces/establishment.interface";

export const getBranchesCompany = async ( companyId: string ) => {
    return await prisma.establishment.findMany({
        where: {
            companyId
        }
    });
}

export const getEstablishmentByIdRepository = async ( id: string ) => {
    return await prisma.establishment.findUnique({
        where: { 
            id,
            status: 1
        }
    })
}

export const getStatusForBranch = async ( establishment_id: string ) => {
    return await prisma.establishment.findUnique({
        where: {
            id: establishment_id
        },
        select: {
            opening_establishment: true
        }
    })
}

export const updateStatusForBranch = async ( establishment_id: string, status: number ) => {
    return await prisma.establishment.update({
        where: {
            id: establishment_id
        },
        data: {
            opening_establishment: status
        }
    })
}

export const updateEstablishmentRepository = async ( id: string, data: Partial<Establishment>) => {
    const updateData: Record<string, any> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.province !== undefined) updateData.province = data.province;
    if (data.district !== undefined) updateData.district = data.district;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.banner_path !== undefined) updateData.banner_path = data.banner_path;

    return await prisma.establishment.update({
        where: { id },
        data: updateData
    })
}


export const deleteEstablishmentRepository = async ( id: string ) => {
    return await prisma.establishment.delete({
        where: { id }
    })
}

export const countEstablishmentsByCompany = async ( companyId: string ) => {
    return await prisma.establishment.count({
        where: {
            companyId,
            status: 1
        }
    });
}

export const infoBranchById = async ( id: string ) => {
    return await prisma.establishment.findFirst({
        where: {
            id,
            status: 1
        }
    })
} 


export const createEstablishmentRepository = async ( data: Partial<Establishment> ) => {
    return await prisma.$transaction(async (tx) => {
        const branch = await prisma.establishment.create({
            data: {
                name: data.name!,
                city: data.city!,
                district: data.district!,
                province: data.province!,
                companyId: data.companyId!,
                status: 1
            }
        });

        const currency = await tx.coinsCompany.create({
            data: {
                establishment_id: branch.id,
                coins_id: 1,
                status: 1
            }
        });

        const payment = await tx.payments.create({
            data: {
                establishment_id: branch.id,
                coins_id: currency.id,
                name: 'Efectivo',
                description: 'Efectivo',
                status: 1
            }
        });

        return {
            branch,
            currency,
            payment
        }
    })
}


export const getInformationForBranchRepository = async ( tradename: string, branch: string ) => {
    const company = await prisma.company.findFirst({
        where: { trade_name: tradename },
        select: {
            id: true,
            trade_name: true,
            bussines_name: true,
            phone: true,
            address: true,
            logo_path: true
        }
    });

    
    if (!company) return null;
    const normalizedBranch = normalizeBranchName(branch);

    const establishment = await prisma.establishment.findFirst({
        where: {
            name: normalizedBranch,
            companyId: company.id
        },
        select: {
            id: true,
            name: true,
            banner_path: true,
            opening_establishment: true
        }
    });

    if (!establishment) return null;

    return { company, branch: establishment };
}

function normalizeBranchName(branch: string) {
    // Quita guiones, pone espacios y capitaliza cada palabra
    return branch
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
