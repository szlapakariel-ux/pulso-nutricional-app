# Auditoría de Integración entre Experiencias — MC-INTEGRACION-0

> **Tipo:** diagnóstico (solo documentación). No implementa código.
> **Fecha:** 2026-06-11
> **Pregunta auditada:** ¿la interacción entre las tres experiencias (panel
> profesional, Mi Pulso, mobile profesional) está realmente implementada,
> parcialmente implementada o solo documentada?

---

## Hallazgo central

**La integración está conectada en el backend pero fragmentada en el frontend.**
Las tres experiencias comparten una sola API y una sola base de datos
(arquitectónicamente correcto), pero en la práctica:

- Solo **lectura básica** (pacientes, plan, agenda) está conectada de verdad
  entre UI y API.
- El **flujo de valor central** ("el paciente registra su día → la nutricionista
  lo revisa") **no persiste**: los registros del paciente son `console.log` y la
  bandeja del profesional es un mock hardcoded.
- El **módulo de fotos** sube a la API (paciente) pero **no tiene visualización**
  en el panel profesional.
- La **app mobile profesional** es un placeholder vacío.

---

## 1. Mapa de las tres experiencias

| Experiencia | Directorio | Existe | Estado real |
|-------------|-----------|--------|-------------|
| Panel profesional | `apps/pulso-nutricional-web` | ✅ | Funcional. Solo pacientes/plan/agenda leen de API; el resto es mock local. |
| Mi Pulso (paciente) | `apps/mi-pulso-web` | ✅ | Vista Hoy lee de API; fotos escriben a API; comida/peso/nota son solo UI sin persistencia. |
| Mobile profesional | `apps/pulso-nutricional-mobile` | ⚠️ | Placeholder vacío (`src/placeholder.ts`). MC-11, pendiente. |

**Evidencia mobile:** `apps/pulso-nutricional-mobile/package.json` →
*"En MC-1 es solo placeholder/documentación (no se construye app mobile real)"*.
Solo contiene `package.json`, `README.md`, `tsconfig.json`, `src/placeholder.ts`.

---

## 2. Tabla por flujo

| # | Flujo | Estado | Evidencia |
|---|-------|--------|-----------|
| 1 | Profesional consulta paciente | **Implementado y probado** | `api-client.ts` `getPatients()`/`getPatient()` → `GET /patients`, `GET /patients/:id`. Cubierto por `scripts/smoke-api-railway.mjs`. |
| 2 | Profesional asigna plan | **Parcial (solo lectura)** | El panel lee `getMealPlan()`/`getAgenda()`, pero no hay endpoint ni UI de creación/asignación. Los planes provienen del seed. |
| 3 | Paciente ve plan | **Implementado y probado** | `mi-pulso-web/lib/api-client.ts` `getToday()` → `GET /patients/:id/today`. Cubierto por `scripts/smoke-mi-pulso-railway.mjs`. |
| 4 | Paciente registra comida/peso/nota | **Solo placeholder UI** | `registrar-view.tsx` hace `console.log("...enviado (demo)")` (comida, peso, nota, actividad). No hay método en api-client. Los endpoints API son `/...-logs/preview` simulados sin persistencia. |
| 5 | Profesional revisa registros | **Solo mock local** | `review-inbox-view.tsx` usa `MOCK_INBOX` hardcoded; acciones por `console.log`. El cliente web profesional **no tiene** método de review-inbox. El endpoint API existe pero no se consume. |
| 6 | Paciente sube foto | **Implementado, no probado E2E** | `mi-pulso-web/lib/api-client.ts` `createMealPhoto()` → `POST /patients/:id/meal-photos` (multipart real). Ningún smoke lo cubre. |
| 7 | Profesional ve/revisa foto | **No existe UI** | 0 referencias a fotos en `apps/pulso-nutricional-web`. El endpoint `POST /.../review` existe; no hay vista, ni cliente, ni endpoint de entrega de imagen. |
| 8 | Nutricionista usa mobile | **Pendiente (placeholder)** | App mobile vacía. MC-11. |

---

## 3. Estado de cada flujo (clasificación)

- **Implementado y probado E2E:** #1, #3.
- **Implementado pero NO probado E2E:** #6 (subir foto).
- **Parcial:** #2 (lectura sí, escritura no).
- **Solo placeholder / mock (no conectado UI↔API):** #4, #5, #7.
- **Pendiente:** #8.

---

## 4. Detalle de los puntos de contacto API ↔ UI

### Panel profesional (`apps/pulso-nutricional-web/lib/api-client.ts`)

Métodos que existen: `login`, `logout`, `getPatients`, `getPatient`,
`getMealPlan`, `getAgenda`.

Métodos que **NO** existen: review-inbox, meal-photos, crear consulta, crear/
asignar plan, registrar acciones de revisión.

Toggle de modo: `NEXT_PUBLIC_PULSO_DATA_MODE` (`mock` default | `api`). Aun en
modo `api`, las vistas de consultas, revisión y actividad siguen leyendo mock
local — solo pacientes/ficha/plan/agenda cambian a API.

| Vista | Fuente de datos |
|-------|-----------------|
| `patients-view.tsx` | API (con fallback a `DEMO_PATIENTS`) |
| `meal-plan-view.tsx` | Mock local (`MOCK_PLAN_ASSIGNMENTS`, `MOCK_DAILY_AGENDAS`) |
| `consultations-view.tsx` | Mock local (`MOCK_CONSULTATIONS`) |
| `review-inbox-view.tsx` | Mock local hardcoded (`MOCK_INBOX`) |
| `activity-view.tsx` | Mock local (`MOCK_ACTIVITY_SETTINGS`) |

### Mi Pulso (`apps/mi-pulso-web/lib/api-client.ts`)

Métodos que existen: `login`, `getMe`, `getToday`, `createMealPhoto`.

Métodos que **NO** existen: registrar comida, peso, nota o actividad.

`registrar-view.tsx`: todos los submit (comida/peso/nota/actividad) hacen
`console.log` y agregan al estado local `registrosEnviados`. **No llegan a la
API.** Solo las fotos (vía `createMealPhoto`) llegan a la API real.

### API (`packages/api/src/routes`)

Endpoints relevantes que existen:
- Lectura: `GET /patients`, `/patients/:id`, `/patients/:id/meal-plan`,
  `/patients/:id/agenda`, `/patients/:id/today`, `/patients/:id/consultations`.
- Registros del paciente: `POST /patients/:id/meal-logs/preview`,
  `.../weight-logs/preview`, `.../notes/preview` — **simulados, sin persistencia**.
- Consulta: `POST /patients/:id/consultations/preview` — **preview sin persistencia**.
- Revisión: `GET /professionals/demo/review-inbox`, `GET /patients/:id/review-inbox`,
  `POST /review-inbox/:entryId/action/preview` — **acción simulada sin persistencia**.
- Fotos: `POST /patients/:id/meal-photos` (crear), `GET .../meal-photos` (listar),
  `GET .../meal-photos/:photoId` (detalle, **solo metadata**),
  `POST .../meal-photos/:photoId/review` (revisar).

Endpoint que **NO** existe: entrega de la imagen (binario o URL firmada). El
controller devuelve metadata por diseño; la entrega real es MC-FOTOS-MVP-3.

### Smoke tests (`scripts/`)

- `smoke-api-railway.mjs`: `/health`, login, `/auth/me`, `/patients`,
  `/patients/:id`, `/meal-plan`, `/agenda`. **No** cubre fotos, revisión ni
  registros.
- `smoke-mi-pulso-railway.mjs`: `/health`, login, `/auth/me`,
  `/patients/:id/today`. **No** cubre crear foto ni registros.
- `smoke-web-profesional-railway.mjs`: web profesional.
- **Ninguno** cubre el flujo E2E "paciente escribe → profesional lee".

---

## 5. Bloqueantes para demo vendible

| # | Bloqueante | Severidad | Por qué importa |
|---|-----------|-----------|-----------------|
| 1 | Paciente registra comida/peso/nota → no persiste (`console.log`). | **Crítico** | Es el flujo central del producto. Si en la demo se registra una comida y se mira el panel, no aparece. |
| 2 | Bandeja de revisión del panel es mock hardcoded. | **Crítico** | Muestra siempre los mismos registros, desconectados de lo que hace el paciente. |
| 3 | Panel profesional no puede ver fotos. | **Crítico** | El módulo estrella de fotos no cierra el loop: el paciente sube, la nutricionista no ve. |
| 4 | No hay endpoint de entrega de imagen. | **Importante** | Aun con la vista construida, falta servir la imagen (MC-FOTOS-MVP-3). |
| 5 | Sin smoke test E2E paciente→profesional. | **Importante** | No hay verificación de que la cadena de valor funcione de punta a punta. |
| 6 | Modo `api` del panel sigue leyendo mock en varias vistas. | **Importante** | Inconsistencia visible para un comprador técnico. |
| 7 | App mobile profesional es placeholder. | Deseable | MC-11; no es prioritario para la demo inicial. |

---

## 6. Recomendación

**No conviene avanzar a MC-DEMO-VENDIBLE-1 (limpieza cosmética de nombres y
banners) todavía.** Primero hay que cerrar el flujo de valor; pintar la fachada
antes de conectar las cañerías invierte en lo equivocado.

**Orden recomendado (cada uno requiere autorización explícita; tocan código):**

1. **MC-INTEGRACION-1** — conectar paciente→profesional con persistencia real:
   - `registrar-view.tsx` envía comida/peso/nota a la API (métodos nuevos en
     api-client).
   - Endpoints de registro **persisten** (no `/preview`).
   - `review-inbox-view.tsx` **lee de la API**.
   - Smoke E2E: paciente escribe → aparece en bandeja del profesional.
2. **MC-FOTOS-MVP-3** — panel profesional ve y revisa fotos, con endpoint de
   entrega de imagen (URL firmada o endpoint con guard).
3. **MC-DEMO-VENDIBLE-1** — recién ahora: nombres creíbles + quitar banners
   "MC-X" de la UI.

**Diferir:** MC-11 (mobile profesional), dominio, MC-FOTOS-PROD-1/2, Play Store.

---

## 7. Límites de este ciclo

Solo diagnóstico documental. No se implementó código, no se tocó la API, ni
Prisma, ni Railway, ni se ejecutó `db:push`, ni deploy, ni credenciales. Los
flujos marcados como faltantes **no** se implementaron: quedan documentados para
ciclos futuros con autorización.
