# 0007 — Mi Pulso: pantalla Hoy del paciente

- **Estado:** Aceptada
- **Fecha:** 2026-06-10
- **Microciclo:** MC-6
- **Contexto:** con planes alimentarios y agenda profesional listos (MC-5), se
  implementa la primera pantalla del paciente en Mi Pulso: la vista "Hoy".
  El objetivo es validar que el paciente puede ver su plan y agenda del día
  **sin acceder a ninguna nota o dato profesional interno**, usando datos
  ficticios y sin persistencia real.

---

## Decisión

### Tipos de dominio en `@pulso/shared`

Se agregaron en `packages/shared/src/types/patient-today.ts`:

- `PatientVisibleMeal` — comida visible al paciente (proyección de `MealPlanItem`).
- `PatientVisibleMealPlan` — plan visible al paciente (proyección de `MealPlanDetail`).
  **Nunca incluye `professionalNote`.** Incluye `generalIndications`.
- `PatientVisibleAgendaItem` — ítem de agenda visible al paciente.
  **Nunca incluye `professionalNote` de la agenda.**
- `PatientTodayView` — vista "Hoy" completa del paciente.
  Respuesta del endpoint `GET /patients/:patientId/today`.

**Regla central aplicada:**
- `professionalNote` de plan y agenda es excluida **explícitamente** en el
  servicio de proyección, no solo omitida por convención.
- `generalIndications` sí llega al paciente — está diseñado así en el dominio.
- El paciente no puede inferir la existencia de datos profesionales internos.

### Endpoint mock en `@pulso/api`

Provisional de MC-6, read-only:

- `GET /patients/:patientId/today` — devuelve
  `{ data: PatientTodayView, meta: { demo: true } }` o `404`.

El servicio `patient-today.service.ts` proyecta explícitamente desde los
mocks de planes/agendas, excluyendo `professionalNote` en el mapeo.

Se mantiene estructura de capas:
`routes → controllers → services → mock-data/meal-plans.mock.ts`.

### UI en `apps/mi-pulso-web`

Se reemplazó el placeholder con la pantalla "Hoy" mobile-first:

- **Header** fijo: "Mi Pulso · Hoy · [fecha]", fondo azul.
- **Banner de datos demo**: aviso ⚠️ visible en todo momento.
- **Selector de paciente demo**: para navegar entre los tres pacientes
  ficticios (reemplaza auth real, que es un MC posterior).
- **Sección "Tu plan alimentario"**:
  - Nombre del plan.
  - Indicaciones generales (campo visible al paciente por diseño).
  - Lista de comidas del día con nombre, horario, descripción y momento.
  - **Sin nota profesional** en ningún punto.
- **Sección "Tu agenda de hoy"**:
  - Lista cronológica de ítems con icono de tipo, título, horario, descripción.
  - **Sin nota profesional de la agenda** en ningún punto.
- **Estado "Sin plan asignado"**: aviso claro si el paciente no tiene plan
  (caso demo-3).

### Datos ficticios

- `apps/mi-pulso-web/app/today.mock.ts` — proyección paciente de los mismos
  datos conceptuales que el API, sin `professionalNote`.
- **Paciente Demo Uno** (demo-1): Plan "Hábitos Saludables", agenda con
  6 ítems.
- **Paciente Demo Dos** (demo-2): Plan "Mantenimiento", agenda con 5 ítems.
- **Paciente Demo Tres** (demo-3): Sin plan ni agenda.

Todos los datos marcados `isDemoData: true`. No representan recomendaciones
clínicas reales.

### Separación de visibilidad verificada

| Campo                        | Panel profesional | Mi Pulso (paciente) |
|------------------------------|:-----------------:|:-------------------:|
| `plan.name`                  | ✅                | ✅                  |
| `plan.generalIndications`    | ✅                | ✅                  |
| `plan.meals`                 | ✅                | ✅                  |
| `plan.professionalNote`      | ✅                | ❌ nunca            |
| `agenda.items`               | ✅                | ✅                  |
| `agenda.professionalNote`    | ✅                | ❌ nunca            |
| `patientDetail.professionalNote` | ✅           | ❌ nunca            |

---

## Deferidos (NO implementados en MC-6)

- Registros del paciente (`meal_logs`, `weight_logs`, `patient_notes`).
- Formularios de carga desde Mi Pulso.
- Autenticación real y sesión de paciente.
- Conexión web ↔ API (Mi Pulso sigue usando mock local).
- Base de datos, Prisma, migraciones.
- Railway, deploy, roles reales.
- Capacidades PWA reales (manifest, service worker, instalabilidad).
- Bandeja de revisión profesional (MC-8).
- Avance a MC-7.

---

## Consecuencias

- Existe una pantalla mobile-first que valida la separación de visibilidad
  entre datos profesionales y datos visibles al paciente.
- La exclusión de `professionalNote` queda expresada a nivel de tipo
  (`PatientTodayView` no tiene el campo) y de servicio (mapeo explícito).
- Los datos mock están duplicados entre API y web (mismo patrón que
  MC-3/MC-4/MC-5) — documentado e intencional hasta conectar web ↔ API.
- El selector de paciente demo reemplaza auth real; se eliminará cuando
  se implemente sesión de paciente.
