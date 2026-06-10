import type {
  PatientPlanAssignment,
  PatientDailyAgenda,
} from "@pulso/shared";
import {
  MOCK_PLAN_ASSIGNMENTS,
  MOCK_DAILY_AGENDAS,
} from "../mock-data/meal-plans.mock.js";

/**
 * Servicio de planes y agenda — MC-5.
 *
 * Read-only sobre datos mock ficticios. Sin base de datos, sin Prisma.
 *
 * REGLA CENTRAL: Planes y agenda son DATO PROFESIONAL / VALIDADO.
 * No son ReviewableData. No necesitan bandeja de revisión.
 */

/** Devuelve el plan asignado a un paciente, o null si no tiene. */
export function getPatientMealPlan(
  patientId: string,
): PatientPlanAssignment | null {
  return MOCK_PLAN_ASSIGNMENTS[patientId] ?? null;
}

/** Devuelve la agenda diaria de un paciente, o null si no tiene. */
export function getPatientDailyAgenda(
  patientId: string,
): PatientDailyAgenda | null {
  return MOCK_DAILY_AGENDAS[patientId] ?? null;
}
