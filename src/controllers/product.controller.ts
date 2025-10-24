import { Request, Response } from "express";
import { addServiceS, deleteServiceS, getServiceListS, listActivesService, listServicesForQuotesService, updateServiceS } from "../services/service.service";
import uploadProducts from "../middlewares/upload.products";
import { addProductService, getProductsListS } from "../services/product.service";

export const addProductController = async ( req: Request, res: Response ) => {
    try {
        uploadProducts.single("image")(req, res, async ( err ) => {
            if ( err ){
                return res.status(400).json({
                    status: 400,
                    message: err.message
                });
            }

            const { body } = req;

            const imagePath = req.file?.filename || "";

            const newProduct = {
                ...body,
                image: imagePath ? `/uploads/products/${imagePath}` : undefined
            };

            const addProduct = await addProductService(newProduct);

            return res.status(201).json({
                status: 201,
                data: addProduct
            })
        })

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}


export const getProductsListController = async ( req: Request, res: Response ) => {
    try {
        const { establishment_id } = req.params;
        const getProducts = await getProductsListS(establishment_id!);
        return res.status(200).json({
            status: 200,
            data: getProducts
        })

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}