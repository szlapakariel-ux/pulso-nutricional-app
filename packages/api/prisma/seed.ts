/**
 * Seed de demostración — Pulso Nutricional MC-10.5A.
 *
 * DATOS FICTICIOS. No representan personas, pacientes ni datos clínicos reales.
 * Solo sirven para desarrollo local y demos.
 *
 * Ejecutar: pnpm --filter @pulso/api db:seed
 * Requiere: DATABASE_URL configurado en .env (NO usar Railway en MC-10.5A).
 *
 * Idempotente: usa upsert con IDs fijos para que pueda ejecutarse múltiples veces.
 */

import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const prismaClientPackageJsonPath = require.resolve("@prisma/client/package.json");
const generatedPrismaClientPath = path.join(
  path.dirname(prismaClientPackageJsonPath),
  "..",
  "..",
  ".prisma",
  "client",
  "index.js",
);
const pkg = require(generatedPrismaClientPath);

const {
  PrismaClient,
  UserRole,
  PatientStatus,
  ConsultationStatus,
  MealPlanStatus,
  MeasurementType,
  MeasurementUnit,
  AgendaItemType,
  DayMoment,
  ActivityType,
  ActivityIntensity,
  ActivityModuleStatus,
  NoteType,
  DataOrigin,
  ReviewStatus,
  MealPhotoType,
} = pkg;

const prisma = new PrismaClient();

// IDs estables para seed idempotente
// Formato UUID válido, prefijados para identificarlos como demo
const IDS = {
  // Usuarios
  profUserId:    "d0000000-0000-0000-0000-000000000001",
  patient1UserId: "d0000000-0000-0000-0000-000000000011",
  patient2UserId: "d0000000-0000-0000-0000-000000000012",
  patient3UserId: "d0000000-0000-0000-0000-000000000013",

  // Entidades de negocio
  profId:    "d0000000-0000-0001-0000-000000000001",
  patient1Id: "d0000000-0000-0001-0000-000000000011",
  patient2Id: "d0000000-0000-0001-0000-000000000012",
  patient3Id: "d0000000-0000-0001-0000-000000000013",

  // Links
  link1Id: "d0000000-0000-0002-0000-000000000001",
  link2Id: "d0000000-0000-0002-0000-000000000002",
  link3Id: "d0000000-0000-0002-0000-000000000003",

  // Consultas
  consult1Id: "d0000000-0000-0003-0000-000000000001",

  // Mediciones
  meas1Id: "d0000000-0000-0004-0000-000000000001",
  meas2Id: "d0000000-0000-0004-0000-000000000002",

  // Plan alimentario
  plan1Id: "d0000000-0000-0005-0000-000000000001",
  plan2Id: "d0000000-0000-0005-0000-000000000002",

  // Items del plan
  mealItem1Id: "d0000000-0000-0006-0000-000000000001",
  mealItem2Id: "d0000000-0000-0006-0000-000000000002",
  mealItem3Id: "d0000000-0000-0006-0000-000000000003",
  mealItem4Id: "d0000000-0000-0006-0000-000000000004",
  mealItem5Id: "d0000000-0000-0006-0000-000000000005",
  mealItem6Id: "d0000000-0000-0006-0000-000000000006",

  // Asignaciones
  assign1Id: "d0000000-0000-0007-0000-000000000001",
  assign2Id: "d0000000-0000-0007-0000-000000000002",

  // Agenda
  agenda1Id: "d0000000-0000-0008-0000-000000000001",
  agenda2Id: "d0000000-0000-0008-0000-000000000002",
  agenda3Id: "d0000000-0000-0008-0000-000000000003",
  agenda4Id: "d0000000-0000-0008-0000-000000000004",

  // Actividad
  actSettings1Id: "d0000000-0000-0009-0000-000000000001",
  actSettings2Id: "d0000000-0000-0009-0000-000000000002",
  actSettings3Id: "d0000000-0000-0009-0000-000000000003",
  prescription1Id: "d0000000-0000-0009-0000-000000000011",
  prescription2Id: "d0000000-0000-0009-0000-000000000012",

  // Registros revisables
  mealLog1Id: "d0000000-0000-000a-0000-000000000001",
  mealLog2Id: "d0000000-0000-000a-0000-000000000002",
  mealPhoto1Id: "d0000000-0000-000e-0000-000000000001",
  weightLog1Id: "d0000000-0000-000b-0000-000000000001",
  note1Id:    "d0000000-0000-000c-0000-000000000001",
  exerciseLog1Id: "d0000000-0000-000d-0000-000000000001",
};

