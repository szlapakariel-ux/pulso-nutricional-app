# ADR 0023 — Exponer patientId en GET /auth/me (MC-PATIENT-ID-1)

**Estado:** Aceptado
**Microciclo:** MC-PATIENT-ID-1
**Fecha:** 2026-06-10

---

## Contexto

MC-MIPULSO-1 conectó Mi Pulso a la API Railway en modo lectura inicial. Quedó
un bloqueo documentado: `GET /auth/me` devuelve el `id` del usuario (userId del
JWT), no el `patientId` del paciente. Para llamar a
`GET /patients/:patientId/today`, Mi Pulso necesitaba el patientId.

Como solución provisional, MC-MIPULSO-1 replicó en el frontend el mapping demo
`userId → patientId` que ya existía en el guard del backend
(`packages/api/src/middleware/auth-guards.ts → DEMO_USER_TO_PATIENT_ID`).
Ese mapping frontend quedó documentado como bloqueo conocido a resolver.

MC-PATIENT-ID-1 resuelve el bloqueo: la API ahora expone el `patientId` en la
respuesta de `GET /auth/me`, y el mapping temporal del frontend se elimina.

## Decisión

Añadir `patientId?: string` a `AuthUser` (`@pulso/shared`) y poblarlo en el
controlador de `GET /auth/me` para usuarios con rol `patient`, usando el mismo
`DEMO_USER_TO_PATIENT_ID` que ya existía en el guard.

### Componentes modificados

| Archivo | Cambio |
|---------|--------|
| `packages/shared/src/types/auth.ts` | `AuthUser` agrega `patientId?: string`. |
| `packages/api/src/middleware/auth-guards.ts` | `DEMO_USER_TO_PATIENT_ID` pasa a ser `export`. |
| `packages/api/src/controllers/auth.controller.ts` | `meController` importa el mapping y lo incluye en la respuesta cuando `role === "patient"`. |
| `apps/mi-pulso-web/app/hoy-view.tsx` | `loadToday` recibe `patientId` directamente desde `auth.user.patientId`; se eliminó la llamada a `resolveDemoPatientId`. |
| `apps/mi-pulso-web/lib/patient-mapping.ts` | **Eliminado.** Ya no se necesita. |

### Invariantes mantenidos

- `patientId` es **opcional** en `AuthUser`: profesionales no tienen patientId
  y el campo simplemente no aparece en su respuesta de `/auth/me`.
- El mapping sigue siendo el mismo `DEMO_USER_TO_PATIENT_ID` del guard
  (no se inventan IDs ni se duplica lógica en un nuevo lugar).
- Si en el futuro la API pasa a leer el patientId desde la DB (Prisma), el
  cambio es local al controlador; `AuthUser` y el frontend no cambian.
- El JWT no incluye `patientId` (el JWT solo lleva `id`, `email`, `role`).
  El mapping se aplica en el controlador al construir la respuesta, no al
  firmar el token.

## Verificación

| Check | Resultado |
|-------|-----------|
| `pnpm type-check` | ✅ |
| `pnpm build` | ✅ |
| `pnpm lint` | ✅ |
| `patient-mapping.ts` eliminado | ✅ |
| `hoy-view.tsx` sin import de `resolveDemoPatientId` | ✅ |

**Límite del entorno:** el flujo real contra Railway no se puede ejecutar desde
el entorno remoto de Claude Code (egress bloqueado, ver ADR 0018). La
verificación end-to-end debe hacerse desde un entorno con acceso de red o tras
desplegar la API con el nuevo código.

## Próximo paso recomendado

Cuando la API use Prisma en lugar de mocks demo, el controlador de `GET /auth/me`
debería leer el `patientId` desde la base de datos (tabla `Patient` donde
`userId` sea el id del usuario autenticado). El contrato de `AuthUser` y el
frontend no necesitan cambiar.
