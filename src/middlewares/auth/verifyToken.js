import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ResponseProvider } from "../../providers/ResponseProvider.js";

dotenv.config();

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;  
  
  // Validamos si la petición trae un token de autorización 
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ResponseProvider.error(
      res,
      "Acceso denegado. Token no proporcionado",
      401
    );
  }
  
  // Extraemos el token de la solicitud
  const token = authHeader.split(" ")[1];  
  
  if (!token) {
    return ResponseProvider.error(
      res,
      "Token inválido",
      401
    );
  } 
  
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);    
    // Aquí tendrás todos los datos que firmaste en el token
    req.user = decoded;
    // Pasamos a la siguiente función
    next();
  } catch (error) {  
    console.log(error);    
    return ResponseProvider.error(res, "Token inválido o expirado", 401);
  }
}

/**
 * Middleware opcional para verificar token - no bloquea si no hay token
 * Útil para rutas que pueden funcionar con o sin autenticación
 */
export function optionalToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // No hay token, pero continuamos sin bloquear
    req.user = null;
    return next();
  }
  
  const token = authHeader.split(" ")[1];
  
  if (!token) {
    req.user = null;
    return next();
  }
  
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Token inválido, pero no bloqueamos
    req.user = null;
    next();
  }
}
