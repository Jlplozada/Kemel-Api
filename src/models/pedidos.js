import db from "../utils/db.js";

export class Pedidos {
  static async getAll() {
    try {
      const [rows] = await db.query("SELECT * FROM pedidos");
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
      const [result] = await db.query(
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
        const [productoRows] = await db.query(
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
        await db.query(
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
      const [rows] = await db.query(
        `SELECT p.*, u.nombre as usuario_nombre, u.correo as usuario_email
         FROM pedidos p 
         JOIN usuarios u ON p.usuario_id = u.id 
         WHERE p.usuario_id = ? 
         ORDER BY p.fecha_pedido DESC`,
        [usuario_id]
      );
      return rows;
    } catch (error) {
      throw new Error("Error al obtener los pedidos del usuario");
    }
  }

  static async updateEstado(pedido_id, estado) {
    try {
      const [result] = await db.query(
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
      console.log("=== MODELO: Buscando pedidos con estado:", estado, "===");
      
      // Primero obtener los pedidos básicos
      const [pedidos] = await db.query(`
        SELECT 
          p.*, 
          u.nombre as nombre_usuario,
          u.telefono as telefono_usuario
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.estado = ? AND p.estado_registro = 'activo'
        ORDER BY p.fecha_pedido DESC
      `, [estado]);
      
      console.log("Pedidos básicos encontrados:", pedidos.length);
      
      if (pedidos.length === 0) {
        console.log("No se encontraron pedidos con estado:", estado);
        return [];
      }
      
      // Para cada pedido, obtener sus productos
      for (let pedido of pedidos) {
        console.log(`Buscando productos para pedido ID: ${pedido.id}`);
        
        const [productos] = await db.query(`
          SELECT 
            pd.cantidad,
            pd.precio_unitario,
            pd.subtotal,
            pd.nombre as nombre_producto,
            pr.id as producto_id,
            pr.nombre as nombre_original
          FROM pedido_detalles pd
          LEFT JOIN productos pr ON pd.producto_id = pr.id
          WHERE pd.pedido_id = ? AND pd.estado_registro = 'activo'
        `, [pedido.id]);
        
        // Usar el nombre del detalle del pedido, no del producto original
        const productosFormateados = productos.map(prod => ({
          cantidad: prod.cantidad,
          precio_unitario: prod.precio_unitario,
          subtotal: prod.subtotal,
          nombre: prod.nombre_producto || prod.nombre_original,
          producto_id: prod.producto_id
        }));
        
        pedido.productos = productosFormateados;
        console.log(`Pedido ${pedido.id} tiene ${productosFormateados.length} productos:`, productosFormateados);
      }
      
      console.log("Resultado final:", pedidos);
      return pedidos;
    } catch (error) {
      console.error("Error al obtener pedidos por estado:", error);
      throw new Error("Error al obtener pedidos por estado: " + error.message);
    }
  }

  // Obtener todos los pedidos activos con filtro opcional por estado
  static async findAllActive(filtroEstado = null) {
    try {
      console.log("=== MODELO: Buscando todos los pedidos activos. Filtro:", filtroEstado, "===");
      
      // Primero obtener los pedidos básicos
      let query = `
        SELECT 
          p.*, 
          u.nombre as nombre_usuario,
          u.telefono as telefono_usuario
        FROM pedidos p
        LEFT JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.estado_registro = 'activo'
      `;
      
      const params = [];
      
      if (filtroEstado) {
        query += ' AND p.estado = ?';
        params.push(filtroEstado);
      }
      
      query += ' ORDER BY p.fecha_pedido DESC';
      
      const [pedidos] = await db.query(query, params);
      
      console.log("Pedidos básicos encontrados:", pedidos.length);
      
      if (pedidos.length === 0) {
        console.log("No se encontraron pedidos");
        return [];
      }
      
      // Para cada pedido, obtener sus productos
      for (let pedido of pedidos) {
        console.log(`Buscando productos para pedido ID: ${pedido.id}`);
        
        const [productos] = await db.query(`
          SELECT 
            pd.cantidad,
            pd.precio_unitario,
            pd.subtotal,
            pd.nombre as nombre_producto,
            pr.id as producto_id,
            pr.nombre as nombre_original
          FROM pedido_detalles pd
          LEFT JOIN productos pr ON pd.producto_id = pr.id
          WHERE pd.pedido_id = ? AND pd.estado_registro = 'activo'
        `, [pedido.id]);
        
        // Usar el nombre del detalle del pedido, no del producto original
        const productosFormateados = productos.map(prod => ({
          cantidad: prod.cantidad,
          precio_unitario: prod.precio_unitario,
          subtotal: prod.subtotal,
          nombre: prod.nombre_producto || prod.nombre_original,
          producto_id: prod.producto_id
        }));
        
        pedido.productos = productosFormateados;
        console.log(`Pedido ${pedido.id} tiene ${productosFormateados.length} productos:`, productosFormateados);
      }
      
      console.log("Resultado final admin:", pedidos);
      return pedidos;
    } catch (error) {
      console.error("Error al obtener todos los pedidos activos:", error);
      throw new Error("Error al obtener pedidos activos");
    }
  }

  // Eliminar pedido (cambiar estado_registro a eliminado)
  static async delete(pedido_id) {
    try {
      const [result] = await db.query(
        "UPDATE pedidos SET estado_registro = 'eliminado' WHERE id = ?",
        [pedido_id]
      );
      return result;
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      throw new Error("Error al eliminar el pedido");
    }
  }

  // Obtener detalles completos de un pedido (pedido + cliente + productos)
  static async getDetailedById(pedido_id) {
    try {
      console.log("=== MODELO getDetailedById ===");
      console.log("Buscando pedido ID:", pedido_id);

      // Obtener información del pedido y cliente
      const [pedidoRows] = await db.query(`
        SELECT 
          p.id,
          p.nombre,
          p.fecha_pedido,
          p.total,
          p.estado,
          p.direccion_entrega,
          u.id as cliente_id,
          u.nombre as cliente_nombre,
          u.correo as cliente_correo,
          u.telefono as cliente_telefono,
          u.direccion as cliente_direccion
        FROM pedidos p
        INNER JOIN usuarios u ON p.usuario_id = u.id
        WHERE p.id = ? AND p.estado_registro = 'activo'
      `, [pedido_id]);

      if (pedidoRows.length === 0) {
        console.log("Pedido no encontrado");
        return null;
      }

      const pedidoData = pedidoRows[0];
      console.log("Pedido encontrado:", pedidoData);

      // Obtener productos del pedido - usar pedido_detalles en lugar de pedido_productos
      const [productosRows] = await db.query(`
        SELECT 
          pd.nombre,
          pd.cantidad,
          pd.precio_unitario,
          pd.subtotal,
          pr.descripcion,
          pr.imagen,
          pr.id as producto_id
        FROM pedido_detalles pd
        LEFT JOIN productos pr ON pd.producto_id = pr.id
        WHERE pd.pedido_id = ? AND pd.estado_registro = 'activo'
      `, [pedido_id]);

      console.log("Productos encontrados:", productosRows);

      // Estructurar la respuesta
      const resultado = {
        pedido: {
          id: pedidoData.id,
          nombre: pedidoData.nombre,
          fecha_pedido: pedidoData.fecha_pedido,
          total: pedidoData.total,
          estado: pedidoData.estado,
          direccion_entrega: pedidoData.direccion_entrega
        },
        cliente: {
          id: pedidoData.cliente_id,
          nombre: pedidoData.cliente_nombre,
          correo: pedidoData.cliente_correo,
          telefono: pedidoData.cliente_telefono,
          direccion: pedidoData.cliente_direccion
        },
        productos: productosRows
      };

      console.log("Resultado estructurado:", resultado);
      return resultado;

    } catch (error) {
      console.error("Error al obtener detalles del pedido:", error);
      throw new Error("Error al obtener los detalles del pedido");
    }
  }
}