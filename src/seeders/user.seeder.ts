import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function seedUsers() {
    const existingUser = await prisma.user.findUnique({
        where: { email: "jeasoncues@gmail.com" }
    });

    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('74237028', 10);

        const company = await prisma.company.findFirst({
            select: { id: true }, 
        });

        
        if (!company) {
            throw new Error("No existe ninguna empresa en la base de datos.");
        }

        await prisma.user.create({
            data: {
                name: "jeasoncues",
                email: "jeasoncues@gmail.com",
                password: hashedPassword,
                role_id: 1,
                status: 1,
                companyId: company.id
            }
        });

        console.log("User super admin seeded successfully");
    } else {
        console.log("User super admin already exists, skipping seed.");
    }
}
