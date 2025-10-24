import bcrypt from "bcryptjs";
import { createUser, deleteUserById, findUserByEmail, getUserAll, getUserById, listUsersAdmin, updateUserById } from "../repositories/user.repository";
import { User } from "../interfaces/user.interface";
import { encrypt } from "../utils/bcrypt.handle";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getUserService = async ( data: { companyId: string, establishmentId: string } ) => {
    
    if ( !data.companyId ) {
        throw new Error("El companyId es obligatorio");
    }

    // Listar todos los usuarios de la sucursal
    const listAllUser = await getUserAll(data);

    return listAllUser;
}


export const deleteUserService = async ( id: string ) => {

    if ( !id ) {
        throw new Error("El id del usuario es obligatorio");
    }

    // Validar de que el usuario exista
    const isUser = await getUserById(id);

    if ( !isUser ) {
        throw new Error("El usuario no existe");
    }

    // Eliminar el usuario 
    const deleteUser = await deleteUserById(id);

    return deleteUser;
}

export const addUserService = async ( data: User ) => {

    if ( !data.email || !data.name || !data.password || !data.role || !data.status || !data.companyId || !data.establishmentId ) {
        throw new Error("Los campos son obligatorios");
    }

    // Validar de que el email no exista
    const validateEmailUser = await findUserByEmail(data.email);

    if ( validateEmailUser ) {
        throw new Error("El email ya existe, vuelve a intentarlo.");
    }

    const passHash = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const newUser = await createUser({
        ...data,
        password: passHash
    });

    // Si el rol es 4, crear también el registro en Collaborator
    if (data.role === 4) {
        await prisma.collaborator.create({
            data: {
                user_id: newUser.id,
                salary: 0,
                name: newUser.name,
                description: newUser.name,
                emergency_contact: null,
                specialties: "STAFF",
                status: 1
            }
        });
    }

    return newUser;
}



export const updateUserService = async ( id: string, data: { name: string, password: string, status: number }) => {
    const user = await getUserById(id);
    if (!user) {
        throw new Error("Usuario no encontrado");
    }

    const updateData: any = {
        name: data.name,
        status: data.status
    };

    if (data.password) {
        updateData.password = await encrypt(data.password);
    }

    const updatedUser = await updateUserById(id, updateData);
    return updatedUser;
}

export const listUsersAdminService = async ( ) => {
    return await listUsersAdmin();
}