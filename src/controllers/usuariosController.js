import { usuarios } from '../models/usuarios.js';

class UsuariosController {
    static getAllUsuarios = async (req, res) => {
        try {
            const todosUsuarios = await usuarios.getAllAdmin();
            // Remover contraseñas de la respuesta
            const usuariosSinPassword = todosUsuarios.map(usuario => {
                const { clave, refresh_token, ...usuarioSinClave } = usuario;
                return usuarioSinClave;
            });
            return res.status(200).json(usuariosSinPassword);
        } catch (error) {
            console.error('Error en getAllUsuarios:', error);
            return res.status(500).json({ error: "Error interno en el servidor", detalle: error.message });
        }
    };

    static getUsuarioById = async (req, res) => {
        try {
            const { id } = req.params;
            const usuario = await usuarios.getById(id);
            if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" });
            
            // Remover contraseña de la respuesta
            const { clave, refresh_token, ...usuarioSinClave } = usuario;
            return res.status(200).json(usuarioSinClave);
        } catch (error) {
            console.error('Error en getUsuarioById:', error);
            return res.status(500).json({ error: "Error interno en el servidor", detalle: error.message });
        }
    };

    static updateUsuario = async (req, res) => {
        try {
            const { id } = req.params;
            const { usuario, nombre, email, correo, telefono, direccion, ciudad_id, rol, password } = req.body;
            
            console.log("=== UPDATE USUARIO ===");
            console.log("ID a actualizar:", id);
            console.log("Datos recibidos:", req.body);
            console.log("Usuario del token:", req.user);
            
            // Usar email o correo (compatibilidad)
            const emailFinal = email || correo;
            
            // Verificar que el usuario existe
            const usuarioExistente = await usuarios.getById(id);
            if (!usuarioExistente) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // Si no es admin, solo puede modificar su propia cuenta
            if (req.user.rol !== 'admin' && req.user.id !== parseInt(id)) {
                return res.status(403).json({ error: "No tienes permisos para modificar este usuario" });
            }

            // Verificar que el nombre de usuario no esté en uso por otro usuario
            if (usuario && usuario !== usuarioExistente.usuario) {
                const usuarioConMismoNombre = await usuarios.findByUsername(usuario);
                if (usuarioConMismoNombre && usuarioConMismoNombre.id !== parseInt(id)) {
                    return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
                }
            }

            // Verificar que el correo no esté en uso por otro usuario
            if (emailFinal && emailFinal !== usuarioExistente.correo) {
                const usuarioConMismoCorreo = await usuarios.findByEmail(emailFinal);
                if (usuarioConMismoCorreo && usuarioConMismoCorreo.id !== parseInt(id)) {
                    return res.status(400).json({ error: "El correo ya está en uso" });
                }
            }

            // Preparar datos para actualizar
            const datosActualizar = { 
                usuario: usuario || usuarioExistente.usuario, 
                nombre: nombre || usuarioExistente.nombre, 
                correo: emailFinal || usuarioExistente.correo, 
                telefono: telefono || usuarioExistente.telefono, 
                direccion: direccion || usuarioExistente.direccion, 
                ciudad_id: ciudad_id || usuarioExistente.ciudad_id, 
                rol: rol || usuarioExistente.rol 
            };

            // Si se proporciona una nueva contraseña, hashearla
            if (password && password.trim() !== '') {
                const bcrypt = await import('bcryptjs');
                datosActualizar.clave = await bcrypt.hash(password.trim(), 12);
                console.log("Contraseña será actualizada");
            }

            console.log("Datos que se van a actualizar:", datosActualizar);
            
            const actualizado = await usuarios.updateUsuario(id, datosActualizar);
            
            if (!actualizado) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // Obtener el usuario actualizado para devolver los nuevos datos
            const usuarioActualizado = await usuarios.getById(id);
            const { clave, refresh_token, ...usuarioSinClave } = usuarioActualizado;

            return res.status(200).json({ 
                success: true,
                message: "Usuario actualizado correctamente",
                data: usuarioSinClave
            });
        } catch (error) {
            console.error('Error en updateUsuario:', error);
            return res.status(500).json({ error: "Error al actualizar el usuario", detalle: error.message });
        }
    };

    static deleteUsuario = async (req, res) => {
        try {
            const { id } = req.params;
            
            // Verificar que no sea el propio usuario admin que se está eliminando
            if (req.user && req.user.id === parseInt(id)) {
                return res.status(400).json({ error: "No puedes eliminar tu propia cuenta" });
            }
            
            const eliminado = await usuarios.deleteUsuario(id);
            if (!eliminado) return res.status(404).json({ error: "Usuario no encontrado" });
            return res.status(200).json({ message: "Usuario eliminado correctamente" });
        } catch (error) {
            console.error('Error en deleteUsuario:', error);
            return res.status(500).json({ error: "Error al eliminar el usuario", detalle: error.message });
        }
    };

