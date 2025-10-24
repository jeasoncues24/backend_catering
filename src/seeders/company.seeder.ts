import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCompany() {
    const company = [
        {
            identification: "20606368349",
            bussines_name:  "LEON SOLEDAD CATERING S.A.C",
            type_company_id: 1,
            trade_name: "LEON SOLEDAD CATERING",
            phone: "957532973",
            address: "PIURA",
            tax_id: 2
        }
    ];

    for (const companyData of company) {
        // Crear la empresa
        const company = await prisma.company.create({
            data: companyData,
        });

        // Crear sucursal principal asociada a la empresa
        await prisma.establishment.create({
            data: {
                name: "Sucursal Principal",
                city: 1,
                province: 1,
                district: 1,
                companyId: company.id, 
                status: 1,
                opening_establishment: 1,
                isActive_payment: 0,
                isOnline: 1,
                isService_house: 0,
            },
        });
    }

    console.log("Company seeded successfully")
}