import type { PatientDetail, PatientSummary } from "@pulso/shared";
import { MOCK_PATIENTS } from "../mock-data/patients.mock.js";

/**
 * Servicio de pacientes — MC-3.
 *
 * Read-only sobre datos mock ficticios. Sin base de datos, sin Prisma.
 * Provisional: existe solo para alimentar la primera pantalla del panel.
 */

/** Proyecta un PatientDetail a su resumen (sin datos profesionales internos). */
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

/** Devuelve la lista de pacientes como resúmenes (sin nota profesional). */
export function listPatients(): PatientSummary[] {
  return MOCK_PATIENTS.map(toSummary);
}

/** Devuelve la ficha (detalle) de un paciente, o null si no existe. */
export function getPatientById(id: string): PatientDetail | null {
  return MOCK_PATIENTS.find((p) => p.id === id) ?? null;
}
