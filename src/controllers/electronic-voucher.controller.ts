// controllers/electronic-voucher.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../config/db';
import { 
  facturacionConfig, 
  getTipoDocumento, 
  formatNumber, 
  formatFechaEmision 
} from '../config/facturacion';

/**
 * GENERAR COMPROBANTE ELECTRÓNICO
 * POST /api/sales/:saleId/generate-voucher
 */
export const generateElectronicVoucherController = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    const { voucherType, client, voucher, amounts } = req.body;

    if (!saleId) {
      return res.status(400).json({
        status: false,
        message: 'El ID de la venta es requerido'
      });
    }

    // Validar que la venta existe y está completada
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        client: true,
        electronicVoucher: true, // Verificar si ya tiene comprobante
        saleProduct: {
          include: { product: true }
        },
        saleService: {
          include: { service: true }
        }
      }
    });

    if (!sale) {
      return res.status(404).json({
        status: false,
        message: 'Venta no encontrada'
      });
    }

    if (sale.status !== 2) {
      return res.status(400).json({
        status: false,
        message: 'Solo se pueden generar comprobantes para ventas completadas'
      });
    }

    // Verificar si ya tiene comprobante
    if (sale.electronicVoucher) {
      return res.status(400).json({
        status: false,
        message: 'Esta venta ya tiene un comprobante electrónico generado'
      });
    }

    // Validaciones según tipo de comprobante
    if (voucherType === 'factura') {
      if (!client.documentNumber || client.documentNumber.length !== 11) {
        return res.status(400).json({
          status: false,
          message: 'El RUC debe tener 11 dígitos'
        });
      }
      if (!client.businessName) {
        return res.status(400).json({
          status: false,
          message: 'La razón social es requerida para facturas'
        });
      }
    } else if (voucherType === 'boleta') {
      if (!client.documentNumber || client.documentNumber.length !== 8) {
        return res.status(400).json({
          status: false,
          message: 'El DNI debe tener 8 dígitos'
        });
      }
      if (!client.name) {
        return res.status(400).json({
          status: false,
          message: 'El nombre es requerido para boletas'
        });
      }
    }

    // Generar número correlativo
    const series = voucherType === 'factura' 
      ? facturacionConfig.series.factura 
      : facturacionConfig.series.boleta;
    
    const voucherNumber = await getNextVoucherNumber(
      sale.establishment_id,
      voucherType,
      series
    );

    const fullNumber = `${series}-${voucherNumber}`;

    // Preparar items del comprobante
    const items = [
      ...sale.saleProduct.map(item => ({
        codigo: item.product.id.slice(0, 10), // Código corto del producto
        description: item.product.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price.toString()),
        discount: parseFloat(item.discount.toString()),
        taxAmount: parseFloat(item.tax_amount.toString()),
        total: parseFloat(item.line_total.toString())
      })),
      ...sale.saleService.map(item => ({
        codigo: item.service.id.slice(0, 10), // Código corto del servicio
        description: item.service.name,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unit_price.toString()),
        discount: parseFloat(item.discount.toString()),
        taxAmount: parseFloat(item.tax_amount.toString()),
        total: parseFloat(item.line_total.toString())
      }))
    ];

    // Preparar datos para envío a SUNAT
    const voucherData = {
      type: voucherType,
      series: series,
      number: voucherNumber,
      issueDate: voucher.issueDate,
      dueDate: voucher.dueDate,
      paymentCondition: voucher.paymentCondition,
      client: {
        documentType: client.documentType,
        documentNumber: client.documentNumber,
        businessName: client.businessName || client.name,
        email: client.email,
        phone: client.phone,
        address: client.address
      },
      amounts: {
        subtotal: parseFloat(amounts.subtotal),
        igv: parseFloat(amounts.igv),
        total: parseFloat(amounts.total)
      },
      items: items,
      observations: voucher.observations
    };

    // Enviar a proveedor de facturación electrónica
    const sunatResponse = await sendToElectronicBillingProvider(voucherData);

    // Guardar comprobante en la base de datos
    const electronicVoucher = await prisma.electronicVoucher.create({
      data: {
        sale_id: saleId,
        voucher_type: voucherType,
        series: series,
        number: voucherNumber,
        full_number: fullNumber,
        issue_date: new Date(voucher.issueDate),
        due_date: voucher.dueDate ? new Date(voucher.dueDate) : null,
        payment_condition: voucher.paymentCondition,
        client_document_type: client.documentType,
        client_document_number: client.documentNumber,
        client_name: client.businessName || client.name,
        client_email: client.email,
        client_phone: client.phone,
        client_address: client.address,
        subtotal: parseFloat(amounts.subtotal),
        igv: parseFloat(amounts.igv),
        total: parseFloat(amounts.total),
        items: items,
        observations: voucher.observations,
        xml_url: sunatResponse.xmlUrl,
        pdf_url: sunatResponse.pdfUrl,
        cdr_url: sunatResponse.cdrUrl,
        sunat_code: sunatResponse.sunatCode,
        sunat_description: sunatResponse.sunatDescription,
        sunat_response: sunatResponse,
        status: sunatResponse.sunatCode === '0' ? 2 : 3, // 2: Aceptado, 3: Rechazado
        // status: 1,
        created_by: req.body.userId // Si tienes autenticación
      }
    });

    return res.status(200).json({
      status: true,
      message: 'Comprobante electrónico generado exitosamente',
      data: {
        id: electronicVoucher.id,
        voucherNumber: fullNumber,
        xml_url: sunatResponse.xmlUrl,
        pdf_url: sunatResponse.pdfUrl,
        cdr_url: sunatResponse.cdrUrl,
        sunat_code: sunatResponse.sunatCode,
        sunat_description: sunatResponse.sunatDescription,
      }
    });

  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al generar comprobante electrónico'
    });
  }
};

