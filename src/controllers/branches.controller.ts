import { Response, Request } from "express";

import uploadBanner from "../middlewares/upload.banner";
import { deleteEstablishmentService, getBranchCompanyService, getEstablishmentService, getInformationForBranchService, getStatusForBranchService, updateEstablishmentService, updateStatusForBranchService } from "../services/branches.service";

const getBranchesForCompanyControllers = async ( req: Request, res: Response ) => {
    try {
        const { companyId } = req.body;
        const getBranchCompany = await getBranchCompanyService(companyId);
        return res.status(200).json({
            status: 200, 
            data: getBranchCompany
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        })
    }
} 

// const addBranchController = async ( req: Request, res: Response ) => {
//     try {

//         const body = req.body;
//         const newBranch = await addBranchService(body);
//         return res.status(201).json({
//             status: 201,
//             message: "Se guardo correctamente la sucursal",
//             data: newBranch
//         })

//     } catch ( error ) {
//         return res.status(500).json({
//             status: false,
//             message: `${ error }`
//         })
//     }
// }

const updateBranchController = async ( req: Request, res: Response ) => {
    try {
        uploadBanner.single("banner")(req, res, async ( err ) => {
            if ( err ) {
                return res.status(400).json({
                    status: 400,
                    message: err.message
                })
            }

            const { id } = req.params;
            const { body } = req;

            // const imagePath = req.file?.filename || "";

            // const updateBody = {
            //     ...body,
            //     banner_path: imagePath ? `/uploads/banners/${imagePath}` : undefined
            // };

            const updateEstablisment = await updateEstablishmentService(id!, body);

            return res.status(200).json({
                status: true,
                data: updateEstablisment
            })


        });
    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `Ocurrio un error ${ error }`
        });
    }
}


const deleteBranchController = async ( req: Request, res: Response ) => {
    try {

        const { id } = req.params; 

        const deleteEstablishment = await deleteEstablishmentService(id!);
        return res.status(200).json({
            status: true, 
            data: deleteEstablishment
        })

    } catch ( error ) {
        return res.status(500).json({
            status: true,
            message: `${ error }`
        });
    }
}

const getEstablishmentController = async ( req: Request, res: Response ) => {
    try {

        const { id } = req.params; 
        const getInformation = await getEstablishmentService(id!);
        return res.status(200).json({
            status: true, 
            data: getInformation
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false, 
            message: `${ error }`
        });
    }
}

const getInformationForBranchController = async ( req: Request, res: Response ) => {
    try {

        const { tradename, branch } = req.params;

        const getInformationForBranch = await getInformationForBranchService(tradename!, branch!);
        return res.status(200).json({
            status: true,
            data: getInformationForBranch
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}


const getStatusForBranchController = async ( req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params;
        const getStatus = await getStatusForBranchService(establishment_id!);
        return res.status(200).json({
            status: 200,
            data: getStatus
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}

const updateStatusForBranchController = async ( req: Request, res: Response ) => {
    try {

        const { establishment_id } = req.params;
        const { status } = req.body;
        const getStatus = await updateStatusForBranchService(establishment_id!, status);
        return res.status(200).json({
            status: 200,
            message: "El estado del local se actualizo correctamente"
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}



export {
    getBranchesForCompanyControllers,
    updateStatusForBranchController,
    updateBranchController,
    getInformationForBranchController,
    deleteBranchController,
    getEstablishmentController,
    // addBranchController,
    getStatusForBranchController
}