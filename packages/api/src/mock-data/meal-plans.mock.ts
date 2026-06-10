import type {
  PatientPlanAssignment,
  PatientDailyAgenda,
} from "@pulso/shared";

/**
 * DATOS FICTICIOS DE DEMOSTRACIÓN — MC-5.
 *
 * Planes alimentarios y agendas asignadas a los pacientes demo.
 * No son reales. No representan recomendaciones clínicas reales.
 * No hay base de datos: este arreglo en memoria es la única fuente en MC-5.
 */

/** Planes asignados por patientId. */
export const MOCK_PLAN_ASSIGNMENTS: Record<
  string,
  PatientPlanAssignment | null
> = {
  "demo-1": {
    id: "assign-demo-1",
    patientId: "demo-1",
    mealPlanId: "plan-demo-1",
    mealPlan: {
      id: "plan-demo-1",
      name: "Plan Demo — Hábitos Saludables",
      description:
        "Plan de demostración orientado a mejorar hábitos generales. " +
        "No representa una prescripción real.",
      status: "active",
      professionalId: "prof-demo-1",
      professionalNote:
        "Nota interna (demo): ajustar porciones según evolución. No es dato real.",
      generalIndications:
        "Tomá agua durante el día. Priorizá alimentos frescos. " +
        "Registrá tus comidas en Mi Pulso para hacer el seguimiento.",
      meals: [
        {
          id: "meal-1",
          name: "Desayuno demo",
          moment: "breakfast",
          timeHint: "08:00",
          description: "Infusión, tostadas integrales, fruta de estación.",
          portionHint: "Porción orientativa (demo).",
          order: 1,
        },
        {
          id: "meal-2",
          name: "Almuerzo demo",
          moment: "lunch",
          timeHint: "13:00",
          description:
            "Plato principal con proteína, vegetales y cereales integrales.",
          portionHint: "Porción orientativa (demo).",
          order: 2,
        },
        {
          id: "meal-3",
          name: "Merienda demo",
          moment: "snack",
          timeHint: "17:00",
          description: "Fruta, yogur o colación liviana.",
          portionHint: "Porción orientativa (demo).",
          order: 3,
        },
        {
          id: "meal-4",
          name: "Cena demo",
          moment: "dinner",
          timeHint: "20:30",
          description: "Cena liviana: sopa, ensalada o guiso suave.",
          portionHint: "Porción orientativa (demo).",
          order: 4,
        },
      ],
      createdAt: "2026-05-20T10:00:00Z",
      isDemoData: true,
    },
    assignedBy: "prof-demo-1",
    startDate: "2026-05-20",
    status: "active",
    assignedAt: "2026-05-20T10:00:00Z",
    isDemoData: true,
  },

  "demo-2": {
    id: "assign-demo-2",
    patientId: "demo-2",
    mealPlanId: "plan-demo-2",
    mealPlan: {
      id: "plan-demo-2",
      name: "Plan Demo — Mantenimiento",
      description:
        "Plan de demostración orientado al mantenimiento de peso. " +
        "No representa una prescripción real.",
      status: "active",
      professionalId: "prof-demo-1",
      professionalNote:
        "Nota interna (demo): enfoque en sostenibilidad. No es dato real.",
      generalIndications:
        "Mantenés un buen equilibrio. Seguí registrando en Mi Pulso. " +
        "Hidratate bien durante el día.",
      meals: [
        {
          id: "meal-5",
          name: "Desayuno demo",
          moment: "breakfast",
          timeHint: "07:30",
          description: "Mate o café, tostadas con palta o queso untable.",
          portionHint: "Porción orientativa (demo).",
          order: 1,
        },
        {
          id: "meal-6",
          name: "Colación mañana demo",
          moment: "mid_morning",
          timeHint: "10:30",
          description: "Fruta o barritas de cereal.",
          portionHint: "Porción orientativa (demo).",
          order: 2,
        },
        {
          id: "meal-7",
          name: "Almuerzo demo",
          moment: "lunch",
          timeHint: "12:30",
          description: "Proteína magra, ensalada variada, arroz integral.",
          portionHint: "Porción orientativa (demo).",
          order: 3,
        },
        {
          id: "meal-8",
          name: "Merienda demo",
          moment: "snack",
          timeHint: "16:30",
          description: "Yogur natural o fruta.",
          portionHint: "Porción orientativa (demo).",
          order: 4,
        },
        {
          id: "meal-9",
          name: "Cena demo",
          moment: "dinner",
          timeHint: "20:00",
          description: "Cena equilibrada, similar al almuerzo pero más ligera.",
          portionHint: "Porción orientativa (demo).",
          order: 5,
        },
      ],
      createdAt: "2026-05-28T10:00:00Z",
      isDemoData: true,
    },
    assignedBy: "prof-demo-1",
    startDate: "2026-05-28",
    status: "active",
    assignedAt: "2026-05-28T10:00:00Z",
    isDemoData: true,
  },

  // demo-3 no tiene plan asignado todavía (paciente pendiente)
  "demo-3": null,
};

