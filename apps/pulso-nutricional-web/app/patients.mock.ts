import type { PatientDetail } from "@pulso/shared";

/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN — MC-3.
 *
 * No son reales. No representan a ninguna persona. Sin base de datos ni API:
 * en MC-3 la pantalla se alimenta de este arreglo local. La conexión real con
 * la API queda para un microciclo posterior.
 */
export const DEMO_PATIENTS: ReadonlyArray<PatientDetail> = [
  {
    id: "demo-1",
    fullName: "Paciente Demo Uno",
    age: 34,
    goal: "Objetivo ficticio: mejorar hábitos",
    lastControl: "2026-05-20",
    status: "active",
    professionalNote: "Observación profesional ficticia (demo). No es un dato real.",
    professionalId: "prof-demo-1",
    isDemoData: true,
  },
  {
    id: "demo-2",
    fullName: "Paciente Demo Dos",
    age: 41,
    goal: "Objetivo ficticio: plan de mantenimiento",
    lastControl: "2026-05-28",
    status: "active",
    professionalNote: "Observación profesional ficticia (demo). No es un dato real.",
    professionalId: "prof-demo-1",
    isDemoData: true,
  },
  {
    id: "demo-3",
    fullName: "Paciente Demo Tres",
    age: 27,
    goal: "Objetivo ficticio: seguimiento inicial",
    lastControl: null,
    status: "pending",
    professionalNote: "Observación profesional ficticia (demo). No es un dato real.",
    professionalId: "prof-demo-1",
    isDemoData: true,
  },
];
