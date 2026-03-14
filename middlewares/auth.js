const jwt = require('jsonwebtoken');
const { unauthorized, forbidden } = require('../utils/errors');


const authorization = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(unauthorized('Token no proporcionado o formato inválido'));
  }

  const token = authHeader.split(' ')[1]; 

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (error) {
    return next(unauthorized('Token inválido o expirado'));
  }
};
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(unauthorized('No autenticado'));
    }

    const userRole = req.user.role;
    if (!allowedRoles.includes(userRole)) {
      return next(forbidden('No tienes permisos para acceder a este recurso'));
    }
    next();
  };
};

module.exports = {authorization, authorize};