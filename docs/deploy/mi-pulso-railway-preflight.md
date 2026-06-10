# Mi Pulso — Railway Preflight (deploy controlado en modo API)

> **Estado: PREPARACIÓN. No ejecutado.**
> Este documento describe cómo desplegar **Mi Pulso** (`apps/mi-pulso-web`) en
> Railway **en modo API** de forma controlada. **Nada de lo aquí descrito se ha
> ejecutado.** No hay deploy, no hay variables cargadas, no hay dominio. Ver la
> sección **"No ejecutar todavía"**.
>
> Ver [ADR 0025](../decisiones/0025-mi-pulso-railway-preflight.md). Complementa
> el preflight general [`railway-preflight.md`](./railway-preflight.md) (MC-RWY-0),
> que describía Mi Pulso cuando **todavía usaba mocks**. Desde MC-MIPULSO-1 y
> MC-PATIENT-ID-1, Mi Pulso **ya puede consumir la API real** en modo lectura.

---

## 1. Contexto y alcance

MC-MIPULSO-1 conectó Mi Pulso a la API Railway en modo lectura. MC-PATIENT-ID-1
hizo que `GET /auth/me` exponga `patientId`, eliminando el mapping demo del
frontend. MC-MIPULSO-2 dejó un smoke test (`smoke:mi-pulso:railway`) y un
playbook de verificación. **La cadena de datos del paciente ya funciona
end-to-end contra la API.**

Lo que falta para un deploy "real" de Mi Pulso es:
1. Configurar el servicio `mi-pulso-web` en Railway con build/start + variables.
2. **Ampliar la allowlist CORS de la API** para incluir el origen de Mi Pulso.

MC-MIPULSO-RWY-0 **solo documenta** esos pasos. **No autoriza** el deploy.

### Estado del servicio (checkpoint read-only)

| Servicio | Rol | Estado actual |
|----------|-----|---------------|
| `api` | API común (Fastify) | online en Railway (`api-production-42e99.up.railway.app`) |
| `mi-pulso-web` | PWA del paciente (Next.js) | offline · sin variables de modo api |

---

## 2. Servicio `mi-pulso-web`

Fuente: `apps/mi-pulso-web/package.json`.

```jsonc
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "type-check": "tsc --noEmit"
}
```

### Configuración recomendada (futura)

| Parámetro       | Valor recomendado |
|-----------------|-------------------|
| Root directory  | Raíz del repo (monorepo). **No** `apps/mi-pulso-web` aislado: el build necesita el workspace para compilar `@pulso/shared`. |
| Install command | `pnpm install --frozen-lockfile` |
| Build command   | `pnpm turbo run build --filter=@pulso/mi-pulso-web` (Turbo compila `@pulso/shared` antes vía `^build`) |
| Start command   | `pnpm --filter @pulso/mi-pulso-web start` |
| Healthcheck path | `GET /` (la home de la PWA) |

### Variables de entorno — `mi-pulso-web`

> ⚠️ **`NEXT_PUBLIC_*` se inlinea en BUILD.** Para que Mi Pulso arranque en
> modo api, estas variables deben estar presentes **antes del build**, no solo
> en runtime. Cambiar el modo requiere **reconstruir** (`pnpm build`), no basta
> con cambiar el entorno de `next start`.

| Variable | Requerida | Valor recomendado | Notas |
|----------|-----------|-------------------|-------|
| `NEXT_PUBLIC_PULSO_DATA_MODE` | Sí (para modo api) | `api` | `mock` por default en el código. Para consumir la API → `api`. |
| `NEXT_PUBLIC_PULSO_API_BASE_URL` | Sí (si `=api`) | `https://api-production-42e99.up.railway.app` | URL del servicio `api`. Si falta con `=api`, el código hace fallback a `mock` con warning. |
| `NODE_ENV` | Recomendada | `production` | Estándar Next.js. |
| `PORT` | Gestionada por Railway | (inyectada) | `next start` respeta `process.env.PORT`. No fijarla manualmente. |

> Las `NEXT_PUBLIC_*` son **públicas por diseño** (se inlinan en el bundle del
> cliente). No poner secretos ahí. La URL de la API y el modo no son secretos.

---

## 3. 🔴 Dependencia crítica: ampliar CORS de la API

Hoy la allowlist CORS de la API (`packages/api/src/config/cors.ts`) permite:
- `localhost:3000`, `localhost:3001`, `localhost:8080` (siempre).
- `CORS_ORIGIN` → el origen de la **web profesional** Railway.
- `PULSO_ALLOWED_ORIGINS` → lista opcional separada por coma.

**El origen de Mi Pulso desplegado NO está en la allowlist.** Sin agregarlo, el
navegador bloqueará las llamadas de Mi Pulso a la API (error CORS), aunque la
cadena de API funcione server-to-server.

### Acción requerida (futura, en el servicio `api`)

Agregar el origen de Mi Pulso a la allowlist **vía variable de entorno** (sin
tocar código, sin wildcard):

| Opción | Cómo |
|--------|------|
| `PULSO_ALLOWED_ORIGINS` (recomendado) | Lista con la web profesional **y** Mi Pulso: `https://pulso-nutricional-web-production.up.railway.app,https://<mi-pulso>.up.railway.app` |
| `CORS_ORIGIN` | Si solo se usaba para la web profesional, mover ambos orígenes a `PULSO_ALLOWED_ORIGINS` para no perder el de la web. |

