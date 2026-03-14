const { Movement } = require('../models/MovementModel');
const { Store } = require('../models/StoreModel');
const { Product } = require('../models/ProductModel');
const InventoryService = require('./InventoryService');
const { sequelize } = require('../config/bd_config');
const { badRequest, notFound } = require('../utils/errors');
const { Op } = require('sequelize');

class MovementService {
  //Obtiene movimientos paginados con filtros opcionales
  async getMovements(query) {
    const { page = 1, limit = 10, fromStoreId, toStoreId, productId, startDate, endDate } = query;
    const offset = (page - 1) * limit;
    const where = {};

    if (fromStoreId) where.fromStoreId = fromStoreId;
    if (toStoreId) where.toStoreId = toStoreId;
    if (productId) where.productId = productId;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt[Op.gte] = new Date(startDate);
      if (endDate) where.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Movement.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        { model: Store, as: 'fromStore', attributes: ['id', 'direction'] },
        { model: Store, as: 'toStore', attributes: ['id', 'direction'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }
      ]
    });

    return {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows
    };
  }

  //Obtiene un movimiento por ID con relaciones
  async getMovementById(id) {
    const movement = await Movement.findByPk(id, {
      include: [
        { model: Store, as: 'fromStore' },
        { model: Store, as: 'toStore' },
        { model: Product, as: 'product' }
      ]
    });
    if (!movement) throw notFound('Movimiento no encontrado');
    return movement;
  }

  //Crea un nuevo movimiento
  async createMovement(data) {
    const { fromStoreId, toStoreId, productId, stock } = data;

    if (!fromStoreId || !toStoreId || !productId || !stock) {
      throw badRequest('Faltan campos obligatorios');
    }
    if (stock <= 0) throw badRequest('La cantidad debe ser positiva');
    if (fromStoreId === toStoreId) throw badRequest('Las tiendas deben ser diferentes');

    const transaction = await sequelize.transaction();

    try {
      // Verificar existencia de tiendas y producto
      const fromStore = await Store.findByPk(fromStoreId, { transaction });
      if (!fromStore) throw notFound('Tienda origen no encontrada');
      const toStore = await Store.findByPk(toStoreId, { transaction });
      if (!toStore) throw notFound('Tienda destino no encontrada');
      const product = await Product.findByPk(productId, { transaction });
      if (!product) throw notFound('Producto no encontrado');

      // Transferir stock usando InventoryService
      await InventoryService.transferStock({
        fromStoreId,
        toStoreId,
        productId,
        quantity: stock,
        transaction
      });

      // Crear el movimiento
      const movement = await Movement.create({
        fromStoreId,
        toStoreId,
        productId,
        stock
      }, { transaction });

      await transaction.commit();
      return movement;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //Actualiza un movimiento (corrección)
  async updateMovement(id, data) {
    const { fromStoreId, toStoreId, productId, stock } = data;

    const original = await Movement.findByPk(id);
    if (!original) throw notFound('Movimiento no encontrado');

    // Si no hay cambios reales, retornar
    if (original.fromStoreId === fromStoreId &&
        original.toStoreId === toStoreId &&
        original.productId === productId &&
        original.stock === stock) {
      return original;
    }

    const transaction = await sequelize.transaction();

    try {
      // 1. Revertir el movimiento original: transferencia inversa
      await InventoryService.transferStock({
        fromStoreId: original.toStoreId,
        toStoreId: original.fromStoreId,
        productId: original.productId,
        quantity: original.stock,
        transaction
      });

      // 2. Aplicar el nuevo movimiento
      await InventoryService.transferStock({
        fromStoreId,
        toStoreId,
        productId,
        quantity: stock,
        transaction
      });

      // 3. Actualizar el registro del movimiento
      await original.update({
        fromStoreId,
        toStoreId,
        productId,
        stock
      }, { transaction });

      await transaction.commit();
      return original;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //Eliminar movimiento (revierte el stock antes de eliminar)

  async deleteMovement(id) {
    const transaction = await sequelize.transaction();
    try {
      const movement = await Movement.findByPk(id, { transaction });
      if (!movement) throw notFound('Movimiento no encontrado');

      // Revertir el movimiento antes de eliminarlo
      await InventoryService.transferStock({
        fromStoreId: movement.toStoreId,
        toStoreId: movement.fromStoreId,
        productId: movement.productId,
        quantity: movement.stock,
        transaction
      });

      await movement.destroy({ transaction });
      await transaction.commit();
      return { message: 'Movimiento eliminado permanentemente' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new MovementService();