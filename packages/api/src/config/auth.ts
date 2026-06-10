/**
 * Configuración de autenticación — MC-10.5C.
 *
 * Variable de entorno: PULSO_AUTH_MODE
 *   "off"  → default. No requiere JWT. Endpoints sin protección.
 *   "demo" → habilita login demo + emisión de JWT.
 *
 * REGLAS:
 *   - Si PULSO_AUTH_MODE no existe → off
 *   - En modo off, JWT_SECRET no se requiere
 *   - En modo demo, JWT_SECRET del env o fallback de desarrollo
 *   - No Railway, no OAuth, no SSO, no credenciales reales
 */

import type { AuthSession } from "@pulso/shared";

// Augmenta los tipos de @fastify/jwt con el payload del sistema
declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: AuthSession;
    user: AuthSession;
  }
}

export type AuthMode = "off" | "demo";

export function getAuthMode(): AuthMode {
  const v = process.env["PULSO_AUTH_MODE"];
  if (v === "demo") return "demo";
  return "off";
}

export function isAuthEnabled(): boolean {
  return getAuthMode() === "demo";
}

/**
 * Devuelve el secreto JWT a usar.
 *
 * En modo off: placeholder — nunca se usa en verificación real.
 * En modo demo: JWT_SECRET del env, o fallback de desarrollo si NODE_ENV !== production.
 * En producción con modo demo sin JWT_SECRET → error explícito.
 */
export function resolveJwtSecret(): string {
  if (getAuthMode() === "off") {
    return "pulso-auth-mode-off-placeholder-not-used-for-real-verification";
  }
  const envSecret = process.env["JWT_SECRET"];
  if (envSecret) return envSecret;
  if (process.env["NODE_ENV"] !== "production") {
    return "pulso-demo-dev-secret-change-before-any-production-use";
  }
  throw new Error(
    "[auth] JWT_SECRET debe estar definido cuando PULSO_AUTH_MODE=demo en producción.",
  );
}
