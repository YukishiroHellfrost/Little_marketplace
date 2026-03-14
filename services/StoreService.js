const { Store } = require('../models/StoreModel');
const { Inventory } = require('../models/InventoryModel');
const { Transaction } = require('../models/TransactionModel');
const { Movement } = require('../models/MovementModel');
const {  db } = require('../config/bd_config');
const { badRequest, notFound } = require('../utils/errors');
const { Op } = require('sequelize'); // Para operadores como iLike

class StoreService {
  //Obtener almacenes paginados con filtros opcionales
  async getStores(query) {
    const { page = 1, limit = 10, direction} = query;
    const offset = (page - 1) * limit;
    const where = {};

    // Filtros dinámicos
    if (direction) where.direction = { [Op.iLike]: `%${direction}%` };

    const { count, rows } = await Store.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
          });

    return {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows
    };
  }

  //Obtener un almacén por su ID con todas las relaciones anidadas
  async getStoreById(id) {
    const store = await Store.findByPk(id, {
      include: [
        {
          model: Transaction,
          as: 'transactions',
          limit: 10,
          order: [['date', 'DESC']]
        },
        {
          model:Inventory,
          as: "inventoryItems"
        },
        {
          model: Movement,
          as: 'outgoingMovements',
          limit: 10,
          order: [['createdAt', 'DESC']]
        },{
          model: Movement,
          as: 'incomingMovements',
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!store) throw notFound('Almacén no encontrado');
    return store;
  }

  // Crear un nuevo Almacén
  async createStore(data) {
    const { direction } = data;

    const transaction = await db.transaction();

    try {

      // Crear almacén
      const store = await Store.create({
      direction
      }, { transaction });

      await transaction.commit();

      // Retornar el almacén creado
      return store;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //Actualizar un almacén existente
  async updateStore(id, data) {
    const { direction } = data;

    const transaction = await db.transaction();

    try {
      const store = await Store.findByPk(id, { transaction });
      if (!store) throw notFound('Almacén no encontrado');

      // Construir objeto con los campos a actualizar
      const updateData = {};
      if (direction) updateData.direction = direction;
     
      await store.update(updateData, { transaction });

      await transaction.commit();

      // Retornar Almacén actualizado 
      return await Store.findByPk(id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
//Eliminar almacén por id
  async DeleteStore(id) {
    const transaction = await db.transaction();
    try {
      const store = await Store.findByPk(id, { transaction });
      if (!store) throw notFound('Almacén no encontrado');

      await store.destroy({ transaction });
      await transaction.commit();
      return { message: 'Almacén eliminado permanentemente' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new StoreService();