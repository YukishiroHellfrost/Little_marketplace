const { badRequest } = require('../utils/errors');

// Lista de roles permitidos (excluyendo SUPERUSER para creación)
const VALID_ROLES = ['CLIENT', 'SELLER', 'SUPERVISOR'];
const ALL_ROLES = [...VALID_ROLES, 'SUPERUSER']; // Para actualización


 //Validación los datos de creación de un usuario
const validateUserCreate = (req, res, next) => {
  const { name, password, role, googleAuth, state, storeId } = req.body;
  const errors = [];

  // Validar campos obligatorios
  if (!name || typeof name !== 'string' || name.trim() === '') {
    errors.push('El nombre es obligatorio y debe ser un texto no vacío');
  }

  if (!password || typeof password !== 'string') {
    errors.push('La contraseña es obligatoria y debe ser un texto');
  } else if (password.length < 6) {
    errors.push('La contraseña debe tener al menos 6 caracteres');
  }

  if (!role) {
    errors.push('El rol es obligatorio');
  } else if (!VALID_ROLES.includes(role)) {
    errors.push(`El rol debe ser uno de: ${VALID_ROLES.join(', ')}. No se permite crear SUPERUSER por API.`);
  }
  // Validar campos opcionales 
  if (googleAuth !== undefined && typeof googleAuth !== 'boolean') {
    errors.push('googleAuth debe ser un valor booleano');
  }

  if (state !== undefined && typeof state !== 'boolean') {
    errors.push('state debe ser un valor booleano');
  }

  if (storeId !== undefined) {
    if (!Number.isInteger(storeId) || storeId <= 0) {
      errors.push('storeId debe ser un número entero positivo');
    }
  }

  if (errors.length > 0) {
    return next(badRequest(errors.join('. ')));
  }

  // Limpiar espacios en nombre y pasar al siguiente middleware
  req.body.name = name.trim();
  next();
};

 // Valida los datos de actualización de un usuario
const validateUserUpdate = (req, res, next) => {
  const { name, password, role, googleAuth, state, storeId } = req.body;
  const errors = [];

  // Solo validar campos que vienen en la petición
  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '') {
      errors.push('El nombre debe ser un texto no vacío');
    } else {
      req.body.name = name.trim();
    }
  }

  if (password !== undefined) {
    if (typeof password !== 'string') {
      errors.push('La contraseña debe ser un texto');
    } else if (password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }
  }

  if (role !== undefined) {
    if (!ALL_ROLES.includes(role)) {
      errors.push(`El rol debe ser uno de: ${ALL_ROLES.join(', ')}`);
    }
    // Nota: No prohibimos SUPERUSER en actualización porque podría ser asignado por un SUPERUSER autorizado.
    // La autorización se maneja en el middleware authorize.
  }

  if (googleAuth !== undefined && typeof googleAuth !== 'boolean') {
    errors.push('googleAuth debe ser un valor booleano');
  }

  if (state !== undefined && typeof state !== 'boolean') {
    errors.push('state debe ser un valor booleano');
  }

  if (storeId !== undefined) {
    if (!Number.isInteger(storeId) || storeId <= 0) {
      errors.push('storeId debe ser un número entero positivo');
    }
  }

  if (errors.length > 0) {
    return next(badRequest(errors.join('. ')));
  }

  next();
};

module.exports = {
  validateUserCreate,
  validateUserUpdate
};