# Plan de Microciclos — Pulso Nutricional

> El desarrollo avanza por **microciclos seguros**: pasos pequeños, verificables
> y acotados. Cada microciclo define **objetivo**, **alcance permitido**, **qué
> NO tocar** y **criterios de aceptación**. No se avanza al siguiente sin cerrar
> el anterior.
>
> **Reglas transversales (válidas en todos los microciclos):** no usar datos
> reales, no exponer credenciales, no desplegar sin pedirlo, no romper lo ya
> entregado, y respetar siempre la separación entre datos revisables y validados.

---

## MC-0 — Documentación base

- **Objetivo:** dejar asentada la visión, la arquitectura, el modelo de datos y
  el plan de trabajo, y crear la estructura inicial de carpetas.
- **Alcance permitido:**
  - README inicial.
  - Estructura de carpetas (`apps/`, `packages/`, `docs/`) con `.gitkeep`.
  - Documentos en `/docs` (producto, arquitectura, microciclos, decisiones).
- **Qué NO tocar:** nada de código funcional, dependencias, base de datos,
  Railway, variables de entorno ni despliegue.
- **Criterios de aceptación:**
  - Existe la estructura de carpetas esperada.
  - Existen README y los documentos base.
  - El repo no contiene código ejecutable ni configuración de servicios.

---

## MC-1 — Estructura técnica inicial

- **Objetivo:** preparar el esqueleto técnico del monorepo (sin lógica de
  negocio).
- **Alcance permitido:**
  - Definir herramienta de monorepo y estructura de paquetes vacíos.
  - Configuración base compartida (lint, formato, tsconfig) en `packages/config`.
  - Placeholders mínimos en cada app/paquete para que el monorepo sea coherente.
- **Qué NO tocar:** no implementar endpoints reales, no conectar base de datos,
  no Railway, no datos reales.
- **Criterios de aceptación:**
  - El monorepo instala/compila el esqueleto sin errores.
  - Cada app y paquete existe con su configuración mínima.
  - Sigue sin haber lógica de negocio ni acceso a datos reales.

---

## MC-2 — API mínima

- **Objetivo:** levantar una API mínima con healthcheck y estructura de rutas,
  sin datos reales.
- **Alcance permitido:**
  - Endpoint de salud (`/health`).
  - Estructura de capas (rutas, controladores, servicios) vacía o simulada.
  - Modelos/contratos derivados del modelo de datos inicial (sin DB real).
- **Qué NO tocar:** no conectar Postgres real, no credenciales, no Railway,
  no datos reales (usar mocks o memoria si hace falta).
- **Criterios de aceptación:**
  - La API arranca localmente y responde el healthcheck.
  - Hay contratos/tipos compartidos en `packages/shared`.
  - No hay conexión a servicios externos ni secretos.

---

## MC-3 — Pulso Nutricional PC: pacientes y ficha

- **Objetivo:** primera pantalla del panel profesional: listado de pacientes y
  ficha.
- **Alcance permitido:**
  - Vista de lista de pacientes y vista de ficha (datos básicos).
  - Consumo de la API mínima (con datos de ejemplo, no reales).
- **Qué NO tocar:** no consultas/planes/agenda todavía, no datos reales,
  no Railway.
- **Criterios de aceptación:**
  - Se puede navegar lista → ficha de un paciente de ejemplo.
  - La separación de datos se respeta a nivel de visibilidad.

---

## MC-4 — Nueva consulta

- **Objetivo:** registrar una consulta con mediciones desde el panel PC.
- **Alcance permitido:**
  - Formulario de nueva consulta y mediciones asociadas.
  - Persistencia a través de la API (entorno controlado, datos de ejemplo).
- **Qué NO tocar:** no planes/agenda, no PDF, no datos reales de pacientes.
- **Criterios de aceptación:**
  - Se crea una consulta con sus mediciones y aparece en la ficha.
  - Las mediciones quedan como dato profesional/validado.

---

## MC-5 — Planes y agenda

- **Objetivo:** crear planes alimentarios y agenda del paciente, y asignarlos.
- **Alcance permitido:**
  - Plantillas de plan/agenda, planes concretos y asignaciones.
  - Generación de agenda diaria a partir de plantillas.