/**
 * Obtener siguiente número correlativo de comprobante
 */
async function getNextVoucherNumber(
  establishmentId: string,
  voucherType: string,
  series: string
): Promise<string> {
  const currentYear = new Date().getFullYear();

  // Buscar o crear secuencia
  let sequence = await prisma.voucherSequence.findUnique({
    where: {
      establishment_id_voucher_type_series_year: {
        establishment_id: establishmentId,
        voucher_type: voucherType,
        series: series,
        year: currentYear
      }
    }
  });

  if (!sequence) {
    // Crear nueva secuencia para este año
    sequence = await prisma.voucherSequence.create({
      data: {
        establishment_id: establishmentId,
        voucher_type: voucherType,
        series: series,
        last_number: 0,
        year: currentYear
      }
    });
  }

  // Incrementar el número
  const newNumber = sequence.last_number + 1;

  // Actualizar la secuencia
  await prisma.voucherSequence.update({
    where: { id: sequence.id },
    data: { last_number: newNumber }
  });

  // Retornar número formateado (8 dígitos)
  return newNumber.toString().padStart(8, '0');
}

/**
 * Enviar a proveedor de facturación electrónica
 */
async function sendToElectronicBillingProvider(voucherData: any) {
  try {
    const IGV_RATE = 0.10; // o 0.18 si corresponde realmente

    // Mapear tipo de comprobante
    const tipoComprobante = voucherData.type === 'factura' ? 2 : 1;
    const clienteDocType = voucherData.client.documentType === 'ruc' ? '6' : '1';

    const fechaEmision = new Date(voucherData.issueDate)
      .toISOString()
      .replace('T', ' ')
      .substring(0, 19);

    // ITEMS: suponemos unitPrice viene SIN IGV
    const items = voucherData.items.map((item: any) => {
      const valorUnitario = Number(item.unitPrice); // sin IGV
      const precioUnitario = Number((valorUnitario * (1 + IGV_RATE)).toFixed(8)); // con IGV
      const cantidad = Number(item.quantity);

      const subtotal = Number((valorUnitario * cantidad).toFixed(8));       // base
      const igv = Number((subtotal * IGV_RATE).toFixed(8));                 // IGV
      const total = Number((subtotal + igv).toFixed(8));                    // con IGV

      return {
        unidad_de_medida: "NIU",
        codigo: item.codigo || "PROD001",
        descripcion: item.description,
        cantidad: cantidad.toFixed(8),
        valor_unitario: valorUnitario.toFixed(8),
        precio_unitario: precioUnitario.toFixed(8),
        afectacion: "10",
        igv: igv.toFixed(8),
        subtotal: subtotal.toFixed(8),
        total: total.toFixed(8),
        icbper: null,
        codigo_producto_sunat: "50192701"
      };
    });

    // Totales desde las líneas (clave para evitar 3277)
    const totalGravada = items
      .reduce((sum: any, it: any) => sum + Number(it.subtotal), 0);
    const totalIgv = items
      .reduce((sum: any, it: any) => sum + Number(it.igv), 0);
    const total = items
      .reduce((sum: any, it: any) => sum + Number(it.total), 0);

    const payload = {
      tipo_de_comprobante: tipoComprobante,
      operacion: "generar_comprobante",
      cliente_tipo_de_documento: clienteDocType,
      cliente_numero_de_documento: voucherData.client.documentNumber,
      cliente_denominacion: voucherData.client.businessName || voucherData.client.name,
      cliente_direccion: voucherData.client.address,
      cliente_email: voucherData.client.email,
      cliente_email2: null,
      cliente_email3: null,
      serie: voucherData.series,
      correlativo: Number(voucherData.number),
      fecha_de_emision: fechaEmision,
      telefono: voucherData.client.phone || null,
      moneda: "PEN",
      tipo_de_cambio: "1.00",
      porcentaje_igv: (IGV_RATE * 100).toFixed(2), // "10.00" o "18.00"
      creditos: null,
      total_descuentos: "0.00000000",
      porcentaje_descuento: "0.00000000",
      observaciones: voucherData.observations || "",
      forma_de_pago: voucherData.paymentCondition === 'contado' ? "CONTADO" : "CREDITO",
      medio_de_pago: "PAGADO",
      total_otros_cargos: "0.00000000",
      recargo_al_consumo: "0.00",
      tipo_documento_afectado: null,
      numero_documento_afectado: null,
      codigo_motivo: null,
      descripcion_motivo: "",
      total_gravada: totalGravada.toFixed(8),
      total_inafecta: "0.00000000",
      total_exonerada: "0.00000000",
      total_gratuita: "0.00000000",
      total_impuestos_bolsas: "0.00000000",
      total_igv: totalIgv.toFixed(8),
      total: total.toFixed(8),
      items,
      detraccion: null,
      porcentaje_detraccion: null,
      cuenta_bancaria_detraccion: null,
      monto_detraccion: null,
      codigo_detraccion: null
    };

    // Aquí harías la llamada real a tu API de facturación 
    const API_URL = process.env.FACTURACION_API_URL || 'https://apiusqayfact.com/comprobantes'; 
    const API_TOKEN = process.env.FACTURACION_API_TOKEN; 
    const response = await fetch(API_URL, { 
      method: 'POST', 
      headers: 
        { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${API_TOKEN}`
        }, 
      body: JSON.stringify(payload) 
    }); 
    
    if (!response.ok) 
      { 
        throw new Error(`Error del proveedor: ${response.statusText}`); 
      } 
    
    const result = await response.json(); 
    return { 
      success: result.success || true, 
      xmlUrl: result.enlace_del_xml || result.xml_url || '', 
      pdfUrl: result.enlace_del_pdf || result.pdf_url || '', 
      cdrUrl: result.enlace_del_cdr || result.cdr_url || '', 
      sunatCode: result.codigo_sunat || result.sunat_code || '0', 
      sunatDescription: result.descripcion_sunat || result.sunat_description || 'Aceptado' 
    };

  } catch (error: any) {
    console.error('Error al enviar al proveedor:', error);
    throw new Error(`Error en facturación electrónica: ${error.message}`);
  }
}


/**
 * OBTENER COMPROBANTE ELECTRÓNICO
 * GET /api/sales/:saleId/voucher
 */
export const getElectronicVoucherController = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;

    const voucher = await prisma.electronicVoucher.findUnique({
      where: { sale_id: saleId! },
      include: {
        sale: {
          select: {
            id: true,
            total: true,
            client: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!voucher) {
      return res.status(404).json({
        status: false,
        message: 'No se encontró comprobante para esta venta'
      });
    }

    return res.status(200).json({
      status: true,
      data: voucher
    });

  } catch (error: any) {
    console.error('Error al obtener comprobante:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al obtener comprobante'
    });
  }
};

/**
 * LISTAR COMPROBANTES ELECTRÓNICOS
 * GET /api/sales/vouchers/:establishmentId
 */
export const listElectronicVouchersController = async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;
    const { startDate, endDate, voucherType, status } = req.query;

    const whereCondition: any = {
      sale: {
        establishment_id: establishmentId
      }
    };

    if (startDate && endDate) {
      whereCondition.issue_date = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    if (voucherType) {
      whereCondition.voucher_type = voucherType;
    }

    if (status) {
      whereCondition.status = parseInt(status as string);
    }

    const vouchers = await prisma.electronicVoucher.findMany({
      where: whereCondition,
      include: {
        sale: {
          select: {
            id: true,
            client: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json({
      status: true,
      data: vouchers
    });

  } catch (error: any) {
    console.error('Error al listar comprobantes:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al listar comprobantes'
    });
  }
};

/**
 * ENVIAR COMPROBANTE POR EMAIL
 * POST /api/sales/:saleId/voucher/send-email
 */
export const sendVoucherByEmailController = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        status: false,
        message: 'El correo electrónico es requerido'
      });
    }

    const voucher = await prisma.electronicVoucher.findUnique({
      where: { sale_id: saleId! },
      include: {
        sale: {
          include: {
            client: true
          }
        }
      }
    });

    if (!voucher) {
      return res.status(404).json({
        status: false,
        message: 'No se encontró comprobante para esta venta'
      });
    }

    // TODO: Aquí implementarías el envío de email
    // usando nodemailer, sendgrid, etc.
    // Adjuntar el PDF y XML del comprobante

    // Actualizar registro como enviado
    await prisma.electronicVoucher.update({
      where: { id: voucher.id },
      data: {
        sent_to_client: 1,
        sent_at: new Date()
      }
    });

    return res.status(200).json({
      status: true,
      message: 'Comprobante enviado por correo exitosamente'
    });

  } catch (error: any) {
    console.error('Error al enviar comprobante:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al enviar comprobante'
    });
  }
};

/**
 * ANULAR COMPROBANTE ELECTRÓNICO
 * PUT /api/sales/:saleId/voucher/cancel
 */
export const cancelElectronicVoucherController = async (req: Request, res: Response) => {
  try {
    const { saleId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        status: false,
        message: 'El motivo de anulación es requerido'
      });
    }

    const voucher = await prisma.electronicVoucher.findUnique({
      where: { sale_id: saleId! }
    });

    if (!voucher) {
      return res.status(404).json({
        status: false,
        message: 'No se encontró comprobante para esta venta'
      });
    }

    if (voucher.status === 4) {
      return res.status(400).json({
        status: false,
        message: 'Este comprobante ya está anulado'
      });
    }

    // TODO: Enviar comunicación de baja a SUNAT
    // Solo se puede anular hasta 7 días después de la emisión

    await prisma.electronicVoucher.update({
      where: { id: voucher.id },
      data: {
        status: 4, // Anulado
        observations: `${voucher.observations || ''}\n\nANULADO: ${reason}`
      }
    });

    return res.status(200).json({
      status: true,
      message: 'Comprobante anulado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al anular comprobante:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al anular comprobante'
    });
  }
};


export const listVoucherElectronicsController =  async ( req: Request, res: Response ) => {
  try {
    const { establishmentId } = req.params;

    if ( !establishmentId ) {
      return res.status(404).json({
        status: false,
        message: 'El id de la sucursal es obligatorio'
      })
    }

    const vouchers = await prisma.electronicVoucher.findMany({
      where: {
        sale: {
          establishment_id: establishmentId
        }
      },
      include: {
        sale: {
          select: {
            id: true,
            total: true,
            status: true,
            client: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: {
        issue_date: 'desc' 
      }
    });

    return res.status(200).json({
      status: true,
      data: vouchers
    });


  } catch (error: any) {
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al obtener los comprobantes'
    });
  }
}