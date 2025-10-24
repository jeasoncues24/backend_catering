import { Company } from "../interfaces/company.interface";
import { getCompanyByIdRepository, updateCompanyRepository, listAllCompanies } from "../repositories/company.repository";

export const listAllCompaniesService = async() => {
    return await listAllCompanies();
}

export const getCompanyService = async (id: string) => {
    if ( !id ) {
        throw new Error("Debe enviar el id de la empresa");
    }

    const getCompanyById = await getCompanyByIdRepository(id);
    return getCompanyById;
}

export const updateCompanyService = async (id: string, data: Partial<Company>) => {
    if (!id) {
        throw new Error("Debe enviar el id de la empresa");
    }

    // Verificar si la empresa existe
    const company = await getCompanyByIdRepository(id);
    if (!company) {
        throw new Error("La empresa no existe");
    }
   
    // Actualizar la empresa
    const updatedCompany = await updateCompanyRepository(id, data);
    return updatedCompany;
}