- **Qué NO tocar:** no la app del paciente todavía, no datos reales.
- **Criterios de aceptación:**
  - Se crea un plan, se asigna a un paciente y se genera agenda diaria.
  - Plantillas no son visibles para el rol paciente (a nivel de diseño/API).

---

## MC-6 — Mi Pulso: pantalla Hoy

- **Objetivo:** primera pantalla del paciente mostrando plan y agenda del día.
- **Alcance permitido:**
  - PWA mobile-first con la pantalla **Hoy** (solo lectura).
  - Consumo de plan/agenda asignados vía API.
- **Qué NO tocar:** todavía sin registros del paciente (solo lectura),
  no datos reales.
- **Criterios de aceptación:**
  - El paciente de ejemplo ve su agenda y plan del día.
  - El paciente no accede a datos profesionales internos.

---

## MC-7 — Registros del paciente

- **Objetivo:** que el paciente cargue comidas, peso y notas desde Mi Pulso.
- **Alcance permitido:**
  - Formularios de meal_logs, weight_logs y patient_notes.
  - Cada registro nace como **dato revisable / pendiente**.
- **Qué NO tocar:** la bandeja de revisión profesional (MC-8), actividad física
  (MC-10), datos reales.
- **Criterios de aceptación:**
  - El paciente carga registros y quedan con estado de revisión pendiente.
  - Ningún registro se valida automáticamente.

---

## MC-8 — Bandeja de revisión

- **Objetivo:** que la profesional vea y resuelva los registros del paciente.
- **Alcance permitido:**
  - Bandeja con los datos revisables pendientes.
  - Acciones explícitas de revisión (marcar revisado, comentar, etc.).
- **Qué NO tocar:** no automatizar la validación, no PDF, no datos reales.
- **Criterios de aceptación:**
  - Los registros del paciente aparecen en la bandeja.
  - La transición revisable → validado es siempre una acción manual.

---

## MC-9 — PDF simple

- **Objetivo:** generar un PDF básico (por ejemplo, plan o resumen).
- **Alcance permitido:**
  - Generación de un PDF simple a partir de datos validados.
  - Descarga/visualización desde el panel.
- **Qué NO tocar:** no incluir datos sin revisar, no plantillas complejas,
  no datos reales.
- **Criterios de aceptación:**
  - Se genera un PDF legible con datos profesionales/validados.
  - El PDF no expone datos revisables sin validar.

---

## MC-10 — Actividad física opcional

- **Objetivo:** incorporar el módulo opcional de actividad física.
- **Alcance permitido:**
  - Prescripciones (profesional) y registros (paciente, revisables).
  - El módulo debe poder estar desactivado sin romper el resto.
- **Qué NO tocar:** no hacerlo obligatorio, no datos reales.
- **Criterios de aceptación:**
  - Con el módulo activo, se prescribe y se registra actividad.
  - Con el módulo inactivo, el sistema funciona igual.

---

## MC-10.5A — Prisma: base técnica de persistencia *(ciclo técnico insertado)*

- **Objetivo:** preparar la capa de persistencia (Prisma + PostgreSQL) sin
  conectar producción ni reemplazar los mocks existentes.
- **Alcance permitido:**
  - Schema Prisma con todos los modelos del dominio.
  - Seed idempotente con datos ficticios demo.
  - Singleton del cliente (`src/lib/prisma.ts`) — no importado aún por servicios.
  - Scripts `db:generate`, `db:push`, `db:seed`, `db:studio` en `packages/api`.
  - ADR 0012 documentando la decisión.
- **Qué NO tocar:** no conectar Railway, no Postgres de producción, no credenciales
  reales, no reemplazar mocks, no auth, no login, no proteger endpoints, no conectar
  apps web a la API real, no avanzar a MC-10.5B ni MC-11 sin autorización.
- **Criterios de aceptación:**
  - `pnpm --filter @pulso/api db:generate` corre sin error (no requiere DB).
  - `pnpm type-check` y `pnpm build` pasan sin error.
  - Todos los endpoints existentes siguen respondiendo igual (mocks intactos).
  - El schema es válido y consistente con el modelo de datos documentado.

---

## MC-10.5B — API leyendo desde DB en endpoints clave *(ciclo técnico insertado)*

