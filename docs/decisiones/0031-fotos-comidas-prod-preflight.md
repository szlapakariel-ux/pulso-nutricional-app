# ADR 0031 — Fotos de comidas: preflight de producción (MC-FOTOS-PROD-0)

**Estado:** Aceptado
**Microciclo:** MC-FOTOS-PROD-0
**Fecha:** 2026-06-11

---

## Contexto

El módulo de fotos de comidas está completo y mergeado en `main` (MC-FOTOS-MVP-1
y MC-FOTOS-MVP-2): tipos, modelo Prisma `MealPhotoLog`, endpoints multipart,
`S3MealPhotoStorage` + `LocalFallbackStorage` y UI en Mi Pulso. Sin embargo,
**en producción todavía no funciona el upload real** porque:

1. el Postgres de Railway **no tiene** la tabla `MealPhotoLog` (el `db:push`
   nunca se corrió contra producción);
2. el bucket `orderly-suitcase` **no está configurado** (faltan las 5 variables
   `S3_*` en el servicio `api`);
3. no se hizo el deploy del API ni de Mi Pulso con esa configuración.

Este ciclo es **delicado**: toca la frontera de producción (Postgres, bucket,
variables Railway, deploy). Un error puede romper la demo online o, peor, exponer
fotos de pacientes públicamente. Por eso se decide **documentar primero**.

## Decisión

**MC-FOTOS-PROD-0 es solo documentación.** Se crea un runbook operativo
(`docs/fotos-comidas/preflight-prod-fotos-comidas.md`) que describe, sin
ejecutar, cómo llevar el módulo a producción de forma controlada. La ejecución
real se difiere a:

- **MC-FOTOS-PROD-1**: `db:push` + configuración de bucket + deploy API.
- **MC-FOTOS-PROD-2**: deploy Mi Pulso + smoke de upload end-to-end.

Cada uno requiere **autorización explícita**.

## Decisiones específicas y su justificación

### 1. No ejecutar nada en este ciclo

El costo de un error en producción (DB corrupta, fotos públicas, credenciales
expuestas) es alto y difícil de revertir. Un runbook revisable de antemano
reduce ese riesgo: separa el "pensar" del "ejecutar".

### 2. El deploy del código es seguro; el cambio de DB es un acto explícito

Verificado en el repo: ni el `build` ni el `start` del API corren `db:push` o
migraciones. `build` solo hace `prisma generate` (genera el cliente, no toca la
DB). → El deploy **no** modifica el schema por sí solo. Se mantiene así: `db:push`
se corre siempre a mano, una vez, con `DATABASE_URL` verificada. **No** se
configurará un release hook que lo automatice.

### 3. `db:push`, no migraciones versionadas

El proyecto usa `prisma db push` (sin carpeta `migrations/`), consistente con
todo el historial (MC-10.5A en adelante). El runbook documenta verificación del
destino (host/base) y del diff de schema antes de confirmar, dado que `db:push`
no tiene historial reversible.

### 4. Credenciales S3 solo en el servicio `api`, nunca en el frontend

Las variables `NEXT_PUBLIC_*` de Next.js se embeben en el bundle del navegador.
Poner credenciales S3 ahí las expondría públicamente. El upload lo hace el API
(servidor), que recibe el multipart del navegador y sube al bucket con sus
credenciales. El navegador nunca ve las claves.

### 5. Bucket privado, sin URLs públicas

Verificado: el código guarda solo `storageKey`, devuelve solo metadata, y **no
existe `S3_PUBLIC_BASE_URL`** ni construcción de URL pública. Se decide bucket
**privado** (sin lectura anónima). La entrega de imágenes al panel profesional
(URL firmada o endpoint con guard) es **MC-FOTOS-MVP-3**, fuera de este alcance.

### 6. `LocalFallbackStorage` permite desacoplar deploy de bucket

Como el código corre en fallback local sin las `S3_*` (responde `201`, descarta
el binario con aviso), se puede desplegar el código **antes** de activar el
bucket si se quiere bajar el riesgo por etapas. El runbook lo documenta como
opción.

### 7. Interruptores de seguridad para rollback sin redeploy

`PULSO_DATA_SOURCE=mock`, `PULSO_AUTH_MODE/ENFORCEMENT=off` y quitar las `S3_*`
devuelven el API al comportamiento previo sin redeploy de código. El runbook los
documenta como vía de rollback principal.

## Alternativas consideradas

- **Ejecutar directamente db:push + bucket + deploy en un solo ciclo.**
  Descartado: demasiado riesgo concentrado, sin checklist previo ni rollback
  acordado. La separación en PROD-0 (plan) → PROD-1/2 (ejecución) es más segura.
- **Migrar a `prisma migrate` antes de producción.** Descartado para este ciclo:
  cambiaría el flujo de todo el proyecto; fuera de alcance. Se puede evaluar en
  un MC de mantenimiento futuro.

## Consecuencias

- **Positivas:** plan revisable, criterios go/no-go explícitos, riesgos y
  rollback escritos antes de tocar producción. Sin secretos, sin ejecución.
- **Negativas / límites:** el upload real en producción sigue sin funcionar hasta
  PROD-1/PROD-2. La visualización profesional sigue pendiente (MVP-3). El runbook
  asume detalles de Railway (endpoint/región del bucket) que se confirman al
  ejecutar.

## Alcance / qué NO se tocó

Solo documentación: `docs/fotos-comidas/preflight-prod-fotos-comidas.md`, este
ADR y `docs/microciclos/plan-microciclos.md`. **No** se tocó código, API, Prisma
schema, seed, `package.json`, `pnpm-lock.yaml`, Railway, Postgres, CORS ni
dominio. **No** se ejecutó `db:push`, **no** se configuró bucket, **no** se hizo
deploy, **no** hay credenciales reales.
