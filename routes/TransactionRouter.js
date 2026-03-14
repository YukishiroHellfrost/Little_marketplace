const { Router } = require('express');
const TransactionController = require('../controllers/TransactionController');
const {authorization,authorize} = require("../middlewares/auth");
const { validateTransactionCreate, validateTransactionUpdate } = require('../middlewares/TransactionValidate');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Transacciones
 *   description: Gestión de transacciones (entradas y salidas)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         storeId:
 *           type: integer
 *           example: 2
 *         productId:
 *           type: integer
 *           example: 5
 *         quantity:
 *           type: number
 *           example: 10
 *         tag:
 *           type: string
 *           enum: [Sale, Inbound]
 *           example: "Sale"
 *         price:
 *           type: number
 *           example: 1200.50
 *         date:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         store:
 *           $ref: '#/components/schemas/Store'
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     PaginatedTransactions:
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
 *             $ref: '#/components/schemas/Transaction'
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Obtiene lista paginada de transacciones con filtros
 *     tags: [Transacciones]
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
 *         name: storeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *           enum: [Sale, Inbound]
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
 *         description: Lista de transacciones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedTransactions'
 */
router.get('/',
  authorization,
  authorize('SUPERUSER', 'SUPERVISOR',"SELLER"),
  TransactionController.getTransactions
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     summary: Obtiene una transacción por ID con relaciones
 *     tags: [Transacciones]
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
 *         description: Transacción encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transacción no encontrada
 */
router.get('/:id',
  authorization,
  authorize('SUPERUSER', 'SUPERVISOR',"SELLER"),
  TransactionController.getTransactionById
);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Crea una nueva transacción (solo SUPERUSER)
 *     tags: [Transacciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeId
 *               - productId
 *               - quantity
 *               - tag
 *               - price
 *             properties:
 *               storeId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               tag:
 *                 type: string
 *                 enum: [Sale, Inbound]
 *               price:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Transacción creada
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *       404:
 *         description: Tienda o producto no encontrado
 */
router.post('/',
  authorization,
  authorize('SUPERUSER',"SUPERVISOR","SELLER"),
  validateTransactionCreate,
  TransactionController.createTransaction
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     summary: Actualiza una transacción (corrección, solo SUPERUSER)
 *     tags: [Transacciones]
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
 *               storeId:
 *                 type: integer
 *               productId:
 *                 type: integer
 *               quantity:
 *                 type: number
 *               tag:
 *                 type: string
 *                 enum: [Sale, Inbound]
 *               price:
 *                 type: number
 *               date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Transacción actualizada
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Transacción no encontrada
 */
router.put('/:id',
  authorization,
  authorize('SUPERUSER',"SUPERVISOR","SELLER"),
  validateTransactionUpdate,
  TransactionController.updateTransaction
);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     summary: Elimina una transacción (revierte inventario, solo SUPERUSER)
 *     tags: [Transacciones]
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
 *         description: Transacción eliminada correctamente
 *       404:
 *         description: Transacción no encontrada
 */
router.delete('/:id',
  authorization,
  authorize('SUPERUSER'),
  TransactionController.deleteTransaction
);

module.exports = router;