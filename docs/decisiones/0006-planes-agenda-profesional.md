# 0006 — Planes alimentarios y agenda profesional

- **Estado:** Aceptada
- **Fecha:** 2026-06-10
- **Microciclo:** MC-5
- **Contexto:** con la experiencia de consultas y mediciones lista (MC-4), se
  agrega la gestión de planes alimentarios y agenda del paciente desde el panel
  profesional. El objetivo es validar los contratos de dominio de planes y
  agenda, mostrando la separación entre datos profesionales (plan/agenda) y
  registros del paciente (meal_logs, weight_logs), usando datos ficticios y sin
  persistencia real.

---

## Decisión

### Tipos de dominio en `@pulso/shared`

Se agregaron en `packages/shared/src/types/meal-plan.ts`:

- `MealPlanId`, `AgendaTemplateId`, `AgendaItemId` — identificadores opacos.
- `MealPlanStatus` — `draft | active | archived`.
- `AgendaItemType` — `meal | hydration | medication | activity | reminder`.
- `DayMoment` — momentos del día: `breakfast | lunch | snack | dinner | ...`.
- `MealPlanItem` — ítem individual del plan (comida/colación).
- `MealPlanSummary` — resumen para listados.
- `MealPlanDetail` — plan completo con comidas, indicaciones y nota profesional.
- `PatientPlanAssignment` — asignación de un plan a un paciente.
- `PatientAgendaItem` — ítem concreto de agenda del paciente.
- `PatientDailyAgenda` — agenda diaria concreta.
- `PlanVisibilityNote` — documenta qué partes ve el paciente.

**Regla central aplicada:**
- Planes y agenda son DATO PROFESIONAL / VALIDADO.
- No son `ReviewableData`. No necesitan bandeja de revisión.
- No son `meal_logs` ni `weight_logs` (que son datos del paciente, revisables).
- La `professionalNote` de un plan NUNCA es visible al paciente.
- `generalIndications` sí es visible al paciente (en Mi Pulso, MC-6).

### Endpoints mock en `@pulso/api`

Provisionales de MC-5, read-only:

- `GET /patients/:patientId/meal-plan` — devuelve `{ data: PatientPlanAssignment, meta: { demo: true } }` o `404`.
- `GET /patients/:patientId/agenda` — devuelve `{ data: PatientDailyAgenda, meta: { demo: true } }` o `404`.

Se mantiene estructura de capas: `routes → controllers → services →
mock-data/meal-plans.mock.ts`.

### UI en `apps/pulso-nutricional-web`

Se agregó el tab "Plan y agenda" en `PanelView`:

- Componente `MealPlanView` con dos secciones:
  1. **Plan alimentario:** nombre, descripción, estado, fecha de inicio,
     indicaciones generales (con badge "Visible al paciente en Mi Pulso"),
     grid de comidas del plan, **nota profesional** (bloque verde,
     "nunca visible al paciente").
  2. **Agenda del día:** lista de ítems con icono, título, horario, descripción,
     momento del día. **Nota profesional de la agenda** (bloque verde).
- Si el paciente no tiene plan asignado → aviso claro.
- Aviso global: "⚠️ Datos ficticios de demostración — MC-5".

### Datos ficticios

- **Paciente Demo Uno** (demo-1): Plan "Hábitos Saludables" con 4 comidas,
  agenda con 6 ítems (incluyendo hidratación y recordatorio de Mi Pulso).
- **Paciente Demo Dos** (demo-2): Plan "Mantenimiento" con 5 comidas,
  agenda con 5 ítems.
- **Paciente Demo Tres** (demo-3): Sin plan ni agenda asignados.

Todos los datos marcados `isDemoData: true`. No representan recomendaciones
clínicas reales.

---

## Deferidos (NO implementados en MC-5)

- Creación/edición real de planes.
- Plantillas de plan (`meal_plan_templates`) — herramienta interna profesional.
- Asignación dinámica de planes desde la UI.
- Base de datos, Prisma, migraciones.
- Railway, deploy, auth real, roles reales.
- Conexión web ↔ API (web sigue usando mock local).
- `meal_logs` y `weight_logs` (datos del paciente, van en bandeja de revisión).
- Mi Pulso funcional (pantalla Hoy del paciente — MC-6).
- Avance a MC-6.

---

## Consecuencias

- Existe una pantalla con tres tabs (Ficha, Consultas, Plan y agenda) que
  valida los contratos del panel profesional y la separación de visibilidad.
- La distinción `generalIndications` (visible al paciente) vs
  `professionalNote` (interna) queda expresada a nivel de tipo y de UI.
- Los datos mock están duplicados entre API y web (como MC-3 y MC-4) porque
  no hay conexión web ↔ API. Se resolverá en un microciclo posterior.
- Cambiar `MealPlanDetail`, `PatientAgendaItem` o `PatientDailyAgenda` impacta
  API y web a la vez.
