import { usuarios } from "../../models/usuarios.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ResponseProvider } from "../../providers/ResponseProvider.js";

dotenv.config();

export async function loginUsuario(req, res) {
  const { usuario, clave } = req.body;
  
  try {
    // Buscar el usuario por nombre de usuario o por email
    let user = await usuarios.findByUsername(usuario);
    
    // Si no se encuentra por username, intentar buscar por email
    if (!user) {
      user = await usuarios.findByEmail(usuario);
    }
    
    if (!user) {
      return ResponseProvider.unauthorized(
        res,
        "Credenciales incorrectas"
      );
    }

    // Verificar que el usuario no esté eliminado o inactivo
    if (user.estado === 'eliminado' || user.estado === 'inactivo') {
      console.log(`Intento de login con usuario ${user.estado}: ${usuario}`);
      return ResponseProvider.unauthorized(
        res,
        "Usuario no disponible. Contacte al administrador."
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

    // Generar un solo token (refresh token) con duración según .env
    const refreshToken = jwt.sign(
      { 
        id: user.id, 
        email: user.correo,
        nombre: user.nombre,
        rol: user.rol || 'cliente'
      }, 
      process.env.REFRESH_TOKEN_SECRET || "secreto_refresh", 
      { expiresIn: process.env.TOKEN_EXPIRATION || "10m" }
    );

    console.log('=== DEBUG LOGIN ===');
    console.log('Token generado:', refreshToken);
    console.log('REFRESH_TOKEN_SECRET:', process.env.REFRESH_TOKEN_SECRET ? 'Definido' : 'No definido');
    console.log('TOKEN_EXPIRATION:', process.env.TOKEN_EXPIRATION);

    // Guardar el refresh token en la base de datos
    await usuarios.updateRefreshToken(user.id, refreshToken);

    // Enviar respuesta exitosa con un solo token
    return ResponseProvider.success(
      res,
      "Login exitoso",
      {
        token: refreshToken, // Solo un token
        usuario: {
          id: user.id,
          nombre: user.nombre,
          correo: user.correo,
          telefono: user.telefono,
          direccion: user.direccion,
          ciudad: user.ciudad,
          rol: user.rol || 'cliente'
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
