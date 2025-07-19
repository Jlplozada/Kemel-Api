import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { usuarios } from "../../models/usuarios.js";
import { ResponseProvider } from "../../providers/ResponseProvider.js";

dotenv.config();

/**
 * Middleware para logout - elimina el token de la base de datos
 */
export async function logout(req, res) {
  const { token } = req.body;

  if (!token) {
    return ResponseProvider.unauthorized(
      res,
      "Token requerido para logout"
    );
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || "secreto_refresh");
    
    // Eliminar el token de la base de datos
    await usuarios.updateRefreshToken(decoded.id, null);

    return ResponseProvider.success(
      res,
      "Logout exitoso",
      {}
    );

  } catch (error) {
    console.error('Error en logout:', error);
    
    // Aunque el token sea inválido, consideramos el logout exitoso
    return ResponseProvider.success(
      res,
      "Logout exitoso",
      {}
    );
  }
}
