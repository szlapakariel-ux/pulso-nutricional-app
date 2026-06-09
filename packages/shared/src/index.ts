/**
 * @pulso/shared — Tipos, contratos y utilidades compartidas.
 *
 * Fuente única de contratos entre las apps y la API.
 * Refleja la regla central: separación entre datos REVISABLES (paciente)
 * y datos VALIDADOS (profesional). Ver src/types/domain.ts.
 */

export { SHARED_PACKAGE_VERSION } from "./version.js";

// Tipos del dominio central (regla revisable/validado)
export type {
  DataOrigin,
  ReviewStatus,
  ReviewableData,
  ValidatedData,
} from "./types/domain.js";

// Tipos de la API
export type { HealthStatus, HealthResponse } from "./types/health.js";
export type { ApiErrorResponse } from "./types/api.js";
