const { Inventory } = require('../models/InventoryModel');
const { sequelize } = require('../config/bd_config');
const { badRequest } = require('../utils/errors');

class InventoryService {
  /**
   * Obtiene el stock de un producto en una tienda específica.
   * @param {number} storeId - ID de la tienda.
   * @param {number} productId - ID del producto.
   * @param {Object} options - Opciones adicionales (como transaction).
   * @returns {Promise<Object>} - Registro de inventario o objeto con stock 0 si no existe.
   */
  async getStock(storeId, productId, options = {}) {
    const inventory = await Inventory.findOne({
      where: { storeId, productId },
      ...options
    });
    // Si no existe, devolvemos un objeto con stock 0 (no lanzamos error)
    return inventory || { stock: 0 };
  }

  /**
   * Actualiza el stock de un producto en una tienda según una transacción.
   * @param {Object} params - Parámetros.
   * @param {number} params.storeId - ID de la tienda.
   * @param {number} params.productId - ID del producto.
   * @param {number} params.quantity - Cantidad a sumar/restar (siempre positiva).
   * @param {string} params.tag - 'Inbound' (entrada) o 'Sale' (salida).
   * @param {Object} params.transaction - Transacción de Sequelize (obligatoria).
   * @returns {Promise<void>}
   */
async updateStock({ storeId, productId, quantity, tag, transaction }) {
  const qty = Number(quantity);
  if (isNaN(qty) || qty <= 0) {
    throw badRequest('La cantidad debe ser un número positivo');
  }

  const [inventory] = await Inventory.findOrCreate({
    where: { storeId, productId },
    defaults: { stock: 0 },
    transaction
  });

  const currentStock = Number(inventory.stock); // ← convertir a número
  const increment = tag === 'Inbound' ? qty : -qty;
  const newStock = currentStock + increment;

  if (tag === 'Sale' && newStock < 0) {
    throw badRequest('Stock insuficiente');
  }

  await Inventory.update(
    { stock: newStock },
    { where: { storeId, productId }, transaction }
  );
}
  /**
   * Transfiere stock entre dos tiendas (usado por MovementService).
   * @param {Object} params - Parámetros.
   * @param {number} params.fromStoreId - Tienda origen.
   * @param {number} params.toStoreId - Tienda destino.
   * @param {number} params.productId - Producto.
   * @param {number} params.quantity - Cantidad a transferir.
   * @param {Object} params.transaction - Transacción de Sequelize.
   */
  async transferStock({ fromStoreId, toStoreId, productId, quantity, transaction }) {
    if (quantity <= 0) {
      throw badRequest('La cantidad debe ser positiva');
    }

    // Verificar stock en origen
    const fromInventory = await Inventory.findOne({
      where: { storeId: fromStoreId, productId },
      transaction
    });

    if (!fromInventory || fromInventory.stock < quantity) {
      throw badRequest('Stock insuficiente en la tienda origen');
    }

    // Restar del origen
await Inventory.update(
      { stock: fromInventory.stock - quantity },
      { where: { storeId: fromStoreId, productId }, transaction }
    );

    // Sumar al destino (crear si no existe)
    const [toInventory] = await Inventory.findOrCreate({
      where: { storeId: toStoreId, productId },
      defaults: { stock: 0 },
      transaction
    });

    await Inventory.update(
      { stock: toInventory.stock + quantity },
      { where: { storeId: toStoreId, productId }, transaction }
    );
  }
}

module.exports = new InventoryService();