const DEMO_DATE = "2026-05-20";
const TODAY = "2026-06-10";

async function main() {
  console.log("🌱 Iniciando seed demo — Pulso Nutricional MC-10.5A");
  console.log("   Datos ficticios. No representan datos clínicos reales.\n");

  // ─── 1. Usuarios ────────────────────────────────────────────────────────
  console.log("→ Usuarios...");

  const profUser = await prisma.user.upsert({
    where: { id: IDS.profUserId },
    update: {},
    create: {
      id: IDS.profUserId,
      email: "profesional-demo@pulsonutricional.demo",
      role: UserRole.professional,
    },
  });

  const patient1User = await prisma.user.upsert({
    where: { id: IDS.patient1UserId },
    update: {},
    create: {
      id: IDS.patient1UserId,
      email: "paciente-demo-uno@pulsonutricional.demo",
      role: UserRole.patient,
    },
  });

  const patient2User = await prisma.user.upsert({
    where: { id: IDS.patient2UserId },
    update: {},
    create: {
      id: IDS.patient2UserId,
      email: "paciente-demo-dos@pulsonutricional.demo",
      role: UserRole.patient,
    },
  });

  const patient3User = await prisma.user.upsert({
    where: { id: IDS.patient3UserId },
    update: {},
    create: {
      id: IDS.patient3UserId,
      email: "paciente-demo-tres@pulsonutricional.demo",
      role: UserRole.patient,
    },
  });

  // ─── 2. Profesional ────────────────────────────────────────────────────
  console.log("→ Profesional...");

  await prisma.professional.upsert({
    where: { id: IDS.profId },
    update: {},
    create: {
      id: IDS.profId,
      userId: profUser.id,
      fullName: "Profesional Demo",
      specialty: "Nutrición (demo)",
      isDemoData: true,
    },
  });

  // ─── 3. Pacientes ───────────────────────────────────────────────────────
  console.log("→ Pacientes...");

  await prisma.patient.upsert({
    where: { id: IDS.patient1Id },
    update: {},
    create: {
      id: IDS.patient1Id,
      userId: patient1User.id,
      fullName: "Paciente Demo Uno",
      age: 34,
      goal: "Objetivo ficticio: mejorar hábitos",
      lastControl: DEMO_DATE,
      status: PatientStatus.active,
      professionalNote: "Observación profesional ficticia (demo). No es un dato real.",
      isDemoData: true,
    },
  });

  await prisma.patient.upsert({
    where: { id: IDS.patient2Id },
    update: {},
    create: {
      id: IDS.patient2Id,
      userId: patient2User.id,
      fullName: "Paciente Demo Dos",
      age: 41,
      goal: "Objetivo ficticio: plan de mantenimiento",
      lastControl: "2026-05-28",
      status: PatientStatus.active,
      professionalNote: "Observación profesional ficticia (demo). No es un dato real.",
      isDemoData: true,
    },
  });

  await prisma.patient.upsert({
    where: { id: IDS.patient3Id },
    update: {},
    create: {
      id: IDS.patient3Id,
      userId: patient3User.id,
      fullName: "Paciente Demo Tres",
      age: 27,
      goal: "Objetivo ficticio: seguimiento inicial",
      lastControl: null,
      status: PatientStatus.pending,
      professionalNote: "Observación profesional ficticia (demo). No es un dato real.",
      isDemoData: true,
    },
  });

  // ─── 4. Links profesional ↔ paciente ────────────────────────────────────
  console.log("→ Links profesional ↔ paciente...");

  for (const [linkId, patientId] of [
    [IDS.link1Id, IDS.patient1Id],
    [IDS.link2Id, IDS.patient2Id],
    [IDS.link3Id, IDS.patient3Id],
  ] as const) {
    await prisma.professionalPatientLink.upsert({
      where: {
        professionalId_patientId: {
          professionalId: IDS.profId,
          patientId,
        },
      },
      update: {},
      create: {
        id: linkId,
        professionalId: IDS.profId,
        patientId,
      },
    });
  }

  // ─── 5. Consulta y mediciones (paciente 1) ───────────────────────────────
  console.log("→ Consulta y mediciones...");

  await prisma.consultation.upsert({
    where: { id: IDS.consult1Id },
    update: {},
    create: {
      id: IDS.consult1Id,
      patientId: IDS.patient1Id,
      professionalId: IDS.profId,
      date: DEMO_DATE,
      status: ConsultationStatus.completed,
      objective: "Objetivo ficticio: inicio de seguimiento. No es real.",
      observations: "Observaciones ficticias de demo. No son datos clínicos reales.",
      professionalNote: "Nota interna de demo (nunca visible al paciente).",
      isDemoData: true,
    },
  });

  await prisma.measurement.upsert({
    where: { id: IDS.meas1Id },
    update: {},
    create: {
      id: IDS.meas1Id,
      consultationId: IDS.consult1Id,
      type: MeasurementType.weight,
      value: 72.5,
      unit: MeasurementUnit.kg,
      source: "professional",
      takenAt: `${DEMO_DATE}T10:00:00Z`,
      isDemoData: true,
    },
  });

  await prisma.measurement.upsert({
    where: { id: IDS.meas2Id },
    update: {},
    create: {
      id: IDS.meas2Id,
      consultationId: IDS.consult1Id,
      type: MeasurementType.height,
      value: 168,
      unit: MeasurementUnit.cm,
      source: "professional",
      takenAt: `${DEMO_DATE}T10:00:00Z`,
      isDemoData: true,
    },
  });

  // ─── 6. Planes alimentarios ──────────────────────────────────────────────
  console.log("→ Plan alimentario...");

  await prisma.mealPlan.upsert({
    where: { id: IDS.plan1Id },
    update: {},
    create: {
      id: IDS.plan1Id,
      professionalId: IDS.profId,
      name: "Plan Demo — Hábitos Saludables",
      description: "Plan de demostración orientado a mejorar hábitos generales. No representa una prescripción real.",
      generalIndications: "Tomá agua durante el día. Priorizá alimentos frescos. Registrá tus comidas en Mi Pulso para hacer el seguimiento.",
      professionalNote: "Nota interna (demo): ajustar porciones según evolución. No es dato real.",
      status: MealPlanStatus.active,
      isDemoData: true,
    },
  });

  await prisma.mealPlan.upsert({
    where: { id: IDS.plan2Id },
    update: {},
    create: {
      id: IDS.plan2Id,
      professionalId: IDS.profId,
      name: "Plan Demo — Mantenimiento",
      description: "Plan de demostración orientado al mantenimiento de peso. No representa una prescripción real.",
      generalIndications: "Mantenés un buen equilibrio. Seguí registrando en Mi Pulso. Hidratate bien durante el día.",
      professionalNote: "Nota interna (demo): enfoque en sostenibilidad. No es dato real.",
      status: MealPlanStatus.active,
      isDemoData: true,
    },
  });

  // Items del plan 1
  const plan1Items = [
    { id: IDS.mealItem1Id, name: "Desayuno demo", moment: DayMoment.breakfast, timeHint: "08:00", description: "Infusión, tostadas integrales, fruta de estación.", portionHint: "Porción orientativa (demo).", order: 1 },
    { id: IDS.mealItem2Id, name: "Almuerzo demo", moment: DayMoment.lunch, timeHint: "13:00", description: "Plato principal con proteína, vegetales y cereales integrales.", portionHint: "Porción orientativa (demo).", order: 2 },
    { id: IDS.mealItem3Id, name: "Merienda demo", moment: DayMoment.snack, timeHint: "17:00", description: "Fruta, yogur o colación liviana.", portionHint: "Porción orientativa (demo).", order: 3 },
    { id: IDS.mealItem4Id, name: "Cena demo", moment: DayMoment.dinner, timeHint: "20:30", description: "Cena liviana: sopa, ensalada o guiso suave.", portionHint: "Porción orientativa (demo).", order: 4 },
  ];

  for (const item of plan1Items) {
    await prisma.mealPlanItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, mealPlanId: IDS.plan1Id, isDemoData: true },
    });
  }

  // Items del plan 2
  const plan2Items = [
    { id: IDS.mealItem5Id, name: "Desayuno demo", moment: DayMoment.breakfast, timeHint: "07:30", description: "Mate o café, tostadas con palta o queso untable.", portionHint: "Porción orientativa (demo).", order: 1 },
    { id: IDS.mealItem6Id, name: "Colación mañana demo", moment: DayMoment.mid_morning, timeHint: "10:30", description: "Fruta o barritas de cereal.", portionHint: "Porción orientativa (demo).", order: 2 },
  ];

  for (const item of plan2Items) {
    await prisma.mealPlanItem.upsert({
      where: { id: item.id },
      update: {},
      create: { ...item, mealPlanId: IDS.plan2Id, isDemoData: true },
    });
  }

  // ─── 7. Asignaciones de plan ─────────────────────────────────────────────
  console.log("→ Asignaciones de plan...");

  await prisma.patientPlanAssignment.upsert({
    where: { id: IDS.assign1Id },
    update: {},
    create: {
      id: IDS.assign1Id,
      patientId: IDS.patient1Id,
      mealPlanId: IDS.plan1Id,
      startDate: DEMO_DATE,
      isDemoData: true,
    },
  });

  await prisma.patientPlanAssignment.upsert({
    where: { id: IDS.assign2Id },
    update: {},
    create: {
      id: IDS.assign2Id,
      patientId: IDS.patient2Id,
      mealPlanId: IDS.plan2Id,
      startDate: "2026-05-28",
      isDemoData: true,
    },
  });

  // ─── 8. Agenda del día (paciente 1) ─────────────────────────────────────
  console.log("→ Agenda del día...");

  const agendaItems = [
    { id: IDS.agenda1Id, title: "Desayuno", type: AgendaItemType.meal, moment: DayMoment.breakfast, timeHint: "08:00", description: "Infusión, tostadas integrales, fruta.", order: 1 },
    { id: IDS.agenda2Id, title: "Hidratación mañana", type: AgendaItemType.hydration, moment: DayMoment.mid_morning, timeHint: "10:00", description: "2 vasos de agua.", order: 2 },
    { id: IDS.agenda3Id, title: "Almuerzo", type: AgendaItemType.meal, moment: DayMoment.lunch, timeHint: "13:00", description: "Plato principal demo.", order: 3 },
    { id: IDS.agenda4Id, title: "Recordatorio cena", type: AgendaItemType.reminder, moment: DayMoment.dinner, timeHint: "20:00", description: "Cena liviana.", order: 4 },
  ];

  for (const item of agendaItems) {
    await prisma.patientAgendaItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        ...item,
        patientId: IDS.patient1Id,
        date: TODAY,
        professionalNote: "Nota interna de agenda (demo, nunca visible al paciente).",
        isDemoData: true,
      },
    });
  }

  // ─── 9. Módulo de actividad física ──────────────────────────────────────
  console.log("→ Configuración de actividad física...");

  // demo-1: activo
  await prisma.activitySettings.upsert({
    where: { id: IDS.actSettings1Id },
    update: {},
    create: {
      id: IDS.actSettings1Id,
      patientId: IDS.patient1Id,
      moduleStatus: ActivityModuleStatus.active,
      activatedAt: "2026-05-01",
      isDemoData: true,
    },
  });

  // demo-2 y demo-3: inactivos
  await prisma.activitySettings.upsert({
    where: { id: IDS.actSettings2Id },
    update: {},
    create: {
      id: IDS.actSettings2Id,
      patientId: IDS.patient2Id,
      moduleStatus: ActivityModuleStatus.inactive,
      isDemoData: true,
    },
  });

  await prisma.activitySettings.upsert({
    where: { id: IDS.actSettings3Id },
    update: {},
    create: {
      id: IDS.actSettings3Id,
      patientId: IDS.patient3Id,
      moduleStatus: ActivityModuleStatus.inactive,
      isDemoData: true,
    },
  });

  // Prescripciones (solo demo-1)
  await prisma.exercisePrescription.upsert({
    where: { id: IDS.prescription1Id },
    update: {},
    create: {
      id: IDS.prescription1Id,
      professionalId: IDS.profId,
      activitySettingsId: IDS.actSettings1Id,
      activityType: ActivityType.walking,
      durationMinutes: 30,
      intensity: ActivityIntensity.low,
      frequency: "3 veces por semana",
      generalNotes: "Caminata liviana al aire libre. Preferentemente por la mañana. No se requiere equipamiento especial.",
      startDate: "2026-05-01",
      isDemoData: true,
    },
  });

  await prisma.exercisePrescription.upsert({
    where: { id: IDS.prescription2Id },
    update: {},
    create: {
      id: IDS.prescription2Id,
      professionalId: IDS.profId,
      activitySettingsId: IDS.actSettings1Id,
      activityType: ActivityType.mobility,
      durationMinutes: 15,
      intensity: ActivityIntensity.low,
      frequency: "Todos los días",
      generalNotes: "Movilidad y elongación suave. Puede hacerse antes de dormir.",
      startDate: "2026-05-15",
      isDemoData: true,
    },
  });

  // ─── 10. Registros revisables del paciente 1 ────────────────────────────
  console.log("→ Registros revisables (demo, pendientes de revisión)...");

  await prisma.mealLog.upsert({
    where: { id: IDS.mealLog1Id },
    update: {},
    create: {
      id: IDS.mealLog1Id,
      patientId: IDS.patient1Id,
      date: TODAY,
      timeOfDay: "breakfast",
      foodDescription: "Café con tostadas integrales y mermelada (demo)",
      portion: "Una taza de café, dos tostadas medianas",
      notes: "Desayuno normal de demo",
      origin: DataOrigin.patient_reported,
      reviewStatus: ReviewStatus.pending,
      isDemoData: true,
    },
  });

  await prisma.mealLog.upsert({
    where: { id: IDS.mealLog2Id },
    update: {},
    create: {
      id: IDS.mealLog2Id,
      patientId: IDS.patient1Id,
      date: TODAY,
      timeOfDay: "lunch",
      foodDescription: "Arroz con pollo y ensalada (demo)",
      portion: "Un plato mediano",
      notes: null,
      origin: DataOrigin.patient_reported,
      reviewStatus: ReviewStatus.pending,
      isDemoData: true,
    },
  });

  await prisma.weightLog.upsert({
    where: { id: IDS.weightLog1Id },
    update: {},
    create: {
      id: IDS.weightLog1Id,
      patientId: IDS.patient1Id,
      date: TODAY,
      weightKg: 72.3,
      unit: "kg",
      notes: "Peso de la mañana, en ayunas (demo)",
      origin: DataOrigin.patient_reported,
      reviewStatus: ReviewStatus.pending,
      isDemoData: true,
    },
  });

  await prisma.patientNote.upsert({
    where: { id: IDS.note1Id },
    update: {},
    create: {
      id: IDS.note1Id,
      patientId: IDS.patient1Id,
      type: NoteType.question,
      subject: "Dudas sobre los horarios del plan (demo)",
      body: "Trabajo hasta tarde algunos días. ¿Puedo cambiar la hora del almuerzo? (pregunta ficticia demo)",
      origin: DataOrigin.patient_reported,
      reviewStatus: ReviewStatus.pending,
      isDemoData: true,
    },
  });

  await prisma.exerciseLog.upsert({
    where: { id: IDS.exerciseLog1Id },
    update: {},
    create: {
      id: IDS.exerciseLog1Id,
      patientId: IDS.patient1Id,
      date: TODAY,
      activityType: ActivityType.walking,
      durationMinutes: 30,
      intensity: ActivityIntensity.low,
      notes: "Caminata matutina demo",
      origin: DataOrigin.patient_reported,
      reviewStatus: ReviewStatus.pending,
      isDemoData: true,
    },
  });

  // Foto de comida demo — MC-FOTOS-MVP-1.
  // storageKey FICTICIA: no existe binario en ningún bucket.
  await prisma.mealPhotoLog.upsert({
    where: { id: IDS.mealPhoto1Id },
    update: {},
    create: {
      id: IDS.mealPhoto1Id,
      patientId: IDS.patient1Id,
      storageKey:
        "patients/demo-1/meal-photos/2026/06/ficticia-seed-0000-000000000001.jpg",
      mealType: MealPhotoType.breakfast,
      patientComment: "Desayuno de hoy (foto demo ficticia, sin binario)",
      origin: DataOrigin.patient_reported,
      reviewStatus: ReviewStatus.pending,
      isDemoData: true,
    },
  });

  console.log("\n✅ Seed completado:");
  console.log("   - 1 profesional demo");
  console.log("   - 3 pacientes demo");
  console.log("   - 1 consulta + 2 mediciones (demo-1)");
  console.log("   - 2 planes alimentarios + 6 items");
  console.log("   - 2 asignaciones de plan");
  console.log("   - 4 items de agenda (demo-1, hoy)");
  console.log("   - Configuración de actividad (demo-1: activo; demo-2/3: inactivo)");
  console.log("   - 2 prescripciones de ejercicio (demo-1)");
  console.log("   - 2 meal logs + 1 weight log + 1 nota + 1 exercise log (pendientes de revisión)");
  console.log("   - 1 foto de comida (metadata ficticia, pendiente de revisión)");
  console.log("\n⚠  Datos ficticios — no usar en producción ni Railway.");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