> El código ya soporta múltiples orígenes (sección `getAllowedOrigins()`). **No
> requiere cambio de código**, solo configurar la variable y **redeploy de la
> API** para que tome efecto. **Sin wildcard `*`.**

---

## 4. Checks post-deploy — `mi-pulso-web`

Tras un deploy futuro (con CORS ya ampliado):

1. `GET /` → `200`, la pantalla **Hoy** carga.
2. **Badge "Conectado a API"** visible (no "Modo mock").
3. DevTools → Console: **sin errores CORS**.
4. Login demo paciente → `POST /auth/login` responde `200`.
5. Badge cambia a **"Sesión demo paciente"**.
6. Vista Hoy carga plan + agenda desde `GET /patients/:id/today`.
7. **Sin `professionalNote`** ni notas internas en la vista.
8. Smoke test de la cadena API: `pnpm smoke:mi-pulso:railway` → exit 0.

Detalle completo del checklist manual en
[`mi-pulso-api-readonly-playbook.md`](./mi-pulso-api-readonly-playbook.md).

---

## 5. No ejecutar todavía

🚫 Hasta nueva autorización explícita, **NO**:

- **No deploy** de `mi-pulso-web`.
- **No** modificar variables del servicio `api` en Railway (incluido CORS).
- **No** redeploy de la API.
- **No** conectar dominio personalizado a Mi Pulso.
- **No** activar auto-deploy / deploy on push.
- **No** tocar Postgres.
- **No** crear secretos reales.
- **No** avanzar a MC-11 ni MC-12.

---

## 6. Orden recomendado (futuro, cuando se autorice)

> Secuencia controlada, un paso a la vez, verificando antes de avanzar.

1. **Ampliar CORS de la API** (sección 3): configurar `PULSO_ALLOWED_ORIGINS`
   con la web profesional + el futuro origen de Mi Pulso, y **redeploy de la
   API**. *(Nota: el origen exacto de Mi Pulso se conoce recién tras el primer
   deploy; ver sección 8.)*
2. **Configurar el servicio `mi-pulso-web`**: root del repo, build/start de la
   sección 2, variables `NEXT_PUBLIC_PULSO_DATA_MODE=api` +
   `NEXT_PUBLIC_PULSO_API_BASE_URL` apuntando al `api` desplegado.
3. **Deploy `mi-pulso-web`**.
4. **Verificar** los checks de la sección 4 (incluido smoke test).
5. **Revisar logs** de build/start de Next.js sin errores.

---

## 7. Rollback

Si algo falla durante un deploy futuro:

1. **Apagar el servicio** `mi-pulso-web` en Railway (volver a offline).
2. **Volver a modo mock**: reconstruir con `NEXT_PUBLIC_PULSO_DATA_MODE=mock`
   (o sin la variable). Mi Pulso vuelve a mostrar mocks locales, sin depender
   de la API. *(Recordar: `NEXT_PUBLIC_*` se inlinea en build → requiere
   rebuild.)*
3. **No revertir CORS** salvo necesidad: ampliar la allowlist no rompe la web
   profesional (los orígenes se suman). Si se revierte, hacerlo sin perder el
   origen de la web profesional.
4. **Revisar logs** para diagnosticar antes de reintentar.
5. **No tocar Postgres** ni el servicio `api` (más allá de CORS).

---

## 8. Brechas y riesgos

| # | Brecha / Riesgo | Impacto | Mitigación |
|---|-----------------|---------|------------|
| 1 | **Dependencia circular de orden:** el origen exacto de Mi Pulso se conoce recién tras el primer deploy, pero CORS debe permitirlo antes de que el navegador funcione. | Primer deploy puede mostrar error CORS hasta ampliar la allowlist. | Hacer el primer deploy de Mi Pulso, leer su URL pública, agregarla a `PULSO_ALLOWED_ORIGINS` de la API, redeploy de la API. Luego verificar. |
| 2 | `NEXT_PUBLIC_*` inlinadas en build. | Cambiar modo/URL en runtime no tiene efecto. | Configurar las variables **antes del build** y reconstruir al cambiarlas. |
| 3 | Mi Pulso es **solo lectura** (sin escritura de registros). | El módulo Registrar sigue en mock; no escribe a la API. | Esperado en este estado. La escritura es un MC futuro fuera de alcance. |
| 4 | Login demo en memoria (sin `passwordHash` en Prisma). | No apto para datos reales/producción. | Auth real es un MC previo a producción (ver brecha 3 de `railway-preflight.md`). |
| 5 | Sin archivo de config de Railway versionado (`railway.json`). | Build/start se define en el dashboard. | Opcional, MC futuro. No agregado aquí (fuera de alcance). |
| 6 | Hardcodear la URL de la API en el repo. | No es secreto, pero acopla el build a un entorno. | Mantenerla como variable `NEXT_PUBLIC_PULSO_API_BASE_URL`, no hardcodear. |

---

## 9. Próximo paso recomendado

- Autorizar un `MC-MIPULSO-RWY-1` para **ampliar CORS + desplegar Mi Pulso** en
  Railway siguiendo este preflight (orden de la sección 6), con verificación por
  smoke test y checklist manual.
- (Futuro) Dominio propio y empaquetado PWA/TWA (MC-12) quedan después del deploy.

> **Freno aquí. No se avanza a deploy de Mi Pulso, ampliación de CORS, dominio,
> MC-11 ni MC-12 sin autorización explícita.**
