import { ResponseProvider } from "../../providers/ResponseProvider.js";

/**
 * Middleware para validar datos de registro de usuario
 */
export function validateRegistro(req, res, next) {
  const { nombre, email, password, telefono, direccion, ciudad } = req.body;
  const errors = {};

  // Validar nombre
  if (!nombre || typeof nombre !== 'string') {
    errors.nombre = "El nombre es requerido";
  } else if (nombre.trim().length < 2) {
    errors.nombre = "El nombre debe tener al menos 2 caracteres";
  } else if (nombre.trim().length > 100) {
    errors.nombre = "El nombre no puede exceder 100 caracteres";
  }

  // Validar email
  if (!email || typeof email !== 'string') {
    errors.email = "El email es requerido";
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.email = "El formato del email no es válido";
    } else if (email.trim().length > 255) {
      errors.email = "El email no puede exceder 255 caracteres";
    }
  }

  // Validar contraseña
  if (!password || typeof password !== 'string') {
    errors.password = "La contraseña es requerida";
  } else if (password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres";
  } else if (password.length > 255) {
    errors.password = "La contraseña no puede exceder 255 caracteres";
  }

  // Validar teléfono (opcional)
  if (telefono && typeof telefono === 'string') {
    const telefonoRegex = /^[0-9]{10}$/;
    if (!telefonoRegex.test(telefono.trim())) {
      errors.telefono = "El teléfono debe tener exactamente 10 dígitos";
    }
  }

  // Validar dirección (opcional)
  if (direccion && typeof direccion === 'string') {
    if (direccion.trim().length > 255) {
      errors.direccion = "La dirección no puede exceder 255 caracteres";
    }
  }

  // Validar ciudad (opcional)
  if (ciudad) {
    const ciudadNum = parseInt(ciudad);
    if (isNaN(ciudadNum) || ciudadNum < 1 || ciudadNum > 5) {
      errors.ciudad = "La ciudad debe ser un ID válido (1-5)";
    }
  }

  // Si hay errores, devolver respuesta de validación
  if (Object.keys(errors).length > 0) {
    return ResponseProvider.validation(
      res,
      "Error en la validación de datos",
      errors
    );
  }

  // Limpiar y normalizar los datos
  req.body.nombre = nombre.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.telefono = telefono ? telefono.trim() : null;
  req.body.direccion = direccion ? direccion.trim() : null;
  req.body.ciudad = ciudad ? parseInt(ciudad) : null;

  next();
}

/**
 * Middleware para validar datos de login
 */
export function validateLogin(req, res, next) {
  const { usuario, clave } = req.body;
  const errors = {};

  // Validar usuario
  if (!usuario || typeof usuario !== 'string') {
    errors.usuario = "El nombre de usuario es requerido";
  } else if (usuario.trim().length < 1) {
    errors.usuario = "El nombre de usuario no puede estar vacío";
  } else if (usuario.trim().length > 100) {
    errors.usuario = "El nombre de usuario no puede exceder 100 caracteres";
  }

  // Validar clave
  if (!clave || typeof clave !== 'string') {
    errors.clave = "La contraseña es requerida";
  } else if (clave.length < 1) {
    errors.clave = "La contraseña no puede estar vacía";
  }

  // Si hay errores, devolver respuesta de validación
  if (Object.keys(errors).length > 0) {
    return ResponseProvider.validation(
      res,
      "Error en la validación de datos",
      errors
    );
  }

  // Limpiar los datos
  req.body.usuario = usuario.trim();

  next();
}
