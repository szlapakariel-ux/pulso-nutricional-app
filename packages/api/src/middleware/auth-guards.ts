/**
 * Guards de autenticación y rol — MC-10.5D.
 *
 * Solo activos cuando PULSO_AUTH_MODE=demo Y PULSO_AUTH_ENFORCEMENT=demo.
 * Con enforcement off, todas las funciones son no-op.
 *
 * requireProfessional → solo rol "professional"
 * requirePatientSelf  → "professional" accede a cualquier paciente;
 *                       "patient" solo accede a su propio patientId
 *
 * Mapping demo: userId del JWT → patientId del mock
 */

import type { FastifyRequest, FastifyReply } from "fastify";
import type { AuthSession } from "@pulso/shared";
import { isEnforcementActive } from "../config/enforcement.js";

// Demo mapping: userId (JWT) → patientId (mock / DB)
export const DEMO_USER_TO_PATIENT_ID: Record<string, string> = {
  "d0000000-0000-0000-0000-000000000011": "demo-1",
  "d0000000-0000-0000-0000-000000000012": "demo-2",
  "d0000000-0000-0000-0000-000000000013": "demo-3",
};

async function verifyAndGetUser(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<AuthSession | null> {
  try {
    await request.jwtVerify();
    return request.user as AuthSession;
  } catch {
    await reply.code(401).send({
      error: {
        code: "UNAUTHORIZED",
        message: "Token JWT requerido o inválido.",
        statusCode: 401,
      },
    });
    return null;
  }
}

/** Requiere rol "professional". Pacientes reciben 403. */
export async function requireProfessional(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!isEnforcementActive()) return;

  const user = await verifyAndGetUser(request, reply);
  if (!user) return;

  if (user.role !== "professional") {
    await reply.code(403).send({
      error: {
        code: "FORBIDDEN",
        message: "Se requiere rol profesional.",
        statusCode: 403,
      },
    });
  }
}

/**
 * Requiere que el usuario sea el propio paciente o un profesional.
 * Un paciente que intenta acceder a datos de otro paciente recibe 403.
 */
export async function requirePatientSelf(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  if (!isEnforcementActive()) return;

  const user = await verifyAndGetUser(request, reply);
  if (!user) return;

  if (user.role === "professional") return;

  const params = request.params as Record<string, string>;
  const requestedPatientId = params["patientId"];
  const userPatientId = DEMO_USER_TO_PATIENT_ID[user.id];

  if (
    !userPatientId ||
    !requestedPatientId ||
    userPatientId !== requestedPatientId
  ) {
    await reply.code(403).send({
      error: {
        code: "FORBIDDEN",
        message: "Solo podés acceder a tus propios datos como paciente.",
        statusCode: 403,
      },
    });
  }
}
