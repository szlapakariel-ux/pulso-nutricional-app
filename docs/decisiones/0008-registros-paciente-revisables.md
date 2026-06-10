# 0008 — Registros del paciente como datos revisables

- **Estado:** Aceptada
- **Fecha:** 2026-06-10
- **Microciclo:** MC-7
- **Contexto:** con la pantalla "Hoy" de Mi Pulso lista (MC-6), se agregan las
  primeras funcionalidades de carga del paciente: formularios para registrar
  comidas, peso y notas/preguntas. El objetivo es validar que **todos los datos
  cargados por el paciente nacen como datos REVISABLES con estado pendiente**,
  nunca como datos validados, y que **no se validan automáticamente**.

---

## Decisión

### Tipos de dominio en `@pulso/shared`

Se agregaron en `packages/shared/src/types/patient-logs.ts`:

Identificadores:
- `MealLogId`, `WeightLogId`, `PatientNoteId` — strings opacos.

Datos del paciente (REVISABLES):
- `PatientMealLog` — registro de comida del paciente.
- `PatientWeightLog` — registro de peso del paciente.
- `PatientNote` — pregunta, observación o preocupación del paciente.

Drafts de entrada:
- `PatientMealLogDraft`, `PatientWeightLogDraft`, `PatientNoteDraft` — datos
  enviados por el formulario, sin ID ni timestamp.

Envolturas en ReviewableData:
- `PatientMealLogReviewable` = `ReviewableData<PatientMealLog>`
- `PatientWeightLogReviewable` = `ReviewableData<PatientWeightLog>`
- `PatientNoteReviewable` = `ReviewableData<PatientNote>`

Tipos agregados:
- `PatientReviewableEntryType` — enum: `"meal_log" | "weight_log" | "note"`.
- `PatientReviewableEntry` — entrada genérica revisable (para bandeja MC-8).
- Versión bumpeada a `0.0.0-mc7`.

**Regla central aplicada:**
- Todo lo cargado por el PACIENTE es `ReviewableData<T>`, NUNCA `ValidatedData<T>`.
- Nace siempre con `origin: "patient_reported"` y `reviewStatus: "pending"`.
- Nunca se valida automáticamente.
- La transición `pending → accepted` requiere acción explícita del profesional.
- Se diferencia explícitamente de:
  - `measurements` (tomadas por profesional, `ValidatedData`)
  - `consultations` (registradas por profesional, `ValidatedData`)
  - `meal_plans`, `agenda` (definidas por profesional, `ValidatedData`)

### Endpoints mock en `@pulso/api`

Provisionales de MC-7, preview simulado, sin persistencia:

- `POST /patients/:patientId/meal-logs/preview` — simula registro de comida,
  devuelve `{ data: ReviewableData<PatientMealLog>, meta: { demo: true } }`
- `POST /patients/:patientId/weight-logs/preview` — simula registro de peso,
  devuelve `{ data: ReviewableData<PatientWeightLog>, meta: { demo: true } }`
- `POST /patients/:patientId/notes/preview` — simula nota/pregunta,
  devuelve `{ data: ReviewableData<PatientNote>, meta: { demo: true } }`

Se mantiene estructura de capas:
`routes → controllers → services → mock-data/patient-logs.mock.ts`.

Cada respuesta marca explícitamente:
- `origin: "patient_reported"`
- `reviewStatus: "pending"` (nunca aceptado/revisado automáticamente)
- `meta.demo: true` y aviso de no persistencia

### UI en `apps/mi-pulso-web`

Se reemplazó la pantalla única con un sistema de tabs:

**Pantalla "Hoy"** (existente, MC-6):
- Plan visible del paciente
- Agenda del día
- Solo lectura

**Pantalla "Registrar"** (nueva, MC-7):
- Tres tabs: 🍽 Comida, ⚖️ Peso, 💬 Nota
- Tab "Comida":
  - Campos: fecha, momento del día, descripción, porción (opcional), notas
  - Aviso claro: "Se enviará a revisión. Estado: pendiente"
  - Formulario valida que descripción no esté vacía
- Tab "Peso":
  - Campos: fecha, peso (numérico), notas (opcional)
  - Aviso claro: "Se enviará a revisión. Estado: pendiente"
  - Formulario valida que peso no esté vacío
- Tab "Nota":
  - Campos: tipo (pregunta/observación/preocupación), asunto, detalle
  - Aviso claro: "Se enviará a tu profesional. Estado: pendiente"
  - Formulario valida que asunto y detalle no estén vacíos
- Historial local (en memoria): muestra los registros enviados en esta sesión
  con estado "Pendiente" (para demo)
- Banner de demo en todo momento: "⚠️ Datos ficticios de demostración — MC-7"

Navegación:
- Botones flotantes en la parte inferior
- Permiten cambiar entre "Hoy" y "Registrar"
- Botón activo resaltado

No hay persistencia real ni conexión a API real en Mi Pulso (MC-7).
Los formularios logean los drafts a consola para propósitos demo.

### Datos ficticios

- Helper `createDemoMealLog()`, `createDemoWeightLog()`, `createDemoNote()`
  generan ejemplos con IDs únicos en la sesión (contadores, no UUID).
- Todos marcados con `isDemoData: true` (en tipos futuros que lo requieran).
- No representan datos clínicos reales.

---

## Deferidos (NO implementados en MC-7)

- Persistencia real (DB, Prisma, migraciones).
- Conexión web ↔ API — Mi Pulso sigue usando mock local.
- Bandeja de revisión profesional (MC-8).
- Acciones de revisión profesional (marcar como revisado, aceptar, comentar).
- Validación automática de registros.
- Transición `pending → accepted/flagged` (requiere MC-8).
- Autenticación real y sesión de paciente.
- Roles y permisos reales.
- Notificaciones al profesional cuando llega un registro.
- Subida de fotos/adjuntos.
- Actividad física (MC-10).
- Avance a MC-8.

---

## Consecuencias

- Existen tres endpoints que simulan carga de datos revisables del paciente.
- Todos los registros generados por estos endpoints nacen con
  `origin: "patient_reported"` y `reviewStatus: "pending"`, reforzando la
  separación de dominio.
- La UI de Mi Pulso permite al paciente cargar datos y visualiza claramente
  que quedan "pendientes de revisión".
- Los datos se logean a consola pero **no se persisten** ni se comunican con
  la API real en MC-7 — es simulación pura.
- El patrón `ReviewableData<T>` queda establecido para toda futura carga de
  datos del paciente (meal_logs, weight_logs, patient_notes, exercise_logs).
- La diferencia entre datos profesionales (ValidatedData) y del paciente
  (ReviewableData) es ahora evidente en tipos, endpoints y UI.
- Cambiar `PatientMealLog`, `PatientWeightLog`, `PatientNote` o
  `ReviewableData` impacta API y web a la vez.

---

## Verificaciones

| Verificación | Resultado |
|---|---|
| Todos los registros nacen con `origin: "patient_reported"` | ✅ |
| Todos los registros nacen con `reviewStatus: "pending"` | ✅ |
| Ningún registro es `ValidatedData` | ✅ |
| No hay validación automática | ✅ |
| No hay persistencia real | ✅ |
| No hay DB/Prisma/migraciones | ✅ |
| No hay auth real ni roles | ✅ |
| `professionalNote` no aparece en registros del paciente | ✅ |
