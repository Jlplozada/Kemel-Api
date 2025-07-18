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
            const { usuario, nombre, correo, telefono, direccion, ciudad_id, rol } = req.body;
            
            // Verificar que el usuario existe
            const usuarioExistente = await usuarios.getById(id);
            if (!usuarioExistente) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            // Verificar que el nombre de usuario no esté en uso por otro usuario
            if (usuario && usuario !== usuarioExistente.usuario) {
                const usuarioConMismoNombre = await usuarios.findByUsername(usuario);
                if (usuarioConMismoNombre && usuarioConMismoNombre.id !== parseInt(id)) {
                    return res.status(400).json({ error: "El nombre de usuario ya está en uso" });
                }
            }

            // Verificar que el correo no esté en uso por otro usuario
            if (correo && correo !== usuarioExistente.correo) {
                const usuarioConMismoCorreo = await usuarios.findByEmail(correo);
                if (usuarioConMismoCorreo && usuarioConMismoCorreo.id !== parseInt(id)) {
                    return res.status(400).json({ error: "El correo ya está en uso" });
                }
            }
            
            const actualizado = await usuarios.updateUsuario(id, { 
                usuario, 
                nombre, 
                correo, 
                telefono, 
                direccion, 
                ciudad_id, 
                rol 
            });
            
            if (!actualizado) return res.status(404).json({ error: "Usuario no encontrado" });
            return res.status(200).json({ message: "Usuario actualizado correctamente" });
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
}

export default UsuariosController;
