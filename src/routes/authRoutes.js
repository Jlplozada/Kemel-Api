import express from "express";
import { loginUsuario } from "../middlewares/auth/login.js";
import { logout } from "../middlewares/auth/refreshToken.js";
import { validateLogin } from "../middlewares/auth/validateAuth.js";

const router = express.Router();

// Ruta para login con validación
router.post('/login', validateLogin, loginUsuario);

// Ruta para logout
router.post('/logout', logout);

export default router;
