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

  static async create(pedidoData, productos) {
    try {
      console.log("=== MODELO PEDIDOS CREATE ===");
      console.log("Datos del pedido:", pedidoData);
      console.log("Productos recibidos:", productos);

      const { usuario_id, total, direccion_entrega, ciudad_id, estado = 'pendiente', nombre } = pedidoData;

      // Crear el pedido principal
      const [result] = await connection.query(
        `INSERT INTO pedidos 
          (nombre, usuario_id, total, direccion_entrega, ciudad_id, estado) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [nombre, usuario_id, total, direccion_entrega, ciudad_id, estado]
      );
      const pedidoId = result.insertId;
      console.log("Pedido creado con ID:", pedidoId);

      // Ahora agregar los productos del pedido
      for (const producto of productos) {
        console.log("Procesando producto:", producto);
        
        // Buscar el producto_id por nombre
        const [productoRows] = await connection.query(
          "SELECT id FROM productos WHERE nombre = ?",
          [producto.nombre]
        );

        if (productoRows.length === 0) {
          console.log("Producto no encontrado:", producto.nombre);
          throw new Error(`Producto no encontrado: ${producto.nombre}`);
        }

        const producto_id = productoRows[0].id;
        console.log(`Producto ${producto.nombre} tiene ID:`, producto_id);

        // Insertar en la tabla de relación
        await connection.query(
          "INSERT INTO pedido_detalles (nombre, pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?, ?)",
          [producto.nombre, pedidoId, producto_id, producto.cantidad, producto.precio, producto.subtotal]
        );
      }

      console.log("Pedido creado exitosamente con ID:", pedidoId);
      return pedidoId;
    } catch (error) {
      console.error("Error en modelo pedidos:", error);
      throw new Error(`Error al crear el pedido: ${error.message}`);
    }
  }

  static async getByUsuario(usuario_id) {
    try {
      const [rows] = await connection.query(
        `SELECT p.*, u.nombre as usuario_nombre, u.email as usuario_email
         FROM pedidos p 
         JOIN usuarios u ON p.usuario_id = u.id 
         WHERE p.usuario_id = ? 
         ORDER BY p.fecha_creacion DESC`,
        [usuario_id]
      );
      return rows;
    } catch (error) {
      throw new Error("Error al obtener los pedidos del usuario");
    }
  }

  static async updateEstado(pedido_id, estado) {
    try {
      const [result] = await connection.query(
        "UPDATE pedidos SET estado = ? WHERE id = ?",
        [estado, pedido_id]
      );
      return result;
    } catch (error) {
      throw new Error("Error al actualizar el estado del pedido");
    }
  }

  // Obtener pedidos por estado específico
  static async findByEstado(estado) {
    try {
      const [rows] = await connection.query(`
        SELECT 
          p.*, 
          u.nombre as nombre_usuario,
          GROUP_CONCAT(
            CONCAT(pr.nombre, ' (x', pd.cantidad, ')') 
            SEPARATOR ', '
          ) as productos_texto
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
        LEFT JOIN productos pr ON pd.producto_id = pr.id
        WHERE p.estado = ? AND p.estado_registro = 'activo'
        GROUP BY p.id
        ORDER BY p.fecha_pedido DESC
      `, [estado]);
      
      return rows;
    } catch (error) {
      console.error("Error al obtener pedidos por estado:", error);
      throw new Error("Error al obtener pedidos por estado");
    }
  }

  // Obtener todos los pedidos activos con filtro opcional por estado
  static async findAllActive(filtroEstado = null) {
    try {
      let query = `
        SELECT 
          p.*, 
          u.nombre as nombre_usuario,
          GROUP_CONCAT(
            CONCAT(pr.nombre, ' (x', pd.cantidad, ')') 
            SEPARATOR ', '
          ) as productos_texto
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        LEFT JOIN pedido_detalles pd ON p.id = pd.pedido_id
        LEFT JOIN productos pr ON pd.producto_id = pr.id
        WHERE p.estado_registro = 'activo'
      `;
      
      const params = [];
      
      if (filtroEstado) {
        query += ' AND p.estado = ?';
        params.push(filtroEstado);
      }
      
      query += ' GROUP BY p.id ORDER BY p.fecha_pedido DESC';
      
      const [rows] = await connection.query(query, params);
      return rows;
    } catch (error) {
      console.error("Error al obtener todos los pedidos activos:", error);
      throw new Error("Error al obtener pedidos activos");
    }
  }

  // Eliminar pedido (cambiar estado_registro a eliminado)
  static async delete(pedido_id) {
    try {
      const [result] = await connection.query(
        "UPDATE pedidos SET estado_registro = 'eliminado' WHERE id = ?",
        [pedido_id]
      );
      return result;
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      throw new Error("Error al eliminar el pedido");
    }
  }
}