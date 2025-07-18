import connection from "../utils/db.js"

class producto {
  async getAll() {
    try {
      const [rows] = await connection.query("SELECT * FROM productos WHERE estado = 'activo'");
      // Ajusta la ruta de la imagen para el frontend
      return rows.map(prod => ({
        ...prod,
        imagen: prod.imagen ? `/img/${prod.imagen}` : null
      }));
    } catch (error) {
      console.error('Error en modelo productos.getAll:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const [rows] = await connection.query("SELECT * FROM productos WHERE id = ?", [id]);
      if (rows[0]) {
        return {
          ...rows[0],
          imagen: rows[0].imagen ? `/img/${rows[0].imagen}` : null
        };
      }
      return rows[0];
    } catch (error) {
      throw new Error("Error al obtener el producto");
    }
  }

  async create({ nombre, descripcion, precio, imagen, creado_por }) {
    try {
      const [result] = await connection.query(
        `INSERT INTO productos (nombre, descripcion, precio, imagen, creado_por) VALUES (?, ?, ?, ?, ?)`,
        [nombre, descripcion, precio, imagen, creado_por]
      );
      return { id: result.insertId };
    } catch (error) {
      throw new Error("Error al crear el producto");
    }
  }

  async update(id, { nombre, descripcion, precio, imagen }) {
    try {
      let query = `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?`;
      let params = [nombre, descripcion, precio];
      
      if (imagen !== undefined) {
        query += `, imagen = ?`;
        params.push(imagen);
      }
      
      query += ` WHERE id = ?`;
      params.push(id);
      
      const [result] = await connection.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Error al actualizar el producto");
    }
  }

  async delete(id) {
    try {
      // Eliminación lógica: solo cambia el estado a 'eliminado'
      const [result] = await connection.query("UPDATE productos SET estado = 'eliminado' WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Error al eliminar el producto");
    }
  }

  async getAllAdmin() {
    try {
      // Para administradores: obtener todos los productos sin filtrar por estado
      const [rows] = await connection.query("SELECT * FROM productos ORDER BY created_at DESC");
      return rows.map(prod => ({
        ...prod,
        imagen: prod.imagen ? `/img/${prod.imagen}` : null
      }));
    } catch (error) {
      console.error('Error en modelo productos.getAllAdmin:', error);
      throw error;
    }
  }

  async restaurar(id) {
    try {
      // Restaurar producto: cambiar estado a 'activo'
      const [result] = await connection.query("UPDATE productos SET estado = 'activo' WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Error al restaurar el producto");
    }
  }
}
export default new producto();