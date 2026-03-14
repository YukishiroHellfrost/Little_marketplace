const { badRequest } = require('../utils/errors');

//Valida los datos de creación de un producto
const validateProductCreate = (req, res, next) => {
  const { name, image, sell_price, sku, unit, state } = req.body;
  const errors = [];

  // Campos obligatorios
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('El nombre es obligatorio y debe ser un texto no vacío');
  }

  if (!sku || typeof sku !== 'string' || sku.trim() === '') {
    errors.push('El SKU es obligatorio y debe ser un texto no vacío');
  }

  if (!unit || typeof unit !== 'string' || unit.trim() === '') {
    errors.push('La unidad es obligatoria y debe ser un texto no vacío');
  }

  // Precio de venta
  if (sell_price === undefined || sell_price === null) {
    errors.push('El precio de venta es obligatorio');
  } else {
    const price = parseFloat(sell_price);
    if (isNaN(price) || price <= 0) {
      errors.push('El precio de venta debe ser un número positivo');
    } else {
      req.body.sell_price = price; // asegurar que sea número
    }
  }

  // Imagen (opcional)
  if (image !== undefined &&  typeof image !== 'string' || image.trim() === '') {
    errors.push('image debe ser una cadena de texto');
  }

  if (errors.length > 0) {
    return next(badRequest(errors.join('. ')));
  }

  // Limpiar espacios
  req.body.name = name.trim();
  req.body.image = image.trim();
  req.body.sku = sku.trim();
  req.body.unit = unit.trim();

  next();
};

// Valida los datos de actualización de un producto
const validateProductUpdate = (req, res, next) => {
  const { name, image, sell_price, sku, unit, state } = req.body;
  const errors = [];

  // Solo validar si vienen en la petición
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      errors.push('El nombre debe ser un texto no vacío');
    } else {
      req.body.name = name.trim(); // ← seguro porque ya verificamos que existe
    }
  }

  if (image !== undefined) {
    if (typeof image !== 'string' || image.trim() === '') {
      errors.push('La imagen debe ser un texto no vacío');
    } else {
      req.body.image = image.trim();
    }
  }

  if (sku !== undefined) {
    if (typeof sku !== 'string' || sku.trim() === '') {
      errors.push('El SKU debe ser un texto no vacío');
    } else {
      req.body.sku = sku.trim();
    }
  }

  if (unit !== undefined) {
    if (typeof unit !== 'string' || unit.trim() === '') {
      errors.push('La unidad debe ser un texto no vacío');
    } else {
      req.body.unit = unit.trim();
    }
  }

  if (sell_price !== undefined) {
    const price = parseFloat(sell_price);
    if (isNaN(price) || price <= 0) {
      errors.push('El precio de venta debe ser un número positivo');
    } else {
      req.body.sell_price = price;
    }
  }

  if (errors.length > 0) {
    return next(badRequest(errors.join('. ')));
  }

  next();
};

module.exports = {
  validateProductCreate,
  validateProductUpdate
};