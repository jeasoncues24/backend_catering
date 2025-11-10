import { Router } from "express";
import {
  getStockReportController,
  getEventsReportController,
  getTopEventsController,
  getTopServicesController,
  getTopClientsController,
  getReportsSummaryController
} from '../controllers/reports.controller'


const router = Router();


// Resumen general
router.get('/summary/:establishmentId', getReportsSummaryController);

// Reportes específicos
router.get('/stock/:establishmentId', getStockReportController);
router.get('/events/:establishmentId', getEventsReportController);
router.get('/top-events/:establishmentId', getTopEventsController);
router.get('/top-services/:establishmentId', getTopServicesController);
router.get('/top-clients/:establishmentId', getTopClientsController);


export { router }