- **Objetivo:** permitir que endpoints clave lean desde Prisma cuando
  `PULSO_DATA_SOURCE=prisma`, manteniendo mocks como comportamiento default.
- **Alcance permitido:**
  - `packages/api/src/config/data-source.ts` — selector de fuente de datos.
  - `packages/api/src/repositories/` — queries Prisma para pacientes, planes y agenda.
  - Servicios `patients.service.ts` y `meal-plans.service.ts` ahora async con rama mock|prisma.
  - Controllers actualizados para `await` los servicios.
  - `.env.example` con `PULSO_DATA_SOURCE=mock`.
  - ADR 0013 documentando la decisión.
- **Qué NO tocar:** no Railway, no auth, no login, no proteger endpoints, no conectar
  apps web a la API real, no reemplazar mocks en apps web, no avanzar a MC-11 sin
  autorización.
- **Criterios de aceptación:**
  - Sin `PULSO_DATA_SOURCE`, la API funciona igual que antes (mocks).
  - Con `PULSO_DATA_SOURCE=prisma` y DB local/demo: los 4 endpoints clave leen desde Prisma.
  - `pnpm type-check`, `pnpm build` y `pnpm lint` pasan sin error.

---

## MC-10.5C — Auth y roles mínimos *(ciclo técnico insertado)*

- **Objetivo:** base mínima de autenticación y roles sin romper el comportamiento
  actual. `PULSO_AUTH_MODE=off` (default) mantiene todo sin cambio.
- **Alcance permitido:**
  - `packages/shared/src/types/auth.ts` — AuthRole, AuthUser, LoginRequest, LoginResponse, AuthSession.
  - `packages/api/src/config/auth.ts` — selector + resolveJwtSecret() + augmentación de tipos JWT.
  - `packages/api/src/mock-data/auth.mock.ts` — credenciales demo en memoria.
  - `packages/api/src/services/auth.service.ts` — verifyDemoCredentials().
  - `packages/api/src/controllers/auth.controller.ts` y `routes/auth.routes.ts`.
  - `POST /auth/login`, `GET /auth/me`, `GET /auth/protected-demo`.
  - Dependencia `@fastify/jwt` en `packages/api`.
  - ADR 0014 documentando la decisión.
- **Qué NO tocar:** no proteger endpoints existentes masivamente, no Railway, no UI,
  no OAuth, no SSO, no datos reales, no avanzar a MC-11 sin autorización.
- **Criterios de aceptación:**
  - Con `PULSO_AUTH_MODE=off`: todos los endpoints existentes funcionan sin token.
  - Con `PULSO_AUTH_MODE=demo`: login devuelve JWT, `/auth/me` verifica token, token
    inválido/ausente devuelve 401, `/auth/protected-demo` requiere JWT.
  - `pnpm type-check`, `pnpm build` y `pnpm lint` pasan sin error.

---

## MC-10.5D — Protección por rol en endpoints clave *(ciclo técnico)*

- **Objetivo:** que los endpoints del dominio rechacen peticiones sin el rol
  adecuado, sin romper el comportamiento existente.
- **Alcance permitido:**
  - `PULSO_AUTH_ENFORCEMENT` (`off` default | `demo`) — solo activo cuando
    además `PULSO_AUTH_MODE=demo`.
  - `packages/api/src/config/enforcement.ts` — selector de modo.
  - `packages/api/src/middleware/auth-guards.ts` — `requireProfessional` y
    `requirePatientSelf` como `preHandler` de Fastify.
  - Actualización de los 8 archivos de rutas con los guards declarativos.
  - `.env.example` actualizado con `PULSO_AUTH_ENFORCEMENT=off`.
  - ADR 0015 documentando la decisión.
- **Qué NO tocar:** no Railway, no deploy, no UI, no pantalla login, no cookies,
  no refresh tokens, no passwordHash, no OAuth, no proteger endpoints cuando
  enforcement está off, no cambiar contratos de respuesta exitosa, no avanzar
  a MC-11 sin autorización.
- **Criterios de aceptación:**
  - Con `PULSO_AUTH_ENFORCEMENT=off`: comportamiento idéntico a MC-10.5C.
  - Con `PULSO_AUTH_MODE=demo` + `PULSO_AUTH_ENFORCEMENT=demo`:
    - Token ausente/inválido → 401.
    - Paciente accede a endpoint profesional → 403.
    - Paciente accede a datos de otro paciente → 403.
    - Rol correcto con token válido → respuesta normal sin cambios.
  - `pnpm type-check`, `pnpm build` y `pnpm lint` pasan sin error.

