# ADR 0022 — Mi Pulso: lectura inicial desde la API Railway (MC-MIPULSO-1)

**Estado:** Aceptado
**Microciclo:** MC-MIPULSO-1
**Fecha:** 2026-06-10

---

## Contexto

MC-WEB-1/2/3 conectaron la **web profesional** a la API Railway y la dejaron
desplegada y verificada. **Mi Pulso** (`apps/mi-pulso-web`, app del paciente)
seguía usando exclusivamente mocks locales (`today.mock.ts`).

MC-MIPULSO-1 conecta Mi Pulso a la API Railway en **modo lectura inicial** para
el paciente demo, manteniendo el modo mock como default y como fallback seguro.

Es una integración sensible porque introduce, por primera vez en la app del
paciente: login de paciente, token JWT, endpoints protegidos y la separación
profesional/paciente a nivel de cliente.

## Decisión

Replicar en Mi Pulso el patrón de cliente API ya establecido en la web
profesional (MC-WEB-1), adaptado a los endpoints del paciente y **solo
lectura**.

### Componentes creados (todos en `apps/mi-pulso-web`)

| Archivo | Rol |
|---------|-----|
| `lib/data-config.ts` | Modo `mock` (default) vs `api` desde variables `NEXT_PUBLIC_*`. |
| `lib/api-client.ts` | Cliente HTTP mínimo: `login`, `getMe`, `getToday`. Bearer token. |
| `lib/use-patient-auth.ts` | Hook de login demo paciente + token en `localStorage`. |
| `lib/patient-mapping.ts` | Mapping demo `userId → patientId` (ver bloqueo abajo). |
| `app/today-content.tsx` | Presentación compartida de plan + agenda (mock y api). |
| `app/hoy-view.tsx` | Orquestador: rama mock (selector demo) vs api (login + API). |

### Variables frontend

- `NEXT_PUBLIC_PULSO_DATA_MODE` — `mock` (default) | `api`.
- `NEXT_PUBLIC_PULSO_API_BASE_URL` — base de la API (requerida en modo api).

Si `DATA_MODE` no existe → `mock`. Si `DATA_MODE=api` sin `API_BASE_URL` →
fallback a `mock` con warning.

### Endpoints consumidos (solo lectura)

- `POST /auth/login` — login demo paciente.
- `GET /auth/me` — usuario del token.
- `GET /patients/:patientId/today` — vista Hoy (plan + agenda).

### Principios aplicados

1. **Solo lectura.** Ninguna escritura (sin registros de comidas, peso,
   actividad ni notas). El módulo Registrar no se conecta a la API en este ciclo.
2. **Mock por default.** La experiencia previa no se rompe; el modo mock es
   idéntico al anterior (selector demo + mocks locales).
3. **Sin mezclar orígenes.** En una misma vista los datos son 100% mock o 100%
   API. `TodayContent` recibe un único `view` ya resuelto.
4. **Token nunca expuesto completo.** No se imprime en UI ni en logs.
5. **Manejo de errores.** 401 → limpia sesión y pide login; error de red →
   mensaje claro sin romper la pantalla; 404 de `/today` → mensaje explícito.
6. **Indicador de modo siempre visible:** `Modo mock`, `Conectado a API`,
   `Sesión demo paciente`, `Error de conexión`.

## 🔴 Bloqueo conocido: la API no expone el `patientId` del paciente

`GET /auth/me` devuelve `{ id, email, role }`, donde `id` es el **userId** del
JWT (p. ej. `d0000000-…011`), **no** el `patientId` (`demo-1`). El tipo
`AuthUser` (`@pulso/shared`) no incluye `patientId`. El mapping real
`userId → patientId` vive solo en el guard del backend
(`packages/api/src/middleware/auth-guards.ts → DEMO_USER_TO_PATIENT_ID`).

Para llamar a `GET /patients/:patientId/today` Mi Pulso necesita el patientId.

**Decisión (dentro del alcance del ciclo):** replicar en el frontend ese mismo
mapping demo **documentado** (`lib/patient-mapping.ts`), sin inventar IDs (son
los IDs ficticios del seed/guard). Así el demo funciona end-to-end sin tocar el
backend. La regla del ciclo lo permite explícitamente: *"no inventar un ID
hardcodeado **sin documentarlo**"*.

**Fix correcto (fuera de MC-MIPULSO-1):** la API debería exponer el patientId
del paciente autenticado — por ejemplo `/auth/me` devolviendo `patientId`, o un
endpoint `/patients/me`. Cuando exista, el mapping del frontend se elimina.

## Verificación

| Check | Resultado |
|-------|-----------|
| `pnpm type-check` | ✅ |
| `pnpm build` (mock y api) | ✅ |
| `pnpm lint` | ✅ |
| Modo mock — homepage | ✅ Badge "Modo mock", selector demo, banner ficticio, plan+agenda |
| Modo api — homepage sin token | ✅ Badge "Conectado a API", formulario login demo paciente |
| Modo api — sin marcadores mock | ✅ No aparece "selector demo" ni "Modo mock" (sin mezcla) |

**Límite del entorno:** el flujo real `login → /auth/me → /today` contra
Railway **no se puede ejecutar desde el entorno remoto de Claude Code**: la
política de red bloquea llamadas salientes a URLs externas (egress proxy, ver
ADR 0018). La verificación end-to-end contra Railway debe hacerse desde un
entorno con acceso de red, o tras desplegar Mi Pulso (fuera de este ciclo).

## Límites explícitos

- Solo `apps/mi-pulso-web` (código) + documentación.
- No toca la web profesional (`apps/pulso-nutricional-web`).
- No toca el backend API (código), Railway, Postgres, Prisma ni seed.
- No escritura (sin registros del paciente, sin review queue).
- No deploy de Mi Pulso, no dominio propio.
- No avanza a MC-11.

## CORS

La API ya permite `localhost:3000/3001/8080`, así que el modo api funciona en
desarrollo local. Mi Pulso **todavía no está desplegado**: cuando se despliegue
en Railway habrá que **agregar su origen a la allowlist CORS de la API**
(variable `CORS_ORIGIN` / `PULSO_ALLOWED_ORIGINS`). Eso es un próximo ciclo;
no se toca CORS de producción aquí.

## Próximo paso recomendado

1. Exponer `patientId` desde la API para eliminar el mapping demo del frontend.
2. Verificar el flujo end-to-end contra Railway desde un entorno con red.
3. (Futuro) Desplegar Mi Pulso y ampliar la allowlist CORS.

> **Freno aquí.** No se avanza a deploy de Mi Pulso, dominio, MC-11 ni MC-12
> sin autorización explícita.
