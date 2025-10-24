import { prisma } from "../config/db";
import { User } from "../interfaces/user.interface";


export const createUser = async (data: User) => {
    return await prisma.user.create({
        data: {
            email: data.email,
            password: data.password,
            name: data.name,
            role_id: data.role,
            status: data.status,
            companyId: data.companyId ?? null,
            establishment_id: data.establishmentId ?? null,
        },
    });
};

export const findUserByEmail = async (email: string) => {
    return await prisma.user.findUnique({
      where: { email }
    });
};


export const findUserByEmailActive = async (email: string) => {
    return await prisma.user.findFirst({
        where: { email },
        select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role_id: true,
            company: {
                select: {
                    id: true,
                    trade_name: true,
                    bussines_name: true,
                    identification: true,
                    establishment: {
                        take: 1,
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            },
            establishment: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });
};

export const findUserByEmailActiveToken = async (email: string) => {
    return await prisma.user.findFirst({
        where: { email },
        select: {
            id: true,
            email: true,
            password: true,
            name: true,
            role_id: true,
            refreshToken: true,
            company: {
                select: {
                    id: true,
                    trade_name: true,
                    establishment: {
                        take: 1,
                        select: {
                            id: true,
                            name: true,
                        }
                    }
                }
            },
            establishment: {
                select: {
                    id: true,
                    name: true,
                }
            }
        }
    });
};


export const getUserAll = async ( data: { companyId: string, establishmentId: string }) => {
    const { companyId, establishmentId } = data;

    if ( establishmentId === '' ) {
        return await prisma.user.findMany({
            where: {
                companyId: companyId,
                establishment_id: null
            },
            include: {
                collaborator: true
            }
        })
    }

    return await prisma.user.findMany({
        where: {
            companyId: companyId,
            establishment_id: establishmentId
        },
        include: {
            collaborator: true
        }
    });
}

export const getUserById = async ( id: string ) => {
    return await prisma.user.findFirst({
        where: { id }
    });
}

export const getCollaboratorById = async ( id: string ) => {
    return await prisma.collaborator.findFirst({
        where: {
            id
        }
    })
}

export const saveRefreshTokenToUser = async ( userId: string, token: string ) => {
    return await prisma.user.update({
        where: {
            id: userId
        },
        data: {
            refreshToken: token
        }
    })
}


export const deleteUserById = async ( id: string ) => {
    return await prisma.user.delete({
        where: { id }
    });
}

export const updateUserById = async (id: string, data: Partial<{ name: string, password: string, status: number }>) => {
    return await prisma.user.update({
        where: { id },
        data
    });
};

export const listUsersAdmin = async() => {
    return await prisma.user.findMany({
        where: {
            role_id: 1
        }
    })
}