---

## MC-WEB-1 — Web profesional: lectura de API Railway

- **Objetivo:** conectar el panel profesional (web) a la API Railway en modo
  lectura inicial sin tocar Mi Pulso, dominio, Postgres ni avanzar a MC-11.
- **Alcance permitido:**
  - Cliente HTTP mínimo (`api-client.ts`) con singleton para login, `getPatients()`,
    `getPatient(id)`, `getMealPlan(id)`, `getAgenda(id)`.
  - Configuración de modo (`data-config.ts`): `NEXT_PUBLIC_PULSO_DATA_MODE`
    (`mock` default | `api`), `NEXT_PUBLIC_PULSO_API_BASE_URL`.
  - Hook React (`use-api-auth.ts`) para estado de autenticación.
  - UI del panel integrada: login form cuando API activa sin token, carga de
    pacientes y detalles desde API cuando autenticado, fallback automático a mock
    si API falla, indicador visual de modo.
  - `.env.example` documentando variables de configuración.
  - ADR 0019 documentando la decisión.
- **Qué NO tocar:** no Railway, no Postgres, no Prisma schema, no seed, no
  package.json, no pnpm-lock.yaml, no datos reales, no deploy, no Mi Pulso,
  no dominio, no avanzar a MC-11 ni MC-12.
- **Criterios de aceptación:**
  - Modo mock (default): experiencia actual sin cambios, usa `DEMO_PATIENTS`.
  - Modo API: requiere login demo, carga pacientes desde Railway, soporta
    ficha/plan/agenda por API.
  - No mezcla datos mock/API en la misma vista.
  - Fallback automático a mock si API falla (error handling robusto).
  - Indicador visible en UI mostrando modo activo.
  - `pnpm type-check`, `pnpm build` y `pnpm lint` pasan sin error.

---

## MC-WEB-2 — Web profesional: deploy Railway y operabilidad

- **Objetivo:** desplegar la web profesional en Railway y verificar que
  funciona en modo API lectura contra la API Railway (MC-WEB-1 + MC-API-CORS-CODE
  operativos).
- **Alcance permitido:**
  - Deploy del servicio `pulso-nutricional-web` en Railway (acción externa).
  - Configuración de variables: `NEXT_PUBLIC_PULSO_DATA_MODE=api`,
    `NEXT_PUBLIC_PULSO_API_BASE_URL=...`, etc.
  - Redeploy del servicio `api` si es necesario para que CORS tenga efecto.
  - Verificación operativa: login demo funciona, lista de pacientes carga,
    ficha/plan/agenda abren sin error, no hay CORS bloqueados.
- **Qué NO tocar:** no código web, no código API, no Postgres, no seed, no
  dominio propio, no Mi Pulso, no avanzar a MC-11 ni MC-12.
- **Criterios de aceptación:**
  - Web profesional accesible en `https://pulso-nutricional-web-production.up.railway.app`.
  - `NEXT_PUBLIC_PULSO_DATA_MODE=api` en producción.
  - Login demo responde 200, token se genera, UI recibe el token.
  - `GET /patients` desde navegador responde 200, lista carga en UI.
  - `GET /patients/:id`, `/meal-plan`, `/agenda` cargan sin error.
  - No hay error CORS en consola del navegador.
  - Fallback a mock sigue funcionando en desarrollo.

---

## MC-WEB-3 — Smoke test y playbook de la web profesional

- **Objetivo:** dejar una verificación repetible (smoke test) y un playbook
  operativo de la web profesional desplegada en Railway, sin tocar código de
  aplicación, Railway, Postgres, Mi Pulso ni dominio propio.
- **Alcance permitido:**
  - `scripts/smoke-web-profesional-railway.mjs` — verifica que la web se sirve
    (`GET /` 200, marcadores HTML) y la cadena de datos de la API (health,
    login demo, pacientes, ficha, plan, agenda). Sin dependencias externas.
  - `docs/deploy/web-profesional-railway-playbook.md` — smoke test automatizado
    + checklist manual de navegador (CORS, login UI) + tabla de diagnóstico.
  - Script `smoke:web:railway` en el `package.json` raíz (igual que
    `smoke:api:railway`).
  - ADR 0021 documentando la decisión y sus límites.
