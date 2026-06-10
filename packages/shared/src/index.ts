/**
 * @pulso/shared — Tipos, contratos y utilidades compartidas.
 *
 * Fuente única de contratos entre las apps y la API.
 * Refleja la regla central: separación entre datos REVISABLES (paciente)
 * y datos VALIDADOS (profesional). Ver src/types/domain.ts.
 */

export { SHARED_PACKAGE_VERSION } from "./version.js";

// Tipos del dominio central (regla revisable/validado)
export type {
  DataOrigin,
  ReviewStatus,
  ReviewableData,
  ValidatedData,
} from "./types/domain.js";

// Tipos de la API
export type { HealthStatus, HealthResponse } from "./types/health.js";
export type { ApiErrorResponse } from "./types/api.js";

// Tipos de pacientes (MC-3 — datos mock)
export type {
  PatientId,
  ProfessionalId,
  PatientStatus,
  PatientSummary,
  PatientDetail,
  ProfessionalSummary,
  PatientVisibilityNote,
} from "./types/patient.js";

// Tipos del módulo de actividad física opcional (MC-10 — datos mock)
export type {
  ActivityType,
  ActivityIntensity,
  ActivityModuleStatus,
  ExercisePrescriptionId,
  ExerciseLogId,
  ExercisePrescription,
  ActivitySettings,
  PatientExerciseLog,
  PatientExerciseLogDraft,
  PatientExerciseLogReviewable,
} from "./types/activity.js";

// Tipos de PDF con datos profesionales/validados (MC-9 — datos mock)
export type {
  PdfDocumentType,
  PdfPreviewMetadata,
  PdfMealItem,
  PdfAgendaItem,
  PatientPlanPdfData,
} from "./types/pdf.js";

// Tipos de la bandeja de revisión profesional (MC-8 — datos mock)
export type {
  ReviewActionType,
  ReviewActionId,
  ReviewActionDraft,
  ReviewActionPreview,
  ReviewInboxItem,
  ReviewInboxResponse,
  ReviewInboxStats,
} from "./types/review-inbox.js";

// Tipos de registros del paciente (MC-7 — datos mock, revisables)
export type {
  MealLogId,
  WeightLogId,
  PatientNoteId,
  PatientMealLog,
  PatientWeightLog,
  PatientNote,
  PatientMealLogDraft,
  PatientWeightLogDraft,
  PatientNoteDraft,
  PatientMealLogReviewable,
  PatientWeightLogReviewable,
  PatientNoteReviewable,
  PatientReviewableEntry,
  PatientReviewableEntryType,
} from "./types/patient-logs.js";

// Tipos de Mi Pulso — vista del paciente (MC-6 — datos mock)
export type {
  PatientVisibleMeal,
  PatientVisibleMealPlan,
  PatientVisibleAgendaItem,
  PatientTodayView,
} from "./types/patient-today.js";

// Tipos de planes alimentarios y agenda profesional (MC-5 — datos mock)
export type {
  MealPlanId,
  AgendaTemplateId,
  AgendaItemId,
  MealPlanStatus,
  AgendaItemType,
  DayMoment,
  MealPlanItem,
  MealPlanSummary,
  MealPlanDetail,
  PatientPlanAssignment,
  PatientAgendaItem,
  PatientDailyAgenda,
  PlanVisibilityNote,
} from "./types/meal-plan.js";

// Tipos de consultas y mediciones profesionales (MC-4 — datos mock)
export type {
  ConsultationId,
  ConsultationStatus,
  ConsultationSummary,
  ConsultationDetail,
  NewConsultationDraft,
  ProfessionalMeasurement,
  MeasurementUnit,
  MeasurementSource,
  MeasurementType,
  ConsultationPreviewResponse,
} from "./types/consultation.js";
