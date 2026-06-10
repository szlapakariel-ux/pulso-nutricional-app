/**
 * Repositorio de planes alimentarios y agenda — MC-10.5B.
 *
 * Solo se llama cuando PULSO_DATA_SOURCE=prisma.
 * En modo mock estas funciones nunca se invocan.
 *
 * Mapeo de gaps entre schema y tipos compartidos:
 *   - PatientPlanAssignment.status: derivado de endDate (null → "active")
 *   - PatientPlanAssignment.assignedBy: tomado de mealPlan.professionalId
 *   - PatientPlanAssignment.assignedAt: createdAt del registro
 *   - PatientDailyAgenda: no existe como modelo; se construye agrupando
 *     PatientAgendaItem por patientId + date
 *   - PatientAgendaItem.linkedMealPlanItemId: no está en schema → undefined
 */

import type {
  PatientPlanAssignment,
  PatientDailyAgenda,
  MealPlanDetail,
  MealPlanItem,
  PatientAgendaItem,
  MealPlanStatus,
  AgendaItemType,
  DayMoment,
} from "@pulso/shared";
import { getPrismaClient } from "../lib/prisma.js";

function mapMealPlanStatus(s: string): MealPlanStatus {
  if (s === "draft" || s === "active" || s === "archived") return s;
  return "active";
}

function mapAgendaItemType(s: string): AgendaItemType {
  const valid: AgendaItemType[] = [
    "meal",
    "hydration",
    "medication",
    "activity",
    "reminder",
  ];
  return valid.includes(s as AgendaItemType) ? (s as AgendaItemType) : "reminder";
}

function mapDayMoment(s: string): DayMoment {
  const valid: DayMoment[] = [
    "morning",
    "breakfast",
    "mid_morning",
    "lunch",
    "afternoon",
    "snack",
    "dinner",
    "night",
  ];
  return valid.includes(s as DayMoment) ? (s as DayMoment) : "morning";
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export async function getPatientMealPlanFromDB(
  patientId: string,
): Promise<PatientPlanAssignment | null> {
  const prisma = getPrismaClient();

  const assignment = await prisma.patientPlanAssignment.findFirst({
    where: { patientId, endDate: null },
    include: {
      mealPlan: {
        include: {
          meals: { orderBy: { order: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!assignment) return null;

  const plan = assignment.mealPlan;

  const mealPlanDetail: MealPlanDetail = {
    id: plan.id,
    name: plan.name,
    status: mapMealPlanStatus(plan.status),
    professionalId: plan.professionalId,
    createdAt: plan.createdAt.toISOString(),
    description: plan.description ?? "",
    meals: plan.meals.map(
      (m): MealPlanItem => ({
        id: m.id,
        name: m.name,
        moment: mapDayMoment(m.moment),
        timeHint: m.timeHint,
        description: m.description ?? "",
        portionHint: m.portionHint ?? undefined,
        order: m.order,
      }),
    ),
    professionalNote: plan.professionalNote ?? "",
    generalIndications: plan.generalIndications ?? "",
    isDemoData: plan.isDemoData,
  };

  return {
    id: assignment.id,
    patientId: assignment.patientId,
    mealPlanId: assignment.mealPlanId,
    mealPlan: mealPlanDetail,
    assignedBy: plan.professionalId,
    startDate: assignment.startDate,
    endDate: assignment.endDate ?? undefined,
    status: assignment.endDate ? "inactive" : "active",
    assignedAt: assignment.createdAt.toISOString(),
    isDemoData: assignment.isDemoData,
  };
}

export async function getPatientDailyAgendaFromDB(
  patientId: string,
): Promise<PatientDailyAgenda | null> {
  const prisma = getPrismaClient();
  const date = todayISO();

  const items = await prisma.patientAgendaItem.findMany({
    where: { patientId, date },
    orderBy: { order: "asc" },
  });

  if (items.length === 0) return null;

  const agendaItems: PatientAgendaItem[] = items.map((item) => ({
    id: item.id,
    patientId: item.patientId,
    title: item.title,
    type: mapAgendaItemType(item.type),
    moment: mapDayMoment(item.moment),
    timeHint: item.timeHint,
    description: item.description ?? undefined,
    order: item.order,
    // linkedMealPlanItemId no está en el schema — campo opcional omitido
  }));

  return {
    id: `agenda-${patientId}-${date}`,
    patientId,
    date,
    items: agendaItems,
    // professionalNote nunca se expone; generatedFrom no está en el schema
    isDemoData: items[0]?.isDemoData ?? true,
  };
}
