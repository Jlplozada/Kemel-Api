import express from "express";
import { usuarios } from "../models/usuarios.js";
import bcrypt from "bcryptjs";
import { ResponseProvider } from "../providers/ResponseProvider.js";
import { validateRegistro } from "../middlewares/auth/validateAuth.js";
import { verifyToken } from "../middlewares/auth/verifyToken.js";
import UsuariosController from "../controllers/usuariosController.js";
import { verificarRol } from "../middlewares/auth/verificarRol.js";

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/registro', validateRegistro, async (req, res) => {
  const { nombre, email, password, telefono, direccion, ciudad } = req.body;
  
  console.log('=== INICIO REGISTRO ===');
  console.log('Datos recibidos:', { nombre, email, password: '***', telefono, direccion, ciudad });
  
  try {
    console.log('Buscando usuario existente...');
    // Verificar si el usuario ya existe
    const usuarioExistente = await usuarios.findByEmail(email);
    console.log('Usuario existente:', usuarioExistente ? 'SÍ' : 'NO');
    
    if (usuarioExistente) {
      console.log('Error: Usuario ya existe');
      return ResponseProvider.error(
        res, 
        "Ya existe un usuario con este email",
        400
      );
    }

    console.log('Encriptando contraseña...');
    // Encriptar la contraseña con mayor nivel de seguridad
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Contraseña encriptada exitosamente');

    // Crear el usuario (ciudad se pasa como ciudad_id)
    console.log('Intentando crear usuario con datos:', { nombre, email, telefono, direccion, ciudad });
    const userId = await usuarios.create(nombre, email, hashedPassword, telefono, direccion, ciudad);
    console.log('Usuario creado exitosamente con ID:', userId);

    return ResponseProvider.success(
      res,
      "Usuario registrado exitosamente",
      { userId: userId },
      201
    );

  } catch (error) {
    console.error('Error en registro:', error);
    return ResponseProvider.serverError(
      res,
      "Error interno del servidor"
    );
  }
});

// Ruta para obtener perfil de usuario (requiere autenticación)
router.get('/perfil', verifyToken, async (req, res) => {
  try {
    const usuario = await usuarios.findById(req.user.id);
    
    if (!usuario) {
      return ResponseProvider.notFound(
        res,
        "Usuario no encontrado"
      );
    }

    return ResponseProvider.success(
      res,
      "Perfil obtenido exitosamente",
      usuario
    );

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return ResponseProvider.serverError(
      res,
      "Error interno del servidor"
    );
  }
});

// Ruta para actualizar perfil de usuario (requiere autenticación)
router.put('/perfil', verifyToken, async (req, res) => {
  const { nombre, telefono, direccion, ciudad } = req.body;

  try {
    // Validar que al menos un campo esté presente
    if (!nombre && !telefono && !direccion && !ciudad) {
      return ResponseProvider.error(
        res,
        "Debe proporcionar al menos un campo para actualizar",
        400
      );
    }

    // Obtener datos actuales del usuario
    const usuarioActual = await usuarios.findById(req.user.id);
    if (!usuarioActual) {
      return ResponseProvider.notFound(
        res,
        "Usuario no encontrado"
      );
    }

    // Usar datos actuales si no se proporcionan nuevos
    const datosActualizados = {
      nombre: nombre || usuarioActual.nombre,
      telefono: telefono || usuarioActual.telefono,
      direccion: direccion || usuarioActual.direccion,
      ciudad: ciudad || usuarioActual.ciudad
    };

    // Actualizar perfil
    await usuarios.updateProfile(
      req.user.id,
      datosActualizados.nombre,
      datosActualizados.telefono,
      datosActualizados.direccion,
      datosActualizados.ciudad
    );

    return ResponseProvider.success(
      res,
      "Perfil actualizado exitosamente"
    );

  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return ResponseProvider.serverError(
      res,
      "Error interno del servidor"
    );
  }
});

// Ruta para cambiar contraseña (requiere autenticación)
router.patch('/cambiar-password', verifyToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return ResponseProvider.error(
      res,
      "Contraseña actual y nueva contraseña son requeridas",
      400
    );
  }

  if (newPassword.length < 6) {
    return ResponseProvider.error(
      res,
      "La nueva contraseña debe tener al menos 6 caracteres",
      400
    );
  }

  try {
    // Obtener usuario actual
    const usuario = await usuarios.findByEmail(req.user.email);
    if (!usuario) {
      return ResponseProvider.notFound(
        res,
        "Usuario no encontrado"
      );
    }

    // Verificar contraseña actual
    const match = await bcrypt.compare(currentPassword, usuario.clave);
    if (!match) {
      return ResponseProvider.error(
        res,
        "La contraseña actual es incorrecta",
        400
      );
    }

    // Encriptar nueva contraseña
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña
    await usuarios.updatePassword(req.user.id, hashedNewPassword);

    return ResponseProvider.success(
      res,
      "Contraseña actualizada exitosamente"
    );

  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    return ResponseProvider.serverError(
      res,
      "Error interno del servidor"
    );
  }
});

// === RUTAS DE ADMINISTRADOR ===
// Obtener todos los usuarios (solo para administradores)
router.get('/admin/todos', verifyToken, verificarRol(['admin']), UsuariosController.getAllUsuarios);

// Obtener un usuario por ID (solo para administradores)
router.get('/admin/:id', verifyToken, verificarRol(['admin']), UsuariosController.getUsuarioById);

// Actualizar un usuario (solo para administradores)
router.put('/admin/:id', verifyToken, verificarRol(['admin']), UsuariosController.updateUsuario);

// Eliminar un usuario (cambiar estado) (solo para administradores)
router.delete('/admin/:id', verifyToken, verificarRol(['admin']), UsuariosController.deleteUsuario);

// Restaurar un usuario (solo para administradores)
router.patch('/admin/:id/restaurar', verifyToken, verificarRol(['admin']), UsuariosController.restaurarUsuario);

// Crear un nuevo usuario (solo para administradores)
router.post('/admin/crear', verifyToken, verificarRol(['admin']), UsuariosController.createUsuario);

router.get('/:id', (req, res) => {
  return ResponseProvider.error(res, "Endpoint no implementado", 501);
});

router.delete('/:id', (req, res) => {
  return ResponseProvider.error(res, "Endpoint no implementado", 501);
});

export default router;