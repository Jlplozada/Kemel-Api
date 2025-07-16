import express from "express";
import { loginUsuario } from "../middlewares/auth/login.js";

const router = express.Router();

router.post('/login', loginUsuario);

export default router;
