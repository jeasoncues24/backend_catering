import { prisma } from "../config/db"

export const getCompanyByIdRepository = async (id: string) => {
    return await prisma.company.findUnique({
        where: { id }
    });
}

export const validateEmailExist = async (data: { email: string }) => {
    return await prisma.user.findFirst({
        where: {
            email: data.email
        }
    })
}


export const updateCompanyRepository = async (id: string, data: Partial<any>) => {
    return await prisma.company.update({
        where: { id },
        data: {
            identification: data.identification,
            bussines_name: data.bussines_name,
            type_company_id: Number(data.type_company_id),
            trade_name: data.trade_name,
            phone: data.phone,
            address: data.address,
            logo_path: data.logo_path,
            tax_id: Number(data.tax_id),
            logo_ticket: Number(data.logo_ticket),
            isReturnMoney: Number(data.isReturnMoney),
            isEventSocials: Number(data.isEventSocials),
            isEventCorporate: Number(data.isEventCorporate),
            isPolityPayment: Number(data.isPolityPayment) // mantiene una politica de pagos ¿? 

        }
    });
}

export const listAllCompanies = async () => {
    return await prisma.company.findMany();
}
