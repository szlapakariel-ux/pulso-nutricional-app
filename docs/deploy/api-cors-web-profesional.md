# CORS de la API para la web profesional

> MC-API-CORS-CODE — habilita CORS mínimo en la API Fastify para que la web
> profesional (Railway) pueda llamar a la API desde el navegador.
> Ver [ADR 0020](../decisiones/0020-api-cors-fastify-web-profesional.md).

## Qué problema resuelve

El navegador envía un **preflight `OPTIONS`** antes de un `POST /auth/login`
cross-origin con headers `Content-Type`/`Authorization`. Sin CORS en la API,
Fastify respondía:

```
Route OPTIONS:/auth/login not found   → 404
```

…y el login quedaba bloqueado. Con `@fastify/cors` registrado, el preflight
se responde correctamente (204) con los headers CORS adecuados.

## Implementación

- **Plugin:** [`@fastify/cors`](https://github.com/fastify/fastify-cors) v11
  (oficial, compatible con Fastify 5). **No** se usa Express ni el paquete
  `cors`.
- **Registro:** `packages/api/src/app.ts`, antes de las rutas.
- **Config:** `packages/api/src/config/cors.ts`.

## Variables de entorno

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `CORS_ORIGIN` | Recomendada en producción | Un origen permitido. Ej: `https://pulso-nutricional-web-production.up.railway.app` |
| `PULSO_ALLOWED_ORIGINS` | Opcional | Lista de orígenes separada por coma. Se suma a `CORS_ORIGIN`. |

Los orígenes de desarrollo local (`http://localhost:3000`, `:3001`, `:8080`)
**siempre** están permitidos, no requieren configuración.

### Desarrollo local

En `packages/api/.env`:

```env
CORS_ORIGIN=http://localhost:3000
```

(o simplemente no definirla: localhost ya está permitido por defecto).

### Railway (producción)

En el servicio `api` de Railway ya está configurada:

```
CORS_ORIGIN=https://pulso-nutricional-web-production.up.railway.app
```

> Esta variable **no** se commitea con valor real en el repo. Se gestiona
> desde el dashboard de Railway. Antes de MC-API-CORS-CODE la variable existía
> pero el backend no la leía; ahora sí tiene efecto.

## Política de CORS aplicada

| Aspecto | Valor |
|---------|-------|
| Métodos | `GET`, `POST`, `OPTIONS` |
| Headers permitidos | `Content-Type`, `Authorization` |
| Credentials | `false` (auth por Bearer token, no cookies) |
| Wildcard `*` | **No** — allowlist explícita |
| Origin desconocido | Rechazado (sin headers CORS), sin error 500 |
| Sin header `Origin` (server-to-server, curl, smoke test) | Permitido — no se rompe |

## Verificación local

```bash
# 1. Build
pnpm build

# 2. Levantar API con auth + enforcement + CORS
cd packages/api
PULSO_AUTH_MODE=demo \
PULSO_AUTH_ENFORCEMENT=demo \
CORS_ORIGIN=https://pulso-nutricional-web-production.up.railway.app \
PORT=3099 \
node dist/server.js

# 3. En otra terminal:

# /health sigue 200
curl -i http://localhost:3099/health

# /patients sin token sigue 401
curl -i http://localhost:3099/patients

# preflight OPTIONS /auth/login ya NO es 404 → 204 con headers CORS
curl -i -X OPTIONS http://localhost:3099/auth/login \
  -H "Origin: https://pulso-nutricional-web-production.up.railway.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization"

# login real con origin permitido devuelve Access-Control-Allow-Origin
curl -i -X POST http://localhost:3099/auth/login \
  -H "Origin: https://pulso-nutricional-web-production.up.railway.app" \
  -H "Content-Type: application/json" \
  -d '{"email":"profesional-demo@pulsonutricional.demo","password":"demo-profesional-2026"}'
```

## Próximo paso (fuera de este ciclo)

Para que el cambio tome efecto en producción hay que **redeploy del servicio
`api` en Railway** (acción externa, no se ejecuta desde Claude Code). Luego
verificar el login real desde la web profesional.

> **Freno aquí.** No se despliega la API ni se avanza a web, Mi Pulso,
> dominio, MC-11 ni MC-12 sin autorización explícita.
