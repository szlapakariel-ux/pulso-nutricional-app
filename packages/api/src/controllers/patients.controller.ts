import type { FastifyReply, FastifyRequest } from "fastify";
import { getPatientById, listPatients } from "../services/patients.service.js";

/** GET /patients — lista de resúmenes (datos mock ficticios). */
export async function listPatientsController(
  _request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const patients = listPatients();
  await reply.code(200).send({ data: patients, meta: { demo: true } });
}

/** GET /patients/:id — ficha de un paciente (datos mock ficticios). */
export async function getPatientController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const patient = getPatientById(request.params.id);

  if (patient === null) {
    await reply.code(404).send({
      error: {
        code: "PATIENT_NOT_FOUND",
        message: `No existe paciente demo con id "${request.params.id}"`,
        statusCode: 404,
      },
    });
    return;
  }

  await reply.code(200).send({ data: patient, meta: { demo: true } });
}
