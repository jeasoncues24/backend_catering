import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedTaxes() {
    const taxes = [
        {
            name: "IGV 10%",
            rate: 10,
        },
        {
            name: "IGV 18%",
            rate: 18
        }
    ];

    for ( const tax of taxes ) {
        await prisma.taxes.create({
            data: tax
        });
    }

    console.log("Taxes seeded successfully");
 }