import { Request, Response } from "express";
import { addUserService, deleteUserService, getUserService, listUsersAdminService, updateUserService } from "../services/user.service";

const getUserController = async ( req: Request, res: Response ) => {
    try {
        const { companyId, establishmentId } = req.query;
        
        if (!companyId) {
            return res.status(400).json({
                status: false,
                message: "El companyId es requerido"
            });
        }

        const response = await getUserService({
            companyId: companyId as string,
            establishmentId: establishmentId as string
        });

        return res.status(200).json(response);

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
}

const deleteUserController = async ( req: Request, res: Response ) => {
    try {
        const { id } = req.params;

        const response = await deleteUserService(id!);
        return res.status(200).json({
            status: true,
            data: response
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
}

const addUserController = async ( req: Request, res: Response ) => {
    try {

        const { name, email, password, role, status, companyId, establishmentId } = req.body;

        const addUser = await addUserService({ name, email, password, role, status, companyId, establishmentId });

        return res.status(201).json({
            status: true,
            message: 'Usuario creado correctamente',
            data: addUser
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
}

const updateUserController = async ( req: Request, res: Response ) => {
    try {

        const { id } = req.params;
        const { name, password, status } = req.body;
        const updateUserCompany = await updateUserService( id!, { name, password, status });
        res.status(201).json({
            status: true,
            message: 'Usuario actualizado correctamente',
            data: updateUserCompany
        });
    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
}

const listUsersAdminController = async ( req: Request, res: Response ) => {
    try {   

        const listUsers = await listUsersAdminService();
        return res.status(200).json({
            status: 200,
            data: listUsers
        })

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}

export { 
    getUserController,
    deleteUserController,
    addUserController,
    updateUserController,
    listUsersAdminController
}