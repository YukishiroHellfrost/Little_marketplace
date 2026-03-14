// services/UserService.js
const { User } = require('../models/UserModel');
const { Store } = require('../models/StoreModel');
const { Inventory } = require('../models/InventoryModel');
const { Product } = require('../models/ProductModel');
const { Transaction } = require('../models/TransactionModel');
const { Movement } = require('../models/MovementModel');
const bcrypt = require('bcryptjs');
const {  db } = require('../config/bd_config');
const { badRequest, notFound, internalServer } = require('../utils/errors');

class UserService {
  // Obtener usuarios 
  async getUsers(query) {
    const { page = 1, limit = 10, role, state } = query;
    const offset = (page - 1) * limit;
    const where = {};
    if (role) where.role = role;
    if (state !== undefined) where.state = state === 'true';

    const { count, rows } = await User.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Store,
          as: 'store',
          attributes: ['id', 'direction']
        }
      ]
    });

    return {
      total: count,
      page: parseInt(page),
      pages: Math.ceil(count / limit),
      data: rows
    };
  }

  //Obtener usuario por ID con relaciones profundas
  async getUserById(id) {
    const user = await User.findByPk(id, {
      include: [
        {
          model: Store,
          as: 'store',
          include: [
            {
              model: Inventory,
              as: 'inventoryItems',
              include: [
                {
                  model: Product,
                  as: 'product'
                }
              ]
            },
            {
              model: Transaction,
              as: 'transactions',
              limit: 10
            },
            {
              model: Movement,
              as: 'outgoingMovements',
              limit: 5
            },
            {
              model: Movement,
              as: 'incomingMovements',
              limit: 5
            }
          ]
        }
      ]
    });

    if (!user) throw notFound('Usuario no encontrado');
    return user;
  }

  //Crear usuario
  async createUser(data) {
    const { name, role, googleAuth, password, state, storeId } = data;

    // Validar datos requeridos
    if (!name || !password || !role) {
      throw badRequest('Nombre, contraseña y rol son obligatorios');
    }

    const transaction = await db.transaction();

    try {
      // Verificar nombre único
      const existingUser = await User.findOne({ where: { name }, transaction });
      if (existingUser) {
        throw badRequest('Ya existe un usuario con ese nombre');
      }

      // Verificar tienda si se proporciona
      if (storeId) {
        const store = await Store.findByPk(storeId, { transaction });
        if (!store) throw notFound('La tienda especificada no existe');
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Crear usuario
      const newUser = await User.create({
        name,
        role,
        googleAuth: googleAuth || false,
        password: hashedPassword,
        state: state !== undefined ? state : true,
        storeId: storeId || null
      }, { transaction });

      await transaction.commit();

      // Retornar usuario
      return await User.findByPk(newUser.id, {
        include: [{ model: Store, as: 'store' }]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Actualizar usuario
  async updateUser(id, data) {
    const { name, role, googleAuth, password, state, storeId } = data;

    const transaction = await db.transaction();

    try {
      const user = await User.findByPk(id, { transaction });
      if (!user) throw notFound('Usuario no encontrado');

      // Verificar nombre único si cambia
      if (name && name !== user.name) {
        const existingUser = await User.findOne({ where: { name }, transaction });
        if (existingUser) throw badRequest('Ya existe un usuario con ese nombre');
      }

      // Verificar tienda si cambia
      if (storeId !== undefined && storeId !== user.storeId) {
        if (storeId) {
          const store = await Store.findByPk(storeId, { transaction });
          if (!store) throw notFound('La tienda especificada no existe');
        }
      }
      // Preparar campos a actualizar
      const updateData = {};
      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (googleAuth !== undefined) updateData.googleAuth = googleAuth;
      if (password) updateData.password = await bcrypt.hash(password, 10);
      if (state !== undefined) updateData.state = state;
      if (storeId !== undefined) updateData.storeId = storeId;

      await user.update(updateData, { transaction });

      await transaction.commit();
      // Retornar usuario actualizado 
      return await User.findByPk(id, {
        include: [{ model: Store, as: 'store' }]
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //Delete Usuario(Soft)
  async deleteUser(id) {
    const transaction = await db.transaction();
    try {
      const user = await User.findByPk(id, { transaction });
      if (!user) throw notFound('Usuario no encontrado');

      await user.update({ state: false }, { transaction });
      await transaction.commit();
      return { message: 'Usuario desactivado correctamente' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
//Eliminar usuario(Hard)
  async hardDeleteUser(id) {
    const transaction = await db.transaction();
    try {
      const user = await User.findByPk(id, { transaction });
      if (!user) throw notFound('Usuario no encontrado');

      await user.destroy({ transaction });
      await transaction.commit();
      return { message: 'Usuario eliminado permanentemente' };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new UserService();