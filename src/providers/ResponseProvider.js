export class ResponseProvider {
  /**
   * Envía una respuesta de éxito
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de éxito
   * @param {Object} data - Datos a enviar
   * @param {number} statusCode - Código de estado HTTP (por defecto 200)
   */
  static success(res, message, data = null, statusCode = 200) {
    const response = {
      success: true,
      message,
      ...(data && { data })
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Envía una respuesta de error
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error
   * @param {number} statusCode - Código de estado HTTP (por defecto 400)
   * @param {Object} errors - Errores específicos (opcional)
   */
  static error(res, message, statusCode = 400, errors = null) {
    const response = {
      success: false,
      message,
      ...(errors && { errors })
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Envía una respuesta de validación con errores específicos
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje general
   * @param {Object} validationErrors - Errores de validación
   */
  static validation(res, message, validationErrors) {
    return this.error(res, message, 422, validationErrors);
  }

  /**
   * Envía una respuesta de no autorizado
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error (por defecto "No autorizado")
   */
  static unauthorized(res, message = "No autorizado") {
    return this.error(res, message, 401);
  }

  /**
   * Envía una respuesta de prohibido
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error (por defecto "Acceso prohibido")
   */
  static forbidden(res, message = "Acceso prohibido") {
    return this.error(res, message, 403);
  }

  /**
   * Envía una respuesta de no encontrado
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error (por defecto "Recurso no encontrado")
   */
  static notFound(res, message = "Recurso no encontrado") {
    return this.error(res, message, 404);
  }

  /**
   * Envía una respuesta de error interno del servidor
   * @param {Object} res - Objeto de respuesta de Express
   * @param {string} message - Mensaje de error (por defecto "Error interno del servidor")
   */
  static serverError(res, message = "Error interno del servidor") {
    return this.error(res, message, 500);
  }
}
