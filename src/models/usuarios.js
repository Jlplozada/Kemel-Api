import connection from "../utils/db.js"

// Nota: Hay un error en la importación, debería ser 'connection' no 'db'
// pero mantendremos el nombre 'db' para que funcione
const db = connection;

export class usuarios{
    static async findByEmail(email){
        const [rows] = await db.query("SELECT * FROM usuarios WHERE correo = ?", [
            email,
        ]);
        return rows[0];
    }
    
    static async findByUsername(usuario){
        const [rows] = await db.query("SELECT * FROM usuarios WHERE usuario = ?", [
            usuario,
        ]);
        return rows[0];
    }
    
    static async findByIdWithRefreshToken(id){
        const [rows] = await db.query("SELECT * FROM usuarios WHERE id = ?", [
            id,
        ]);
        return rows[0];
    }
    
    static async create(usuario, nombre, email, hashedPassword, telefono = null, direccion = null, ciudad_id = null){
        try {
            console.log('=== MODELO CREATE ===');
            console.log('Creando usuario:', { usuario, nombre, email, telefono, direccion, ciudad_id });
            
            // Convertir ciudad_id a número si es string, o null si está vacío
            const ciudadIdFinal = ciudad_id ? parseInt(ciudad_id) : null;
            console.log('Ciudad ID final:', ciudadIdFinal);
            
            // Usar el nombre de usuario proporcionado, pero verificar que sea único
            let usuarioFinal = usuario.toLowerCase().replace(/[^a-z0-9]/g, '');
            console.log('Username proporcionado:', usuarioFinal);
            
            // Verificar si el nombre de usuario ya existe y generar uno único si es necesario
            let counter = 1;
            const baseUsername = usuarioFinal;
            console.log('Verificando unicidad del username...');
            while (await this.findByUsername(usuarioFinal)) {
                console.log(`Username ${usuarioFinal} ya existe, probando ${baseUsername}${counter}`);
                usuarioFinal = `${baseUsername}${counter}`;
                counter++;
            }
            console.log('Username final:', usuarioFinal);

            console.log('Ejecutando query INSERT...');
            const [result] = await db.query(
                "INSERT INTO usuarios(usuario, nombre, correo, clave, telefono, direccion, ciudad_id) VALUES(?, ?, ?, ?, ?, ?, ?)",
                [usuarioFinal, nombre, email, hashedPassword, telefono, direccion, ciudadIdFinal]
            );
            console.log('Query ejecutado exitosamente, insertId:', result.insertId);
            return {
                id: result.insertId,
                usuario: usuarioFinal // Devolver el nombre de usuario final (puede tener número si hubo duplicado)
            };
        } catch (error) {
            console.error('Error en modelo usuarios.create:', error);
            throw error;
        }
    }
    
    static async updateRefreshToken(id, refreshToken){
        await db.query("UPDATE usuarios SET refresh_token = ? WHERE id = ?", [
            refreshToken,
            id,
        ]);
    }

    static async findById(id){
        const [rows] = await db.query("SELECT id, nombre, correo, telefono, direccion, ciudad_id FROM usuarios WHERE id = ?", [
            id,
        ]);
        return rows[0];
    }

    static async updatePassword(id, hashedPassword){
        await db.query("UPDATE usuarios SET clave = ? WHERE id = ?", [
            hashedPassword,
            id,
        ]);
    }

    static async updateProfile(id, nombre, telefono, direccion, ciudad_id){
        await db.query(
            "UPDATE usuarios SET nombre = ?, telefono = ?, direccion = ?, ciudad_id = ? WHERE id = ?", 
            [nombre, telefono, direccion, ciudad_id, id]
        );
    }

