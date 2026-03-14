const { badRequest } = require('../utils/errors');

const validateMovementCreate = (req, res, next) => {
  const { fromStoreId, toStoreId, productId, stock } = req.body;
  const errors = [];

  if (!fromStoreId || typeof fromStoreId !== 'number' || fromStoreId <= 0) {
    errors.push('fromStoreId es obligatorio y debe ser un número positivo');
  }
  if (!toStoreId || typeof toStoreId !== 'number' || toStoreId <= 0) {
    errors.push('toStoreId es obligatorio y debe ser un número positivo');
  }
  if (!productId || typeof productId !== 'number' || productId <= 0) {
    errors.push('productId es obligatorio y debe ser un número positivo');
  }
  if (!stock || typeof stock !== 'number' || stock <= 0) {
    errors.push('stock es obligatorio y debe ser un número positivo');
  }

  if (errors.length > 0) return next(badRequest(errors.join('. ')));
  next();
};

const validateMovementUpdate = (req, res, next) => {
  const { fromStoreId, toStoreId, productId, stock } = req.body;
  const errors = [];

  if (fromStoreId !== undefined && (typeof fromStoreId !== 'number' || fromStoreId <= 0)) {
    errors.push('fromStoreId debe ser un número positivo');
  }
  if (toStoreId !== undefined && (typeof toStoreId !== 'number' || toStoreId <= 0)) {
    errors.push('toStoreId debe ser un número positivo');
  }
  if (productId !== undefined && (typeof productId !== 'number' || productId <= 0)) {
    errors.push('productId debe ser un número positivo');
  }
  if (stock !== undefined && (typeof stock !== 'number' || stock <= 0)) {
    errors.push('stock debe ser un número positivo');
  }

  if (errors.length > 0) return next(badRequest(errors.join('. ')));
  next();
};

module.exports = { validateMovementCreate, validateMovementUpdate };