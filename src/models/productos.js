import connection from "../utils/db.js"

class producto {
  async getAll() {
    try {
      const [rows] = await connection.query("SELECT * FROM productos WHERE estado = 'activo'");
      // Ajusta la ruta de la imagen para el frontend
      return rows.map(prod => ({
        ...prod,
        imagen: typeof prod.imagen === 'string' ? `/api/productos/img/${prod.imagen.split('/').pop()}` : null
      }));
    } catch (error) {
      console.error('Error en modelo productos.getAll:', error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const [rows] = await connection.query("SELECT * FROM productos WHERE id = ?", [id]);
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
      const [result] = await connection.query(
        `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, imagen = ? WHERE id = ?`,
        [nombre, descripcion, precio, imagen, id]
      );
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
}
export default new producto();