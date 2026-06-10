/**
 * Controladores de auth — MC-10.5C.
 *
 * POST /auth/login    → login demo, devuelve JWT
 * GET  /auth/me       → devuelve usuario del token
 * GET  /auth/protected-demo → endpoint demo que requiere JWT
 *
 * Si PULSO_AUTH_MODE=off: login y protected-demo devuelven 501.
 * Si PULSO_AUTH_MODE=demo: login funciona con credenciales demo.
 */

import type { FastifyReply, FastifyRequest } from "fastify";
import type { LoginRequest, AuthSession } from "@pulso/shared";
import { isAuthEnabled } from "../config/auth.js";
import { verifyDemoCredentials } from "../services/auth.service.js";

const AUTH_MODE_OFF_ERROR = {
  error: {
    code: "AUTH_MODE_OFF",
    message:
      "Auth desactivada. Configurar PULSO_AUTH_MODE=demo para habilitar login.",
    statusCode: 501,
  },
};

/** POST /auth/login */
export async function loginController(
  request: FastifyRequest<{ Body: LoginRequest }>,
  reply: FastifyReply,
): Promise<void> {
  if (!isAuthEnabled()) {
    await reply.code(501).send(AUTH_MODE_OFF_ERROR);
    return;
  }

  const { email, password } = request.body;

  const result = verifyDemoCredentials(email, password);
  if (!result) {
    await reply.code(401).send({
      error: {
        code: "INVALID_CREDENTIALS",
        message: "Email o contraseña incorrectos.",
        statusCode: 401,
      },
    });
    return;
  }

  const token = await reply.jwtSign(result.user, { expiresIn: "24h" });

  await reply.code(200).send({
    data: {
      token,
      user: result.user,
      isDemoData: result.isDemoData,
    },
    meta: { demo: true },
  });
}

/** GET /auth/me — requiere JWT válido */
export async function meController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!isAuthEnabled()) {
    await reply.code(501).send(AUTH_MODE_OFF_ERROR);
    return;
  }

  try {
    await request.jwtVerify();
    const user = request.user as AuthSession;
    await reply.code(200).send({ data: user, meta: { demo: true } });
  } catch {
    await reply.code(401).send({
      error: {
        code: "INVALID_TOKEN",
        message: "Token JWT inválido o ausente.",
        statusCode: 401,
      },
    });
  }
}

/** GET /auth/protected-demo — endpoint demo que requiere JWT */
export async function protectedDemoController(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!isAuthEnabled()) {
    await reply.code(501).send(AUTH_MODE_OFF_ERROR);
    return;
  }

  try {
    await request.jwtVerify();
    const user = request.user as AuthSession;
    await reply.code(200).send({
      data: {
        message:
          "Este endpoint requiere autenticación JWT (demo). " +
          "Si llegaste aquí con un token válido, la auth básica funciona.",
        authenticatedAs: { id: user.id, role: user.role },
        isDemoData: true,
      },
      meta: { demo: true },
    });
  } catch {
    await reply.code(401).send({
      error: {
        code: "UNAUTHORIZED",
        message: "Token JWT inválido o ausente. Este endpoint requiere login.",
        statusCode: 401,
      },
    });
  }
}
