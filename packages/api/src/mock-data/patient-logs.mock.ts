/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN — MC-7.
 *
 * Registros del paciente (comidas, peso, notas).
 * Estos datos ilustran cómo nacen los registros como DATO REVISABLE / PENDIENTE.
 *
 * En MC-7 no se persisten — son solo para preview/simulación.
 * Se resolverá persistencia real en un microciclo posterior.
 *
 * Todos marcados como pendientes de revisión.
 * No representan datos clínicos reales.
 */

import type {
  PatientMealLog,
  PatientWeightLog,
  PatientNote,
  MealLogId,
  WeightLogId,
  PatientNoteId,
} from "@pulso/shared";

/**
 * Contador para generar IDs únicos en la sesión (demo).
 * En producción sería UUID o ID secuencial de DB.
 */
let mealLogCounter = 0;
let weightLogCounter = 0;
let noteCounter = 0;

export function generateMealLogId(): MealLogId {
  return `meal-log-demo-${++mealLogCounter}-${Date.now()}`;
}

export function generateWeightLogId(): WeightLogId {
  return `weight-log-demo-${++weightLogCounter}-${Date.now()}`;
}

export function generateNoteId(): PatientNoteId {
  return `note-demo-${++noteCounter}-${Date.now()}`;
}

/**
 * Ejemplos de registros de comida para demo.
 * Estos ilustran cómo el paciente carga comidas.
 *
 * En MC-7 no se persisten entre sesiones.
 */
export function createDemoMealLog(
  patientId: string,
  overrides?: Partial<PatientMealLog>,
): PatientMealLog {
  return {
    id: generateMealLogId(),
    patientId,
    date: new Date().toISOString().split("T")[0] ?? "",
    timeOfDay: "breakfast",
    foodDescription: "Café con tostadas integrales y mermelada",
    portion: "una taza de café, dos tostadas medianas",
    notes: "Desayuno normal, sin problemas",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Ejemplos de registros de peso para demo.
 */
export function createDemoWeightLog(
  patientId: string,
  overrides?: Partial<PatientWeightLog>,
): PatientWeightLog {
  return {
    id: generateWeightLogId(),
    patientId,
    date: new Date().toISOString().split("T")[0] ?? "",
    weight: 72.5,
    unit: "kg",
    notes: "Peso de la mañana, sin ropa, después de ir al baño",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Ejemplos de notas/preguntas para demo.
 */
export function createDemoNote(
  patientId: string,
  overrides?: Partial<PatientNote>,
): PatientNote {
  return {
    id: generateNoteId(),
    patientId,
    type: "question",
    subject: "Dudas sobre los horarios del plan",
    body: "Trabajo hasta tarde algunos días. ¿Puedo cambiar la hora del almuerzo?",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}
