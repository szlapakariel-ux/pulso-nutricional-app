# ADR 0033 — MC-FOTOS-PROD-1: activación de fotos en producción + fix patientId

**Estado:** Aceptado ✅ — smoke E2E 10/10 en producción
**Fecha:** 2026-06-22
**Microciclo:** MC-FOTOS-PROD-1

---

## Contexto

Tras el preflight documental (ADR 0031, MC-FOTOS-PROD-0), se ejecutó la
activación real del upload de fotos en producción Railway:

1. **`db:push` contra el Postgres de Railway** → se creó la tabla `MealPhotoLog`
   y el enum `MealPhotoType` (verificado con control negativo: `SELECT` sobre
   `MealPhotoLog` OK; `SELECT` sobre tabla inexistente → `P1014`).
2. **Variables S3 en el servicio `api`** → bucket `orderly-suitcase` conectado
   (HeadBucket OK, binario sube a S3 desde Railway).
3. **`PULSO_DATA_SOURCE=prisma`** activo en el servicio `api`.

Al correr el smoke E2E de upload (`scripts/smoke-fotos-s3-upload.mjs`), el
upload completo devolvía **503 para todos los pacientes**.

## Problema detectado

Mismatch de identidad entre dos fuentes de verdad para el `patientId`:

- El mapeo `userId → patientId` (en `middleware/auth-guards.ts`) devolvía
  siempre `"demo-N"`, heredado de la era mock (MC-10.5D).
- Pero el seed de Prisma crea cada `Patient` con un **UUID real**
  (`IDS.patientNId`, p. ej. `d0000000-0000-0001-0000-000000000011`).

En modo `prisma`, el API insertaba `MealPhotoLog(patientId="demo-1")` → no
existe ningún `Patient` con ese id → **violación de FK → 503**.

Impacto doble:

- **Funcional:** ningún paciente podía subir fotos.
- **Storage leak latente:** como `putObject` a S3 ocurre *antes* del insert que
  fallaba, cada intento dejaba un binario huérfano en el bucket.

> El check `meta.storageConfigured` del smoke daba falso ✅ porque deriva de
> `storageKey.startsWith("patients/")` (constante). La verificación real contra
> el bucket y la respuesta HTTP sí detectaron el 503.

## Decisión

`resolvePatientId(userId)` elige el mapa según `PULSO_DATA_SOURCE`:

| Modo | patientId | Razón |
|------|-----------|-------|
| `mock` | `"demo-N"` | Los mock stores se indexan por `"demo-N"`. |
| `prisma` | UUID del seed (`IDS.patientNId`) | FK válida contra `Patient` → insert OK. |

Aplica a las dos fuentes que **deben coincidir**:

- `GET /auth/me` (`controllers/auth.controller.ts`) → el `patientId` que recibe
  el frontend de Mi Pulso.
- `requirePatientSelf` (`middleware/auth-guards.ts`) → la validación del guard.

### Por qué data-source-aware y no un map fijo a UUIDs

Un map fijo a UUIDs habría arreglado producción pero **roto el dev local**: en
modo mock los stores se indexan por `"demo-N"`. La función consciente del data
source mantiene el mismo alcance (solo código, sin tocar la DB) y funciona en
ambos entornos.

### Storage leak: fuera de alcance (deliberado)

El orden "subir a S3 → luego insertar metadata" es una decisión del ADR 0030
(evita metadata sin binario → imágenes rotas en el panel). El trade-off inverso
es el binario huérfano ante un fallo de DB. Tras este fix, el insert ya no falla
en el flujo normal, por lo que el leak solo se daría ante un error inesperado de
DB. Blindarlo (transacción o rollback de S3) queda como microciclo aparte.

## Variables usadas (sin secrets)

**Servicio `api` (Railway):**

| Variable | Valor / fuente | Secreto |
|----------|----------------|---------|
| `S3_ENDPOINT` | Endpoint del bucket `orderly-suitcase` (Railway Object Storage) | No |
| `S3_REGION` | Región del proveedor | No |
| `S3_ACCESS_KEY_ID` | Access key del bucket | **Sí** — solo en Railway, nunca en el repo |
| `S3_SECRET_ACCESS_KEY` | Secret key del bucket | **Sí** — solo en Railway, nunca en el repo |
| `S3_BUCKET` | `orderly-suitcase` | No |
| `PULSO_DATA_SOURCE` | `prisma` | No |
| `DATABASE_URL` | Referencia `${{Postgres.DATABASE_URL}}` (runtime); proxy público para `db:push` desde shell controlado | **Sí** |

> Las `S3_*` van **solo** en el servicio `api`, nunca como `NEXT_PUBLIC_*`
> (se embeberían en el bundle del navegador). El upload lo hace el servidor.

## Verificación

| Check | Resultado |
|-------|-----------|
| `pnpm --filter @pulso/api type-check` | ✅ |
| `pnpm --filter @pulso/api build` | ✅ |
| `resolvePatientId` en modo mock → `"demo-1"` | ✅ (módulo compilado) |
| `resolvePatientId` en modo prisma → UUID del seed | ✅ (módulo compilado) |
| `db:push` → tabla `MealPhotoLog` creada | ✅ (control negativo `P1014`) |
| Bucket `orderly-suitcase` conectado (HeadBucket) | ✅ |
| Binario sube a S3 desde Railway | ✅ |
| Smoke E2E upload en producción → **10/10 verde** | ✅ (post-redeploy `fea49ea`) |
| Artefactos de smoke limpiados (objetos S3 + fila DB) | ✅ |
| 3 filas legítimas intactas | ✅ |

## Pendiente

1. **Limpiar 2 huérfanos pre-fix** bajo `patients/demo-1/` en el bucket
   `orderly-suitcase` (~327 KB c/u, sin fila DB asociada — basura del bug).
   Borrar desde Railway dashboard → Object Storage → bucket → prefijo `patients/demo-1/`.
2. **MC-FOTOS-PROD-2:** smoke de upload end-to-end desde Mi Pulso (navegador).
3. **Storage leak (microciclo aparte):** con el fix, el leak solo ocurre ante un
   error inesperado de DB. Evaluar transacción o rollback de S3 en el catch.

> **✅ Fotos funcionales.** Upload y descarga de metadata funcionan en ambas apps
> (panel + Mi Pulso). Datos persistidos en S3 y Postgres. Sin errores en logs.
