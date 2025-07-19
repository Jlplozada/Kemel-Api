import express from "express";
import productoController from '../controllers/productoController.js';
import { uploadSingle } from '../middlewares/upload.js';
import { verifyToken } from '../middlewares/auth/verifyToken.js';

const router = express.Router();

// Rutas específicas primero (antes de rutas con parámetros)
router.get("/admin/todos", verifyToken, productoController.getAllProductosAdmin);
router.get("/admin", verifyToken, productoController.getAllProductosAdmin); // Nueva ruta para el frontend

// Rutas con autenticación
router.get("/:id", verifyToken, productoController.getProductoById);
router.post("/", verifyToken, uploadSingle('imagen'), productoController.createProducto);
router.put("/:id", verifyToken, uploadSingle('imagen'), productoController.updateProducto);
router.put("/:id/estado", verifyToken, productoController.cambiarEstadoProducto);
router.delete("/:id", verifyToken, productoController.deleteProducto);
router.put("/:id/restaurar", verifyToken, productoController.restaurarProducto);

// Rutas públicas (al final)
router.get("/", productoController.getAllProductos);

export default router;