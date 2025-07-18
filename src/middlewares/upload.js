import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Guardar en la carpeta src/img
    const uploadPath = path.join(__dirname, '..', 'img');
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generar nombre único: timestamp + nombre original limpio
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const uniqueName = `${Date.now()}_${cleanName}${ext}`;
    cb(null, uniqueName);
  }
});

// Filtro para solo permitir imágenes
const fileFilter = (req, file, cb) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen (jpg, png, gif, etc.)'), false);
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Límite de 5MB
  },
  fileFilter: fileFilter
});

// Middleware para subir una sola imagen
export const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.single(fieldName);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'El archivo es demasiado grande. Máximo 5MB.'
          });
        }
        return res.status(400).json({
          success: false,
          error: `Error al subir archivo: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      // Si no hay error, continúa
      next();
    });
  };
};

// Middleware para subir múltiples imágenes
export const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    const uploadMiddleware = upload.array(fieldName, maxCount);
    
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: 'Uno o más archivos son demasiado grandes. Máximo 5MB por archivo.'
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            success: false,
            error: `Demasiados archivos. Máximo ${maxCount} archivos.`
          });
        }
        return res.status(400).json({
          success: false,
          error: `Error al subir archivos: ${err.message}`
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          error: err.message
        });
      }
      
      // Si no hay error, continúa
      next();
    });
  };
};

export default upload;
