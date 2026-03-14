const { Router } = require('express');
const UserController = require('../controllers/UserController');
const {authorization, authorize} = require("../middlewares/auth");
const { validateUserCreate, validateUserUpdate } = require('../middlewares/UserValidate');
const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: "Juan Pérez"
 *         role:
 *           type: string
 *           enum: [SUPERUSER, CLIENT, SELLER, SUPERVISOR]
 *           example: "SELLER"
 *         googleAuth:
 *           type: boolean
 *           example: false
 *         state:
 *           type: boolean
 *           example: true
 *         storeId:
 *           type: integer
 *           nullable: true
 *           example: 2
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         store:
 *           $ref: '#/components/schemas/Store'
 *     Store:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         direction:
 *           type: string
 *           example: "Av. Principal 123"
 *         inventoryItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Inventory'
 *     Inventory:
 *       type: object
 *       properties:
 *         storeId:
 *           type: integer
 *           example: 2
 *         productId:
 *           type: integer
 *           example: 5
 *         stock:
 *           type: number
 *           example: 100.5
 *         product:
 *           $ref: '#/components/schemas/Product'
 *     Product:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 5
 *         name:
 *           type: string
 *           example: "Laptop Gamer"
 *         sell_price:
 *           type: number
 *           example: 1200.00
 *         sku:
 *           type: string
 *           example: "LPT-001"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Mensaje de error"
 *     PaginatedUsers:
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
 *             $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /api/user/:
 *   get:
 *     summary: Obtiene lista paginada de usuarios con filtros opcionales
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [SUPERUSER, CLIENT, SELLER, SUPERVISOR]
 *         description: Filtrar por rol
 *       - in: query
 *         name: state
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado (activo/inactivo)
 *     responses:
 *       200:
 *         description: Lista de usuarios paginada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsers'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado (rol insuficiente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', authorization, authorize("SUPERUSER", "SUPERVISOR"), UserController.getUsers);

/**
 * @swagger
 * /api/user/{id}:
 *   get:
 *     summary: Obtiene un usuario por su ID con todas las relaciones anidadas (tienda, inventario, productos)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario
 *     responses:
 *       200:
 *         description: Usuario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado (rol insuficiente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno
 */
router.get('/:id', authorization, authorize("SUPERUSER", "SUPERVISOR"), UserController.getUserById);

/**
 * @swagger
 * /api/user/:
 *   post:
 *     summary: Crea un nuevo usuario
 *     tags: [Usuarios]
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
 *               - password
 *               - role
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nuevo Usuario"
 *               role:
 *                 type: string
 *                 enum: [SUPERUSER, CLIENT, SELLER, SUPERVISOR]
 *                 example: "CLIENT"
 *               googleAuth:
 *                 type: boolean
 *                 default: false
 *                 example: false
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "MiClaveSegura123"
 *               state:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *               storeId:
 *                 type: integer
 *                 nullable: true
 *                 example: 1
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario creado exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos (nombre duplicado, contraseña débil, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado (rol insuficiente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Tienda no encontrada (si se proporcionó storeId)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno
 */
router.post('/', authorization,validateUserCreate, authorize("SUPERUSER"), UserController.createUser);

/**
 * @swagger
 * /api/user/{id}:
 *   put:
 *     summary: Actualiza un usuario existente
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nombre Actualizado"
 *               role:
 *                 type: string
 *                 enum: [SUPERUSER, CLIENT, SELLER, SUPERVISOR]
 *               googleAuth:
 *                 type: boolean
 *               password:
 *                 type: string
 *                 format: password
 *               state:
 *                 type: boolean
 *               storeId:
 *                 type: integer
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado correctamente"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Datos inválidos (nombre duplicado, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado (rol insuficiente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario o tienda no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno
 */
router.put('/:id', authorization, validateUserUpdate, authorize("SUPERUSER"), UserController.updateUser);

/**
 * @swagger
 * /api/user/{id}:
 *   delete:
 *     summary: Desactiva a un usuario (soft delete) - cambia su estado a false
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a desactivar
 *     responses:
 *       200:
 *         description: Usuario desactivado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario desactivado correctamente (soft delete)"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado (rol insuficiente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno
 */
router.delete('/:id', authorization, authorize("SUPERUSER"), UserController.deleteUser);

/**
 * @swagger
 * /api/user/hardDeleteUser/{id}:
 *   delete:
 *     summary: Elimina permanentemente un usuario (hard delete) - uso restringido
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario a eliminar definitivamente
 *     responses:
 *       200:
 *         description: Usuario eliminado permanentemente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Usuario eliminado permanentemente"
 *       401:
 *         description: No autenticado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado (rol insuficiente)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno
 */
router.delete('/hardDeleteUser/:id', authorization, authorize("SUPERUSER"), UserController.hardDeleteUser);

module.exports = router;