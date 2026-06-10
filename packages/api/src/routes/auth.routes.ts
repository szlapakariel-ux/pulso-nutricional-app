/**
 * Rutas de autenticación — MC-10.5C.
 *
 * POST /auth/login           → login demo
 * GET  /auth/me              → usuario del token
 * GET  /auth/protected-demo  → endpoint demo protegido
 *
 * Todos los endpoints devuelven 501 si PULSO_AUTH_MODE=off (default).
 * No hay protección masiva de endpoints existentes.
 */

import type { FastifyInstance } from "fastify";
import {
  loginController,
  meController,
  protectedDemoController,
} from "../controllers/auth.controller.js";

const loginBodySchema = {
  type: "object" as const,
  required: ["email", "password"],
  properties: {
    email: { type: "string" },
    password: { type: "string" },
  },
};

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post(
    "/auth/login",
    { schema: { body: loginBodySchema } },
    loginController,
  );

  app.get("/auth/me", meController);

  app.get("/auth/protected-demo", protectedDemoController);
}
