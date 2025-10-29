import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listPaymentsController = async ( req: Request, res: Response ) => {
    try {
        const { establishmentId } = req.params;

        if ( !establishmentId ) {
            return res.status(500).json({
                status: false,
                message: 'El id de la sucursal es obligatorio.'
            })
        }

        const payments = await prisma.payments.findMany({
            where: { establishment_id: establishmentId! },
            include: {
                coins: true
            }
        })

        return res.status(200).json({
            status: true,
            data: payments
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: `${ error }`
        })
    }
}