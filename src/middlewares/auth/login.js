import { usuarios } from "../../models/usuarios.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ResponseProvider } from "../../providers/ResponseProvider.js";

dotenv.config();

export async function loginUsuario(req, res) {
  const { email, clave } = req.body;
  
  try {
    // Buscar el usuario por email
    const user = await usuarios.findByEmail(email);
    if (!user) {
      return ResponseProvider.unauthorized(
        res,
        "Credenciales incorrectas"
      );
    }

    // Verificar la contraseña
    const match = await bcrypt.compare(clave, user.clave);
    if (!match) {
      return ResponseProvider.unauthorized(
        res,
        "Credenciales incorrectas"
      );
    }

    // Generar tokens incluyendo el rol del usuario
    const accessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.correo,
        nombre: user.nombre,
        rol: user.rol || 'cliente' // Incluir el rol en el token
      }, 
      process.env.ACCESS_TOKEN_SECRET || "secreto_access", 
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { 
        id: user.id, 
        email: user.correo, 
        rol: user.rol || 'cliente' // Incluir el rol en el refresh token también
      }, 
      process.env.REFRESH_TOKEN_SECRET || "secreto_refresh", 
      { expiresIn: "7d" }
    );

    // Guardar el refresh token en la base de datos
    await usuarios.updateRefreshToken(user.id, refreshToken);

    // Enviar respuesta exitosa incluyendo el rol
    return ResponseProvider.success(
      res,
      "Login exitoso",
      {
        token: accessToken,
        refreshToken: refreshToken,
        usuario: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          telefono: user.telefono,
          direccion: user.direccion,
          ciudad: user.ciudad,
          rol: user.rol || 'cliente' // Incluir el rol en la respuesta
        }
      }
    );

  } catch (error) {
    console.error('Error en login:', error);
    return ResponseProvider.serverError(
      res,
      "Error interno del servidor"
    );
  }
}
