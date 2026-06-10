# ADR 0011 — Módulo de actividad física opcional (MC-10)

**Estado:** Aceptado  
**Microciclo:** MC-10  
**Fecha:** 2026-06-10

## Contexto

El documento maestro prevé que el paciente pueda registrar actividad física desde Mi Pulso, y que la profesional pueda prescribirla y habilitarla. Sin embargo, el módulo debe ser:

1. **Opcional:** el paciente solo puede registrar actividad si la profesional lo habilitó explícitamente.
2. **Acotado:** no convierte el sistema en una app deportiva. Sin GPS, calorías, frecuencia cardíaca, ni recomendaciones automáticas.
3. **Con doble candado:** la profesional habilita y prescribe (ValidatedData), el paciente registra (ReviewableData, siempre pendiente).

## Decisión

Implementar el módulo de actividad física como módulo **opcional** con doble candado:

### Doble candado

| Capa | Actor | Tipo de dato |
|---|---|---|
| 1. Configuración | Profesional activa el módulo | `ActivitySettings` (dato profesional) |
| 2. Prescripción | Profesional prescribe actividad | `ExercisePrescription` (ValidatedData) |
| 3. Registro | Paciente registra su actividad | `PatientExerciseLog` envuelto en `ReviewableData<PatientExerciseLog>` |

### Reglas de inclusión

| Campo | Visible al paciente | Motivo |
|---|---|---|
| `activityType` | ✅ | Indicación al paciente |
| `durationMinutes` | ✅ | Indicación al paciente |
| `intensity` | ✅ | Indicación al paciente |
| `frequency` | ✅ | Indicación al paciente |
| `generalNotes` | ✅ | Indicaciones explícitas para el paciente |
| `professionalNote` | ❌ NUNCA | Nota interna profesional |

### Tipos de actividad soportados (conjunto acotado)

`walking`, `gym`, `bike`, `running`, `soccer`, `mobility`, `other`

Sin tipos deportivos avanzados, sin wearables, sin GPS.

### Intensidades soportadas

`low`, `moderate`, `high` — percibidas por el paciente. Sin cálculo de calorías ni frecuencia cardíaca.

### Endpoints

- `GET /patients/:patientId/activity/settings` — estado del módulo para el paciente
- `GET /patients/:patientId/activity/prescriptions` — prescripciones profesionales (ValidatedData)
- `POST /patients/:patientId/activity-logs/preview` — preview de registro del paciente (ReviewableData, pending)
  - Si el módulo está inactivo → 403

## Mock duplicado intencional

En MC-10, el mock de actividad se duplica entre `packages/api` y las apps web (`apps/pulso-nutricional-web/app/activity.mock.ts`, `apps/mi-pulso-web/app/activity.mock.ts`). Esto sigue el patrón establecido en MC-5 (planes/agenda): en ausencia de conexión web ↔ API, los mocks son idénticos y se mantienen sincronizados manualmente. Se resolverá cuando se conecte la API real.

En Mi Pulso (`mi-pulso-web`) la constante `DEMO_ACTIVITY_MODULE_ACTIVE` simula que el paciente actual tiene el módulo habilitado. En producción, este estado provendría de la API.

## Consecuencias

- **Positivo:** El módulo es claramente opcional y no interfiere con el flujo nutricional base.
- **Positivo:** La separación de dominio se mantiene íntegra: prescripción profesional ≠ registro del paciente.
- **Positivo:** No hay riesgo de transformar el sistema en una app deportiva: el conjunto de tipos es explícito y acotado.
- **Negativo:** Mock duplicado entre API y apps web (aceptable, documentado, igual que MC-5 a MC-9).
- **Neutral:** En MC-10 sin persistencia real. El historial de actividad real requiere DB y un microciclo posterior.

## Alternativas descartadas

- **Módulo siempre activo:** Rechazado. El doble candado es un requerimiento explícito de producto.
- **Incluir GPS/calorías/frecuencia cardíaca:** Rechazado. Fuera del alcance de MC-10 y del producto nutricional base.
- **Integrar con bandeja de revisión (MC-8) en MC-10:** Rechazado. Integración a futura MC para no romper la bandeja existente.
