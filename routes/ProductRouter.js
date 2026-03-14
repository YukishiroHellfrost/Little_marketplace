const { Router } = require('express');
const ProductController = require('../controllers/ProductController');
const {authorization, authorize} = require("../middlewares/auth");
const { validateProductCreate, validateProductUpdate } = require('../middlewares/ProductValidate');

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: Gestión de productos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Laptop Gamer"
 *         image:
 *           type: string
 *           example: "https://ejemplo.com/laptop.jpg"
 *         sell_price:
 *           type: number
 *           example: 1200.00
 *         sku:
 *           type: string
 *           example: "LPT-001"
 *         unit:
 *           type: string
 *           example: "unidad"
 *         state:
 *           type: boolean
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     PaginatedProducts:
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
 *             $ref: '#/components/schemas/Product'
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Obtiene lista paginada de productos con filtros opcionales 
 *     tags: [Productos]
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
 *         name: name
 *         schema:
 *           type: string
 *         description: Buscar por nombre (parcial)
 *       - in: query
 *         name: sku
 *         schema:
 *           type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: state
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedProducts'
 */
router.get('/',
  authorization,
  ProductController.getProducts
);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Obtiene un producto por su ID con todas sus relaciones (inventarios, transacciones, movimientos)
 *     tags: [Productos]
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
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 */
router.get('/:id',
  authorization,
  ProductController.getProductById
);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Crea un nuevo producto (solo SUPERUSER)
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - image
 *               - sell_price
 *               - sku
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               sell_price:
 *                 type: number
 *               sku:
 *                 type: string
 *               unit:
 *                 type: string
 *               state:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Producto creado
 *       400:
 *         description: Datos inválidos o SKU duplicado
 */
router.post('/',
  authorization,
  authorize('SUPERUSER'),
  validateProductCreate,
  ProductController.createProduct
);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Actualiza un producto existente (solo SUPERUSER)
 *     tags: [Productos]
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
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *               sell_price:
 *                 type: number
 *               sku:
 *                 type: string
 *               unit:
 *                 type: string
 *               state:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       400:
 *         description: Datos inválidos o SKU duplicado
 *       404:
 *         description: Producto no encontrado
 */
router.put('/:id',
  authorization,
  authorize('SUPERUSER'),
  validateProductUpdate,
  ProductController.updateProduct
);

/**
 * @swagger
 * /api/products/DeleteProduct/{id}:
 *   delete:
 *     summary: Elimina permanentemente un producto (hard delete) - (solo SUPERUSER)
 *     tags: [Productos]
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
 *         description: Producto eliminado permanentemente
 *       404:
 *         description: Producto no encontrado
 */
router.delete('/DeleteProduct/:id',
  authorization,
  authorize('SUPERUSER'),
  ProductController.DeleteProduct
);

module.exports = router;