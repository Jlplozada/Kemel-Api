import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import productoRoutes from './src/routes/productosRoutes.js';
import authRoutes from './src/routes/authRoutes.js';
import usuarioRoutes from './src/routes/usuarioRoutes.js';
import pedidosRoutes from './src/routes/pedidosRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './src/utils/db.js';

dotenv.config();

const app = express();
const port= 5010;

// Solución para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Servir imágenes estáticamente
app.use('/img', express.static(path.join(__dirname, 'src/img')));

app.use('/productos', productoRoutes);
app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/pedidos', pedidosRoutes);

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

app.listen(port, () => {
  console.log(`🚀 Servidor API corriendo en http://localhost:${port}`);
  console.log(`📁 Imágenes disponibles en http://localhost:${port}/img/`);
});