import type { PatientDetail } from "@pulso/shared";

/** Pacientes ficticios de demostración. No representan personas reales. */
export const DEMO_PATIENTS: ReadonlyArray<PatientDetail> = [
  {
    id: "demo-1",
    fullName: "Valentina Morales",
    age: 34,
    goal: "Reducir peso y mejorar hábitos alimentarios",
    lastControl: "2026-05-20",
    status: "active",
    professionalNote: "Buena adherencia al plan. Reforzar hidratación diaria y control de porciones en cena.",
    professionalId: "prof-demo-1",
    isDemoData: true,
  },
  {
    id: "demo-2",
    fullName: "Marcos Rodríguez",
    age: 41,
    goal: "Mantener peso y optimizar composición corporal",
    lastControl: "2026-05-28",
    status: "active",
    professionalNote: "Excelente evolución. Mantener actividad física consistente y aumentar proteína en almuerzo.",
    professionalId: "prof-demo-1",
    isDemoData: true,
  },
  {
    id: "demo-3",
    fullName: "Carolina Benzaquen",
    age: 27,
    goal: "Consulta inicial y evaluación nutricional",
    lastControl: null,
    status: "pending",
    professionalNote: "Primera consulta pendiente. Completar evaluación inicial antes de asignar plan.",
    professionalId: "prof-demo-1",
    isDemoData: true,
  },
];
