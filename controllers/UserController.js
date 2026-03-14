
const { request, response } = require('express');
const UserService = require('../services/UserService');

class UserController {
  async getUsers(req = request, res = response, next) {
    try {
      const result = await UserService.getUsers(req.query);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserById(req = request, res = response, next) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);
      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req = request, res = response, next) {
    try {
      const newUser = await UserService.createUser(req.body);
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req = request, res = response, next) {
    try {
      const { id } = req.params;
      const updatedUser = await UserService.updateUser(id, req.body);
      res.json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req = request, res = response, next) {
    try {
      const { id } = req.params;
      const result = await UserService.deleteUser(id);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }

  // Hard delete (opcional)
  async hardDeleteUser(req = request, res = response, next) {
    try {
      const { id } = req.params;
      const result = await UserService.hardDeleteUser(id);
      res.json({
        success: true,
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController()