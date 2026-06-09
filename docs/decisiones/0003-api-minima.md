# 0003 — API mínima

- **Estado:** Aceptada
- **Fecha:** 2026-06-09
- **Microciclo:** MC-2
- **Contexto:** con el monorepo técnico listo (MC-1), se necesita una API
  mínima que sirva como base verificable para los próximos microciclos. El
  objetivo es tener Fastify corriendo, un endpoint de salud, estructura de
  capas clara y los primeros tipos compartidos del dominio — sin conectar base
  de datos ni implementar lógica de negocio.

---

## Decisión

### Framework HTTP

- **Fastify 5** como framework HTTP de `@pulso/api`.
  - Primera clase en TypeScript.
  - Esquemas de validación/serialización nativos (JSON Schema / TypeBox).
  - Alta performance; buena integración con el ecosistema Node 22.
- El servidor **no se levanta al importar el paquete**: `buildApp()` crea la
  instancia Fastify, `server.ts` la arranca. Esto facilita el testing y evita
  efectos secundarios al importar.

### Endpoint implementado

- `GET /health` — devuelve `{ data: { status, service, version, timestamp, environment } }`.
  No accede a base de datos ni a servicios externos.

### Estructura de capas

```
packages/api/src/
  app.ts                          ← crea Fastify + registra rutas
  server.ts                       ← arranca el servidor (punto de entrada)
  index.ts                        ← exporta buildApp (sin arrancar)
  routes/
    health.routes.ts              ← declara GET /health
  controllers/
    health.controller.ts          ← maneja request/reply
  services/
    health.service.ts             ← lógica pura (sin side effects)
```

La separación rutas → controladores → servicios es la que se usará para todos
los endpoints de negocio en microciclos posteriores.

### Tipos compartidos en @pulso/shared

Se agregaron en `packages/shared/src/types/`:

- **`domain.ts`** — tipos que expresan la **regla central del producto**:
  - `DataOrigin`: `patient_reported` | `professional_validated`
  - `ReviewStatus`: `pending` | `reviewed` | `accepted` | `flagged`
  - `ReviewableData<T>`: envuelve datos del paciente con su estado de revisión
  - `ValidatedData<T>`: envuelve datos de la profesional
- **`health.ts`** — `HealthStatus`, `HealthResponse`
- **`api.ts`** — `ApiErrorResponse`

### Script `dev`

Se usa `node --watch --experimental-transform-types` para ejecutar TypeScript
directamente en Node 22 sin build intermedio durante desarrollo. No requiere
`ts-node` ni `tsx`.

---

## Deferidos (pendientes, NO implementados en MC-2)

- **Prisma + Postgres**: no hay schema, migraciones ni conexión a DB.
  Se introduce cuando se necesite persistencia real (MC-3+).
- **Railway**: los servicios existen pero el código no los conecta.
  Se integra cuando haya algo para desplegar.
- **Autenticación / autorización**: diferidos. La API no protege rutas todavía.
- **Endpoints de negocio**: pacientes, consultas, mediciones, planes, etc.
  Se implementan a partir de MC-3.
- **ESLint**: `lint` sigue siendo placeholder en todos los workspaces.

---

## Alcance de MC-2 (qué SÍ se hizo)

- Fastify 5 instalado en `@pulso/api`.
- `GET /health` con respuesta tipada.
- Estructura de capas (rutas, controladores, servicios).
- Tipos del dominio en `@pulso/shared` que expresan la regla central.
- `.env.example` documentando variables futuras (sin valores reales).
- ADR-0003.

## Qué quedó fuera de MC-2

Login, auth, roles, permisos, endpoints de negocio, Prisma, Postgres, Railway,
`.env` real, credenciales, datos reales, migraciones, workflows/CI, deploy,
conexión entre apps web y API. No se avanzó a MC-3.

---

## Consecuencias

- La separación `buildApp` / `server.ts` es un patrón que se mantiene en todos
  los microciclos. Cambiar esa separación requiere una nueva decisión.
- Los tipos de `domain.ts` son la fuente de verdad para la regla central.
  Cambiar `ReviewStatus` o `DataOrigin` impacta a toda la API y las apps.
- `@pulso/shared` ahora es una dependencia real de `@pulso/api`; los cambios
  de contrato en shared requieren actualizar api y viceversa.
