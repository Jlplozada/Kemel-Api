import express from "express";
import { pedidosController } from '../controllers/pedidosController.js';
import { verifyToken } from '../middlewares/auth/verifyToken.js';
import { verificarRol } from '../middlewares/auth/verificarRol.js';

const router = express.Router();

// Todas las rutas de pedidos requieren autenticación
router.use(verifyToken);

// Crear un nuevo pedido (cualquier usuario autenticado)
router.post('/', pedidosController.crearPedido);

// Obtener pedidos del usuario autenticado
router.get('/mis-pedidos', pedidosController.obtenerPedidosUsuario);

// Ruta específica para panaderos - solo pedidos pendientes
router.get('/pendientes', verificarRol(['panaderia']), pedidosController.obtenerPedidosPendientes);

// Ruta específica para administradores - todos los pedidos activos
router.get('/admin', verificarRol(['admin']), pedidosController.obtenerPedidosAdmin);

// Obtener todos los pedidos (solo para administradores y panaderos)
router.get('/', verificarRol(['admin', 'panaderia']), pedidosController.obtenerTodosPedidos);

// Actualizar estado de un pedido (solo para administradores y panaderos)
router.put('/:id/estado', verificarRol(['admin', 'panaderia']), pedidosController.actualizarEstadoPedido);

// Eliminar pedido (solo administradores)
router.delete('/:id', verificarRol(['admin']), pedidosController.eliminarPedido);

export default router;