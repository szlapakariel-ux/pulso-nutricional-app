# ADR 0013 — API leyendo desde DB en endpoints clave (MC-10.5B)

**Estado:** Aceptado  
**Microciclo:** MC-10.5B  
**Fecha:** 2026-06-10

## Contexto

MC-10.5A dejó Prisma instalado y el schema listo, pero ningún servicio leía desde la DB.
MC-10.5B introduce la posibilidad de leer desde Prisma en endpoints clave, manteniendo
los mocks como comportamiento default y sin cambiar ningún comportamiento visible por defecto.

## Decisión

Agregar un selector de fuente de datos controlado por variable de entorno:

```
PULSO_DATA_SOURCE=mock    # default — comportamiento anterior
PULSO_DATA_SOURCE=prisma  # usa Prisma para endpoints soportados
```

### Regla central

**Los mocks siguen siendo el comportamiento default.** Si `PULSO_DATA_SOURCE` no está
definida o vale `mock`, la API funciona exactamente igual que en MC-10.5A, sin requerir
`DATABASE_URL`.

### Sin fallback silencioso

Si `PULSO_DATA_SOURCE=prisma` y la DB no está disponible, el error se propaga al caller.
No hay fallback silencioso a mock: si se elige modo prisma, la expectativa es que la DB
esté disponible.

## Archivos nuevos

```
packages/api/src/config/data-source.ts        ← selector PULSO_DATA_SOURCE
packages/api/src/repositories/
  patients.repository.ts                       ← queries Prisma para pacientes
  meal-plans.repository.ts                     ← queries Prisma para planes y agenda
```

## Archivos modificados

```
packages/api/src/services/patients.service.ts   ← ahora async, rama mock|prisma
packages/api/src/services/meal-plans.service.ts ← ahora async, rama mock|prisma
packages/api/src/controllers/patients.controller.ts    ← await services
packages/api/src/controllers/meal-plans.controller.ts  ← await services
packages/api/.env.example                       ← PULSO_DATA_SOURCE=mock
```

## Endpoints con lectura Prisma opcional

| Endpoint | Mock | Prisma |
|---|---|---|
| `GET /patients` | ✅ | ✅ |
| `GET /patients/:id` | ✅ | ✅ |
| `GET /patients/:patientId/meal-plan` | ✅ | ✅ |
| `GET /patients/:patientId/agenda` | ✅ | ✅ |

## Endpoints no modificados (siguen usando mocks)

- `GET /health`
- `GET /patients/:patientId/consultations`
- `GET /patients/:patientId/agenda-today`
- `POST /patients/:patientId/meal-logs`
- `POST /patients/:patientId/weight-logs`
- `POST /patients/:patientId/patient-notes`
- `GET /review-inbox/:patientId`
- `POST /review-inbox/:patientId/actions`
- `GET /patients/:patientId/pdf/plan/*`
- `GET /patients/:patientId/activity/*`
- `POST /patients/:patientId/activity-logs/preview`

## Cambio de sincrónico a asíncrono en los servicios

Los servicios `patients.service.ts` y `meal-plans.service.ts` cambiaron de retornar
valores síncronos a `Promise<T>`. Los controllers los hacen `await`. La rama mock usa
`Promise.resolve` implícito (retorna directamente desde función `async`).

`patient-today.service.ts` no fue afectado: accede a `MOCK_PLAN_ASSIGNMENTS` y
`MOCK_DAILY_AGENDAS` directamente, no a través de los servicios.

## Mapeo de gaps entre schema y tipos compartidos

| Campo | Shared type | Schema | Resolución |
|---|---|---|---|
| `PatientSummary.age` | `number` | `Int?` | `?? 0` |
| `PatientSummary.goal` | `string` | `String?` | `?? ""` |
| `PatientDetail.professionalNote` | `string` | `String?` | `?? ""` |
| `PatientDetail.professionalId` | `string` | via link | primer `ProfessionalPatientLink.professionalId` |
| `PatientPlanAssignment.status` | `"active" \| "inactive" \| "pending"` | — | derivado: `endDate === null → "active"` |
| `PatientPlanAssignment.assignedBy` | `string` | — | `mealPlan.professionalId` |
| `PatientPlanAssignment.assignedAt` | `string` | `createdAt` | `createdAt.toISOString()` |
| `PatientDailyAgenda` | modelo agregado | items individuales | agrupado por `patientId + date` (hoy) |
| `PatientAgendaItem.linkedMealPlanItemId` | `string?` | — | `undefined` (campo opcional omitido) |
| `MealPlanItem.description` | `string` | `String?` | `?? ""` |

## Estado MC-10.5B

- Mocks siguen siendo el default. No se rompe ningún comportamiento existente.
- Prisma solo se usa con `PULSO_DATA_SOURCE=prisma`.
- Railway sigue fuera de alcance.
- Auth sigue fuera de alcance.
- Las apps web (`pulso-nutricional-web`, `mi-pulso-web`) siguen usando sus mocks
  locales sin conectarse a la API real.

## Fuera de alcance (MC-10.5B)

- Railway / Postgres de producción
- Auth / login / roles reales
- Protección de endpoints
- Conexión de apps web a la API
- Endpoints no listados en la tabla de arriba
- Migraciones destructivas

## Consecuencias

- **Positivo:** Los 4 endpoints clave pueden validarse contra datos reales de la DB
  de desarrollo, sin arriesgar la estabilidad del modo mock.
- **Positivo:** El cambio a `async` en los servicios es mínimo y no rompe contratos
  (controllers ya eran async en Fastify).
- **Positivo:** `patient-today.service.ts` y todos los servicios no modificados
  siguen exactamente como estaban.
- **Neutral:** El ID de paciente en modo prisma es un UUID (del seed), distinto de
  `demo-1` del modo mock. Esto es esperado: las apps web usan sus mocks locales.
- **Negativo:** `PatientDailyAgenda` no tiene modelo propio en el schema; se
  construye agrupando ítems. Si en el futuro se necesita más metadata del aggregate
  (como `generatedFrom`), habría que agregar un modelo o una tabla de metadata.

## Próximo paso recomendado

MC-10.5C: conectar los servicios restantes a Prisma (consultas, mediciones, bandeja
de revisión) o avanzar directamente a la capa de auth (que desbloqueará MC-11).