    static restaurarUsuario = async (req, res) => {
        try {
            const { id } = req.params;
            const restaurado = await usuarios.restaurarUsuario(id);
            if (!restaurado) return res.status(404).json({ error: "Usuario no encontrado" });
            return res.status(200).json({ message: "Usuario restaurado correctamente" });
        } catch (error) {
            console.error('Error en restaurarUsuario:', error);
            return res.status(500).json({ error: "Error al restaurar el usuario", detalle: error.message });
        }
    };

    static createUsuario = async (req, res) => {
        try {
            const { usuario, nombre, clave, correo, telefono, direccion, ciudad_id, rol = 'cliente' } = req.body;
            
            // Validaciones básicas
            if (!usuario || !nombre || !clave) {
                return res.status(400).json({ error: "Usuario, nombre y contraseña son requeridos" });
            }

            // Verificar que el usuario no exista
            const usuarioExistente = await usuarios.findByUsername(usuario);
            if (usuarioExistente) {
                return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
            }

            // Verificar que el correo no exista
            if (correo) {
                const correoExistente = await usuarios.findByEmail(correo);
                if (correoExistente) {
                    return res.status(400).json({ error: "El correo ya está en uso" });
                }
            }

            // Hashear la contraseña
            const bcrypt = await import('bcryptjs');
            const hashedPassword = await bcrypt.hash(clave, 12);
            
            const nuevoUsuario = await usuarios.create(
                nombre, 
                correo, 
                hashedPassword, 
                telefono, 
                direccion, 
                ciudad_id
            );
            
            return res.status(201).json({ 
                id: nuevoUsuario.id, 
                message: "Usuario creado correctamente" 
            });
        } catch (error) {
            console.error('Error en createUsuario:', error);
            return res.status(500).json({ error: "Error al crear el usuario", detalle: error.message });
        }
    };

    // Obtener todos los usuarios activos para administración
    static obtenerUsuariosAdmin = async (req, res) => {
        try {
            console.log("=== OBTENER USUARIOS ADMIN ===");
            console.log("Usuario autenticado:", req.user);
            console.log("Filtro rol:", req.query.rol);

            const filtroRol = req.query.rol || null;
            const todosUsuarios = await usuarios.findAllActive(filtroRol);
            
            // Remover contraseñas y tokens de la respuesta
            const usuariosSinDatosSensibles = todosUsuarios.map(usuario => {
                const { clave, refresh_token, ...usuarioLimpio } = usuario;
                return usuarioLimpio;
            });

            return res.status(200).json({
                success: true,
                data: usuariosSinDatosSensibles,
                message: "Usuarios obtenidos exitosamente"
            });
        } catch (error) {
            console.error('Error en obtenerUsuariosAdmin:', error);
            return res.status(500).json({ 
                success: false,
                error: "Error interno del servidor", 
                detalle: error.message 
            });
        }
    };

    // Cambiar rol de usuario
    static cambiarRolUsuario = async (req, res) => {
        try {
            console.log("=== CAMBIAR ROL USUARIO ===");
            const { id } = req.params;
            const { rol } = req.body;
            console.log("ID usuario:", id);
            console.log("Nuevo rol:", rol);
            console.log("Usuario autenticado:", req.user);

            if (!id || !rol) {
                return res.status(400).json({
                    success: false,
                    error: "ID de usuario y rol son requeridos"
                });
            }

            // Validar que el rol sea válido
            const rolesValidos = ['admin', 'panaderia', 'cliente'];
            if (!rolesValidos.includes(rol)) {
                return res.status(400).json({
                    success: false,
                    error: "Rol no válido"
                });
            }

            const resultado = await usuarios.updateRol(id, rol);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Usuario no encontrado"
                });
            }

            return res.status(200).json({
                success: true,
                data: { id, rol },
                message: "Rol actualizado exitosamente"
            });
        } catch (error) {
            console.error('Error en cambiarRolUsuario:', error);
            return res.status(500).json({
                success: false,
                error: "Error interno del servidor",
                detalle: error.message
            });
        }
    };

    // Eliminar usuario (cambiar estado a eliminado)
    static eliminarUsuario = async (req, res) => {
        try {
            console.log("=== ELIMINAR USUARIO ===");
            const { id } = req.params;
            console.log("ID usuario a eliminar:", id);
            console.log("Usuario autenticado:", req.user);

            if (!id) {
                return res.status(400).json({
                    success: false,
                    error: "ID de usuario es requerido"
                });
            }

            const resultado = await usuarios.delete(id);

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    error: "Usuario no encontrado"
                });
            }

            return res.status(200).json({
                success: true,
                data: { id },
                message: "Usuario eliminado exitosamente"
            });
        } catch (error) {
            console.error('Error en eliminarUsuario:', error);
            return res.status(500).json({
                success: false,
                error: "Error interno del servidor",
                detalle: error.message
            });
        }
    };
}

export default UsuariosController;
