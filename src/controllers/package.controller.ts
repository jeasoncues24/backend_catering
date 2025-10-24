import { Request, Response } from "express";
import { addPackageService, createPackageService, detailForProformaService, getPackagesByEstablishmentService, informationPackageService } from "../services/package.service";
import { Decimal } from "@prisma/client/runtime/library";

export const addPackageController = async ( req: Request, res: Response ) => {
    try {

        const {  name, description, quantity_person, price_person, event_id, local_id, isGift, establishment_id } = req.body; 

          const packageData = {
            name,
            description,
            quantity_person: parseInt(quantity_person, 10), 
            price_person: new Decimal(price_person),           
            event_id,
            local_id,
            isGift: parseInt(isGift, 10),               
            establishment_id
        };

        const newPackage = await addPackageService(packageData);

        return res.status(201).json({
            status: true,
            message: "Paquete agregado exitosamente",
            data: newPackage
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
} 


export const getPackagesByEstablishmentController = async ( req: Request, res: Response ) => {
    try {
        const { establishment_id } = req.params;

        if ( !establishment_id ) {
            return res.status(400).json({
                status: false,
                message: "El ID del establecimiento es obligatorio"
            });
        }

        const response = await getPackagesByEstablishmentService(establishment_id);
        return res.status(200).json({
            status: true,
            message: "Paquetes obtenidos exitosamente",
            data: response
        });
    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        });
    }   
}

export const informationPackageController = async ( req: Request, res: Response ) => {
    try {

        const { id } = req.params;

        if ( !id ) {
            return res.status(400).json({
                status: false,
                message: "El ID del paquete es obligatorio"
            });
        }

        const response = await informationPackageService(id);
        return res.status(200).json({
            status: true,
            data: response
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        });
    }
}


export const detailForProformaController = async ( req: Request, res: Response ) => {
    try {

        const { id } = req.params;

        if ( !id ) {
            return res.status(400).json({
                status: false,
                message: "El ID del paquete es obligatorio"
            });
        }

        const response = await detailForProformaService(id);
        return res.status(200).json({
            status: true,
            data: response
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        });
    }
}


export const addInformationPackageController = async ( req: Request, res: Response ) => {
    try {
        const packageData = req.body;

        if (!packageData.name || !packageData.eventType) {
            return res.status(400).json({
                status: false,
                message: 'Nombre y tipo de evento son requeridos',
            });
        }

        if (!packageData.services || packageData.services.length === 0) {
            return res.status(400).json({
                status: false,
                message: 'Debe incluir al menos un servicio',
            });
        }

        const result = await createPackageService(packageData);

        return res.status(201).json({
            status: true,
            message: 'Se creo correctamente el detalle del paquete',
            data: result,
        });

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}