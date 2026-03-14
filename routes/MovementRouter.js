const { Router } = require('express');
const MovementController = require('../controllers/MovementController');
const {authorization,authorize} = require("../middlewares/auth");
const { validateMovementCreate, validateMovementUpdate } = require('../middlewares/MovementValidate');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Movimientos
 *   description: Gestión de movimientos entre tiendas
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Movement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         fromStoreId:
 *           type: integer
 *           example: 2
 *         toStoreId:
 *           type: integer
 *           example: 3
 *         productId:
 *           type: integer
 *           example: 5
 *         stock:
 *           type: number
 *           example: 10
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         fromStore:
 *           $ref: '#/components/schemas/Store'
 *         toStore:
 *           $ref: '#/components/schemas/Store'
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     PaginatedMovements:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         total:
 *           type: integer
 *           example: 50
 *         page:
 *           type: integer
 *           example: 1
 *         pages:
 *           type: integer
 *           example: 5
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Movement'
 */

/**
 * @swagger
 * /api/movements:
 *   get:
 *     summary: Obtiene lista paginada de movimientos con filtros opcionales
 *     tags: [Movimientos]
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
 *         name: fromStoreId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: toStoreId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Lista de movimientos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedMovements'
 *       500:
 *         description: Error interno
 */
router.get('/',
  authorization,
  authorize('SUPERUSER', 'SUPERVISOR'),
  MovementController.getMovements
);

/**
 * @swagger
 * /api/movements/{id}:
 *   get:
 *     summary: Obtiene un movimiento por ID con relaciones
 *     tags: [Movimientos]
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
 *         description: Movimiento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Movement'
 *       404:
 *         description: Movimiento no encontrado
 */
router.get('/:id',
  authorization,
  authorize('SUPERUSER', 'SUPERVISOR'),
  MovementController.getMovementById
);

/**
 * @swagger
 * /api/movements:
 *   post:
 *     summary: Crea un nuevo movimiento (solo SUPERUSER y SUPERVISOR)
 *     tags: [Movimientos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromStoreId
 *               - toStoreId
 *               - productId
 *               - stock
 *             properties:
 *               fromStoreId:
 *                 type: integer
 *               toStoreId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               stock:
 *                 type: number
 *     responses:
 *       201:
 *         description: Movimiento creado
 *       400:
 *         description: Datos inválidos (cantidad, tiendas iguales, etc.)
 *       404:
 *         description: Tienda o producto no encontrado
 */
router.post('/',
  authorization,
  authorize('SUPERUSER',"SUPERVISOR"),
  validateMovementCreate,
  MovementController.createMovement
);

/**
 * @swagger
 * /api/movements/{id}:
 *   put:
 *     summary: Actualiza un movimiento (corrección, solo SUPERUSER)
 *     tags: [Movimientos]
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
 *               fromStoreId:
 *                 type: integer
 *               toStoreId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               stock:
 *                 type: number
 *     responses:
 *       200:
 *         description: Movimiento actualizado
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Movimiento no encontrado
 */
router.put('/:id',
  authorization,
  authorize('SUPERUSER',"SUPERVISOR"),
  validateMovementUpdate,
  MovementController.updateMovement
);

/**
 * @swagger
 * /api/movements/{id}:
 *   delete:
 *     summary: Elimina un movimiento (revierte stock, solo SUPERUSER)
 *     tags: [Movimientos]
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
 *         description: Movimiento eliminado permanentemente
 *       404:
 *         description: Movimiento no encontrado
 */
router.delete('/:id',
  authorization,
  authorize('SUPERUSER',"SUPERVISOR"),
  MovementController.deleteMovement
);

module.exports = router;