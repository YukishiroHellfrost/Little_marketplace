const { Transaction } = require('../models/TransactionModel');
const { Store } = require('../models/StoreModel');
const { Product } = require('../models/ProductModel');
const InventoryService = require('./InventoryService');
const {  db } = require('../config/bd_config');
const { badRequest, notFound } = require('../utils/errors');
const { Op } = require('sequelize');

class TransactionService {
  /**
   * Obtiene transacciones paginadas con filtros.
   */
  async getTransactions(query) {
    const { page = 1, limit = 10, storeId, productId, tag, startDate, endDate } = query;
    const offset = (page - 1) * limit;
    const where = {};

    if (storeId) where.storeId = storeId;
    if (productId) where.productId = productId;
    if (tag) where.tag = tag;
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date[Op.gte] = new Date(startDate);
      if (endDate) where.date[Op.lte] = new Date(endDate);
    }

    const { count, rows } = await Transaction.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']],
      include: [
        { model: Store, as: 'store', attributes: ['id', 'direction'] },
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku',"sell_price","unit"] }
      ]
    });

    return {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows
    };
  }

  // Obtiene una transacción por ID con relaciones
  async getTransactionById(id) {
    const transaction = await Transaction.findByPk(id, {
      include: [
        { model: Store, as: 'store' },
        { model: Product, as: 'product' }
      ]
    });
    if (!transaction) throw notFound('Transacción no encontrada');
    return transaction;
  }

  /**
   * Crea una nueva transacción (entrada o salida) y actualiza inventario.
   * @param {Object} data - Datos de la transacción.
   * @returns {Promise<Object>} - Transacción creada.
   */
  async createTransaction(data) {
    const { storeId, productId, quantity, tag, price, date } = data;

    // Validaciones básicas
    if (!storeId || !productId || !quantity || !tag || !price) {
      throw badRequest('Faltan campos obligatorios');
    }
    if (!['Sale', 'Inbound'].includes(tag)) {
      throw badRequest('Tag debe ser Sale o Inbound');
    }
    if (quantity <= 0) {
      throw badRequest('La cantidad debe ser positiva');
    }

    const transaction = await db.transaction();

    try {
      // Verificar que la tienda y el producto existan (opcional, pero recomendado)
      const store = await Store.findByPk(storeId, { transaction });
      if (!store) throw notFound('Tienda no encontrada');
      const product = await Product.findByPk(productId, { transaction });
      if (!product) throw notFound('Producto no encontrado');

      // Si es venta, verificar stock suficiente (InventoryService lanza error si no)
      if (tag === 'Sale') {
        const stock = await InventoryService.getStock(storeId, productId, { transaction });
        if (stock.stock < quantity) {
          throw badRequest('Stock insuficiente');
        }
      }

      // Crear la transacción
      const newTransaction = await Transaction.create({
        storeId,
        productId,
        quantity,
        tag,
        price,
        date: date || new Date()
      }, { transaction });

      // Actualizar inventario (llamada a InventoryService)
      await InventoryService.updateStock({
        storeId,
        productId,
        quantity,
        tag,
        transaction
      });

      await transaction.commit();

      // Retornar la transacción con relaciones
      return await Transaction.findByPk(newTransaction.id, {
        include: [
          { model: Store, as: 'store' },
          { model: Product, as: 'product' }
        ]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Actualiza una transacción (solo si es necesario, con cuidado).
   * Normalmente las transacciones no se modifican; se crean otras para corregir errores.
   */
async updateTransaction(id, data) {
  const { storeId, productId, quantity, tag, price, date } = data;

  // Buscar la transacción original
  const original = await Transaction.findByPk(id);
  if (!original) throw notFound('Transacción no encontrada');

  // Si no hay cambios reales, no hacer nada
  if (original.storeId === storeId &&
      original.productId === productId &&
      original.quantity === quantity &&
      original.tag === tag &&
      original.price === price &&
      original.date === date) {
    return original; // o lanzar error de que no hay cambios
  }

  const transaction = await db.transaction();

  try {
    // 1. Revertir el efecto de la transacción original en el inventario
    // La reversión es la operación inversa: si era Inbound, restar; si era Sale, sumar.
    await InventoryService.updateStock({
      storeId: original.storeId,
      productId: original.productId,
      quantity: original.quantity,
      tag: original.tag === 'Inbound' ? 'Sale' : 'Inbound', // inversa
      transaction
    });

    // 2. Aplicar la nueva transacción (efecto deseado)
    await InventoryService.updateStock({
      storeId,
      productId,
      quantity,
      tag,
      transaction
    });

    // 3. Actualizar el registro de la transacción
    await original.update({
      storeId,
      productId,
      quantity,
      tag,
      price,
      date: date || original.date, 
    }, { transaction });

    await transaction.commit();

    // Retornar la transacción actualizada
    return await Transaction.findByPk(id, {
      include: [
        { model: Store, as: 'store' },
        { model: Product, as: 'product' }
      ]
    });
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
 async deleteTransaction(id) {
    const transaction = await db.transaction();
    try {
      const trans = await Transaction.findByPk(id, { transaction });
      if (!trans) throw notFound('Transacción no encontrada');

      // Revertir el efecto en el inventario (operación inversa)
      const inverseTag = trans.tag === 'Inbound' ? 'Sale' : 'Inbound';
      await InventoryService.updateStock({
        storeId: trans.storeId,
        productId: trans.productId,
        quantity: trans.quantity,
        tag: inverseTag,
        transaction
      });

      await trans.destroy({ transaction });
      await transaction.commit();
      return { message: 'Transacción eliminada correctamente' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

}

module.exports = new TransactionService();