- **Qué NO tocar:** no código de web ni de API, no Railway, no Postgres, no
  Prisma schema, no seed, no Mi Pulso, no dominio propio, no datos reales, no
  deploy, no avanzar a MC-11 ni MC-12.
- **Criterios de aceptación:**
  - El smoke test corre sin dependencias y sale con exit code semántico (0/1).
  - Configurable por `PULSO_WEB_BASE_URL` y `PULSO_API_BASE_URL`.
  - El playbook cubre lo que el script no puede automatizar (CORS, UI).
  - Documenta el límite de red del entorno Claude Code (egress proxy).

---

## MC-MIPULSO-1 — Mi Pulso: lectura inicial desde la API Railway

- **Objetivo:** conectar la app del paciente (`apps/mi-pulso-web`) a la API
  Railway en modo lectura inicial para el paciente demo, manteniendo el modo
  mock como default y fallback seguro.
- **Alcance permitido:**
  - `apps/mi-pulso-web/lib/data-config.ts` — modo `mock` (default) | `api` vía
    `NEXT_PUBLIC_PULSO_DATA_MODE` / `NEXT_PUBLIC_PULSO_API_BASE_URL`.
  - `apps/mi-pulso-web/lib/api-client.ts` — cliente HTTP solo lectura
    (`login`, `getMe`, `getToday`).
  - `apps/mi-pulso-web/lib/use-patient-auth.ts` — login demo paciente + token
    en `localStorage`.
  - `apps/mi-pulso-web/lib/patient-mapping.ts` — mapping demo `userId →
    patientId` (espejo documentado del guard del backend).
  - `apps/mi-pulso-web/app/today-content.tsx` + `hoy-view.tsx` — UI con rama
    mock (selector demo) vs api (login + carga desde API), indicador de modo.
  - `.env.example`, ADR 0022, doc `docs/deploy/mi-pulso-api-readonly.md`.
- **Qué NO tocar:** no web profesional, no backend API (código), no Railway,
  no Postgres, no Prisma schema, no seed, no escritura (sin registros), no
  review queue, no deploy de Mi Pulso, no dominio propio, no CORS de producción,
  no avanzar a MC-11 ni MC-12.
- **Endpoints consumidos (solo lectura):** `POST /auth/login`, `GET /auth/me`,
  `GET /patients/:patientId/today`.
- **Bloqueo conocido:** `/auth/me` devuelve userId, no patientId. Se replica el
  mapping demo documentado en el frontend; el fix correcto (API exponiendo
  patientId) queda para un próximo ciclo.
- **Criterios de aceptación:**
  - `pnpm type-check`, `pnpm build`, `pnpm lint` sin error.
  - Modo mock: Mi Pulso funciona como antes (selector demo + mocks).
  - Modo api: login demo paciente, `/auth/me` y vista Hoy desde API; sin
    mezclar mock/API; token nunca impreso completo; 401 limpia sesión.

---

## MC-PATIENT-ID-1 — Exponer patientId en GET /auth/me *(ciclo técnico)*

- **Objetivo:** que `GET /auth/me` devuelva el `patientId` del paciente
  autenticado, eliminando el mapping demo temporal del frontend de Mi Pulso.
- **Alcance permitido:**
  - `packages/shared/src/types/auth.ts` — campo `patientId?: string` en
    `AuthUser`.
  - `packages/api/src/middleware/auth-guards.ts` — exportar
    `DEMO_USER_TO_PATIENT_ID` (antes privado).
  - `packages/api/src/controllers/auth.controller.ts` — `meController` incluye
    `patientId` en la respuesta cuando `role === "patient"`.
  - `apps/mi-pulso-web/app/hoy-view.tsx` — `loadToday` usa
    `auth.user.patientId` directamente.
  - Eliminar `apps/mi-pulso-web/lib/patient-mapping.ts`.
  - ADR 0023, actualización de `docs/deploy/mi-pulso-api-readonly.md`.
