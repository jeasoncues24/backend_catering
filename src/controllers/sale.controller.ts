import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listSalesController = async (req: Request, res: Response ) => {
    try {
        const { establihsmentId } = req.params;
        const sales = await prisma.sale.findMany({
            where: { establishment_id: establihsmentId! },
            include: {
                client: true
            }
        });
        return res.status(200).json({
            status: true,
            data: sales
        });
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Error interno al obtener las ventas",
        });
    }
}