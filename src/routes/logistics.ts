import { Router } from "express";
import { assignProductToEventController, checkExistingGuidesController, confirmLoadedController, createColaboradorServiceController, createDispatchGuideController, createReturnGuideController, getAllEventsController, getAvailableProductsController, getEventByIdController, getEventInventoryController, getOperationStatusController, listAvailableColaboradoresController, listColaboradorServiceController, markInEventController, reconcileAndCloseController, startOperationController, updateProductInventoryController } from "../controllers/logistic.controller";


const router = Router();



router.get('/events/:establishmentId', getAllEventsController);

router.get('/event/:agendaId',  getEventInventoryController)
router.put('/inventory/:inventoryId', updateProductInventoryController)
router.get('/products/:establishmentId', getAvailableProductsController)
router.post('/assign', assignProductToEventController)
router.get('/:agendaId', getEventByIdController)
// router.get('/list-colaborador-service/:agendaId', listColaboradorServiceController)
router.get('/event/list/available-colaboradores', listAvailableColaboradoresController)
router.post('/add-colaborador-event', createColaboradorServiceController)


router.get("/operation/:agendaId/status", getOperationStatusController);

// POST - Iniciar operación (PLANNED -> PICKING)
router.post("/operation/:agendaId/start", startOperationController);

// POST - Crear guía de salida (PICKING -> LOADED)
router.post("/operation/:agendaId/dispatch-guide", createDispatchGuideController);

// POST - Confirmar carga lista (LOADED)
router.post("/operation/:agendaId/confirm-loaded", confirmLoadedController);

// POST - Marcar evento en curso (IN_EVENT)
router.post("/operation/:agendaId/in-event", markInEventController);

// POST - Crear guía de retorno (RETURNING)
router.post("/operation/:agendaId/return-guide", createReturnGuideController);

// POST - Conciliar y cerrar (CLOSED)
router.post("/operation/:agendaId/reconcile-close", reconcileAndCloseController);

router.get("/guides/:agendaId", checkExistingGuidesController);


export { router }