- **Qué NO tocar:** no Postgres, no Prisma schema, no seed, no deploy de Mi
  Pulso, no dominio propio, no escritura de datos de paciente, no avanzar a
  MC-11 ni MC-12.
- **Criterios de aceptación:**
  - `pnpm type-check`, `pnpm build`, `pnpm lint` sin error.
  - `GET /auth/me` con token de paciente devuelve `patientId` en la respuesta.
  - `patient-mapping.ts` eliminado del frontend.
  - Profesional autenticado: `patientId` ausente de la respuesta (campo
    opcional).

---

## MC-MIPULSO-2 — Mi Pulso: smoke test y playbook de verificación API *(ciclo técnico)*

- **Objetivo:** verificación end-to-end de Mi Pulso en modo API contra la API
  Railway, sin deploy, sin tocar Railway, sin tocar Postgres, sin dominio propio
  y sin avanzar a MC-11.
- **Alcance permitido:**
  - `scripts/smoke-mi-pulso-railway.mjs` — verifica la cadena API del paciente
    demo: `/health`, login, `/auth/me` con `patientId` (MC-PATIENT-ID-1),
    `/patients/:id/today` con plan y agenda. Sin dependencias externas.
  - `docs/deploy/mi-pulso-api-readonly-playbook.md` — smoke test automatizado
    + checklist manual para correr Mi Pulso local en modo api y verificar en
    el navegador (CORS, login UI, vista Hoy).
  - Script `smoke:mi-pulso:railway` en el `package.json` raíz.
  - ADR 0024 documentando la decisión y sus límites.
- **Qué NO tocar:** no código de Mi Pulso ni de la API, no Railway, no Postgres,
  no Prisma schema, no seed, no deploy de Mi Pulso, no dominio propio, no avanzar
  a MC-11 ni MC-12.
- **Criterios de aceptación:**
  - El smoke test corre sin dependencias y sale con exit code semántico (0/1).
  - Configurable por `PULSO_API_BASE_URL`.
  - Verifica `patientId` en la respuesta de `/auth/me` (MC-PATIENT-ID-1).
  - El playbook cubre lo que el script no puede automatizar (CORS, UI).
  - Documenta el límite de red del entorno Claude Code (egress proxy).

---

## MC-MIPULSO-FE-1 — Mi Pulso: fix frontend patientId desde /auth/me *(ciclo técnico)*

- **Objetivo:** corregir el bug por el cual Mi Pulso queda atascado en
  "Cargando tu día..." tras el login porque `POST /auth/login` no devuelve
  `patientId` en `response.user`. La fuente de verdad es `GET /auth/me`.
- **Alcance permitido:**
  - `apps/mi-pulso-web/lib/use-patient-auth.ts` — en el callback `login`,
    después de `client.login()`, llamar `client.getMe()` y usar ese resultado
    para `setUser()` en lugar de `response.user`.
  - ADR 0026 documentando la decisión.
  - Actualización de este plan.
- **Qué NO tocar:** no código de API, no Railway, no Postgres, no Prisma schema,
  no seed, no web profesional, no dominio, no deploy, no variables de entorno,
  no CORS, no avanzar a MC-11 ni MC-12.
- **Invariantes a mantener:**
  - Modo mock sigue funcionando sin cambios.
  - No se imprime el token completo en consola.
  - No se mezclan datos mock/API.
  - La fuente de verdad para `patientId` es siempre `/auth/me`, nunca
    `POST /auth/login`.
- **Criterios de aceptación:**
  - `pnpm type-check`, `pnpm build`, `pnpm lint` sin error.
  - Después del login demo, `auth.user.patientId` es `"demo-1"`.
  - La vista Hoy carga desde `GET /patients/demo-1/today` sin error.
  - No aparece "La API no devolvió el patientId del paciente autenticado."

---

## MC-MIPULSO-RWY-0 — Mi Pulso: preflight para deploy controlado en Railway *(ciclo técnico)*

- **Objetivo:** preparar el preflight documental para un deploy controlado de
  Mi Pulso en Railway en modo API, sin deploy, sin tocar Railway, sin tocar
  Postgres, sin dominio propio y sin avanzar a MC-11.
