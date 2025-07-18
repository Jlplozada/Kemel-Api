import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import productoRoutes from './src/routes/productosRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './src/utils/db.js';

dotenv.config();

const app = express();
const port= 5010;

// Solución para __dirname en ES Modules
// En ES Modules no existe __dirname por defecto. Estas líneas lo recrean usando 'fileURLToPath' y 'path.dirname',
// permitiendo obtener la ruta absoluta del directorio actual como en CommonJS.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'src/img'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.use(cors());

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/productos/img', express.static(path.join(__dirname, 'src/img')));

app.use('/productos', productoRoutes);
app.use('/auth', authRoutes);

// Endpoint para subir imágenes de productos
app.post('/productos/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  // Devuelve la ruta relativa para guardar en la base de datos y mostrar en el frontend
  const rutaImagen = `/productos/img/${req.file.filename}`;
  res.json({ mensaje: 'Imagen subida correctamente', ruta: rutaImagen });
});

// Endpoint para obtener la lista de ciudades
app.get('/ciudades', async (req, res) => {
  try {
    const [ciudades] = await db.query('SELECT * FROM ciudades WHERE estado = "activo"');
    res.json(ciudades);
  } catch (error) {
    console.error('Error al obtener ciudades:', error);
    res.status(500).json({ error: 'Error al obtener ciudades', detalle: error.message });
  }
});

app.get('/', (req, res) => {
  res.send(`Prueba del servidor api para los datos del host ${port} `);
});

app.listen(port);