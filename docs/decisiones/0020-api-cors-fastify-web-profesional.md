# ADR 0020 — CORS mínimo en la API Fastify para la web profesional (MC-API-CORS-CODE)

**Estado:** Aceptado
**Microciclo:** MC-API-CORS-CODE
**Fecha:** 2026-06-10

---

## Contexto

MC-WEB-1 dejó la web profesional (`apps/pulso-nutricional-web`) capaz de
consumir la API Railway en modo lectura. Una vez desplegada en
`https://pulso-nutricional-web-production.up.railway.app`, el login quedó
bloqueado por CORS:

```
Route OPTIONS:/auth/login not found
```

El navegador envía un **preflight `OPTIONS`** antes del `POST /auth/login`
(porque la petición lleva header `Authorization`/`Content-Type` y es
cross-origin). La API Fastify no tenía ningún plugin de CORS registrado, así
que no existía handler para `OPTIONS` y Fastify respondía 404, abortando el
login desde el navegador.

En Railway ya existía la variable `CORS_ORIGIN` apuntando al origen de la web
profesional, pero **el backend no la leía**, por lo que no tenía efecto.

La API usa **Fastify 5**, no Express. La autenticación usa **Bearer token**
(JWT en header `Authorization`), no cookies.

## Decisión

Registrar el plugin oficial **`@fastify/cors`** en el punto donde se construye
la app Fastify (`packages/api/src/app.ts`), con una configuración mínima y
explícita leída desde variables de entorno.

### Principios aplicados

1. **Plugin oficial, no Express ni `cors`.** Se usa `@fastify/cors` v11,
   compatible con Fastify 5.
2. **Sin wildcard.** El origen se valida contra una allowlist explícita.
3. **Configurable por variable.** `CORS_ORIGIN` (un origen) y
   `PULSO_ALLOWED_ORIGINS` (lista separada por coma, opcional).
4. **Localhost de desarrollo siempre permitido.** `http://localhost:3000`,
   `:3001`, `:8080`.
5. **Métodos mínimos.** `GET`, `POST`, `OPTIONS` (la web profesional solo lee
   y hace login).
6. **Headers mínimos.** `Content-Type`, `Authorization`.
7. **Sin credentials.** La auth usa Bearer token, no cookies → `credentials: false`.
8. **No rompe server-to-server.** Las llamadas sin header `Origin` (curl,
   smoke test, health checks) se permiten siempre; no son peticiones CORS de
   navegador.
9. **Origin desconocido se rechaza sin error.** El validador devuelve
   `allow=false` (no lanza), de modo que no se emiten headers CORS y el
   navegador bloquea, pero la API no responde 500.

### Diseño

- `packages/api/src/config/cors.ts` — módulo de configuración siguiendo el
  patrón de `config/auth.ts` y `config/enforcement.ts`:
  - `getAllowedOrigins()` — construye la allowlist (dev + `CORS_ORIGIN` +
    `PULSO_ALLOWED_ORIGINS`), sin duplicados.
  - `buildCorsOriginValidator()` — función `origin` para `@fastify/cors`.
  - `CORS_METHODS`, `CORS_ALLOWED_HEADERS` — constantes exportadas.
- `packages/api/src/app.ts` — registra `cors` **antes** de las rutas para que
  el preflight `OPTIONS` sea atendido por el plugin.

### Orígenes permitidos (resultado)

| Origen | Fuente |
|--------|--------|
| `http://localhost:3000` | dev (siempre) |
| `http://localhost:3001` | dev (siempre) |
| `http://localhost:8080` | dev (siempre) |
| `https://pulso-nutricional-web-production.up.railway.app` | `CORS_ORIGIN` (Railway) |
| (otros) | `PULSO_ALLOWED_ORIGINS`, opcional |

## Verificación local

Con `PULSO_AUTH_MODE=demo`, `PULSO_AUTH_ENFORCEMENT=demo` y
`CORS_ORIGIN=https://pulso-nutricional-web-production.up.railway.app`:

| Caso | Resultado |
|------|-----------|
| `GET /health` | 200 ✅ |
| `GET /patients` sin token | 401 ✅ (enforcement intacto) |
| `OPTIONS /auth/login` (origin Railway) | 204 + headers CORS ✅ (antes 404) |
| `POST /auth/login` (origin Railway) | 200 + `Access-Control-Allow-Origin` ✅ |
| `OPTIONS /auth/login` (origin desconocido) | sin header ACAO ✅ (rechazado) |
| `OPTIONS /patients` (origin localhost:3000) | header ACAO presente ✅ |
| `GET /health` sin Origin (server-to-server) | 200 ✅ (no se rompe) |

`pnpm type-check`, `pnpm build` y `pnpm lint` pasan sin error.

## Consecuencias

- **Positivo:** El preflight `OPTIONS` ya no cae en "route not found"; la web
  profesional puede hacer login y leer datos desde el navegador.
- **Positivo:** La variable `CORS_ORIGIN` ya existente en Railway pasa a tener
  efecto sin tocar Railway desde el repo.
- **Positivo:** Allowlist explícita; sin wildcard inseguro.
- **Positivo:** Auth y guards de rol no se modifican; el enforcement sigue
  igual.
- **Neutral:** Solo se permiten `GET`/`POST`/`OPTIONS`. Cuando un futuro MC
  necesite escritura (`PUT`/`PATCH`/`DELETE`) habrá que ampliar `CORS_METHODS`.
- **Neutral:** `credentials: false`. Si en el futuro se migra a cookies de
  sesión, habrá que revisar esta decisión.

## Límites explícitos

- No toca `apps/mi-pulso-web`.
- No toca Postgres ni el schema Prisma ni el seed.
- No toca la lógica de auth, pacientes, planes ni agenda.
- No relaja guards.
- No usa wildcard `*`.
- No usa Express ni el paquete `cors`.
- No conecta dominio propio.
- No despliega la API ni toca Railway desde el repo.
- No avanza a MC-11.

## Próximo paso recomendado

Desplegar/redeploy del servicio `api` en Railway (acción externa, fuera de
Claude Code) para que el cambio tome efecto en producción, y luego verificar
el login real desde la web profesional. La variable `CORS_ORIGIN` ya está
configurada en Railway.

> **Freno aquí.** No se despliega la API ni se avanza a web, Mi Pulso,
> dominio, MC-11 ni MC-12 sin autorización explícita.
