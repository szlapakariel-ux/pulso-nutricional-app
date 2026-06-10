/**
 * Credenciales demo para login — MC-10.5C.
 *
 * DATOS FICTICIOS. No representan personas reales.
 * Los emails coinciden con los del seed de Prisma para coherencia
 * entre modos mock y prisma, pero las contraseñas son demo y solo
 * existen en memoria (el modelo User no tiene campo password).
 *
 * NO usar estas credenciales en producción.
 * NO agregar contraseñas reales aquí.
 */

import type { AuthRole } from "@pulso/shared";

export interface DemoCredential {
  id: string;       // userId del seed (IDS.profUserId / patient1UserId / etc.)
  email: string;
  password: string; // demo — solo en memoria, nunca en DB
  role: AuthRole;
  isDemoData: true;
}

export const DEMO_CREDENTIALS: ReadonlyArray<DemoCredential> = [
  {
    id: "d0000000-0000-0000-0000-000000000001",
    email: "profesional-demo@pulsonutricional.demo",
    password: "demo-profesional-2026",
    role: "professional",
    isDemoData: true,
  },
  {
    id: "d0000000-0000-0000-0000-000000000011",
    email: "paciente-demo-uno@pulsonutricional.demo",
    password: "demo-paciente-2026",
    role: "patient",
    isDemoData: true,
  },
  {
    id: "d0000000-0000-0000-0000-000000000012",
    email: "paciente-demo-dos@pulsonutricional.demo",
    password: "demo-paciente-2026",
    role: "patient",
    isDemoData: true,
  },
  {
    id: "d0000000-0000-0000-0000-000000000013",
    email: "paciente-demo-tres@pulsonutricional.demo",
    password: "demo-paciente-2026",
    role: "patient",
    isDemoData: true,
  },
];
