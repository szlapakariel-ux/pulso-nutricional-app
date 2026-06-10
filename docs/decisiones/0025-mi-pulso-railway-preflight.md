# ADR 0025 — Mi Pulso: preflight para deploy controlado en Railway (MC-MIPULSO-RWY-0)

**Estado:** Aceptado
**Microciclo:** MC-MIPULSO-RWY-0
**Fecha:** 2026-06-10

---

## Contexto

Mi Pulso ya puede consumir la API Railway en modo lectura:
- MC-MIPULSO-1 conectó Mi Pulso a la API (login paciente + vista Hoy).
- MC-PATIENT-ID-1 hizo que `GET /auth/me` exponga `patientId`.
- MC-MIPULSO-2 dejó smoke test (`smoke:mi-pulso:railway`) y playbook.

El preflight general (ADR 0016 / `railway-preflight.md`, MC-RWY-0) describía Mi
Pulso cuando **todavía usaba mocks** y no consumía la API. Ese estado ya no
aplica: Mi Pulso tiene cliente HTTP, modo `api` y la cadena funciona.

Falta documentar, específicamente, **cómo desplegar Mi Pulso en modo API** de
forma controlada — incluyendo la dependencia crítica de **ampliar la allowlist
CORS de la API** para el nuevo origen.

## Decisión

Crear un preflight dedicado a Mi Pulso, siguiendo el patrón de MC-RWY-0, **sin
ejecutar nada**:

### Componentes creados

| Archivo | Rol |
|---------|-----|
| `docs/deploy/mi-pulso-railway-preflight.md` | Preflight: build/start, variables (`NEXT_PUBLIC_PULSO_DATA_MODE=api`, `NEXT_PUBLIC_PULSO_API_BASE_URL`), dependencia CORS, checks, rollback, brechas y riesgos. |
| ADR 0025 (este archivo) | Documenta la decisión y sus límites. |

### Puntos clave documentados

1. **Build/start:** root del repo + Turbo (`--filter=@pulso/mi-pulso-web`),
   `pnpm --filter @pulso/mi-pulso-web start`. Verificado contra `package.json`.
2. **Variables `NEXT_PUBLIC_*` inlinadas en build:** deben estar antes del build,
   no solo en runtime. Cambiar modo/URL requiere rebuild.
3. **Dependencia crítica CORS:** el origen de Mi Pulso desplegado **no** está en
   la allowlist de la API. Hay que agregarlo vía `PULSO_ALLOWED_ORIGINS`
   (sin tocar código, sin wildcard) y redeploy de la API.
4. **Dependencia circular de orden:** el origen exacto de Mi Pulso se conoce
   recién tras el primer deploy → secuencia: deploy Mi Pulso, leer URL, ampliar
   CORS, redeploy API, verificar.
5. **Rollback:** volver a `NEXT_PUBLIC_PULSO_DATA_MODE=mock` (con rebuild)
   devuelve Mi Pulso al comportamiento con mocks sin depender de la API.

## Verificación

| Check | Resultado |
|-------|-----------|
| Solo documentación (sin código) | ✅ |
| Comandos derivados de `package.json` real | ✅ |
| Sin secretos ni valores reales | ✅ (la URL de la API es pública, no secreta) |
| `type-check`/`build` | No requeridos: solo documentación. |

## Límites explícitos (MC-MIPULSO-RWY-0)

- Solo agrega el preflight y este ADR + actualización del plan.
- No deploy de Mi Pulso.
- No toca Railway, ni variables del servicio `api` (incluido CORS), ni redeploy.
- No toca Postgres, Prisma schema, seed, package.json, pnpm-lock.yaml.
- No conecta dominio propio.
- No avanza a MC-11 ni MC-12.

## Próximo paso recomendado

Autorizar `MC-MIPULSO-RWY-1` para ampliar CORS + desplegar Mi Pulso en Railway
siguiendo el orden de la sección 6 del preflight, con verificación por smoke
test y checklist manual del playbook.

> **Freno aquí.** No se avanza a deploy de Mi Pulso, ampliación de CORS,
> dominio, MC-11 ni MC-12 sin autorización explícita.
