/** Tipos de respuesta genéricos de la API. */

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    statusCode: number;
  };
}
