# ADR 0021 — Smoke test y playbook de la web profesional (MC-WEB-3)

**Estado:** Aceptado
**Microciclo:** MC-WEB-3
**Fecha:** 2026-06-10

---

## Contexto

MC-WEB-2 dejó la web profesional (`pulso-nutricional-web`) desplegada en
Railway y operativa contra la API Railway en modo lectura (MC-WEB-1 +
MC-API-CORS-CODE). La verificación de ese deploy fue manual y puntual. Sin un
mecanismo repetible, cada redeploy de la web o de la API requeriría re-verificar
a mano la misma cadena (web servida + login + pacientes + ficha/plan/agenda).

MC-RWY-2 ya estableció el patrón con `scripts/smoke-api-railway.mjs` para la
API. MC-WEB-3 lo replica para la web profesional y añade un playbook operativo
para la parte que no se puede automatizar desde Node (CORS y flujo de UI).

## Decisión

1. Crear `scripts/smoke-web-profesional-railway.mjs`: script Node.js ESM sin
   dependencias externas (usa `fetch` nativo) que verifica que la web está
   servida y que la cadena de datos de la API responde, saliendo con exit
   code 0/1.
2. Crear `docs/deploy/web-profesional-railway-playbook.md`: playbook con el
   smoke test automatizado + la verificación manual en navegador (lo que el
   script no puede cubrir) + tabla de diagnóstico.
3. Registrar el script en el `package.json` raíz como `smoke:web:railway`,
   igual que `smoke:api:railway`.

### Principios aplicados

1. **Sin dependencias externas.** `fetch` nativo (Node ≥20).
2. **Configurable por variable.** `PULSO_WEB_BASE_URL` y `PULSO_API_BASE_URL`.
3. **Credenciales ficticias.** Las mismas demo ya documentadas; token nunca
   impreso completo (solo 12 caracteres + "…").
4. **Solo lectura.** No ejecuta mutaciones persistentes.
5. **Exit code semántico.** 0 = OK, 1 = fallo.
6. **Honestidad sobre los límites.** El script declara explícitamente que **no**
   verifica CORS (lo aplica el navegador) y deriva esa verificación al playbook.

### Qué verifica el smoke test

| Verificación | Esperado |
|--------------|----------|
| `GET /` de la web | 200 |
| HTML contiene `Pulso Nutricional` / `Panel profesional` | presente |
| API `GET /health` | 200 |
| API `POST /auth/login` (demo) | 200 + token |
| API `GET /patients` (con token) | 200 + lista |
| API `GET /patients/:id` | 200 |
| API `GET /patients/:id/meal-plan` | 200 o 404 |
| API `GET /patients/:id/agenda` | 200 |

## Por qué CORS no se automatiza

CORS es una política que aplica el **navegador** sobre respuestas cross-origin.
`fetch` de Node no aplica CORS, así que un smoke test de Node no puede
distinguir entre "CORS bien configurado" y "CORS roto" — ambas devolverían lo
mismo desde Node. Por eso la verificación de CORS (y del flujo de login en la
UI) queda como checklist manual en el playbook, con pasos concretos en DevTools.

## Límite de entorno

Igual que el smoke test de la API (ADR 0018), este script **no** corre desde el
entorno remoto de Claude Code: la política de red (egress proxy) bloquea las
URLs externas y devuelve 403. Se ejecuta desde una terminal con acceso a
internet. Es un límite del entorno de ejecución, no del script.

## Consecuencias

- **Positivo:** Verificación repetible de la web tras cada redeploy.
- **Positivo:** Playbook único que combina automatizado + manual + diagnóstico.
- **Positivo:** Consistente con el patrón `smoke:api:railway` ya existente.
- **Neutral:** No verifica CORS de forma automática (limitación inherente);
  se cubre con checklist manual.
- **Neutral:** Requiere que web y API estén online para pasar (esperado en un
  smoke test de entorno).

## Límites explícitos

- No toca código de la web ni de la API.
- No toca Railway.
- No toca Postgres.
- No toca Mi Pulso.
- No usa datos reales.
- No conecta dominio propio.
- No avanza a MC-11.

## Próximo paso recomendado

Ejecutar `pnpm smoke:web:railway` desde una terminal con internet tras cada
redeploy de la web o de la API, y completar el checklist manual del playbook.
El próximo MC de producto puede elegir entre Mi Pulso, dominio propio o MC-11
(panel mobile), siempre con autorización explícita.

> **Freno aquí.** No se avanza a Mi Pulso, dominio, MC-11 ni MC-12 sin
> autorización explícita.
