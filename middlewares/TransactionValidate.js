const { badRequest } = require('../utils/errors');

const validateTransactionCreate = (req, res, next) => {
  let { storeId, productId, quantity, tag, price, date } = req.body;
  const errors = [];

  storeId = Number(storeId);
  productId = Number(productId);
  quantity = Number(quantity);
  price = Number(price);

  if (isNaN(storeId) || storeId <= 0) errors.push('storeId inválido');
  if (isNaN(productId) || productId <= 0) errors.push('productId inválido');
  if (isNaN(quantity) || quantity <= 0) errors.push('quantity debe ser número positivo');
  if (!['Sale', 'Inbound'].includes(tag)) errors.push('tag inválido');
  if (isNaN(price) || price <= 0) errors.push('price debe ser número positivo');
  if (date && isNaN(new Date(date).getTime())) errors.push('date inválida');

  if (errors.length > 0) return next(badRequest(errors.join('. ')));

  // Asignar valores convertidos
  req.body.storeId = storeId;
  req.body.productId = productId;
  req.body.quantity = quantity;
  req.body.price = price;
  next();
};
const validateTransactionUpdate = (req, res, next) => {
  const { storeId, productId, quantity, tag, price, date } = req.body;
  const errors = [];

  if (storeId !== undefined && (typeof storeId !== 'number' || storeId <= 0)) {
    errors.push('storeId debe ser un número positivo');
  }
  if (productId !== undefined && (typeof productId !== 'number' || productId <= 0)) {
    errors.push('productId debe ser un número positivo');
  }
  if (quantity !== undefined && (typeof quantity !== 'number' || quantity <= 0)) {
    errors.push('quantity debe ser un número positivo');
  }
  if (tag !== undefined && !['Sale', 'Inbound'].includes(tag)) {
    errors.push('tag debe ser Sale o Inbound');
  }
  if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
    errors.push('price debe ser un número positivo');
  }
  if (date !== undefined && isNaN(new Date(date).getTime())) {
    errors.push('date debe ser una fecha válida');
  }

  if (errors.length > 0) return next(badRequest(errors.join('. ')));
  next();
};

module.exports = { validateTransactionCreate, validateTransactionUpdate };