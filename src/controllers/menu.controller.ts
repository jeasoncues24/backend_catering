import { Request, Response } from "express";
import { addBuildYourMenuService, addStructureMenuService, addTypeMenuService, listBuildYourMenuService, listStructureMenuService, listTypeMenuService } from "../services/menu.service";

export const addTypeMenuController = async(req: Request, res: Response) => {
    try {

        const { name, price, establishmentId } = req.body;

        if ( !establishmentId || !name ) {
            return res.status(500).json({
                status: false,
                message: `El id de la sucursal y el nombre del tipo de menu es obligatorio.`
            })
        }

        const response = await addTypeMenuService(establishmentId, name, price);

        return res.status(201).json({
            status: true, 
            message: 'Se creo correctamente el tipo de menu',
            data: response
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}


export const listTypeMenuController = async ( req: Request, res: Response ) => {
    try { 

        const { establishmentId } = req.params; 

        if ( !establishmentId ) {
            return res.status(500).json({
                status: false,
                message: 'El id de la sucursal es obligatorio'
            })
        }

        const data = await listTypeMenuService(establishmentId);

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


export const addStructureMenuController = async ( req: Request, res: Response ) => {
    try {

        const { name, order, status, establishmentId } = req.body;

        if ( !establishmentId || !name ) {
            return res.status(500).json({
                status: false,
                message: 'Los campos son obligatorios'
            })
        }

        const data = await addStructureMenuService(name, order, status, establishmentId);

        return res.status(201).json({
            status: true,
            message: 'Se creo correctamente la estructura de menu',
            data: data
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}

export const addBuildYourMenuController = async ( req: Request, res: Response ) => {
    try {

        const { type_component_menu_id, structure_menu_id, product_id, status, establishmentId } = req.body;

        if ( !establishmentId || !type_component_menu_id || !structure_menu_id  || !product_id) {
            return res.status(500).json({
                status: false,
                message: 'Los campos son obligatorios'
            })
        }

        const data = await addBuildYourMenuService(type_component_menu_id, structure_menu_id, product_id, status, establishmentId);

        return res.status(201).json({
            status: true,
            message: 'Se creo correctamente la estructura de menu',
            data: data
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}

export const listStructureMenuController = async ( req: Request, res: Response ) => {
    try { 

        const { establishmentId } = req.params; 

        if ( !establishmentId ) {
            return res.status(500).json({
                status: false,
                message: 'El id de la sucursal es obligatorio'
            })
        }

        const data = await listStructureMenuService(establishmentId);

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


export const listBuildYourMenuController = async ( req: Request, res: Response ) => {
    try { 

        const { establishmentId } = req.params; 

        if ( !establishmentId ) {
            return res.status(500).json({
                status: false,
                message: 'El id de la sucursal es obligatorio'
            })
        }

        const data = await listBuildYourMenuService(establishmentId);

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
