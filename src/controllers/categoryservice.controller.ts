import { Request, Response } from "express";
import { addCategoryServiceS, deleteCategoryServiceS, listCategoryServiceS, updateCategoryServiceS, listActiveCategoriesServiceS } from "../services/categoryservice.service";



const addCategoryServiceController = async ( req: Request, res: Response ) => {
    try {

        const { name, description, establishment_id, status } = req.body;
        
        const responseCategoryService = await addCategoryServiceS({name, description, establishment_id, status});

        return res.status(201).json({
            status: 201,
            message: "Se guardo correctamente",
            data: responseCategoryService
        })

    } catch ( error ) {
        return res.status(500).json({
            status: 500,
            message: `${ error }`
        });
    }
}

const listCategoryServiceController = async ( req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params; 
        const listCategories = await listCategoryServiceS(establishment_id!);
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

const deleteCategoryServiceController = async ( req: Request, res: Response ) => {
    try {

        const { id } = req.params;
        const deleteCategoryService = await deleteCategoryServiceS(id!);
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

const updateCategoryServiceController = async ( req: Request, res: Response ) => {
    try {
        const { id } = req.params;
        const { name, description, status } = req.body;
        const updateCategory = await updateCategoryServiceS(id!, { name, description, status });
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

const listCategoriesActivesController = async ( req: Request, res: Response ) => {
    try {
        const { establishment_id } = req.params;
        const categories = await listActiveCategoriesServiceS(establishment_id!);
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

export {
    addCategoryServiceController,
    listCategoriesActivesController,
    listCategoryServiceController,
    deleteCategoryServiceController,
    updateCategoryServiceController,
}