- **Alcance permitido:**
  - `docs/deploy/mi-pulso-railway-preflight.md` — build/start (verificados
    contra `package.json`), variables (`NEXT_PUBLIC_PULSO_DATA_MODE=api`,
    `NEXT_PUBLIC_PULSO_API_BASE_URL`), la dependencia crítica de **ampliar CORS**
    de la API para el origen de Mi Pulso, checks post-deploy, "No ejecutar
    todavía", orden recomendado, rollback, brechas y riesgos.
  - ADR 0025 documentando la decisión y sus límites.
  - Actualización de este plan.
- **Qué NO tocar:** no deploy de Mi Pulso, no Railway, no variables del servicio
  `api` (incluido CORS), no redeploy, no Postgres, no Prisma schema, no seed, no
  package.json, no pnpm-lock.yaml, no dominio propio, no avanzar a MC-11 ni MC-12.
- **Criterios de aceptación:**
  - Documentación clara y accionable para un futuro deploy de Mi Pulso.
  - Comandos derivados de scripts reales (no inventados).
  - Documenta la dependencia CORS y la dependencia circular de orden.
  - Sin secretos ni valores reales de variables.

---

## MC-API-CORS-CODE — CORS mínimo en la API para la web profesional

- **Objetivo:** habilitar CORS mínimo y explícito en la API Fastify para que
  la web profesional Railway pueda llamar a `/auth/login`, `/auth/me`,
  `/patients`, `/patients/:id`, `/patients/:id/meal-plan` y
  `/patients/:id/agenda` desde el navegador.
- **Alcance permitido:**
  - Dependencia `@fastify/cors` en `packages/api`.
  - `packages/api/src/config/cors.ts` — allowlist desde `CORS_ORIGIN` y
    `PULSO_ALLOWED_ORIGINS`, + localhost de desarrollo.
  - Registro de `@fastify/cors` en `packages/api/src/app.ts` antes de las rutas.
  - `.env.example` documentando `CORS_ORIGIN` y `PULSO_ALLOWED_ORIGINS`.
  - ADR 0020 y doc `docs/deploy/api-cors-web-profesional.md`.
- **Qué NO tocar:** no Mi Pulso, no Postgres, no Prisma schema, no seed, no
  datos, no dominio propio, no lógica de auth/pacientes/planes/agenda, no
  relajar guards, no wildcard `*`, no Express ni paquete `cors`, no deploy,
  no Railway desde el repo, no avanzar a MC-11.
- **Criterios de aceptación:**
  - API compila (`type-check`, `build`, `lint` sin error).
  - CORS configurado con `@fastify/cors` (Fastify, no Express).
  - Origen Railway web profesional y localhost permitidos; sin wildcard.
  - Preflight `OPTIONS /auth/login` ya no cae en "route not found".
  - Auth y guards no se relajan (`/patients` sin token sigue 401).

---

## MC-11 — Pulso Nutricional Mobile

- **Objetivo:** versión reducida del panel profesional para celular.
- **Alcance permitido:**
  - Subconjunto del panel PC (pacientes, ficha resumida, bandeja de revisión).
  - Reutilización de API y componentes compartidos.
- **Qué NO tocar:** no duplicar lógica de negocio, no datos reales.
- **Criterios de aceptación:**
  - La profesional resuelve tareas frecuentes desde el celular.
  - No se rompe ni el panel PC ni Mi Pulso.

---

## MC-RWY-0 — Preparación repo-side para deploy Railway *(ciclo técnico)*

- **Objetivo:** dejar documentado y ordenado todo lo necesario para que un
  futuro agente Railway pueda conectar y desplegar de forma controlada, sin
  improvisar comandos. **No** ejecuta deploy ni toca Railway.
- **Alcance permitido:**
  - `docs/deploy/railway-preflight.md` — guía por servicio (`api`,
    `pulso-nutricional-web`, `mi-pulso-web`, `Postgres`): root directory,
    build/start recomendados (verificados contra `package.json`), variables
    requeridas/opcionales, checks post-deploy, "No ejecutar todavía", orden
    recomendado, rollback, brechas y riesgos.
  - ADR 0016 documentando la decisión y sus límites.
  - Actualización de este plan.
- **Qué NO tocar:** no Railway, no agente Railway, no conectar GitHub a Railway,
  no variables reales, no secretos, no deploy/redeploy/restart, no Postgres
  (`db:push`/`db:seed`), no conectar UI con API, no cambiar runtime, no crear
  dominio, no config de Railway en código, no avanzar a MC-11.
