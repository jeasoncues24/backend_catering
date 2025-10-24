import { Request, Response } from "express";
import uploadLogo from "../middlewares/upload.logo";
import { getCompanyService, listAllCompaniesService, updateCompanyService } from "../services/company.service";



const getCompanyController = async ( req: Request, res: Response ) => {
    try {
        const { id } = req.params;
        const company = await getCompanyService(String(id));
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }
        res.status(200).json({
            status: true, 
            data: company
        });
    } catch ( error ) {
        return res.status(500).json({
            status: 500, 
            message: `Ocurrio un error ${error}`
        });
    }
}

const updateCompanyController = async (req: Request, res: Response) => {
  uploadLogo.single("logo")(req, res, async (err: any) => {
    try {
      if (err) {
        return res.status(400).json({
          status: false,
          message: err.message,
        });
      }

      const { id } = req.params;
      const { body } = req;

      // nombre del archivo subido
      const imagePath = req.file?.filename || "";

      const updatedBody = {
        ...body,
        logo_path: imagePath ? `/uploads/logos/${imagePath}` : undefined,
      };

      const updateCompany = await updateCompanyService(id!, updatedBody);

      return res.status(200).json({
        status: true,
        data: updateCompany,
      });
    } catch (error) {
      return res.status(500).json({
        status: false,
        message: `Ocurrió un error: ${error}`,
      });
    }
  });
};

const listAllCompaniesController = async ( req: Request, res: Response ) => {
    try {
        const listAll = await listAllCompaniesService();
        return res.status(200).json({
            status: 200,
            data: listAll
        })

    } catch ( error ) {
        return res.status(500).json({
            status: 500, 
            message: `${ error }`
        })
    }
}

export {
    getCompanyController,
    listAllCompaniesController,
    updateCompanyController
}