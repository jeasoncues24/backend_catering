import { Request, Response } from "express";
import { addLocalService, listLocalesActivesService, listLocalesService } from "../services/local.service";

export const listLocalesController = async ( req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params;

        if ( !establishment_id ) { 
            return res.status(500).json({
                status: false,
                message: "El id de la sucursal es obligatorio"
            })
        }

        const response = await listLocalesService(establishment_id)
        return res.status(200).json({
            status: true,
            data: response
        })

    } catch ( error: any ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
}

export const listLocalesActivesController = async ( req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params;

        if ( !establishment_id ) { 
            return res.status(500).json({
                status: false,
                message: "El id de la sucursal es obligatorio"
            })
        }

        const response = await listLocalesActivesService(establishment_id)
        return res.status(200).json({
            status: true,
            data: response
        })

    } catch ( error: any ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
}



export const addLocalController = async ( req: Request, res: Response ) => {
    try {

        const { name, capacity, description, characteristics, ubication, reference, price_aprox, establishment_id } = req.body;

        if ( !name || !capacity || !characteristics || !ubication || !reference || !price_aprox || !establishment_id) {
            return res.status(500).json({
                status: false,
                message: "los campos son obligatorios"
            });
        }

        const response  = await addLocalService(name, capacity, description, characteristics, ubication, reference, price_aprox, establishment_id);
        return res.status(201).json({
            status: true,
            data: response
        })

    } catch ( error: any ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
}