import type { ActivitySettings, ExercisePrescription } from "@pulso/shared";

/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN — MC-10.
 *
 * Mock local para la app profesional (pulso-nutricional-web).
 * Idéntico al mock de la API porque aún no hay conexión web ↔ API
 * (patrón establecido en MC-5, documentado en ADR 0011).
 *
 * Módulo OPCIONAL: solo activo para demo-1.
 * No son datos reales. No representan recomendaciones médicas.
 */

export const MOCK_ACTIVITY_SETTINGS: Record<string, ActivitySettings> = {
  "demo-1": {
    patientId: "demo-1",
    moduleStatus: "active",
    activatedAt: "2026-05-01",
    isDemoData: true,
  },
  "demo-2": {
    patientId: "demo-2",
    moduleStatus: "inactive",
    isDemoData: true,
  },
  "demo-3": {
    patientId: "demo-3",
    moduleStatus: "inactive",
    isDemoData: true,
  },
};

export const MOCK_EXERCISE_PRESCRIPTIONS: Record<
  string,
  ReadonlyArray<ExercisePrescription>
> = {
  "demo-1": [
    {
      id: "pres-act-demo-1-a",
      patientId: "demo-1",
      activityType: "walking",
      durationMinutes: 30,
      intensity: "low",
      frequency: "3 veces por semana",
      generalNotes:
        "Caminata liviana al aire libre. Preferentemente por la mañana. No se requiere equipamiento especial.",
      startDate: "2026-05-01",
      isDemoData: true,
    },
    {
      id: "pres-act-demo-1-b",
      patientId: "demo-1",
      activityType: "mobility",
      durationMinutes: 15,
      intensity: "low",
      frequency: "Todos los días",
      generalNotes:
        "Movilidad y elongación suave. Puede hacerse antes de dormir.",
      startDate: "2026-05-15",
      isDemoData: true,
    },
  ],
  "demo-2": [],
  "demo-3": [],
};