    // Nuevos métodos para administración de usuarios
    static async getAllAdmin() {
        try {
            // Para administradores: obtener todos los usuarios con información de ciudad
            const [rows] = await db.query(`
                SELECT u.*, c.nombre as ciudad_nombre 
                FROM usuarios u 
                LEFT JOIN ciudades c ON u.ciudad_id = c.id 
                ORDER BY u.fecha_registro DESC
            `);
            return rows;
        } catch (error) {
            console.error('Error en modelo usuarios.getAllAdmin:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            const [rows] = await db.query(`
                SELECT u.*, c.nombre as ciudad_nombre 
                FROM usuarios u 
                LEFT JOIN ciudades c ON u.ciudad_id = c.id 
                WHERE u.id = ?
            `, [id]);
            return rows[0];
        } catch (error) {
            throw new Error("Error al obtener el usuario");
        }
    }

    static async updateUsuario(id, { usuario, nombre, correo, telefono, direccion, ciudad_id, rol }) {
        try {
            let query = `UPDATE usuarios SET usuario = ?, nombre = ?, correo = ?, telefono = ?, direccion = ?, ciudad_id = ?`;
            let params = [usuario, nombre, correo, telefono, direccion, ciudad_id];
            
            if (rol !== undefined) {
                query += `, rol = ?`;
                params.push(rol);
            }
            
            query += ` WHERE id = ?`;
            params.push(id);
            
            const [result] = await db.query(query, params);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error("Error al actualizar el usuario");
        }
    }

    static async deleteUsuario(id) {
        try {
            // Eliminación lógica: solo cambia el estado a 'eliminado'
            const [result] = await db.query("UPDATE usuarios SET estado = 'eliminado' WHERE id = ?", [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error("Error al eliminar el usuario");
        }
    }

    static async restaurarUsuario(id) {
        try {
            // Restaurar usuario: cambiar estado a 'activo'
            const [result] = await db.query("UPDATE usuarios SET estado = 'activo' WHERE id = ?", [id]);
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error("Error al restaurar el usuario");
        }
    }

    // Obtener todos los usuarios activos con filtro opcional por rol
    static async findAllActive(filtroRol = null, excludeUserId = null) {
        try {
            console.log("=== FINDALLACTIVE USUARIOS ===");
            console.log("Filtro rol:", filtroRol);
            console.log("Excluir usuario ID:", excludeUserId);
            
            let query = "SELECT * FROM usuarios WHERE estado = 'activo'";
            const params = [];
            
            // Excluir el usuario actual
            if (excludeUserId) {
                query += " AND id != ?";
                params.push(excludeUserId);
            }
            
            if (filtroRol) {
                query += ' AND rol = ?';
                params.push(filtroRol);
            }
            
            query += ' ORDER BY fecha_registro DESC';
            
            console.log("Query ejecutándose:", query);
            console.log("Parámetros:", params);
            
            const [rows] = await db.query(query, params);
            console.log("Usuarios encontrados:", rows.length);
            
            return rows;
        } catch (error) {
            console.error("Error al obtener usuarios activos:", error);
            throw new Error("Error al obtener usuarios activos");
        }
    }

    // Actualizar rol de usuario
    static async updateRol(id, rol) {
        try {
            const [result] = await db.query(
                "UPDATE usuarios SET rol = ? WHERE id = ? AND estado = 'activo'",
                [rol, id]
            );
            return result;
        } catch (error) {
            console.error("Error al actualizar rol del usuario:", error);
            throw new Error("Error al actualizar rol del usuario");
        }
    }

    // Actualizar estado de usuario
    static async updateEstado(id, estado) {
        try {
            const [result] = await db.query(
                "UPDATE usuarios SET estado = ? WHERE id = ?",
                [estado, id]
            );
            return result;
        } catch (error) {
            console.error("Error al actualizar estado del usuario:", error);
            throw new Error("Error al actualizar estado del usuario");
        }
    }

    // Actualizar estado de usuario
    static async updateEstado(id, estado) {
        try {
            console.log("=== UPDATE ESTADO USUARIO MODEL ===");
            console.log("ID:", id);
            console.log("Nuevo estado:", estado);
            
            const [result] = await db.query(
                "UPDATE usuarios SET estado = ? WHERE id = ?",
                [estado, id]
            );
            
            console.log("Resultado de actualización:", result);
            return result;
        } catch (error) {
            console.error("Error al actualizar estado del usuario:", error);
            throw new Error("Error al actualizar estado del usuario");
        }
    }

    // Actualizar estado de usuario
    static async updateEstado(id, estado) {
        try {
            const [result] = await db.query(
                "UPDATE usuarios SET estado = ? WHERE id = ?",
                [estado, id]
            );
            return result;
        } catch (error) {
            console.error("Error al actualizar estado del usuario:", error);
            throw new Error("Error al actualizar estado del usuario");
        }
    }

    // Eliminar usuario (cambiar estado a eliminado)
    static async delete(id) {
        try {
            const [result] = await db.query(
                "UPDATE usuarios SET estado = 'eliminado' WHERE id = ?",
                [id]
            );
            return result;
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            throw new Error("Error al eliminar el usuario");
        }
    }
}
