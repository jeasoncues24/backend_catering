// config/facturacion.config.ts

export const facturacionConfig = {
  // URL de tu proveedor de facturación
  apiUrl: process.env.FACTURACION_API_URL || 'https://api.tuproveedor.com/comprobantes',
  
  // Token de autenticación
  apiToken: process.env.FACTURACION_API_TOKEN || '',
  
  // Configuración de series
  series: {
    factura: 'FF01', // Serie para facturas
    boleta: 'BB01'   // Serie para boletas
  },
  
  // Configuración de IGV
  igv: {
    porcentaje: 10.00,
    afectacion: '10' // 10: Gravado - Operación Onerosa
  },
  
  // Moneda
  moneda: 'PEN', // Soles peruanos
  
  // Códigos SUNAT
  codigosSunat: {
    servicios: '50192701', // Código genérico para servicios
    productos: '50192701'   // Código genérico para productos
  },
  
  // Unidad de medida
  unidadMedida: 'NIU', // Unidad (NIU = Número de Items)
  
  // Tipos de documento
  tiposDocumento: {
    ruc: '6',
    dni: '1',
    carnetExtranjeria: '4',
    pasaporte: '7'
  },
  
  // Tipos de comprobante
  tiposComprobante: {
    factura: 2,
    boleta: 1,
    notaCredito: 3,
    notaDebito: 4
  }
};

// Función helper para obtener el tipo de documento
export function getTipoDocumento(documentType: string): string {
  const mapping: Record<string, string> = {
    'ruc': facturacionConfig.tiposDocumento.ruc,
    'dni': facturacionConfig.tiposDocumento.dni,
    'carnet_extranjeria': facturacionConfig.tiposDocumento.carnetExtranjeria,
    'pasaporte': facturacionConfig.tiposDocumento.pasaporte
  };
  
  return mapping[documentType] || facturacionConfig.tiposDocumento.dni;
}

// Función helper para formatear números
export function formatNumber(num: number, decimals: number = 8): string {
  return num.toFixed(decimals);
}

// Función helper para formatear fecha
export function formatFechaEmision(date: Date | string): string {
  const d = new Date(date);
  return d.toISOString().replace('T', ' ').substring(0, 19);
}