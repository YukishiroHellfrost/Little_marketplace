const { Product } = require('../models/ProductModel');
const { Store } = require('../models/StoreModel');
const { Inventory } = require('../models/InventoryModel');
const { Transaction } = require('../models/TransactionModel');
const { Movement } = require('../models/MovementModel');
const {  db } = require('../config/bd_config');
const { badRequest, notFound } = require('../utils/errors');
const { Op } = require('sequelize'); // Para operadores como iLike

class ProductService {
  //Obtener productos paginados con filtros opcionales
  async getProducts(query) {
    const { page = 1, limit = 10, name, sku, minPrice, maxPrice, state } = query;
    const offset = (page - 1) * limit;
    const where = {};

    // Filtros dinámicos
    if (name) where.name = { [Op.iLike]: `%${name}%` };
    if (sku) where.sku = sku;
    if (minPrice) where.sell_price = { [Op.gte]: minPrice };
    if (maxPrice) where.sell_price = { ...where.sell_price, [Op.lte]: maxPrice };
    if (state !== undefined) where.state = state === 'true';

    const { count, rows } = await Product.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
      // No incluí relaciones para no sobrecargar la respuesta
    });

    return {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows
    };
  }

  /**
   * Obtener un producto por su ID con todas las relaciones anidadas
   */
  async getProductById(id) {
    const product = await Product.findByPk(id, {
      include: [
        {
          model: Inventory,
          as: 'inventoryItems', 
          include: [
            {
              model: Store,
              as: 'store',
              attributes: ['id', 'direction'] // Campos necesarios
            }
          ]
        },
        {
          model: Transaction,
          as: 'transactions',
          limit: 10,
          order: [['date', 'DESC']]
        },
        {
          model: Movement,
          as: 'movements',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!product) throw notFound('Producto no encontrado');
    return product;
  }

  // Crear un nuevo producto
  async createProduct(data) {
    const { name, image, sell_price, sku, unit, state } = data;

    const transaction = await db.transaction();

    try {
      // Verificar que el SKU sea único
      const existingProduct = await Product.findOne({ where: { sku }, transaction });
      if (existingProduct) {
        throw badRequest('Ya existe un producto con ese SKU');
      }

      // Crear producto
      const newProduct = await Product.create({
        name,
        image,
        sell_price,
        sku,
        unit,
        state: state !== undefined ? state : true
      }, { transaction });

      await transaction.commit();

      // Retornar el producto creado
      return newProduct;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //Actualizar un producto existente
  async updateProduct(id, data) {
    const { name, image, sell_price, sku, unit, state } = data;

    const transaction = await db.transaction();

    try {
      const product = await Product.findByPk(id, { transaction });
      if (!product) throw notFound('Producto no encontrado');

      // Si se cambia el SKU, verificar que no exista otro con el mismo
      if (sku && sku !== product.sku) {
        const existingProduct = await Product.findOne({ where: { sku }, transaction });
        if (existingProduct) throw badRequest('Ya existe un producto con ese SKU');
      }

      // Construir objeto con los campos a actualizar
      const updateData = {};
      if (name) updateData.name = name;
      if (image) updateData.image = image;
      if (sell_price) updateData.sell_price = sell_price;
      if (sku) updateData.sku = sku;
      if (unit) updateData.unit = unit;
      if (state !== undefined) updateData.state = state;

      await product.update(updateData, { transaction });

      await transaction.commit();

      // Retornar producto actualizado 
      return await Product.findByPk(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
//Eliminar producto por id
  async DeleteProduct(id) {
    const transaction = await db.transaction();
    try {
      const product = await Product.findByPk(id, { transaction });
      if (!product) throw notFound('Producto no encontrado');

      await product.destroy({ transaction });
      await transaction.commit();
      return { message: 'Producto eliminado permanentemente' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new ProductService();