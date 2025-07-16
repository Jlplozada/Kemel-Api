import connection from "../utils/db.js";

export class Pedidos {
  static async getAll() {
    try {
      const [rows] = await connection.query("SELECT * FROM pedidos");
      return rows;
    } catch (error) {
      throw new Error("Error al obtener los pedidos");
    }
  }

  static async create({ usuario_id, productos, total, direccion_entrega, ciudad_id, estado = 'pendiente' }) {
    try {
      const [result] = await connection.query(
        `INSERT INTO pedidos 
          (usuario_id, total, direccion_entrega, ciudad_id, estado) 
         VALUES (?, ?, ?, ?, ?)`,
        [usuario_id, total, direccion_entrega, ciudad_id, estado]
      );
      const pedidoId = result.insertId;

      for (const producto of productos) {
        await connection.query(
          "INSERT INTO pedidos_productos (pedido_id, producto_id, cantidad) VALUES (?, ?, ?)",
          [pedidoId, producto.producto_id, producto.cantidad]
        );
      }

      return pedidoId;
    } catch (error) {
      throw new Error("Error al crear el pedido");
    }
  }
}