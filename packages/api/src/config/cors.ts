/**
 * Configuración de CORS — MC-API-CORS-CODE.
 *
 * Habilita CORS mínimo y explícito para que la web profesional Railway
 * pueda llamar a la API desde el navegador. No usa wildcard.
 *
 * Orígenes permitidos:
 *   - CORS_ORIGIN              → un origen (el que ya existe en Railway).
 *   - PULSO_ALLOWED_ORIGINS    → lista separada por coma (opcional).
 *   - localhost de desarrollo  → 3000, 3001, 8080 (siempre incluidos).
 *
 * La auth actual usa Bearer token (no cookies), por eso credentials=false.
 *
 * REGLAS:
 *   - No wildcard "*".
 *   - Llamadas server-to-server (sin header Origin) no se rompen.
 *   - Si el Origin no está permitido, no se emiten headers CORS (el
 *     navegador bloquea), pero no se lanza error 500.
 */

/** Orígenes de desarrollo local, siempre permitidos. */
const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:8080",
];

/** Métodos HTTP permitidos para la web profesional (solo lectura + login). */
export const CORS_METHODS = ["GET", "POST", "OPTIONS"];

/** Headers permitidos: JSON + Bearer token. */
export const CORS_ALLOWED_HEADERS = ["Content-Type", "Authorization"];

/**
 * Construye la lista de orígenes permitidos a partir de las variables de
 * entorno más los orígenes de desarrollo local. Sin duplicados.
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>(DEV_ORIGINS);

  const corsOrigin = process.env["CORS_ORIGIN"]?.trim();
  if (corsOrigin) {
    origins.add(corsOrigin);
  }

  const allowedList = process.env["PULSO_ALLOWED_ORIGINS"];
  if (allowedList) {
    for (const raw of allowedList.split(",")) {
      const trimmed = raw.trim();
      if (trimmed) origins.add(trimmed);
    }
  }

  return [...origins];
}

/**
 * Validador de origin para @fastify/cors.
 *
 * - Sin header Origin (curl, smoke test, server-to-server) → permitido,
 *   no es una petición CORS de navegador.
 * - Origin en la lista permitida → permitido.
 * - Origin desconocido → rechazado sin error (no se emiten headers CORS).
 */
export function buildCorsOriginValidator(): (
  origin: string | undefined,
  callback: (err: Error | null, allow: boolean) => void,
) => void {
  const allowed = getAllowedOrigins();
  return (origin, callback) => {
    if (!origin) {
      callback(null, true);
      return;
    }
    callback(null, allowed.includes(origin));
  };
}
