import producto from "../models/productos.js";

class productosController {
  static getAllProductos = async (req, res) => {
    try {
      const productos = await producto.getAll();
      return res.status(200).json(productos);
    } catch (error) {
      return res.status(500).json({ error: "Error interno en el servidor" });
    }
  };

  static getProductoById = async (req, res) => {
    try {
      const { id } = req.params;
      const prod = await producto.getById(id);
      if (!prod) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json(prod);
    } catch (error) {
      return res.status(500).json({ error: "Error interno en el servidor" });
    }
  };

  static createProducto = async (req, res) => {
    try {
      const { nombre, descripcion, precio, imagen, creado_por } = req.body;
      const nuevo = await producto.create({ nombre, descripcion, precio, imagen, creado_por });
      return res.status(201).json({ id: nuevo.id, message: "Producto creado" });
    } catch (error) {
      return res.status(500).json({ error: "Error al crear el producto" });
    }
  };

  static updateProducto = async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio, imagen } = req.body;
      const actualizado = await producto.update(id, { nombre, descripcion, precio, imagen });
      if (!actualizado) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ message: "Producto actualizado" });
    } catch (error) {
      return res.status(500).json({ error: "Error al actualizar el producto" });
    }
  };

  static deleteProducto = async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await producto.delete(id);
      if (!eliminado) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ message: "Producto eliminado" });
    } catch (error) {
      return res.status(500).json({ error: "Error al eliminar el producto" });
    }
  };
}
export default productosController;
