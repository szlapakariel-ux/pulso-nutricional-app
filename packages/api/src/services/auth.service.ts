/**
 * Servicio de autenticación — MC-10.5C.
 *
 * Login demo: siempre usa credenciales en memoria (DEMO_CREDENTIALS).
 * El modelo User no tiene campo password, por lo que no hay consulta
 * a la DB para verificar credenciales. Ver ADR 0014.
 *
 * No hay hash de contraseñas: los passwords demo solo existen en memoria
 * para la fase demo, sin persistencia real.
 */

import type { AuthUser } from "@pulso/shared";
import { DEMO_CREDENTIALS } from "../mock-data/auth.mock.js";

export interface LoginResult {
  user: AuthUser;
  isDemoData: true;
}

/**
 * Intenta autenticar con email + password demo.
 * Devuelve el AuthUser si las credenciales coinciden, null si no.
 */
export function verifyDemoCredentials(
  email: string,
  password: string,
): LoginResult | null {
  const match = DEMO_CREDENTIALS.find(
    (c) => c.email === email && c.password === password,
  );
  if (!match) return null;

  return {
    user: { id: match.id, email: match.email, role: match.role },
    isDemoData: true,
  };
}
