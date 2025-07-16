import connection from "../utils/db.js"

class producto {
  async getAll() {
    try {
      // Volver a incluir el campo imagen en la consulta general
      const [rows] = await connection.query("SELECT * FROM productos");
      return rows;
    } catch (error) {
      throw new Error("Error al obtener los productos");
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
      const [result] = await connection.query("DELETE FROM productos WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Error al eliminar el producto");
    }
  }
}
export default new producto();