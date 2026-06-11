# ADR 0028 — Fotos de comidas como parte del MVP (MC-FOTOS-MVP-0)

**Estado:** Aceptado
**Microciclo:** MC-FOTOS-MVP-0
**Fecha:** 2026-06-11

---

## Contexto

La demo de Pulso Nutricional ya está operativa online: API Railway, web
profesional, Mi Pulso con login paciente, `patientId` desde `/auth/me`,
Vista Hoy sin loop (MC-MIPULSO-FE-1/FE-2, MC-MIPULSO-REDEPLOY-2).

El usuario confirmó que **las fotos de comidas forman parte del MVP de valor**
de Mi Pulso: el paciente registra visualmente lo que come, la nutricionista ve
porciones reales y puede comentar antes de la consulta, y queda material para
trabajar durante la consulta. El roadmap se corrige para incorporarlas.

Implementarlas involucra archivos binarios, bucket S3, permisos, datos
reportados por paciente y revisión profesional — por eso se diseña primero
(este ciclo) y se implementa después (ciclos autorizados).

## Decisión

1. **Incorporar las fotos de comidas al MVP** con un roadmap propio de cinco
   microciclos (MC-FOTOS-MVP-0 a MC-FOTOS-MVP-4), donde este ciclo (0) es
   **solo documentación**.

2. **Respetar la regla central del producto:** toda foto nace como dato
   revisable — `origin: "patient_reported"`, `reviewStatus: "pending"` — y
   solo una acción explícita de la profesional cambia su estado. Se reusan
   los tipos existentes `DataOrigin` y `ReviewStatus` de
   `packages/shared/src/types/domain.ts`.

3. **Modelo conceptual `meal_photo_logs`:** entidad nueva con `id`,
   `patientId`, `storageKey`, `mealType`, `patientComment`,
   `professionalComment`, `reviewStatus`, `origin`, `createdAt`, `reviewedAt`,
   `reviewedBy`. Hermana de `meal_logs` (MC-7), no la reemplaza.

4. **Storage en bucket, referencia en Postgres:** las imágenes irán al bucket
   Railway/S3 `orderly-suitcase` (futuro); Postgres guarda solo `storageKey`,
   nunca el binario. Path preliminar:
   `patients/{patientId}/meal-photos/{year}/{month}/{fileId}`.

5. **Permisos estrictos:** el paciente crea y ve solo lo suyo; la profesional
   ve y comenta las fotos de sus pacientes; nunca se exponen fotos entre
   pacientes; sin URLs públicas — se prefieren URLs firmadas en la
   implementación futura.

### Componentes creados

| Archivo | Rol |
|---------|-----|
| `docs/fotos-comidas/preflight-fotos-comidas-mvp.md` | Preflight completo: definición funcional, regla de datos, modelo, storage, permisos, UI futura, exclusiones, roadmap, brechas. |
| ADR 0028 (este archivo) | Documenta la decisión y sus límites. |

### Decisiones abiertas (a resolver en MC-FOTOS-MVP-1)

- **Vocabulario de tipo de comida:** `mealType` propio de fotos
  (desayuno/almuerzo/merienda/cena/colación/otro) vs converger con el
  `timeOfDay` existente de `PatientMealLog` (MC-7). Resolver antes de tocar
  Prisma.
- **Límites de imagen:** tamaño máximo, formatos aceptados, resize server-side.
- **Política de credenciales del bucket:** variables de entorno y permisos,
  sin valores reales en el repo.

## Verificación

| Check | Resultado |
|-------|-----------|
| Solo documentación (sin código) | ✅ |
| Consistente con `DataOrigin`/`ReviewStatus` existentes | ✅ |
| Sin secretos ni credenciales | ✅ |
| Sin datos reales | ✅ |
| `type-check`/`build` | No requeridos: solo documentación. |

## Límites explícitos (MC-FOTOS-MVP-0)

- Solo agrega el preflight, este ADR y la actualización del plan.
- No toca código, API, Prisma schema, Postgres, seed.
- No toca Railway ni el bucket `orderly-suitcase`.
- No toca CORS, package.json, pnpm-lock.yaml.
- No hace deploy.
- No conecta dominio. No avanza a MC-11 ni MC-12.
- No inventa credenciales. No usa datos reales.

## Próximo paso recomendado

Autorizar **MC-FOTOS-MVP-1** (API + storage + modelo mínimo): entidad
`meal_photo_logs` en Prisma, endpoint de alta con upload al bucket, guards de
permisos y URLs firmadas — resolviendo antes las decisiones abiertas.

> **Freno aquí.** No se implementa nada del módulo de fotos sin autorización
> explícita.