- **Criterios de aceptación:**
  - Documentación clara y accionable para un futuro agente Railway.
  - Comandos derivados de scripts reales (no inventados).
  - Sin secretos ni valores reales de variables.
  - Runtime sin cambios; `type-check`/`build` solo si algo lo requiere (no lo
    requiere: solo documentación).

---

## MC-12 — PWA/TWA futura

- **Objetivo:** preparar la distribución como PWA instalable y, a futuro, TWA
  (Play Store).
- **Alcance permitido:**
  - Manifest, service worker e instalabilidad de Mi Pulso.
  - Plan (no ejecución) para empaquetado TWA.
- **Qué NO tocar:** no publicar en tiendas, no credenciales de publicación,
  no datos reales.
- **Criterios de aceptación:**
  - Mi Pulso es instalable como PWA.
  - El empaquetado TWA queda documentado como paso futuro, no ejecutado.

---

## Estado del plan

| Microciclo | Estado     |
|------------|------------|
| MC-0       | ✅ Completado (mergeado en `main`) |
| MC-1       | ✅ Completado (mergeado en `main`) |
| MC-2       | ✅ Completado (mergeado en `main`) |
| MC-3       | ✅ Completado (mergeado en `main`) |
| MC-4       | ✅ Completado (mergeado en `main`) |
| MC-5       | ✅ Completado (mergeado en `main`) |
| MC-6       | ✅ Completado (mergeado en `main`) |
| MC-7       | ✅ Completado (mergeado en `main`) |
| MC-8       | ✅ Completado (mergeado en `main`) |
| MC-9       | ✅ Completado (mergeado en `main`) |
| MC-10      | ✅ Completado (mergeado en `main`) |
| MC-10.5A   | ✅ Completado (mergeado en `main`) |
| MC-10.5B   | ✅ Completado (mergeado en `main`) |
| MC-10.5C   | ✅ Completado (mergeado en `main`) |
| MC-10.5D   | ✅ Completado (mergeado en `main`) |
| MC-WEB-1   | ✅ Completado (mergeado en `main`) |
| MC-WEB-2   | ✅ Completado (desplegado en Railway) |
| MC-WEB-3   | ✅ Completado (mergeado en `main`) |
| MC-API-CORS-CODE | ✅ Completado (mergeado en `main`) |
| MC-MIPULSO-1 | ✅ Completado (mergeado en `main`) |
| MC-PATIENT-ID-1 | ✅ Completado (mergeado en `main`) |
| MC-MIPULSO-2 | ✅ Completado (mergeado en `main`) |
| MC-MIPULSO-RWY-0 | ✅ Completado (mergeado en `main`) |
| MC-MIPULSO-FE-1  | ✅ Completado (mergeado en `main`) |
| MC-RWY-0   | ✅ Completado (mergeado en `main`) |
| MC-RWY-1   | ✅ Completado (operativo en Railway) |
| MC-RWY-2   | ✅ Completado (mergeado en `main`) |
| Deploy Mi Pulso, dominio, MC-11, MC-12 | Pendientes |

> **MC-MIPULSO-FE-1 completado.** Fix frontend: `usePatientAuth.login()` ahora
> llama `client.getMe()` después del login para obtener `patientId` desde
> `/auth/me` (antes usaba `response.user` de `POST /auth/login`, que no incluye
> `patientId`). Con esto la vista Hoy carga desde `GET /patients/:id/today` sin
> quedar atascada en "Cargando tu día...".
> Docs: [`../decisiones/0026-mi-pulso-fe-fix-patient-id-login.md`](../decisiones/0026-mi-pulso-fe-fix-patient-id-login.md).
> Queda pendiente el **redeploy de `mi-pulso-web`** en Railway para que el fix
> llegue a producción (`NEXT_PUBLIC_*` se inlinan en build → requiere rebuild).
> MC-MIPULSO-FE-1 completado. Mi Pulso ya obtiene patientId desde /auth/me después del login. Queda pendiente redeploy de mi-pulso-web para llevar el fix a producción. No se avanza a dominio, Play Store, MC-11 ni MC-12 sin una nueva indicación explícita.
