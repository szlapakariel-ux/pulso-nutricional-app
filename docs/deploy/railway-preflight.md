# Railway Preflight — Preparación para deploy controlado (MC-RWY-0)

> **Estado: PREPARACIÓN. No ejecutado.**
> Este documento describe cómo un futuro agente Railway podría conectar y
> desplegar los servicios **de forma controlada**. **Nada de lo aquí descrito
> se ha ejecutado.** No hay deploy, no hay conexión de repo, no hay variables
> cargadas, no hay dominio. Ver la sección **"No ejecutar todavía"**.

---

## 1. Contexto y alcance

El proyecto Railway `pulso-nutricional` ya existe con estos servicios:

| Servicio                  | Rol                          | Estado actual (checkpoint read-only) |
|---------------------------|------------------------------|--------------------------------------|
| `Postgres`                | Base de datos única          | **online**                           |
| `api`                     | API común (Fastify)          | offline · sin repo · sin variables   |
| `pulso-nutricional-web`   | Panel profesional (Next.js)  | offline · sin repo · sin variables   |
| `mi-pulso-web`            | PWA del paciente (Next.js)   | offline · sin repo · sin variables   |

El objetivo de MC-RWY-0 es **dejar documentado y ordenado** todo lo necesario
para un deploy futuro: comandos reales (verificados contra `package.json`),
variables por servicio, orden de pasos, checks y rollback. **No autoriza** el
deploy en sí.

### Características del repo relevantes para el deploy

- **Monorepo pnpm + Turborepo.** `pnpm-workspace.yaml` declara `apps/*` y
  `packages/*`.
- Node `>=20`, pnpm `>=10` (ver `engines` en `package.json` raíz).
- `packageManager`: `pnpm@10.33.0`.
- Root `package.json` declara `pnpm.onlyBuiltDependencies` para permitir el
  build de Prisma (`@prisma/client`, `@prisma/engines`, `prisma`).
- La API (`@pulso/api`) importa de `@pulso/shared` (`workspace:*`): **shared
  debe compilarse antes que la API**. Turbo lo resuelve con `dependsOn: ["^build"]`.
- Las apps web hoy **usan mocks locales** (`app/*.mock.ts`) y **no consumen la
  API**. No tienen variable de API base URL ni llamadas `fetch`. Ver
  **Brechas detectadas**.

---

## 2. Servicio `api`

Fuente: `packages/api/package.json`.

```jsonc
"scripts": {
  "build": "prisma generate && tsc -p tsconfig.json",
  "start": "node dist/server.js",
  "db:push": "prisma db push",
  "db:seed": "node --experimental-transform-types prisma/seed.ts"
}
```

El servidor (`packages/api/src/server.ts`) escucha en:

```ts
const HOST = process.env["HOST"] ?? "0.0.0.0";
const PORT = Number(process.env["PORT"] ?? 3001);
```

→ Respeta `PORT` y `HOST` del entorno. Railway inyecta `PORT` automáticamente;
escuchar en `0.0.0.0` es lo correcto para Railway.

### Configuración recomendada (futura)

| Parámetro          | Valor recomendado |
|--------------------|-------------------|
| Root directory     | Raíz del repo (monorepo). **No** `packages/api` aislado, porque el build necesita el workspace para compilar `@pulso/shared`. |
| Install command    | `pnpm install --frozen-lockfile` |
| Build command      | `pnpm turbo run build --filter=@pulso/api` (Turbo compila `@pulso/shared` antes vía `^build`, y `prisma generate` corre dentro del build de la API) |
| Start command      | `pnpm --filter @pulso/api start` (equivale a `node packages/api/dist/server.js`) |
| Healthcheck path   | `GET /health` |

> Nota: el build de la API ejecuta `prisma generate`, por lo que el cliente
> Prisma se genera en cada build. No requiere `DATABASE_URL` para generar
> (sí para `db:push` / `db:seed`).

### Variables de entorno — servicio `api`

> ⚠️ **Sin valores reales.** Los valores concretos (especialmente `JWT_SECRET`
> y `DATABASE_URL`) se generan/referencian en Railway, nunca se hardcodean ni
> se commitean.

