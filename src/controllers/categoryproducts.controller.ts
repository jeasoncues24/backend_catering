import { Request, Response } from "express";
import { addCategoryProductService, deleteCategoryProductS, listCategoryProductsActiveService, listCategoryProductService, updateCategoryProductS } from "../services/categoryproduct.service";

export const addCategoryProductController = async ( req: Request, res: Response ) => {
    try {

        const { name, description, establishment_id, status } = req.body;
                
        const responseCategoryProduct = await addCategoryProductService({name, description, establishment_id, status});

        return res.status(201).json({
            status: 201,
            message: "Se guardo correctamente",
            data: responseCategoryProduct
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: ``
        })
    }
}


export const deleteCategoryProductController = async ( req: Request, res: Response ) => {
    try {

        const { id } = req.params;
        const deleteCategoryService = await deleteCategoryProductS(id!);
        return res.status(200).json({
            status: 200,
            data: deleteCategoryService
        });

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        });
    }
}

export const updateCategoryProductController = async ( req: Request, res: Response ) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        const updateCategory = await updateCategoryProductS(id!, { name, description, status });
        return res.status(200).json({
            status: 200,
            data: updateCategory
        });
    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}


export const listCategoryProductController = async ( req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params; 
        const listCategories = await listCategoryProductService(establishment_id!);
        return res.status(200).json({
            status: 200,
            data: listCategories
        });

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        });
    }
}

export const listCategoryProductsActivesController = async ( req: Request, res: Response ) => {
    try {
        const { establishment_id } = req.params;
        const categories = await listCategoryProductsActiveService(establishment_id!);
        return res.status(200).json({
            status: 200,
            data: categories
        });
    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        })
    }
}