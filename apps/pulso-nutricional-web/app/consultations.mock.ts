import type { ConsultationDetail } from "@pulso/shared";

/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN — MC-4.
 *
 * Consultas para los pacientes demo. Los datos son idénticos a los de la API
 * porque todavía no hay conexión web ↔ API. La duplication se resolverá
 * cuando se conecten en un microciclo posterior.
 */
export const MOCK_CONSULTATIONS: Record<string, ReadonlyArray<ConsultationDetail>> = {
  "demo-1": [
    {
      id: "consult-demo-1-1",
      patientId: "demo-1",
      date: "2026-05-20",
      reason: "Seguimiento mensual",
      status: "completed",
      objective: "Evaluar avance de plan nutricional",
      observations:
        "Paciente reporta buen adherencia al plan. Cambios positivos en energía.",
      professionalNote: "Nota interna (demo): considerar ajuste de macros.",
      measurements: [
        {
          id: "meas-1",
          type: "weight",
          value: 72.5,
          unit: "kg",
          source: "professional",
          takenAt: "2026-05-20T10:30:00Z",
          notes: "Peso sin ropa, en ayunas",
        },
        {
          id: "meas-2",
          type: "height",
          value: 168,
          unit: "cm",
          source: "professional",
          takenAt: "2026-05-20T10:30:00Z",
        },
        {
          id: "meas-3",
          type: "waist_circumference",
          value: 82,
          unit: "cm",
          source: "professional",
          takenAt: "2026-05-20T10:30:00Z",
        },
      ],
      professionalId: "prof-demo-1",
      isDemoData: true,
      createdAt: "2026-05-20T10:35:00Z",
    },
  ],
  "demo-2": [
    {
      id: "consult-demo-2-1",
      patientId: "demo-2",
      date: "2026-05-28",
      reason: "Evaluación inicial",
      status: "completed",
      objective: "Establecer plan de mantenimiento",
      observations:
        "Paciente en buen estado de salud general. Solicita plan de mantenimiento.",
      professionalNote: "Nota interna (demo): enfoque en hábitos sostenibles.",
      measurements: [
        {
          id: "meas-4",
          type: "weight",
          value: 68.0,
          unit: "kg",
          source: "professional",
          takenAt: "2026-05-28T14:00:00Z",
          notes: "Peso sin ropa, en ayunas",
        },
        {
          id: "meas-5",
          type: "height",
          value: 165,
          unit: "cm",
          source: "professional",
          takenAt: "2026-05-28T14:00:00Z",
        },
      ],
      professionalId: "prof-demo-1",
      isDemoData: true,
      createdAt: "2026-05-28T14:05:00Z",
    },
  ],
  "demo-3": [],
};
