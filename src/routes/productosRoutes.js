import express from "express";
import productoController from '../controllers/productoController.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = express.Router();

// Rutas específicas primero (antes de rutas con parámetros)
router.get("/admin/todos", productoController.getAllProductosAdmin);
router.get("/admin", productoController.getAllProductosAdmin); // Nueva ruta para el frontend

// Rutas con autenticación
router.post("/", uploadSingle('imagen'), productoController.createProducto);
router.put("/:id", uploadSingle('imagen'), productoController.updateProducto);
router.put("/:id/estado", productoController.cambiarEstadoProducto);
router.delete("/:id", productoController.deleteProducto);
router.put("/:id/restaurar", productoController.restaurarProducto);

// Rutas públicas (al final)
router.get("/", productoController.getAllProductos);
router.get("/:id", productoController.getProductoById);

export default router;