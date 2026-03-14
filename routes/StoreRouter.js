// routes/StoreRouter.js
const { Router } = require('express');
const StoreController = require('../controllers/StoreController');
const {authorization, authorize} = require("../middlewares/auth");
const { validateStoreCreate, validateStoreUpdate } = require('../middlewares/StoreValidate');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Almacenes
 *   description: Gestión de Almacenes
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Store:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         direction:
 *           type: string
 *           example: "Av. Principal 123"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PaginatedStores:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         total:
 *           type: integer
 *         page:
 *           type: integer
 *         pages:
 *           type: integer
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Store'
 */

/**
 * @swagger
 * /api/stores:
 *   get:
 *     summary: Obtiene lista paginada de Almacenes
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *         description: Buscar por dirección (parcial)
 *     responses:
 *       200:
 *         description: Lista de Almacenes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedStores'
 */
router.get('/',
  authorization,
  authorize('SUPERUSER', 'SUPERVISOR'),
  StoreController.getStores
);

/**
 * @swagger
 * /api/stores/{id}:
 *   get:
 *     summary: Obtiene una Almacén por su ID con relaciones (productos, transacciones, movimientos)
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Almacén encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Store'
 *       404:
 *         description: Almacén no encontrada
 */
router.get('/:id',
  authorization,
  authorize('SUPERUSER', 'SUPERVISOR'),
  StoreController.getStoreById
);

/**
 * @swagger
 * /api/stores:
 *   post:
 *     summary: Crea una nueva Almacén (solo SUPERUSER)
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - direction
 *             properties:
 *               direction:
 *                 type: string
 *     responses:
 *       201:
 *         description: Almacén creada
 *       400:
 *         description: Dirección inválida
 */
router.post('/',
  authorization,
  authorize('SUPERUSER'),
  validateStoreCreate,
  StoreController.createStore
);

/**
 * @swagger
 * /api/stores/{id}:
 *   put:
 *     summary: Actualiza una Almacén (solo SUPERUSER)
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               direction:
 *                 type: string
 *     responses:
 *       200:
 *         description: Almacén actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Almacén no encontrada
 */
router.put('/:id',
  authorization,
  authorize('SUPERUSER'),
  validateStoreUpdate,
  StoreController.updateStore
);

/**
 * @swagger
 * /api/stores/{id}:
 *   delete:
 *     summary: Elimina una Almacén (hard delete, solo SUPERUSER)
 *     tags: [Almacenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Almacén eliminada
 *       404:
 *         description: Almacén no encontrada
 */
router.delete('/:id',
  authorization,
  authorize('SUPERUSER'),
  StoreController.deleteStore
);

module.exports = router;