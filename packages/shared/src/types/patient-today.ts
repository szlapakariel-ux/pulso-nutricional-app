/**
 * Tipos de Mi Pulso para el paciente — pantalla "Hoy" (MC-6).
 *
 * REGLA CRÍTICA:
 *   - NUNCA incluir professionalNote.
 *   - NUNCA incluir notas internas del profesional.
 *   - Solo datos marcados como visibles al paciente.
 *
 * Estos tipos son proyecciones de MealPlanDetail / PatientDailyAgenda
 * que eliminan todos los campos de uso interno profesional.
 *
 * En MC-6 estos tipos describen datos mock/ficticios de demostración.
 */

import type { AgendaItemType, DayMoment } from "./meal-plan.js";

/**
 * Comida visible al paciente (proyección de MealPlanItem).
 * No contiene ninguna nota interna.
 */
export interface PatientVisibleMeal {
  id: string;
  name: string;
  moment: DayMoment;
  timeHint: string;
  description: string;
  portionHint?: string;
  order: number;
}

/**
 * Plan visible al paciente (proyección de MealPlanDetail).
 *
 * NUNCA incluye professionalNote.
 * Incluye generalIndications — visible al paciente por diseño de dominio.
 */
export interface PatientVisibleMealPlan {
  id: string;
  name: string;
  generalIndications: string;
  meals: ReadonlyArray<PatientVisibleMeal>;
}

/**
 * Ítem de agenda visible al paciente (proyección de PatientAgendaItem).
 *
 * NUNCA incluye professionalNote de la agenda.
 */
export interface PatientVisibleAgendaItem {
  id: string;
  title: string;
  type: AgendaItemType;
  moment: DayMoment;
  timeHint: string;
  description?: string;
  order: number;
}

/**
 * Vista "Hoy" completa del paciente.
 *
 * Respuesta del endpoint GET /patients/:patientId/today.
 * NUNCA incluye professionalNote ni ninguna nota interna.
 *
 * Plan y agenda son DATO PROFESIONAL / VALIDADO — los define la profesional.
 * El paciente los consume en modo solo lectura desde Mi Pulso.
 */
export interface PatientTodayView {
  patientId: string;
  date: string;
  plan: PatientVisibleMealPlan | null;
  agendaItems: ReadonlyArray<PatientVisibleAgendaItem>;
  isDemoData: boolean;
}
