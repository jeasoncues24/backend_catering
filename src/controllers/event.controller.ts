import { Request, Response } from "express";
import { addTypeEventService, listAllActivesTypesEventsService, listAllTypesEventsService } from "../services/event.service";



const listAllTypesEventsController = async (req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params;

        if ( !establishment_id ) {
            return res.status(500).json({
                status: false,
                message: `El id de la sucursal es obligatorio`
            })
        }

        const typesEvents = await listAllTypesEventsService(establishment_id);
        return res.status(200).json({
            status: true, 
            data: typesEvents
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
} 

const listAllActivesTypesEventsController = async (req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params;

        if ( !establishment_id ) {
            return res.status(500).json({
                status: false,
                message: `El id de la sucursal es obligatorio`
            })
        }

        const typesEvents = await listAllActivesTypesEventsService(establishment_id);
        return res.status(200).json({
            status: true, 
            data: typesEvents
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
} 

const addTypeEventController = async ( req: Request, res: Response ) => {
    try {

        console.log(req.body)
        const { name, description, status, isIgv, type, establishmentId } = req.body;

        if ( !name || !isIgv || !type || !establishmentId ) {
            return res.status(500).json({
                status: false, 
                message: "Los campos son obligatorios"
            })
        }

        const response = await addTypeEventService({ name, description, status, isIgv, type, establishmentId });
        return res.status(201).json({
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


export {
    listAllTypesEventsController,
    addTypeEventController,
    listAllActivesTypesEventsController
}