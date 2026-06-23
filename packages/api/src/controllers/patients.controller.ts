import type { FastifyReply, FastifyRequest } from "fastify";
import { getPatientById, listPatients, createPatient } from "../services/patients.service.js";

/** GET /patients — lista de resúmenes. */
export async function listPatientsController(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const patients = await listPatients();
  await reply.code(200).send({ data: patients, meta: { demo: true } });
}

/** GET /patients/:id — ficha de un paciente. */
export async function getPatientController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const patient = await getPatientById(request.params.id);

  if (patient === null) {
    await reply.code(404).send({
      error: {
        code: "PATIENT_NOT_FOUND",
        message: `No existe paciente con id "${request.params.id}"`,
        statusCode: 404,
      },
    });
    return;
  }

  await reply.code(200).send({ data: patient, meta: { demo: true } });
}

/** POST /patients — registrar nuevo paciente (sin cuenta). */
export async function createPatientController(
  request: FastifyRequest<{ Body: { fullName: string; age?: number; goal?: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const draft = request.body;
  if (!draft.fullName?.trim()) {
    await reply.code(400).send({ error: { code: "INVALID_INPUT", message: "fullName es requerido", statusCode: 400 } });
    return;
  }
  const patient = await createPatient({ fullName: draft.fullName.trim(), age: draft.age, goal: draft.goal?.trim() || undefined });
  await reply.code(201).send({ data: patient });
}
