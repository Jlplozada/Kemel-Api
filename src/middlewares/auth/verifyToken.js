import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ResponseProvider } from "../../providers/ResponseProvider.js";

dotenv.config();

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;  
  
  console.log('=== DEBUG VERIFY TOKEN ===');
  console.log('Auth header:', authHeader);
  
  // Validamos si la petición trae un token de autorización 
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('No hay header de autorización válido');
    return ResponseProvider.error(
      res,
      "Acceso denegado. Token no proporcionado",
      401
    );
  }
  
  // Extraemos el token de la solicitud
  const token = authHeader.split(" ")[1];  
  console.log('Token extraído:', token);
  console.log('Token length:', token ? token.length : 0);
  
  if (!token) {
    console.log('Token vacío después de extraer');
    return ResponseProvider.error(
      res,
      "Token inválido",
      401
    );
  } 
  
  try {
    console.log('Intentando verificar token con REFRESH_TOKEN_SECRET');
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);    
    console.log('Token decodificado exitosamente:', decoded);
    // Aquí tendrás todos los datos que firmaste en el token
    req.user = decoded;
    // Pasamos a la siguiente función
    next();
  } catch (error) {  
    console.log('Error al verificar token:', error.message);
    console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'Definido' : 'No definido');
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
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    // Token inválido, pero no bloqueamos
    req.user = null;
    next();
  }
}
