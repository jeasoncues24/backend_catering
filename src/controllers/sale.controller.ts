import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { Decimal } from '@prisma/client/runtime/library'


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


export const paymentSaleController = async ( req: Request, res: Response ) => {
    try {
        const { amount, method, notes, saleId } = req.body;

        // Validaciones básicas
        if (!saleId) {
            return res.status(400).json({
                status: false,
                message: 'El id de la venta es obligatorio.'
            })
        }

        if (!method) {
            return res.status(400).json({
                status: false,
                message: 'El método de pago es obligatorio.'
            })
        }

        if (!amount || amount <= 0) {
            return res.status(400).json({
                status: false,
                message: 'El monto debe ser mayor a 0.'
            })
        }

        // Verificar que la venta existe
        const saleExists = await prisma.sale.findUnique({
            where: { id: saleId }
        })

        if (!saleExists) {
            return res.status(404).json({
                status: false,
                message: 'La venta no existe.'
            })
        }

        // Calcular el saldo pendiente ANTES de crear el pago
        const totalPaidBefore = await prisma.salePayment.aggregate({
            where: { 
                sale_id: saleId,
                status: 1 // Solo contar pagos activos
            },
            _sum: { amount: true }
        })

        const totalSale = parseFloat(saleExists.total.toString())
        const alreadyPaid = totalPaidBefore._sum.amount 
            ? parseFloat(totalPaidBefore._sum.amount.toString()) 
            : 0
        
        const currentPending = totalSale - alreadyPaid

        // VALIDACIÓN CLAVE: El monto no debe exceder el saldo pendiente
        const paymentAmount = parseFloat(amount)
        
        if (paymentAmount > currentPending) {
            return res.status(400).json({
                status: false,
                message: `El monto a pagar (S/ ${paymentAmount.toFixed(2)}) excede el saldo pendiente (S/ ${currentPending.toFixed(2)})`,
                data: {
                    total: totalSale,
                    pagado: alreadyPaid,
                    pendiente: currentPending,
                    montoIntentado: paymentAmount
                }
            })
        }

        // Verificar que el método de pago existe
        const paymentMethodExists = await prisma.payments.findUnique({
            where: { id: method }
        })

        if (!paymentMethodExists) {
            return res.status(404).json({
                status: false,
                message: 'El método de pago no existe.'
            })
        }
      
        // Crear el pago
        const paymentSale = await prisma.salePayment.create({
            data: {
                sale_id: saleId,
                payment_id: method,
                amount: new Decimal(paymentAmount), 
                reference: notes || null
            }
        })

        // Recalcular el total pagado DESPUÉS de crear el nuevo pago
        const totalPaidAfter = await prisma.salePayment.aggregate({
            where: { 
                sale_id: saleId,
                status: 1
            },
            _sum: { amount: true }
        })

        const totalPaidAmount = totalPaidAfter._sum.amount 
            ? parseFloat(totalPaidAfter._sum.amount.toString()) 
            : 0

        const newPendingBalance = totalSale - totalPaidAmount

        // Actualizar la venta con los nuevos montos
        await prisma.sale.update({
            where: { id: saleId },
            data: {
                anticipo: new Decimal(totalPaidAmount),
                saldo_pendiente: new Decimal(newPendingBalance),
                status: newPendingBalance <= 0 ? 2 : 1 // 2 = Completada, 1 = Pendiente
            }
        })

        return res.status(201).json({
            status: true,
            message: 'Pago registrado exitosamente.',
            data: {
                payment: paymentSale,
                resumen: {
                    total: totalSale,
                    pagado: totalPaidAmount,
                    pendiente: newPendingBalance,
                    estado: newPendingBalance <= 0 ? 'Completada' : 'Pendiente'
                }
            }
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: 'Error al registrar el pago.',
            error: `${ error }`
        });
    }
}


export const historyPaymentController = async ( req: Request, res: Response ) => {
    try {

        const { saleId } = req.params;

        const saleExists = await prisma.sale.findFirst({
            where: {
                id: saleId!
            }
        })


        if ( !saleExists ) {
            return res.status(404).json({
                status: false,
                message: 'La venta no existe.'
            })
        }

        const historyPayments = await prisma.salePayment.findMany({
            where: {
                sale_id: saleExists.id
            }
        })


        return res.status(200).json({
            status: true,
            data: historyPayments
        })

    } catch ( error ) {
        return res.status(500).json({
            status: false,
            message: 'Error al visualizar el historias de pagos de la venta.',
            error: `${ error }`
        });
    }
}