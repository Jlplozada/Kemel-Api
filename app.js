import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import productoRoutes from './src/routes/productosRoutes.js';
import authRoutes from './src/routes/authRoutes.js';

dotenv.config();

const app = express();
const port= 5010;

app.use(cors());

app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


app.use('/productos', productoRoutes);
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send(`Prueba del servidor api para los datos del host ${port} `);
});

app.listen(port);