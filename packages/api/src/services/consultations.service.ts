import type {
  ConsultationDetail,
  ConsultationSummary,
  NewConsultationDraft,
} from "@pulso/shared";
import { MOCK_CONSULTATIONS } from "../mock-data/consultations.mock.js";

/**
 * Servicio de consultas — MC-4.
 *
 * Read-only + preview sobre datos mock ficticios. Sin base de datos, sin Prisma.
 * Provisional: existe solo para alimentar la primera experiencia de consultas
 * en el panel profesional.
 *
 * REGLA CENTRAL: Las consultas y mediciones son DATO PROFESIONAL/VALIDADO.
 * No son ReviewableData. No necesitan bandeja de revisión.
 */

/** Proyecta un ConsultationDetail a su resumen. */
function toSummary(consultation: ConsultationDetail): ConsultationSummary {
  return {
    id: consultation.id,
    patientId: consultation.patientId,
    date: consultation.date,
    reason: consultation.reason,
    status: consultation.status,
    createdAt: consultation.createdAt,
  };
}

/** Devuelve la lista de consultas de un paciente como resúmenes. */
export function listConsultationsByPatient(
  patientId: string,
): ConsultationSummary[] {
  const consultations = MOCK_CONSULTATIONS[patientId] ?? [];
  return consultations.map(toSummary);
}

/** Devuelve el detalle de una consulta, o null si no existe. */
export function getConsultationById(
  patientId: string,
  consultationId: string,
): ConsultationDetail | null {
  const consultations = MOCK_CONSULTATIONS[patientId] ?? [];
  return consultations.find((c) => c.id === consultationId) ?? null;
}

/**
 * Preview de una nueva consulta (simulación sin persistencia).
 *
 * En MC-4 esto es pura simulación: toma el draft, crea una ID fake,
 * y devuelve lo que sería el resultado. No guarda nada.
 */
export function previewNewConsultation(
  patientId: string,
  draft: NewConsultationDraft,
): ConsultationDetail {
  const fakeId = `consult-demo-${Date.now()}`;

  return {
    id: fakeId,
    patientId,
    date: draft.date,
    reason: draft.reason,
    status: "draft",
    objective: draft.objective,
    observations: draft.observations,
    professionalNote: draft.professionalNote,
    measurements: draft.measurements.map((m, i) => ({
      id: `meas-demo-${Date.now()}-${i}`,
      type: m.type,
      value: m.value,
      unit: m.unit,
      source: "professional" as const,
      takenAt: new Date().toISOString(),
      notes: m.notes,
    })),
    professionalId: "prof-demo-1",
    isDemoData: true,
    createdAt: new Date().toISOString(),
  };
}