/** Agendas diarias por patientId. */
export const MOCK_DAILY_AGENDAS: Record<string, PatientDailyAgenda | null> = {
  "demo-1": {
    id: "agenda-demo-1",
    patientId: "demo-1",
    date: "2026-06-10",
    items: [
      {
        id: "agenda-item-1",
        patientId: "demo-1",
        title: "Desayuno",
        type: "meal",
        moment: "breakfast",
        timeHint: "08:00",
        description: "Según tu plan: infusión, tostadas integrales, fruta.",
        order: 1,
        linkedMealPlanItemId: "meal-1",
      },
      {
        id: "agenda-item-2",
        patientId: "demo-1",
        title: "Hidratación mañana",
        type: "hydration",
        moment: "mid_morning",
        timeHint: "10:00",
        description: "Tomá al menos un vaso de agua.",
        order: 2,
      },
      {
        id: "agenda-item-3",
        patientId: "demo-1",
        title: "Almuerzo",
        type: "meal",
        moment: "lunch",
        timeHint: "13:00",
        description: "Según tu plan: proteína, vegetales y cereales.",
        order: 3,
        linkedMealPlanItemId: "meal-2",
      },
      {
        id: "agenda-item-4",
        patientId: "demo-1",
        title: "Merienda",
        type: "meal",
        moment: "snack",
        timeHint: "17:00",
        description: "Según tu plan: fruta, yogur o colación liviana.",
        order: 4,
        linkedMealPlanItemId: "meal-3",
      },
      {
        id: "agenda-item-5",
        patientId: "demo-1",
        title: "Registrar comidas en Mi Pulso",
        type: "reminder",
        moment: "afternoon",
        timeHint: "18:00",
        description:
          "Acordate de registrar tus comidas del día en Mi Pulso.",
        order: 5,
      },
      {
        id: "agenda-item-6",
        patientId: "demo-1",
        title: "Cena",
        type: "meal",
        moment: "dinner",
        timeHint: "20:30",
        description: "Según tu plan: cena liviana.",
        order: 6,
        linkedMealPlanItemId: "meal-4",
      },
    ],
    generatedFrom: "plan-demo-1",
    professionalNote:
      "Nota interna (demo): agenda generada desde plan de hábitos. No es dato real.",
    isDemoData: true,
  },

  "demo-2": {
    id: "agenda-demo-2",
    patientId: "demo-2",
    date: "2026-06-10",
    items: [
      {
        id: "agenda-item-7",
        patientId: "demo-2",
        title: "Desayuno",
        type: "meal",
        moment: "breakfast",
        timeHint: "07:30",
        description: "Según tu plan: mate o café, tostadas.",
        order: 1,
        linkedMealPlanItemId: "meal-5",
      },
      {
        id: "agenda-item-8",
        patientId: "demo-2",
        title: "Colación de mañana",
        type: "meal",
        moment: "mid_morning",
        timeHint: "10:30",
        description: "Según tu plan: fruta o barrita.",
        order: 2,
        linkedMealPlanItemId: "meal-6",
      },
      {
        id: "agenda-item-9",
        patientId: "demo-2",
        title: "Almuerzo",
        type: "meal",
        moment: "lunch",
        timeHint: "12:30",
        description: "Según tu plan: proteína magra, ensalada, arroz.",
        order: 3,
        linkedMealPlanItemId: "meal-7",
      },
      {
        id: "agenda-item-10",
        patientId: "demo-2",
        title: "Merienda",
        type: "meal",
        moment: "snack",
        timeHint: "16:30",
        description: "Según tu plan: yogur o fruta.",
        order: 4,
        linkedMealPlanItemId: "meal-8",
      },
      {
        id: "agenda-item-11",
        patientId: "demo-2",
        title: "Cena",
        type: "meal",
        moment: "dinner",
        timeHint: "20:00",
        description: "Según tu plan: cena equilibrada.",
        order: 5,
        linkedMealPlanItemId: "meal-9",
      },
    ],
    generatedFrom: "plan-demo-2",
    professionalNote:
      "Nota interna (demo): agenda de mantenimiento. No es dato real.",
    isDemoData: true,
  },

  // demo-3 sin agenda (no tiene plan asignado)
  "demo-3": null,
};
