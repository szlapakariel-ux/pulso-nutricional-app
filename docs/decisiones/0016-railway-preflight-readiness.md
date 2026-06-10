# ADR 0016 — Preflight de readiness para deploy Railway (MC-RWY-0)

**Estado:** Aceptado
**Microciclo:** MC-RWY-0
**Fecha:** 2026-06-10

---

## Contexto

Tras MC-10.5D, la API tiene tres interruptores de configuración por entorno
(`PULSO_DATA_SOURCE`, `PULSO_AUTH_MODE`, `PULSO_AUTH_ENFORCEMENT`), Prisma listo
y guards por rol. El proyecto Railway `pulso-nutricional` existe con Postgres
online, pero los servicios `api`, `pulso-nutricional-web` y `mi-pulso-web` están
offline, sin repo conectado, sin variables y sin comandos de build/start.

Antes de cualquier deploy real conviene **ordenar comandos, variables, orden de
pasos, checks y rollback** para que un futuro agente Railway no improvise. Este
ciclo es **preparación repo-side**, no ejecución.

## Decisión

Crear documentación de preflight **sin tocar Railway ni el runtime**:

- `docs/deploy/railway-preflight.md` — guía operativa completa por servicio:
  root directory, install/build/start recomendados (verificados contra los
  `package.json` reales), variables requeridas/opcionales, checks post-deploy,
  sección "No ejecutar todavía", orden recomendado, rollback, brechas y riesgos.
- Este ADR, que registra la decisión y sus límites.

### Principios aplicados

1. **No inventar comandos.** Todos los build/start recomendados derivan de los
   scripts reales en `package.json`:
   - `api`: `build = prisma generate && tsc`, `start = node dist/server.js`.
   - web (ambas): `build = next build`, `start = next start`.
2. **Monorepo-aware.** El build se recomienda desde la raíz del repo con Turbo
   (`pnpm turbo run build --filter=<pkg>`), porque `@pulso/api` depende de
   `@pulso/shared` compilado (`dependsOn: ["^build"]`).
3. **Secretos solo en Railway.** `JWT_SECRET` y `DATABASE_URL` se generan/
   referencian en Railway; nunca se hardcodean ni se commitean.
4. **Interruptores de seguridad documentados.** `PULSO_DATA_SOURCE=mock`,
   `PULSO_AUTH_MODE=off`, `PULSO_AUTH_ENFORCEMENT=off` permiten revertir el
   comportamiento sin redeploy de código (base del rollback).

### Valores recomendados para un futuro deploy demo controlado (`api`)

| Variable | Valor |
|---|---|
| `PULSO_DATA_SOURCE` | `prisma` |
| `PULSO_AUTH_MODE` | `demo` |
| `PULSO_AUTH_ENFORCEMENT` | `demo` |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | secreto real generado en Railway (no hardcodear) |
| `DATABASE_URL` | referencia al Postgres de Railway (no pegar la cadena) |
| `PORT` | gestionada por Railway (el código respeta `process.env.PORT`) |

## Brechas registradas

1. Las apps web **no consumen la API** (usan mocks locales `app/*.mock.ts`); no
   hay cliente HTTP ni variable de API base URL.
2. No existe `NEXT_PUBLIC_API_BASE_URL` (consecuencia de la brecha 1).
3. `User` no tiene `passwordHash`; credenciales demo en memoria.
4. No hay config de Railway versionada (`railway.json`/`nixpacks.toml`) — se
   deja en el dashboard por ahora; versionarla sería un MC futuro opcional.
5. `package.json#prisma.seed` deprecated (Prisma 7 → `prisma.config.ts`).

## Consecuencias

- **Positivo:** Un futuro agente Railway tiene comandos, variables, orden y
  rollback explícitos y verificados; menos riesgo de improvisación.
- **Positivo:** Cero cambios de runtime; el comportamiento actual queda intacto.
- **Neutral:** La documentación quedará desactualizada si cambian los scripts;
  debe revisarse al implementar el consumo real de API (brechas 1–2).
- **Negativo:** El deploy "integrado" (web ↔ API) no es posible hasta resolver
  las brechas 1–2 en un MC de producto dedicado.

## Límites explícitos (qué NO hace este MC)

- No toca Railway, no conecta repo, no carga variables, no hace deploy/redeploy/
  restart, no toca Postgres (`db:push`/`db:seed`), no crea dominio, no conecta
  UI con API, no cambia runtime, no avanza a MC-11.
- No agrega archivos de configuración de Railway al repo (evita cambios
  potencialmente disruptivos fuera de alcance).

## Próximo paso recomendado

- `MC-RWY-1` (con autorización): conectar y desplegar **solo `api`** con health
  check y `db:push`/`db:seed` controlados; **o** primero resolver el consumo
  real de API en las apps web si se prioriza la integración.

> **Freno aquí. No se avanza a Railway setup ni MC-11 sin autorización.**
