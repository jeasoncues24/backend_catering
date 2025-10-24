import { Request, Response } from "express";
import { addProviderService, listAllProviderService, listProviderActivesService } from "../services/provider.service";

export const listAllProviderController =  async ( req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params;

        if ( !establishment_id ) {
            return res.status(500).json({
                status: false,
                message: "El id de la sucursal es obligatorio"
            })
        }

        const data = await listAllProviderService(establishment_id)
        return res.status(200).json({
            status: true,
            data: data
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        })
    }
}

export const listProviderActivesController = async ( req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params;

        if ( !establishment_id ) {
            return res.status(500).json({
                status: false,
                message: "El id de la sucursal es obligatorio"
            })
        }

        const data = await listProviderActivesService(establishment_id)
        return res.status(200).json({
            status: true,
            data: data
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}


export const addProviderController = async ( req: Request, res: Response ) => {
    try {

        const { name, bussines_name, identification, email, phone, status, establishmentId } = req.body;
        
        if ( !name || !bussines_name || !identification || !email || !phone || !establishmentId ) {
            return res.status(500).json({
                status: false, 
                message: "Los campos son obligatorios"
            })
        }

        const data = await addProviderService({ name, bussines_name, identification, email, phone, status, establishmentId });
        return res.status(201).json({
            status: true,
            data: data
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        })
    }
}