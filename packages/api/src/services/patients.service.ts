import type { PatientDetail, PatientSummary } from "@pulso/shared";
import { MOCK_PATIENTS } from "../mock-data/patients.mock.js";
import { isPrismaMode } from "../config/data-source.js";
import {
  listPatientsFromDB,
  getPatientByIdFromDB,
} from "../repositories/patients.repository.js";

/**
 * Servicio de pacientes — MC-10.5B.
 *
 * Fuente de datos seleccionada por PULSO_DATA_SOURCE:
 *   mock   → datos ficticios en memoria (default)
 *   prisma → lectura desde Prisma/DB
 *
 * En modo prisma, si la DB no está disponible el error se propaga al caller.
 * No hay fallback silencioso a mock cuando el modo es explícitamente prisma.
 */

function toSummary(patient: PatientDetail): PatientSummary {
  return {
    id: patient.id,
    fullName: patient.fullName,
    age: patient.age,
    goal: patient.goal,
    lastControl: patient.lastControl,
    status: patient.status,
  };
}

export async function listPatients(): Promise<PatientSummary[]> {
  if (isPrismaMode()) {
    return listPatientsFromDB();
  }
  return MOCK_PATIENTS.map(toSummary);
}

export async function getPatientById(
  id: string,
): Promise<PatientDetail | null> {
  if (isPrismaMode()) {
    return getPatientByIdFromDB(id);
  }
  return MOCK_PATIENTS.find((p) => p.id === id) ?? null;
}
