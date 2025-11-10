import { Request, Response } from "express";
import { addServiceS, amarrarColaboradorService, amarrarProductosService, deleteServiceS, getServiceListS, listActivesService, listColaboradorService, listServicesForQuotesService, updateServiceS } from "../services/service.service";
import uploadServices from "../middlewares/upload.services";

const addServiceController = async ( req: Request, res: Response ) => {
    try {
        uploadServices.single("image")(req, res, async ( err ) => {
            if ( err ){
                return res.status(400).json({
                    status: 400,
                    message: err.message
                });
            }

            const { body } = req;

            const imagePath = req.file?.filename || "";

            const newService = {
                ...body,
                image: imagePath ? `/uploads/services/${imagePath}` : undefined
            };

            const addService = await addServiceS(newService);

            return res.status(201).json({
                status: 201,
                data: addService
            })
        })

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}

const amarrarProductosController = async ( req: Request, res: Response ) => {
    try {

        const { productId, serviceId, status } = req.body;

        const newRelation = await amarrarProductosService({
        productId,
        serviceId,
        status: Number(status) || 1,
        });

        return res.status(201).json({
            success: true,
            message: "Producto amarrado correctamente al servicio",
            data: newRelation,
        });

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}

const amarrarColaboradorController = async ( req: Request, res: Response ) => {
    try {

        const { colaboradorId, serviceId, status } = req.body;

        const newRelation = await amarrarColaboradorService({
            colaboradorId,
            serviceId,
            status: Number(status) || 1,
        });

        return res.status(201).json({
            success: true,
            message: "Colaborador amarrado correctamente al servicio",
            data: newRelation,
        });

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}

const listColaboresAmarradosController = async ( req: Request, res: Response ) => {
    try {

        const { serviceId } = req.params;

        if ( !serviceId ) {
            return res.status(404).json({
                success: false,
                message: 'El service id no existe'
            })
        }

        const newRelation = await listColaboradorService(serviceId);

        return res.status(201).json({
            success: true,
            data: newRelation,
        });

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}

const updateServiceController = async ( req: Request, res: Response ) => {
    try {
        uploadServices.single("image")(req, res, async ( err ) => {
            if ( err ){
                return res.status(400).json({
                    status: 400,
                    message: err.message
                });
            }

            const { body } = req;
            const { id } = req.params;
            const imagePath = req.file?.filename || "";

            const updateData = {
                ...body,
                image: imagePath ? `/uploads/services/${imagePath}` : undefined
            };

            try {
                const updatedService = await updateServiceS(id!, updateData);
                return res.status(200).json({
                    status: 200,
                    data: updatedService
                });
            } catch (error) {
                return res.status(400).json({
                    status: 400,
                    message: `${error}`
                });
            }
        })
    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}

const getServiceListController = async ( req: Request, res: Response ) => {
    try {
        const { establishment_id } = req.params;
        const getServices = await getServiceListS(establishment_id!);
        return res.status(200).json({
            status: 200,
            data: getServices
        })

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}

const deleteServiceController = async ( req: Request, res: Response ) => {
    try {
        const { id } = req.params;
        const deleteService = await deleteServiceS(id!);
        return res.status(200).json({
            status: 200,
            data: deleteService
        });

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}

const listActivesController = async ( req: Request, res: Response ) => {
    try {   

        const { establishment_id } = req.params;

        const listActives = await listActivesService(establishment_id!);
        return res.status(200).json({
            status: 200,
            data: listActives
        })

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}

const listServicesForQuotesController = async ( req: Request, res: Response ) => {
    try {   
        const { establishment_id, category_id } = req.body;
        const categoryParam = category_id ?? "";
        const listServicesForQuotes = await listServicesForQuotesService(establishment_id, categoryParam);
        return res.status(200).json({
            status: 200,
            data: listServicesForQuotes
        })
    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}


export { 
    addServiceController,
    getServiceListController,
    listServicesForQuotesController,
    deleteServiceController,
    listActivesController,
    updateServiceController,
    amarrarProductosController,
    amarrarColaboradorController,
    listColaboresAmarradosController
}