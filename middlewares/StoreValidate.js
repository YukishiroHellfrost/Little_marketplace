const { badRequest } = require('../utils/errors');

// Valida los datos de creación de una tienda
const validateStoreCreate = (req, res, next) => {
  const { direction } = req.body;
  const errors = [];

  // Validar campo obligatorio
  if (!direction || typeof direction !== 'string' || direction.trim() === '') {
    errors.push('La dirección es obligatoria y debe ser un texto no vacío');
  } else {
    req.body.direction = direction.trim();
  }

  if (errors.length > 0) {
    return next(badRequest(errors.join('. ')));
  }

  next();
};

//Valida los datos de actualización de una tienda
const validateStoreUpdate = (req, res, next) => {
  const { direction } = req.body;
  const errors = [];

  // Solo validar si viene en la petición
  if (direction !== undefined) {
    if (typeof direction !== 'string' || direction.trim() === '') {
      errors.push('La dirección debe ser un texto no vacío');
    } else {
      req.body.direction = direction.trim();
    }
  }

  if (errors.length > 0) {
    return next(badRequest(errors.join('. ')));
  }

  next();
};

module.exports = {
  validateStoreCreate,
  validateStoreUpdate
};