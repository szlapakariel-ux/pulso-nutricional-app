# ADR 0018 — Smoke test operativo para API Railway (MC-RWY-2)

**Estado:** Aceptado  
**Microciclo:** MC-RWY-2  
**Fecha:** 2026-06-10

---

## Contexto

MC-RWY-1 dejó el servicio `api` desplegado y verificado manualmente en
Railway. Sin un mecanismo repetible de verificación, cada redeploy o
cambio de variables requeriría re-verificar manualmente los mismos 9
endpoints. MC-RWY-2 formaliza esa verificación en un script ejecutable.

## Decisión

Crear `scripts/smoke-api-railway.mjs`: un script Node.js ESM sin
dependencias externas (usa `fetch` nativo, disponible desde Node 18+
y el repo exige Node ≥20) que verifica los 9 endpoints clave de la API
y sale con exit code 0/1.

### Principios aplicados

1. **Sin dependencias externas.** `fetch` nativo elimina `npm install`
   como prerequisito para correr el test.
2. **Configurable por variable.** `PULSO_API_BASE_URL` permite apuntar
   a cualquier entorno (Railway, local, staging).
3. **Credenciales ficticias.** Usa `profesional-demo@pulsonutricional.demo`
   / `demo-profesional-2026`, credenciales ya documentadas en el repo,
   sin secretos reales.
4. **Token nunca impreso completo.** Solo los primeros 12 caracteres + "…".
5. **Solo lectura.** No ejecuta ninguna mutación persistente; las rutas
   de escritura (`/preview`) se dejan para tests más avanzados.
6. **Exit code semántico.** 0 = todo OK, 1 = algún fallo; integrable
   con CI o scripts de deploy.

### Endpoints verificados

| Endpoint | Token | Esperado |
|----------|-------|----------|
| `GET /health` | No | 200 |
| `GET /patients` | No | 401 |
| `POST /auth/login` | N/A | 200 |
| `GET /auth/me` | Profesional | 200 |
| `GET /patients` | Profesional | 200 |
| `GET /patients/:id` | Profesional | 200 |
| `GET /patients/:id/meal-plan` | Profesional | 200 o 404 |
| `GET /patients/:id/agenda` | Profesional | 200 |
| `GET /auth/me` | Inválido | 401 |

### Nota sobre el entorno de ejecución

El script funciona desde cualquier terminal con acceso a internet.
**No** puede ejecutarse desde el entorno remoto de Claude Code: ese
entorno aplica una política de red (egress proxy de Anthropic) que
bloquea llamadas salientes a URLs externas, devolviendo 403. Esto es
un límite del entorno de ejecución, no del script ni de la API.

## Archivo del script

```
scripts/smoke-api-railway.mjs
```

Script root `package.json`:

```json
"smoke:api:railway": "node scripts/smoke-api-railway.mjs"
```

## Consecuencias

- **Positivo:** Verificación repetible sin pasos manuales post-deploy.
- **Positivo:** Sin dependencias; funciona con Node ≥20 nativo.
- **Positivo:** Configurable por variable (`PULSO_API_BASE_URL`).
- **Positivo:** Integrable con CI future (exit code semántico).
- **Neutral:** Cubre solo endpoints clave (9 de ~20+). Tests de rol
  paciente, PDF, consultas, etc. quedan para un ciclo de testing más
  completo.
- **Neutral:** Requiere que la API Railway esté online para pasar
  (esperado: es un smoke test de entorno, no un test unitario).

## Límites explícitos

- No toca Railway (solo hace peticiones HTTP).
- No toca Postgres.
- No toca web apps.
- No usa datos reales.
- No conecta dominio.
- No avanza a MC-11.

## Próximo paso recomendado

El smoke test es infraestructura de verificación. El próximo MC de
producto puede elegir entre:
- **Opción A:** Conectar la web profesional a la API.
- **Opción B:** Preparar MC-11 (panel mobile).
- **Opción C:** Ampliar el smoke test con endpoints de paciente y
  escritura.

> **Freno aquí.** No se avanza a web apps, dominio, MC-11 ni MC-12
> sin autorización explícita.
