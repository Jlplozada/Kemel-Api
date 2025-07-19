import { Pedidos } from '../models/pedidos.js';
import { ResponseProvider } from '../providers/ResponseProvider.js';

export const pedidosController = {
  // Crear un nuevo pedido
  async crearPedido(req, res) {
    try {
      console.log("=== CREAR PEDIDO ===");
      console.log("Datos recibidos:", req.body);
      console.log("Usuario autenticado:", req.user);

      const { nombre, direccion_entrega, ciudad_id, total, estado, productos } = req.body;
      const usuario_id = req.user.id; // Del token JWT

      // Validar datos requeridos
      if (!nombre || !usuario_id || !total || !productos || productos.length === 0) {
        return ResponseProvider.error(res, "Faltan datos obligatorios para crear el pedido", 400);
      }

      // Datos del pedido
      const pedidoData = {
        nombre,
        usuario_id,
        direccion_entrega: direccion_entrega || '',
        ciudad_id: ciudad_id || 1,
        total,
        estado: estado || 'pendiente'
      };

      console.log("Datos del pedido a crear:", pedidoData);
      console.log("Productos del pedido:", productos);

      // Crear el pedido en la base de datos
      const pedidoId = await Pedidos.create(pedidoData, productos);

      return ResponseProvider.success(res, {
        id: pedidoId,
        mensaje: "Pedido creado exitosamente",
        pedido: { ...pedidoData, id: pedidoId, productos }
      }, "Pedido creado exitosamente", 201);

    } catch (error) {
      console.error("Error al crear pedido:", error);
      return ResponseProvider.error(res, "Error interno del servidor al crear el pedido", 500);
    }
  },

  // Obtener todos los pedidos de un usuario
  async obtenerPedidosUsuario(req, res) {
    try {
      const usuario_id = req.user.id;
      const pedidos = await Pedidos.getByUsuario(usuario_id);
      
      return ResponseProvider.success(res, pedidos, "Pedidos obtenidos exitosamente");
    } catch (error) {
      console.error("Error al obtener pedidos:", error);
      return ResponseProvider.error(res, "Error interno del servidor", 500);
    }
  },

  // Obtener todos los pedidos (solo para administradores)
  async obtenerTodosPedidos(req, res) {
    try {
      const pedidos = await Pedidos.getAll();
      
      return ResponseProvider.success(res, pedidos, "Todos los pedidos obtenidos exitosamente");
    } catch (error) {
      console.error("Error al obtener todos los pedidos:", error);
      return ResponseProvider.error(res, "Error interno del servidor", 500);
    }
  },

  // Actualizar estado de un pedido
  async actualizarEstadoPedido(req, res) {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!estado) {
        return ResponseProvider.error(res, "El estado es requerido", 400);
      }

      const resultado = await Pedidos.updateEstado(id, estado);
      
      if (resultado.affectedRows === 0) {
        return ResponseProvider.error(res, "Pedido no encontrado", 404);
      }

      return ResponseProvider.success(res, { id, estado }, "Estado del pedido actualizado exitosamente");
    } catch (error) {
      console.error("Error al actualizar estado del pedido:", error);
      return ResponseProvider.error(res, "Error interno del servidor", 500);
    }
  },

  // Obtener pedidos pendientes (para panaderos)
  async obtenerPedidosPendientes(req, res) {
    try {
      console.log("=== OBTENER PEDIDOS PENDIENTES ===");
      console.log("Usuario autenticado:", req.user);

      const pedidos = await Pedidos.findByEstado('pendiente');
      
      console.log("Pedidos encontrados:", pedidos.length);
      console.log("Primer pedido (si existe):", pedidos[0]);

      return ResponseProvider.success(res, "Pedidos pendientes obtenidos exitosamente", pedidos);
    } catch (error) {
      console.error("Error al obtener pedidos pendientes:", error);
      return ResponseProvider.error(res, "Error interno del servidor", 500);
    }
  },

  // Obtener todos los pedidos activos (para administradores)
  async obtenerPedidosAdmin(req, res) {
    try {
      console.log("=== OBTENER PEDIDOS ADMIN ===");
      console.log("Usuario autenticado:", req.user);
      console.log("Filtro estado:", req.query.estado);

      const filtroEstado = req.query.estado || null;
      const pedidos = await Pedidos.findAllActive(filtroEstado);

      console.log("Pedidos encontrados para admin:", pedidos.length);
      console.log("Primer pedido (si existe):", pedidos[0]);

      return ResponseProvider.success(res, "Pedidos obtenidos exitosamente", pedidos);
    } catch (error) {
      console.error("Error al obtener pedidos admin:", error);
      return ResponseProvider.error(res, "Error interno del servidor", 500);
    }
  },

  // Eliminar pedido (para administradores)
  async eliminarPedido(req, res) {
    try {
      console.log("=== ELIMINAR PEDIDO ===");
      const { id } = req.params;
      console.log("ID del pedido a eliminar:", id);
      console.log("Usuario autenticado:", req.user);

      if (!id) {
        return ResponseProvider.error(res, "ID del pedido es requerido", 400);
      }

      const resultado = await Pedidos.delete(id);

      if (resultado.affectedRows === 0) {
        return ResponseProvider.error(res, "Pedido no encontrado", 404);
      }

      return ResponseProvider.success(res, { id }, "Pedido eliminado exitosamente");
    } catch (error) {
      console.error("Error al eliminar pedido:", error);
      return ResponseProvider.error(res, "Error interno del servidor", 500);
    }
  },

  // Obtener detalles completos de un pedido (pedido + cliente + productos)
  async obtenerDetallePedido(req, res) {
    try {
      console.log("=== OBTENER DETALLE PEDIDO ===");
      const { id } = req.params;
      console.log("ID del pedido:", id);
      console.log("Usuario autenticado:", req.user);

      if (!id) {
        return ResponseProvider.error(res, "ID del pedido es requerido", 400);
      }

      // Obtener detalles completos del pedido
      const detalles = await Pedidos.getDetailedById(id);

      if (!detalles) {
        return ResponseProvider.error(res, "Pedido no encontrado", 404);
      }

      console.log("Detalles encontrados:", detalles);

      return ResponseProvider.success(res, detalles, "Detalles del pedido obtenidos exitosamente");
    } catch (error) {
      console.error("Error al obtener detalles del pedido:", error);
      return ResponseProvider.error(res, "Error interno del servidor", 500);
    }
  }
};
