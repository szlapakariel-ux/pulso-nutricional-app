/**
 * Tipos de autenticación y roles — MC-10.5C.
 *
 * ESTADO MC-10.5C:
 *   Auth desactivada por default (PULSO_AUTH_MODE=off).
 *   Login demo disponible solo con PULSO_AUTH_MODE=demo.
 *   Sin Railway, sin OAuth, sin SSO.
 *
 * Roles del sistema:
 *   PROFESSIONAL → nutricionista, gestiona pacientes, valida datos
 *   PATIENT      → paciente, registra su día a día
 */

/** Rol de usuario en el sistema. */
export type AuthRole = "professional" | "patient";

/** Usuario autenticado (representación mínima para el token y la sesión). */
export interface AuthUser {
  id: string;
  email: string;
  role: AuthRole;
  /** Solo presente cuando role === "patient". Expuesto por GET /auth/me. */
  patientId?: string;
}

/** Cuerpo del request de login. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Respuesta del endpoint POST /auth/login. */
export interface LoginResponse {
  token: string;
  user: AuthUser;
  isDemoData: boolean;
}

/**
 * Payload que se firma en el JWT y que se lee al verificar.
 * Extiende AuthUser con los campos estándar del JWT (iat, exp).
 */
export interface AuthSession extends AuthUser {
  iat?: number; // issued at (añadido por el JWT library)
  exp?: number; // expiration (añadido por el JWT library)
}
