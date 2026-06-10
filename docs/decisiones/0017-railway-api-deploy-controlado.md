# ADR 0017 — Deploy controlado de `api` en Railway (MC-RWY-1)

**Estado:** Aceptado  
**Microciclo:** MC-RWY-1  
**Fecha:** 2026-06-10

---

## Contexto

MC-RWY-0 dejó documentada la preparación repo-side (comandos, variables, orden de pasos).
El proyecto Railway `pulso-nutricional` tiene Postgres online, pero el servicio `api` estaba offline
sin repo conectado. MC-RWY-1 ejecuta la configuración y el deploy **solo de `api`**, dejando
las web apps (`pulso-nutricional-web`, `mi-pulso-web`) sin desplegar e intactas.

## Decisión

Desplegar el servicio `api` en Railway de forma **manual controlada** desde el dashboard,
verificando cada paso:

1. **Conectar repo** (`szlapakariel-ux/pulso-nutricional-app`, rama `main`) al servicio `api`.
2. **Configurar build/start** (Turbo, monorepo-aware).
3. **Cargar variables** (`PULSO_DATA_SOURCE=prisma`, auth demo, etc.).
4. **Preparar DB demo** (`db:push` + `db:seed`) desde local.
5. **Desplegar solo `api`** (no web apps).
6. **Verificar** health check + auth + endpoints con token.

### Principios aplicados

1. **Manual + controlado.** Sin auto-deploy; cada paso confirmado.
2. **No autoexpande.** Web apps no se despliegan aunque el repo tenga sus servicios.
3. **Secretos en Railway.** `JWT_SECRET` generado dentro de Railway; nunca en chat/logs.
4. **DB demo idempotente.** `db:seed` usa upsert con UUIDs fijos.
5. **Verificación post-deploy.** Todos los endpoints clave testeados con y sin token.

### Configuración final

| Aspecto | Valor |
|---------|-------|
| **Repo** | `szlapakariel-ux/pulso-nutricional-app` |
| **Rama** | `main` |
| **Root Directory** | `/` (raíz, monorepo) |
| **Install** | `pnpm install --frozen-lockfile` |
| **Build** | `pnpm turbo run build --filter=@pulso/api` |
| **Start** | `pnpm --filter @pulso/api start` |
| **DB** | Postgres Railway (demo schema + seed) |
| **PULSO_DATA_SOURCE** | `prisma` |
| **PULSO_AUTH_MODE** | `demo` |
| **PULSO_AUTH_ENFORCEMENT** | `demo` |
| **NODE_ENV** | `production` |
| **JWT_SECRET** | (generado en Railway) |
| **DATABASE_URL** | (referencia interna Postgres) |
| **URL pública** | `https://api-production-42e99.up.railway.app` |

### Datos demo insertados

Seed de Prisma incluyó:

- 1 usuario profesional (email: `profesional-demo@pulsonutricional.demo`).
- 3 usuarios pacientes (`paciente-demo-{uno,dos,tres}@pulsonutricional.demo`).
- Planes, agenda, logs revisables (estado `pending`).
- Todo ficticio, UUIDs fijos (idempotente).

### Verificación post-deploy

| Endpoint | Token | Esperado | Resultado |
|----------|-------|----------|-----------|
| `/health` | No | 200 | ✅ 200 |
| `/patients` | No | 401 | ✅ 401 |
| `/auth/login` | No | 200 + JWT | ✅ 200 |
| `/auth/me` | Profesional | 200 | ✅ 200 |
| `/patients` | Profesional | 200 | ✅ 200 |
| `/patients/:id` | Profesional | 200 | ✅ 200 |
| `/patients/:id/meal-plan` | Profesional | 200 | ✅ 200 |
| `/patients/:id/agenda` | Profesional | 200 | ✅ 200 |
| `/patients` | Token inválido | 401 | ✅ 401 |

## Consecuencias

- **Positivo:** La API está viva en producción Railway, conectada a Postgres demo.
- **Positivo:** Guards de rol (`PULSO_AUTH_ENFORCEMENT=demo`) activos; pacientes no acceden
  endpoints profesionales.
- **Positivo:** Auth demo funcional; flujo JWT verificado.
- **Positivo:** Web apps sin desplegar; pueden seguir locales con mocks hasta decisión
  explícita de conectarlas.
- **Neutral:** UUIDs Prisma en producción (no `demo-1` de mocks); aplicaciones locales siguen
  con mocks (paridad temporal).
- **Neutral:** `*.up.railway.app` público; dominio propio todavía no conectado.

## Brechas vigentes

1. **Apps web no consumen la API.** Muestran mocks locales; no hay cliente HTTP ni
   `NEXT_PUBLIC_API_BASE_URL`.
2. **Sin auth persistente en User.** Credenciales demo en memoria; `passwordHash` pendiente.
3. **Sin monitoreo.** Health check manual; sin alertas ni logs centralizados.

## Límites explícitos

- **No toca** web apps, dominio, OAuth, SSO, MFA.
- **No expone** secretos.
- **No ejecuta** datos reales.
- **No destruye** Postgres.

## Próximo paso recomendado

**Tres opciones mutuamente excluyentes** (elegir una):

1. **Opción A:** Conectar web profesional a la API (`NEXT_PUBLIC_API_BASE_URL`).
2. **Opción B:** Preparar MC-11 (mobile reducido).
3. **Opción C:** Documentar playbook de monitoreo operativo.

> **Freno aquí.** No se avanza a web apps, dominio, MC-11 ni MC-12 sin autorización
> explícita.