| Variable               | Requerida | Valor recomendado (deploy demo controlado) | Notas |
|------------------------|-----------|--------------------------------------------|-------|
| `DATABASE_URL`         | Sí (si `PULSO_DATA_SOURCE=prisma`) | Referencia al Postgres de Railway | Usar referencia de variable de Railway (`${{Postgres.DATABASE_URL}}`), no pegar la cadena. |
| `PULSO_DATA_SOURCE`    | Sí        | `prisma`                                   | `mock` por default en el código. Para usar la DB del deploy → `prisma`. Sin fallback silencioso: si es `prisma`, la DB debe estar disponible. |
| `PULSO_AUTH_MODE`      | Sí        | `demo`                                     | `off` por default. `demo` habilita login JWT. |
| `PULSO_AUTH_ENFORCEMENT` | Sí      | `demo`                                     | `off` por default. Solo tiene efecto si además `PULSO_AUTH_MODE=demo`. Activa guards por rol. |
| `JWT_SECRET`           | Sí (si `PULSO_AUTH_MODE=demo` + `NODE_ENV=production`) | **Secreto real generado en Railway** | Con `NODE_ENV=production` y auth demo, el código **exige** `JWT_SECRET` (lanza error si falta). Nunca hardcodear. |
| `NODE_ENV`             | Sí        | `production`                               | Activa la validación estricta de `JWT_SECRET`. |
| `PORT`                 | Gestionada por Railway | (inyectada por Railway) | El código respeta `process.env.PORT`. No fijarla manualmente salvo necesidad. |

Variables opcionales:

| Variable     | Default código | Notas |
|--------------|----------------|-------|
| `HOST`       | `0.0.0.0`      | Dejar el default; Railway requiere `0.0.0.0`. |
| `LOG_LEVEL`  | `info`         | Ajustable (`debug`, `warn`, etc.). |

### Checks post-deploy — `api`

1. `GET /health` → `200` con `{ data: { status: "ok", ... } }`.
2. `POST /auth/login` con credencial demo profesional → `200` con token (valida
   `PULSO_AUTH_MODE=demo`).
3. `GET /patients` **sin token** → `401` (valida `PULSO_AUTH_ENFORCEMENT=demo`).
4. `GET /patients` **con token profesional** → `200` (valida lectura + guard).
5. Revisar logs de arranque: `API escuchando en http://0.0.0.0:<PORT>`.

---

## 3. Servicio `pulso-nutricional-web` (panel profesional)

Fuente: `apps/pulso-nutricional-web/package.json`.

```jsonc
"scripts": {
  "build": "next build",
  "start": "next start",
  "type-check": "tsc --noEmit"
}
```

### Estado actual del consumo de datos

> 🔴 **Hoy esta app usa mocks locales** (`app/patients.mock.ts`,
> `app/consultations.mock.ts`, `app/meal-plans.mock.ts`, `app/activity.mock.ts`).
> **No consume la API real.** No hay `fetch`, no hay variable de API base URL,
> no hay lógica de cliente HTTP. Un deploy de esta app hoy mostraría datos
> ficticios renderizados localmente, **independiente del servicio `api`**.

### Configuración recomendada (futura)

| Parámetro       | Valor recomendado |
|-----------------|-------------------|
| Root directory  | Raíz del repo (monorepo) |
| Install command | `pnpm install --frozen-lockfile` |
| Build command   | `pnpm turbo run build --filter=@pulso/pulso-nutricional-web` |
| Start command   | `pnpm --filter @pulso/pulso-nutricional-web start` |

### Variables de entorno — `pulso-nutricional-web`

| Variable                  | Requerida hoy | Notas |
|---------------------------|---------------|-------|
| `NODE_ENV`                | Recomendada `production` | Estándar Next.js. |
| `PORT`                    | Gestionada por Railway | `next start` respeta `PORT`. |
| `NEXT_PUBLIC_API_BASE_URL`| **No existe todavía** | 🔴 **Brecha:** la app no consume la API. Cuando se implemente el consumo real, se necesitará una variable pública (ej. `NEXT_PUBLIC_API_BASE_URL`) apuntando a la URL del servicio `api`. Hoy **no** definir nada: no haría efecto. |

