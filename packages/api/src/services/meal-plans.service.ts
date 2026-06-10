import type {
  PatientPlanAssignment,
  PatientDailyAgenda,
} from "@pulso/shared";
import {
  MOCK_PLAN_ASSIGNMENTS,
  MOCK_DAILY_AGENDAS,
} from "../mock-data/meal-plans.mock.js";
import { isPrismaMode } from "../config/data-source.js";
import {
  getPatientMealPlanFromDB,
  getPatientDailyAgendaFromDB,
} from "../repositories/meal-plans.repository.js";

/**
 * Servicio de planes y agenda — MC-10.5B.
 *
 * Fuente de datos seleccionada por PULSO_DATA_SOURCE:
 *   mock   → datos ficticios en memoria (default)
 *   prisma → lectura desde Prisma/DB
 *
 * REGLA CENTRAL: Planes y agenda son DATO PROFESIONAL / VALIDADO.
 * No son ReviewableData. No necesitan bandeja de revisión.
 *
 * En modo prisma, si la DB no está disponible el error se propaga al caller.
 * No hay fallback silencioso a mock cuando el modo es explícitamente prisma.
 */

export async function getPatientMealPlan(
  patientId: string,
): Promise<PatientPlanAssignment | null> {
  if (isPrismaMode()) {
    return getPatientMealPlanFromDB(patientId);
  }
  return MOCK_PLAN_ASSIGNMENTS[patientId] ?? null;
}

export async function getPatientDailyAgenda(
  patientId: string,
): Promise<PatientDailyAgenda | null> {
  if (isPrismaMode()) {
    return getPatientDailyAgendaFromDB(patientId);
  }
  return MOCK_DAILY_AGENDAS[patientId] ?? null;
}
