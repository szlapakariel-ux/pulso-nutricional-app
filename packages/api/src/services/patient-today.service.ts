import type { PatientTodayView } from "@pulso/shared";
import { MOCK_PLAN_ASSIGNMENTS, MOCK_DAILY_AGENDAS } from "../mock-data/meal-plans.mock.js";

/**
 * Servicio para la vista "Hoy" del paciente — MC-6.
 *
 * REGLA CRÍTICA: nunca incluir professionalNote en la respuesta.
 * Solo proyectar campos visibles al paciente.
 */

export function getPatientTodayView(
  patientId: string,
  date: string,
): PatientTodayView | null {
  // Verificar que el paciente exista en el sistema de planes conocidos
  if (!(patientId in MOCK_PLAN_ASSIGNMENTS)) {
    return null;
  }

  const assignment = MOCK_PLAN_ASSIGNMENTS[patientId] ?? null;
  const agenda = MOCK_DAILY_AGENDAS[patientId] ?? null;

  return {
    patientId,
    date,
    plan: assignment
      ? {
          id: assignment.mealPlan.id,
          name: assignment.mealPlan.name,
          // professionalNote explícitamente EXCLUIDO — nunca sale de aquí
          generalIndications: assignment.mealPlan.generalIndications,
          meals: assignment.mealPlan.meals.map((m) => ({
            id: m.id,
            name: m.name,
            moment: m.moment,
            timeHint: m.timeHint,
            description: m.description,
            portionHint: m.portionHint,
            order: m.order,
          })),
        }
      : null,
    agendaItems: agenda
      ? agenda.items.map((item) => ({
          id: item.id,
          title: item.title,
          type: item.type,
          moment: item.moment,
          timeHint: item.timeHint,
          description: item.description,
          order: item.order,
          // professionalNote de la agenda explícitamente EXCLUIDO
        }))
      : [],
    isDemoData: true,
  };
}
