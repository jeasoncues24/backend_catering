import { Establishment } from "../interfaces/establishment.interface";
import { countEstablishmentsByCompany, deleteEstablishmentRepository, getBranchesCompany, getEstablishmentByIdRepository, getInformationForBranchRepository, getStatusForBranch, updateEstablishmentRepository, updateStatusForBranch } from "../repositories/branches.repository";

import { getCompanyByIdRepository } from "../repositories/company.repository";


export const getBranchCompanyService = async ( companyId: string ) => {
    if ( !companyId ) {
        throw new Error("Debe ingresar el id de empresa");
    }

    const branchCompany = await getBranchesCompany(companyId);
    return branchCompany;
}

// export const addBranchService = async ( data: Partial<Establishment> ) => {

//     if ( !data.name  ) {
//         throw new Error("Debe ingresar el nombre de la sucursal.");
//     }

//     // Validar de que el id de la empresa exista
//     const company = await getCompanyByIdRepository(data.companyId!);

//     if ( !company ) {
//         throw new Error("La empresa no existe, vuelve a intentarlo");
//     }



//     // Verificar cuántas sucursales tiene actualmente la empresa
//     const currentBranchesCount = await countEstablishmentsByCompany(company.id);


//     // Crear la nueva sucursal
//     const newBranch = await createEstablishmentRepository(data);

//     return newBranch;

// }

export const updateEstablishmentService = async ( id: string, data: Partial<Establishment> ) => {

    if ( !id ) {
        throw new Error("Debe enviar el id de la sucursal");
    }

    const establishment = await getEstablishmentByIdRepository(id);

    if ( !establishment ) {
        throw new Error("La sucursal no existe");
    }

    const updateEstablisment = await updateEstablishmentRepository(id, data);

    return updateEstablisment;
}


export const deleteEstablishmentService = async ( id: string ) => {
    if ( !id ) {
        throw new Error("Debe enviar el id de la sucursal");
    }

    // Primero verificamos que la sucursal existe
    const establishment = await getEstablishmentByIdRepository(id);
    if ( !establishment ) {
        throw new Error("La sucursal no existe");
    }

    // Verificamos cuántas sucursales tiene la empresa
    const establishmentCount = await countEstablishmentsByCompany(establishment.companyId);
    
    // Si solo tiene una sucursal, no permitimos eliminarla
    if ( establishmentCount <= 1 ) {
        throw new Error("No se puede eliminar la sucursal. La empresa debe tener al menos una sucursal activa para el funcionamiento del sistema.");
    }

    const deleteEstablishment = await deleteEstablishmentRepository(id);
    return deleteEstablishment;
}

export const getEstablishmentService = async ( id: string ) => {
    if ( !id ) {
        throw new Error("Debe enviar el id de la sucursal");
    }

    const establishment = await getEstablishmentByIdRepository(id);

    if ( !establishment ) {
        throw new Error("La sucursal no existe");
    }

    return establishment;
}


export const getInformationForBranchService = async (tradename: string, branch: string) => {
    if (!tradename || !branch) {
        throw new Error("Debe enviar el tradename y branch son obligatorios");
    }

    // Convertir guiones a espacios
    const tradenameDB = tradename.replace(/-/g, " ");
    const branchDB = branch.replace(/-/g, " ");

    // Validar de que exista el tradename con branch
    const branchCompany = await getInformationForBranchRepository(tradenameDB, branchDB);

    if (!branchCompany) {
        throw new Error("No existe la sucursal, vuelve a intentarlo.");
    }

    // Retornar la información encontrada
    return branchCompany;
}

export const getStatusForBranchService = async ( establishment_id: string ) => {
    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio");
    }

    const establishment = await getEstablishmentByIdRepository(establishment_id);

    if ( !establishment ) {
        throw new Error("La sucursal no existe o no esta activa.");
    }

    // Mostar status de la sucursal
    const responseData = await getStatusForBranch(establishment_id);
    return responseData;
}

export const updateStatusForBranchService = async ( establishment_id: string, status: number ) => {
    if ( !establishment_id ) {
        throw new Error("El id de la sucursal es obligatorio");
    }

    const establishment = await getEstablishmentByIdRepository(establishment_id);

    if ( !establishment ) {
        throw new Error("La sucursal no existe o no esta activa.");
    }

    // Actualizar status de la sucursal
    const responseData = await updateStatusForBranch(establishment_id, status);
    return responseData;
}


// 