### Checks post-deploy — `pulso-nutricional-web`

1. La home carga y renderiza el panel con datos demo.
2. Confirmar (esperado en este estado) que **no** hay llamadas a la API.
3. Revisar logs de build/start de Next.js sin errores.

---

## 4. Servicio `mi-pulso-web` (PWA del paciente)

Fuente: `apps/mi-pulso-web/package.json`.

```jsonc
"scripts": {
  "build": "next build",
  "start": "next start",
  "type-check": "tsc --noEmit"
}
```

### Estado actual del consumo de datos

> 🔴 **Hoy esta app usa mocks locales** (`app/today.mock.ts`,
> `app/activity.mock.ts`). **No consume la API real.** Mismo escenario que el
> panel profesional: sin `fetch`, sin API base URL, sin cliente HTTP.

### Configuración recomendada (futura)

| Parámetro       | Valor recomendado |
|-----------------|-------------------|
| Root directory  | Raíz del repo (monorepo) |
| Install command | `pnpm install --frozen-lockfile` |
| Build command   | `pnpm turbo run build --filter=@pulso/mi-pulso-web` |
| Start command   | `pnpm --filter @pulso/mi-pulso-web start` |

### Variables de entorno — `mi-pulso-web`

| Variable                  | Requerida hoy | Notas |
|---------------------------|---------------|-------|
| `NODE_ENV`                | Recomendada `production` | Estándar Next.js. |
| `PORT`                    | Gestionada por Railway | `next start` respeta `PORT`. |
| `NEXT_PUBLIC_API_BASE_URL`| **No existe todavía** | 🔴 **Brecha:** igual que el panel. Hasta implementar el consumo real de la API, no definir nada. |

### Checks post-deploy — `mi-pulso-web`

1. La pantalla **Hoy** carga y renderiza con datos demo.
2. Confirmar (esperado) que **no** hay llamadas a la API.
3. Revisar logs de build/start de Next.js sin errores.

---

## 5. Postgres

- Ya **online** en Railway.
- La API lo consume **solo** con `PULSO_DATA_SOURCE=prisma` + `DATABASE_URL`
  referenciada desde el servicio Postgres.
- **No tocar** sin autorización: no `db:push`, no `db:seed`, no migraciones
  destructivas (ver secciones siguientes).

---

## 6. No ejecutar todavía

🚫 Hasta nueva autorización explícita, **NO**:

- **No deploy** de ningún servicio.
- **No conectar** el repo de GitHub a Railway.
- **No** cargar variables reales en Railway.
- **No** `db:push` contra el Postgres de Railway (producción).
- **No** `db:seed` contra Railway sin autorización explícita.
- **No** activar auto-deploy / deploy on push.
- **No** conectar dominio personalizado.
- **No** crear secretos reales fuera de Railway.
- **No** restart / redeploy de servicios.

---

## 7. Orden recomendado (futuro, cuando se autorice)

> Secuencia controlada, un paso a la vez, verificando antes de avanzar.

1. **Conectar repo** del monorepo al servicio `api`.
2. **Configurar variables** del servicio `api` (sección 2), con `JWT_SECRET`
   generado en Railway y `DATABASE_URL` referenciada desde Postgres.
3. **Deploy `api`** con build/start de la sección 2.
4. **Health check**: `GET /health` → `200`.
5. **`db:push` controlado** (una sola vez, con autorización): sincroniza el
   schema con el Postgres de Railway. Verificar que no haya datos previos que
   se pisen.
6. **`db:seed` demo controlado** (con autorización): inserta datos ficticios
   demo idempotentes.
7. **Verificar endpoints clave** con token (sección "Checks post-deploy" de `api`).
8. **Deploy `pulso-nutricional-web`** (panel profesional). *(Recordar: hoy usa
   mocks; no consume la API hasta resolver la brecha de la sección 9.)*
9. **Deploy `mi-pulso-web`** (PWA paciente). *(Mismo recordatorio.)*
10. **Revisar logs** de los tres servicios; confirmar arranque limpio.

---

## 8. Rollback

Si algo falla durante un deploy futuro:

