import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { usuarios } from "../../models/usuarios.js";
import { ResponseProvider } from "../../providers/ResponseProvider.js";

dotenv.config();

/**
 * Middleware para refrescar el access token usando el refresh token
 */
export async function refreshToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return ResponseProvider.unauthorized(
      res,
      "Refresh token requerido"
    );
  }

  try {
    // Verificar el refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "secreto_refresh");
    
    // Buscar el usuario y verificar que el refresh token coincida
    const user = await usuarios.findByIdWithRefreshToken(decoded.id);
    
    if (!user || user.refresh_token !== refreshToken) {
      return ResponseProvider.unauthorized(
        res,
        "Refresh token inválido"
      );
    }

    // Generar nuevos tokens
    const newAccessToken = jwt.sign(
      { 
        id: user.id, 
        email: user.correo,
        nombre: user.nombre 
      }, 
      process.env.ACCESS_TOKEN_SECRET || "secreto_access", 
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      { 
        id: user.id, 
        email: user.correo 
      }, 
      process.env.REFRESH_TOKEN_SECRET || "secreto_refresh", 
      { expiresIn: "7d" }
    );

    // Actualizar el refresh token en la base de datos
    await usuarios.updateRefreshToken(user.id, newRefreshToken);

    return ResponseProvider.success(
      res,
      "Token renovado exitosamente",
      {
        token: newAccessToken,
        refreshToken: newRefreshToken
      }
    );

  } catch (error) {
    console.error('Error en refresh token:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return ResponseProvider.unauthorized(
        res,
        "Refresh token inválido o expirado"
      );
    }

    return ResponseProvider.serverError(
      res,
      "Error interno del servidor"
    );
  }
}

/**
 * Middleware para logout - invalida el refresh token
 */
export async function logout(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return ResponseProvider.error(
      res,
      "Refresh token requerido",
      400
    );
  }

  try {
    // Verificar el refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET || "secreto_refresh");
    
    // Invalidar el refresh token en la base de datos
    await usuarios.updateRefreshToken(decoded.id, null);

    return ResponseProvider.success(
      res,
      "Logout exitoso"
    );

  } catch (error) {
    console.error('Error en logout:', error);
    
    // Aunque el token sea inválido, consideramos el logout exitoso
    return ResponseProvider.success(
      res,
      "Logout exitoso"
    );
  }
}
