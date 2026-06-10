/**
 * Tipos del dominio de planes alimentarios y agenda del paciente.
 *
 * REGLA CENTRAL:
 *   - Los planes y la agenda son DATO PROFESIONAL / VALIDADO.
 *   - Los crea y asigna la profesional.
 *   - NO son ReviewableData.
 *   - NO son meal_logs ni weight_logs (eso es lo que carga el paciente).
 *   - NO pasan por bandeja de revisión.
 *
 * Visibilidad:
 *   - MealPlanDetail (plan asignado): profesional ✅ · paciente ✅ (solo el suyo)
 *   - Indicaciones internas: profesional ✅ · paciente ❌
 *   - PatientDailyAgenda: profesional ✅ · paciente ✅ (la suya)
 *
 * En MC-5 estos tipos describen datos mock/ficticios de demostración.
 */

/** Identificador de plan alimentario (string opaco). */
export type MealPlanId = string;

/** Identificador de agenda template (string opaco). */
export type AgendaTemplateId = string;

/** Identificador de ítem de agenda (string opaco). */
export type AgendaItemId = string;

/** Estado de un plan alimentario. */
export type MealPlanStatus = "draft" | "active" | "archived";

/** Tipo de ítem de agenda. */
export type AgendaItemType =
  | "meal"
  | "hydration"
  | "medication"
  | "activity"
  | "reminder";

/** Momento del día para un ítem de agenda. */
export type DayMoment =
  | "morning"
  | "breakfast"
  | "mid_morning"
  | "lunch"
  | "afternoon"
  | "snack"
  | "dinner"
  | "night";

/**
 * Ítem individual dentro de un plan alimentario.
 * Representa una comida o colación del día.
 */
export interface MealPlanItem {
  id: string;
  name: string;
  moment: DayMoment;
  timeHint: string; // "08:00", "13:00", etc.
  description: string;
  portionHint?: string; // Orientación de porción (demo)
  order: number;
}

/**
 * Resumen de plan alimentario para listados.
 */
export interface MealPlanSummary {
  id: MealPlanId;
  name: string;
  status: MealPlanStatus;
  professionalId: string;
  createdAt: string;
}

/**
 * Detalle completo de un plan alimentario.
 *
 * DATO PROFESIONAL / VALIDADO.
 * El paciente verá este plan (en Mi Pulso, MC-6), pero sin la nota profesional.
 */
export interface MealPlanDetail extends MealPlanSummary {
  description: string;
  meals: ReadonlyArray<MealPlanItem>;
  professionalNote: string; // NUNCA visible al paciente
  generalIndications: string; // Visible al paciente en Mi Pulso
  isDemoData: boolean;
}

/**
 * Asignación de un plan a un paciente.
 *
 * DATO PROFESIONAL / VALIDADO.
 */
export interface PatientPlanAssignment {
  id: string;
  patientId: string;
  mealPlanId: MealPlanId;
  mealPlan: MealPlanDetail;
  assignedBy: string; // professionalId
  startDate: string;
  endDate?: string;
  status: "active" | "inactive" | "pending";
  assignedAt: string;
  isDemoData: boolean;
}

/**
 * Ítem concreto de la agenda del paciente.
 *
 * DATO PROFESIONAL / VALIDADO.
 * Lo define la profesional. El paciente lo verá en Mi Pulso (MC-6).
 */
export interface PatientAgendaItem {
  id: AgendaItemId;
  patientId: string;
  title: string;
  type: AgendaItemType;
  moment: DayMoment;
  timeHint: string;
  description?: string;
  order: number;
  linkedMealPlanItemId?: string;
}

/**
 * Agenda diaria concreta de un paciente para un día específico.
 *
 * DATO PROFESIONAL / VALIDADO.
 * Es lo que verá el paciente en su pantalla "Hoy" (Mi Pulso, MC-6).
 */
export interface PatientDailyAgenda {
  id: string;
  patientId: string;
  date: string; // ISO 8601 date
  items: ReadonlyArray<PatientAgendaItem>;
  generatedFrom?: string; // referencia a template
  professionalNote?: string; // NUNCA visible al paciente
  isDemoData: boolean;
}

/**
 * Nota de visibilidad: documenta qué partes del plan ve el paciente.
 */
export interface PlanVisibilityNote {
  visibleToPatient: ReadonlyArray<"meals" | "generalIndications" | "agenda">;
  professionalOnly: ReadonlyArray<"professionalNote">;
}
