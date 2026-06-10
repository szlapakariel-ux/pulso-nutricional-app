import type { FastifyReply, FastifyRequest } from "fastify";
import {
  getPatientMealPlan,
  getPatientDailyAgenda,
} from "../services/meal-plans.service.js";

/**
 * GET /patients/:patientId/meal-plan
 * Plan alimentario asignado a un paciente.
 */
export async function getPatientMealPlanController(
  request: FastifyRequest<{ Params: { patientId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const assignment = getPatientMealPlan(request.params.patientId);

  if (assignment === null) {
    await reply.code(404).send({
      error: {
        code: "MEAL_PLAN_NOT_FOUND",
        message: `No hay plan alimentario asignado al paciente "${request.params.patientId}"`,
        statusCode: 404,
      },
    });
    return;
  }

  await reply.code(200).send({ data: assignment, meta: { demo: true } });
}

/**
 * GET /patients/:patientId/agenda
 * Agenda diaria de un paciente (hoy demo).
 */
export async function getPatientAgendaController(
  request: FastifyRequest<{ Params: { patientId: string } }>,
  reply: FastifyReply,
): Promise<void> {
  const agenda = getPatientDailyAgenda(request.params.patientId);

  if (agenda === null) {
    await reply.code(404).send({
      error: {
        code: "AGENDA_NOT_FOUND",
        message: `No hay agenda asignada al paciente "${request.params.patientId}"`,
        statusCode: 404,
      },
    });
    return;
  }

  await reply.code(200).send({ data: agenda, meta: { demo: true } });
}