1. **Apagar el servicio** afectado en Railway (volver a offline).
2. **Volver `PULSO_DATA_SOURCE=mock`** en `api` → la API deja de depender del
   Postgres y vuelve al comportamiento con mocks (no requiere `DATABASE_URL`).
3. **Volver `PULSO_AUTH_ENFORCEMENT=off`** (y/o `PULSO_AUTH_MODE=off`) → los
   endpoints dejan de exigir token; comportamiento previo a la protección.
4. **Revisar logs** para diagnosticar la causa antes de reintentar.
5. **No tocar Postgres** (no borrar tablas, no migraciones destructivas) salvo
   autorización explícita.

> Estas tres variables (`PULSO_DATA_SOURCE`, `PULSO_AUTH_MODE`,
> `PULSO_AUTH_ENFORCEMENT`) son los interruptores de seguridad: revertirlas
> devuelve la API al comportamiento base sin redeploy de código.

---

## 9. Brechas detectadas

| # | Brecha | Impacto | Acción futura sugerida |
|---|--------|---------|------------------------|
| 1 | Apps web **no consumen la API** (usan mocks locales). | Un deploy web hoy no refleja datos reales de la API ni del Postgres. | Implementar cliente HTTP + `NEXT_PUBLIC_API_BASE_URL` en un MC dedicado antes de un deploy "integrado". |
| 2 | No existe variable de API base URL en ninguna app. | Sin punto de configuración para apuntar al `api` desplegado. | Definir `NEXT_PUBLIC_API_BASE_URL` cuando se implemente el consumo (brecha 1). |
| 3 | `User` (Prisma) **no tiene `passwordHash`**; credenciales demo viven en memoria. | El login demo no es apto para datos reales/producción. | Agregar `passwordHash` + hashing (bcrypt/argon2) en un MC de auth previo a producción real. |
| 4 | No hay archivos de config de Railway en el repo (`railway.json`/`nixpacks.toml`). | El build/start se define en el dashboard de Railway, no versionado. | Opcional: versionar `railway.json` por servicio en un MC futuro si se quiere config-as-code. **No** agregado en MC-RWY-0 (sería potencialmente disruptivo / fuera de alcance). |
| 5 | `package.json#prisma.seed` está deprecated en Prisma 6 (→ `prisma.config.ts` en Prisma 7). | Solo warning; sin impacto funcional. | Migrar en un MC de mantenimiento antes de subir a Prisma 7. |

---

## 10. Riesgos detectados

| Riesgo | Mitigación |
|--------|------------|
| `PULSO_DATA_SOURCE=prisma` sin `DATABASE_URL` válida → la API falla sin fallback. | Configurar `DATABASE_URL` (referencia Postgres) **antes** de poner `prisma`. Si hay duda, dejar `mock`. |
| `JWT_SECRET` ausente con `NODE_ENV=production` + `PULSO_AUTH_MODE=demo` → arranque falla (por diseño). | Generar `JWT_SECRET` en Railway antes del deploy. |
| `db:push` sobre un Postgres con datos → posible pérdida/conflicto de schema. | Ejecutar solo con autorización, una vez, verificando estado previo. |
| Deploy web da falsa sensación de "integración" (en realidad muestra mocks). | Comunicar claramente el estado (brechas 1–2) antes de cualquier demo. |
| Hardcodear secretos en `.env`/repo. | **Prohibido.** Secretos solo en Railway; `.env` nunca se commitea. |
| Build de un servicio aislado sin el workspace → falla por `@pulso/shared` no compilado. | Usar root del repo + Turbo (`--filter`), que compila dependencias primero. |

---

## 11. Próximo paso recomendado

- Si se prioriza **backend**: autorizar un `MC-RWY-1` para conectar y desplegar
  **solo el servicio `api`** (con health check + `db:push`/`db:seed` controlados),
  dejando las apps web para después.
- Si se prioriza **integración web**: resolver primero la **brecha 1** (consumo
  de API en las apps + `NEXT_PUBLIC_API_BASE_URL`) en un MC de producto, y luego
  desplegar.

> **Freno aquí. No se avanza a Railway setup ni MC-11 sin autorización.**
