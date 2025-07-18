import { ResponseProvider } from "../../providers/ResponseProvider.js";

/**
 * Middleware para verificar que el usuario tenga un rol específico
 * Debe usarse después del middleware verifyToken
 */
export function verificarRol(...rolesPermitidos) {
  return (req, res, next) => {
    // Verificar que el usuario esté autenticado (debe tener req.user del verifyToken)
    if (!req.user) {
      return ResponseProvider.unauthorized(
        res,
        "Usuario no autenticado"
      );
    }

    // Obtener el rol del usuario del token
    const rolUsuario = req.user.rol || 'cliente';

    // Verificar si el rol del usuario está en la lista de roles permitidos
    if (!rolesPermitidos.includes(rolUsuario)) {
      return ResponseProvider.forbidden(
        res,
        `Acceso denegado. Se requiere uno de estos roles: ${rolesPermitidos.join(', ')}`
      );
    }

    // Si el usuario tiene el rol correcto, continuar
    console.log(`Usuario ${req.user.nombre} con rol ${rolUsuario} accedió a ruta protegida`);
    next();
  };
}

/**
 * Middleware específico para verificar si es administrador
 */
export const soloAdministrador = verificarRol('administrador', 'admin');

/**
 * Middleware específico para verificar si es panadero
 */
export const soloPanadero = verificarRol('panadero');

/**
 * Middleware para verificar si es administrador o panadero
 */
export const adminOPanadero = verificarRol('administrador', 'admin', 'panadero');

/**
 * Middleware para cualquier usuario autenticado (no verifica rol específico)
 */
export const usuarioAutenticado = (req, res, next) => {
  if (!req.user) {
    return ResponseProvider.unauthorized(
      res,
      "Usuario no autenticado"
    );
  }
  next();
};
