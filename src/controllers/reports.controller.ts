// controllers/reports.controller.ts
import { Request, Response } from 'express';
import {
  getStockReportService,
  getEventsReportService,
  getTopEventsService,
  getTopServicesService,
  getTopClientsService,
  getReportsSummaryService
} from '../services/reports.service';

/**
 * REPORTE DE STOCK
 * GET /api/reports/stock/:establishmentId
 */
export const getStockReportController = async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({
        status: false,
        message: 'El ID del establecimiento es requerido'
      });
    }

    const report = await getStockReportService(establishmentId);

    return res.status(200).json({
      status: true,
      data: report
    });
  } catch (error: any) {
    console.error('Error en reporte de stock:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al generar reporte de stock'
    });
  }
};

/**
 * REPORTE DE EVENTOS
 * GET /api/reports/events/:establishmentId
 * Query params: ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */
export const getEventsReportController = async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;
    const { startDate, endDate } = req.query;

    if (!establishmentId) {
      return res.status(400).json({
        status: false,
        message: 'El ID del establecimiento es requerido'
      });
    }

    const report = await getEventsReportService(
      establishmentId,
      startDate as string,
      endDate as string
    );

    return res.status(200).json({
      status: true,
      data: report
    });
  } catch (error: any) {
    console.error('Error en reporte de eventos:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al generar reporte de eventos'
    });
  }
};

/**
 * TOP EVENTOS MÁS SOLICITADOS
 * GET /api/reports/top-events/:establishmentId
 */
export const getTopEventsController = async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({
        status: false,
        message: 'El ID del establecimiento es requerido'
      });
    }

    const report = await getTopEventsService(establishmentId);

    return res.status(200).json({
      status: true,
      data: report
    });
  } catch (error: any) {
    console.error('Error en top eventos:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al generar top eventos'
    });
  }
};

/**
 * TOP SERVICIOS
 * GET /api/reports/top-services/:establishmentId
 */
export const getTopServicesController = async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({
        status: false,
        message: 'El ID del establecimiento es requerido'
      });
    }

    const report = await getTopServicesService(establishmentId);

    return res.status(200).json({
      status: true,
      data: report
    });
  } catch (error: any) {
    console.error('Error en top servicios:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al generar top servicios'
    });
  }
};

/**
 * TOP CLIENTES
 * GET /api/reports/top-clients/:establishmentId
 */
export const getTopClientsController = async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({
        status: false,
        message: 'El ID del establecimiento es requerido'
      });
    }

    const report = await getTopClientsService(establishmentId);

    return res.status(200).json({
      status: true,
      data: report
    });
  } catch (error: any) {
    console.error('Error en top clientes:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al generar top clientes'
    });
  }
};

/**
 * RESUMEN GENERAL
 * GET /api/reports/summary/:establishmentId
 */
export const getReportsSummaryController = async (req: Request, res: Response) => {
  try {
    const { establishmentId } = req.params;

    if (!establishmentId) {
      return res.status(400).json({
        status: false,
        message: 'El ID del establecimiento es requerido'
      });
    }

    const summary = await getReportsSummaryService(establishmentId);

    return res.status(200).json({
      status: true,
      data: summary
    });
  } catch (error: any) {
    console.error('Error en resumen de reportes:', error);
    return res.status(500).json({
      status: false,
      message: error?.message || 'Error al generar resumen'
    });
  }
};