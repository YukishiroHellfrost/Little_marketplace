const { request, response } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models/UserModel');
const { badRequest, unauthorized, internalServer } = require('../utils/errors');

class AuthController {
  async login(req = request, res = response, next) {
    try {
      const { username, password } = req.body;

      // Validar que lleguen los campos
      if (!username || !password) {
        return next(badRequest('Usuario y contraseña son requeridos'));
      }

      // Buscar usuario por nombre (campo 'name' en tu modelo)
      const user = await User.findOne({ 
        where: { name: username } 
      });

      // Verificar si existe y está activo
      if (!user || !user.state) {
        return next(unauthorized('Credenciales inválidas'));
      }

      // Comparar contraseña usando bcrypt
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return next(unauthorized('Credenciales inválidas'));
      }

      // Generar token JWT con datos del usuario
      const token = jwt.sign(
        { 
          id: user.id, 
          name: user.name, 
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: '3h' }
      );

      // Respuesta exitosa
      res.json({
        success: true,
        token,
        expiresIn: '3h',
        user: {
          id: user.id,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(internalServer(`Error al autenticar: ${error.message}`));
    }
  }
}

module.exports = AuthController;