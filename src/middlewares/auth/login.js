import { usuarios } from "../../models/usuarios.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function loginUsuario(req, res) {
  const { email, clave } = req.body;
  if (!email || !clave) {
    return res.status(400).json({ error: "Email y clave requeridos" });
  }
  try {
    const user = await usuarios.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Usuario o clave incorrectos" });
    }
    const match = await bcrypt.compare(clave, user.clave);
    if (!match) {
      return res.status(401).json({ error: "Usuario o clave incorrectos" });
    }
    const token = jwt.sign({ id: user.id, email: user.correo }, process.env.JWT_SECRET || "secreto", { expiresIn: "1d" });
    return res.status(200).json({ token, usuario: { id: user.id, nombre: user.nombre, correo: user.correo } });
  } catch (error) {
    return res.status(500).json({ error: "Error en el login" });
  }
}
