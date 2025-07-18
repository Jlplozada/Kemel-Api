import producto from "../models/productos.js";

class productosController {
  static getAllProductos = async (req, res) => {
    try {
      const productos = await producto.getAll();
      return res.status(200).json(productos);
    } catch (error) {
      console.error('Error en getAllProductos:', error);
      return res.status(500).json({ error: "Error interno en el servidor", detalle: error.message });
    }
  };

  static getProductoById = async (req, res) => {
    try {
      const { id } = req.params;
      const prod = await producto.getById(id);
      if (!prod) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json(prod);
    } catch (error) {
      console.error('Error en getProductoById:', error);
      return res.status(500).json({ error: "Error interno en el servidor", detalle: error.message });
    }
  };

  static createProducto = async (req, res) => {
    try {
      const { nombre, descripcion, precio, creado_por } = req.body;
      
      // Si hay un archivo subido, usar su nombre de archivo
      const imagen = req.file ? req.file.filename : null;
      
      console.log('Datos recibidos:', { nombre, descripcion, precio, creado_por, imagen });
      
      const nuevo = await producto.create({ nombre, descripcion, precio, imagen, creado_por });
      return res.status(201).json({ 
        id: nuevo.id, 
        message: "Producto creado",
        imagen: imagen
      });
    } catch (error) {
      console.error('Error en createProducto:', error);
      return res.status(500).json({ error: "Error al crear el producto", detalle: error.message });
    }
  };

  static updateProducto = async (req, res) => {
    try {
      const { id } = req.params;
      const { nombre, descripcion, precio } = req.body;
      
      // Si hay un archivo subido, usar su nombre de archivo
      const imagen = req.file ? req.file.filename : undefined;
      
      // Solo incluir imagen en el update si se subió una nueva
      const updateData = { nombre, descripcion, precio };
      if (imagen) {
        updateData.imagen = imagen;
      }
      
      const actualizado = await producto.update(id, updateData);
      if (!actualizado) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ 
        message: "Producto actualizado",
        imagen: imagen || 'Sin cambios'
      });
    } catch (error) {
      console.error('Error en updateProducto:', error);
      return res.status(500).json({ error: "Error al actualizar el producto", detalle: error.message });
    }
  };

  static deleteProducto = async (req, res) => {
    try {
      const { id } = req.params;
      const eliminado = await producto.delete(id);
      if (!eliminado) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ message: "Producto eliminado" });
    } catch (error) {
      console.error('Error en deleteProducto:', error);
      return res.status(500).json({ error: "Error al eliminar el producto", detalle: error.message });
    }
  };

  static getAllProductosAdmin = async (req, res) => {
    try {
      const productos = await producto.getAllAdmin();
      return res.status(200).json(productos);
    } catch (error) {
      console.error('Error en getAllProductosAdmin:', error);
      return res.status(500).json({ error: "Error interno en el servidor", detalle: error.message });
    }
  };

  static restaurarProducto = async (req, res) => {
    try {
      const { id } = req.params;
      const restaurado = await producto.restaurar(id);
      if (!restaurado) return res.status(404).json({ error: "Producto no encontrado" });
      return res.status(200).json({ message: "Producto restaurado" });
    } catch (error) {
      console.error('Error en restaurarProducto:', error);
      return res.status(500).json({ error: "Error al restaurar el producto", detalle: error.message });
    }
  };
}

export default productosController;
