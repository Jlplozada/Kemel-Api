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
    
    static async create(nombre, email, hashedPassword, telefono = null, direccion = null, ciudad_id = null){
        try {
            console.log('=== MODELO CREATE ===');
            console.log('Creando usuario:', { nombre, email, telefono, direccion, ciudad_id });
            
            // Convertir ciudad_id a número si es string, o null si está vacío
            const ciudadIdFinal = ciudad_id ? parseInt(ciudad_id) : null;
            console.log('Ciudad ID final:', ciudadIdFinal);
            
            // Generar un nombre de usuario único basado en el email
            // Tomamos la parte antes del @ y le agregamos un número aleatorio si es necesario
            const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            let usuario = baseUsername;
            console.log('Username base generado:', usuario);
            
            // Verificar si el nombre de usuario ya existe y generar uno único
            let counter = 1;
            console.log('Verificando unicidad del username...');
            while (await this.findByUsername(usuario)) {
                console.log(`Username ${usuario} ya existe, probando ${baseUsername}${counter}`);
                usuario = `${baseUsername}${counter}`;
                counter++;
            }
            console.log('Username final:', usuario);

            console.log('Ejecutando query INSERT...');
            const [result] = await db.query(
                "INSERT INTO usuarios(usuario, nombre, correo, clave, telefono, direccion, ciudad_id) VALUES(?, ?, ?, ?, ?, ?, ?)",
                [usuario, nombre, email, hashedPassword, telefono, direccion, ciudadIdFinal]
            );
            console.log('Query ejecutado exitosamente, insertId:', result.insertId);
            return result.insertId;
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
            console.error("Error al obtener todos los usuarios:", error);
            throw new Error("Error al obtener usuarios");
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
            console.error("Error al obtener usuario por ID:", error);
            throw new Error("Error al obtener usuario");
        }
    }

    static async updateUsuario(id, datosUsuario) {
        try {
            const campos = [];
            const valores = [];
            
            // Construir query dinámicamente
            Object.keys(datosUsuario).forEach(campo => {
                if (datosUsuario[campo] !== undefined) {
                    campos.push(`${campo} = ?`);
                    valores.push(datosUsuario[campo]);
                }
            });
            
            valores.push(id); // Agregar ID al final para WHERE
            
            const [result] = await db.query(
                `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`,
                valores
            );
            return result;
        } catch (error) {
            console.error("Error al actualizar usuario:", error);
            throw new Error("Error al actualizar usuario");
        }
    }

    // Obtener todos los usuarios activos para administración
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
