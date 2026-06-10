# ADR 0024 — Mi Pulso: smoke test y playbook de verificación API (MC-MIPULSO-2)

**Estado:** Aceptado
**Microciclo:** MC-MIPULSO-2
**Fecha:** 2026-06-10

---

## Contexto

MC-MIPULSO-1 conectó Mi Pulso a la API Railway en modo lectura inicial y
MC-PATIENT-ID-1 eliminó el mapping demo temporal del frontend. Ambos ciclos
se verificaron con `type-check`, `build` y `lint`, pero no se ejecutó el
flujo real contra la API Railway (el entorno remoto de Claude Code tiene egress
bloqueado, ver ADR 0018).

MC-MIPULSO-2 crea la herramienta de verificación repetible: un smoke test
automatizado para la cadena de API que usa Mi Pulso, y un playbook manual para
verificar el flujo completo en el navegador con Mi Pulso corriendo localmente.

## Decisión

Replicar el patrón de MC-WEB-3 (ADR 0021) adaptado al flujo del paciente:

### Componentes creados

| Archivo | Rol |
|---------|-----|
| `scripts/smoke-mi-pulso-railway.mjs` | Smoke test: verifica la cadena API de Mi Pulso sin dependencias externas. |
| `docs/deploy/mi-pulso-api-readonly-playbook.md` | Playbook: cómo arrancar Mi Pulso local en modo api y checklist de verificación manual en el navegador. |
| ADR 0024 (este archivo) | Documenta la decisión y sus límites. |

Script registrado en `package.json` raíz como `smoke:mi-pulso:railway`.

### Qué verifica el smoke test (7 checks)

| # | Verificación |
|---|-------------|
| 1 | `GET /health` → 200 |
| 2 | `POST /auth/login` (paciente demo) → 200 + token |
| 3 | `GET /auth/me` (con token) → 200 |
| 4 | `GET /auth/me` devuelve `patientId` (MC-PATIENT-ID-1) |
| 5 | `GET /patients/:patientId/today` → 200 |
| 6 | Vista Hoy contiene campo `date` |
| 7 | Vista Hoy contiene `plan` y/o `agendaItems` |

### Principios aplicados (consistentes con ADR 0021)

1. **Sin dependencias externas.** Solo `fetch` nativo de Node ≥ 18.
2. **Configurable por variable de entorno.** `PULSO_API_BASE_URL` con default
   a la URL de Railway.
3. **Credenciales ficticias documentadas.** `paciente-demo-uno@pulsonutricional.demo`
   / `demo-paciente-2026` — ya presentes en el repo.
4. **Token nunca impreso completo.** Solo se muestra el prefijo (`…`).
5. **Exit codes semánticos.** `0` = todo OK, `1` = algún fallo.
6. **Honesto sobre CORS.** El script lo documenta explícitamente: CORS lo aplica
   el navegador, no `fetch` de Node. La verificación de CORS es manual.
7. **Solo lectura.** No escribe ni modifica datos.

### Por qué el smoke test no verifica el frontend de Mi Pulso

Mi Pulso no está desplegado (está fuera del alcance de MC-MIPULSO-1/2). El
script solo puede verificar la cadena de API (backend Railway). La verificación
del frontend requiere correr Mi Pulso en local y abrir el navegador; eso está
en el playbook manual.

## Verificación

| Check | Resultado |
|-------|-----------|
| `pnpm type-check` | ✅ (no cambia TypeScript) |
| `pnpm build` | ✅ (no cambia TypeScript) |
| `pnpm lint` | ✅ (no cambia TypeScript) |
| Script registrado en `package.json` | ✅ |
| Script sin dependencias externas | ✅ (solo `fetch` nativo) |

**Límite del entorno:** el smoke test no corre desde el entorno remoto de
Claude Code (egress bloqueado, ver ADR 0018). Debe ejecutarse desde un entorno
con acceso de red o desde una máquina con conexión a Railway.

## Límites explícitos (MC-MIPULSO-2)

- Solo agrega script de smoke test, playbook y este ADR.
- No toca código de Mi Pulso ni de la API.
- No toca Railway, Postgres, Prisma schema, seed ni variables de producción.
- No hace deploy de Mi Pulso ni registra dominio propio.
- No avanza a MC-11 ni MC-12.

## Próximo paso recomendado

1. Verificar el smoke test desde un entorno con acceso de red:
   `pnpm smoke:mi-pulso:railway`
2. Verificar el flujo completo en el navegador siguiendo el playbook:
   `docs/deploy/mi-pulso-api-readonly-playbook.md`
3. (Futuro) Desplegar Mi Pulso en Railway y ampliar la allowlist CORS de la API.

> **Freno aquí.** No se avanza a deploy de Mi Pulso, dominio, MC-11 ni MC-12
> sin autorización explícita.
