import { Router } from 'express';
import {
  generateElectronicVoucherController,
  getElectronicVoucherController,
  listVoucherElectronicsController,
  sendVoucherByEmailController
} from '../controllers/electronic-voucher.controller';

const router = Router();

// Generar comprobante electrónico
router.post('/:saleId/generate-voucher', generateElectronicVoucherController);

// Obtener información del comprobante
router.get('/:saleId/voucher', getElectronicVoucherController);

// Enviar comprobante por email
router.post('/:saleId/voucher/send-email', sendVoucherByEmailController);


router.get('/list/:establishmentId', listVoucherElectronicsController);

export { router };

