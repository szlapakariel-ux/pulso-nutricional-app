# ADR 0029 — Fotos de comidas: API + modelo mínimo + storage adapter (MC-FOTOS-MVP-1)

**Estado:** Aceptado
**Microciclo:** MC-FOTOS-MVP-1
**Fecha:** 2026-06-11

---

## Contexto

MC-FOTOS-MVP-0 (ADR 0028) incorporó las fotos de comidas al MVP y dejó el
diseño documentado. Este ciclo implementa el backend mínimo: modelo Prisma,
tipos compartidos, endpoints con guards y el contrato del storage adapter —
**sin tocar Railway, sin credenciales reales, sin upload real del binario y
sin UI de Mi Pulso** (eso es MC-FOTOS-MVP-2).

## Decisiones

### 1. `mealType` propio (Opción A) — no converge con `timeOfDay`

Se evaluó reutilizar `timeOfDay` de `PatientMealLog` (MC-7:
`breakfast | mid_morning | lunch | afternoon | snack | dinner | night`,
7 momentos de agenda) vs un vocabulario propio para fotos.

**Decisión: enum propio `MealPhotoType`**
(`breakfast | lunch | snack | dinner | collation | other`):

- La lista de 6 valores es el requisito de producto confirmado en
  MC-FOTOS-MVP-0 (desayuno, almuerzo, merienda, cena, colación, otro).
- `timeOfDay` no tiene `other` (necesario: el paciente fotografía cosas que
  no encajan en categorías) ni distingue `collation` como concepto propio.
- Agregar `other`/`collation` a `DayMoment` contaminaría el vocabulario de
  planes/agenda, usado por la web profesional y la Vista Hoy.
- Mapeo documentado: `snack` = merienda, `collation` = colación.

### 2. Upload diferido (Opción B del enunciado)

El ciclo **no** agrega multipart ni el SDK de S3:

- `POST /patients/:patientId/meal-photos` acepta **metadata JSON**
  (`mealType` obligatorio, `patientComment` opcional) y crea el registro con
  una `storageKey` **reservada**, generada en servidor.
- El upload real del binario (multipart + SDK S3 + URL firmada) queda
  **explícitamente pendiente para MC-FOTOS-MVP-2**, junto con la UI de
  tomar/subir foto.
- Ventaja: no se toca `package.json`/`pnpm-lock.yaml` (permitido solo "si es
  estrictamente necesario" — no lo es con el upload diferido).

### 3. Review por POST, no PATCH

`POST /patients/:patientId/meal-photos/:photoId/review` (en lugar del PATCH
sugerido) por dos razones:

- Consistencia con el patrón existente de acciones de review-inbox (MC-8),
  que usa POST.
- `CORS_METHODS` solo permite `GET/POST/OPTIONS` y este ciclo **no puede
  tocar CORS**. Con POST, el panel profesional podrá llamar al endpoint en
  MC-FOTOS-MVP-3 sin cambios de CORS.

### 4. Storage adapter: contrato sin implementación

- `config/storage.ts`: configuración 100% por variables de entorno
  (`S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
  `S3_BUCKET`) — sin valores reales, sin hardcodear nada. Constantes de
  validación: MIME permitidos (`image/jpeg`, `image/png`, `image/webp`) y
  límite preliminar de **5 MB**.
- `storage/meal-photo-storage.ts`: interfaz `MealPhotoStorageAdapter`
  (`isConfigured`, `putObject`), generador de keys
  `patients/{patientId}/meal-photos/{year}/{month}/{fileId}.{ext}` con
  `fileId` UUID de servidor (nunca el nombre original del archivo), y un
  adapter actual que rechaza `putObject` con error explícito.
- **Sin URL pública**: el contrato no expone `S3_PUBLIC_BASE_URL`; la entrega
  será por URL firmada o endpoint controlado en ciclos futuros.

### 5. Regla de datos (verificada por smoke local)

- Todo registro nace `origin: patient_reported`, `reviewStatus: pending`
  (defaults en Prisma + hardcodeado en servicio; el cliente no puede
  influir).
- El body de creación tiene `additionalProperties: false`: si el paciente
  envía `professionalComment`, `reviewStatus` u `origin`, **se descartan**.
- La revisión profesional solo acepta `reviewed | accepted | flagged`
  (nunca `pending`) y **nunca cambia `origin`**.
- Guards: crear/listar/detalle → `requirePatientSelf`; review →
  `requireProfessional` (el paciente no puede comentar como profesional ni
  cambiar estados).

## Componentes

| Archivo | Rol |
|---------|-----|
| `packages/shared/src/types/meal-photo.ts` | `MealPhotoType`, `MealPhotoLog`, drafts. |
| `packages/api/prisma/schema.prisma` | Enum `MealPhotoType` + modelo `MealPhotoLog` (sección revisables) + relación en `Patient`. |
| `packages/api/prisma/seed.ts` | 1 foto demo ficticia (storageKey sin binario). |
| `packages/api/src/config/storage.ts` | Config S3 por env + constantes de validación. |
| `packages/api/src/storage/meal-photo-storage.ts` | Contrato del adapter + generador de storageKey. |
| `packages/api/src/mock-data/meal-photos.mock.ts` | Store en memoria con 2 registros demo ficticios. |
| `packages/api/src/repositories/meal-photos.repository.ts` | CRUD Prisma (modo `PULSO_DATA_SOURCE=prisma`). |
| `packages/api/src/services/meal-photos.service.ts` | Lógica con rama mock\|prisma e invariantes del dominio. |
| `packages/api/src/controllers/meal-photos.controller.ts` | Validación y respuestas (solo metadata). |
| `packages/api/src/routes/meal-photos.routes.ts` | 4 endpoints con guards y schemas estrictos. |
| `packages/api/.env.example` | Sección S3 documentada sin valores. |

## Endpoints

| Método | Ruta | Guard | Rol |
|--------|------|-------|-----|
| POST | `/patients/:patientId/meal-photos` | `requirePatientSelf` | Paciente crea registro propio. |
| GET | `/patients/:patientId/meal-photos` | `requirePatientSelf` | Paciente lista lo propio / profesional lo de sus pacientes. |
| GET | `/patients/:patientId/meal-photos/:photoId` | `requirePatientSelf` | Detalle (metadata, sin binario). |
| POST | `/patients/:patientId/meal-photos/:photoId/review` | `requireProfessional` | Avanza estado + comentario profesional. |

## Verificación

| Check | Resultado |
|-------|-----------|
| `prisma generate` (schema válido) | ✅ |
| `pnpm type-check` / `pnpm build` / `pnpm lint` | ✅ |
| Smoke local (fastify.inject, modo mock) | ✅ create 201 pending/patient_reported · mealType inválido 400 · campos prohibidos descartados · review 200 sin cambiar origin · review "pending" 400 · 404 correcto |
| Sin credenciales reales / sin URLs públicas | ✅ |
| Railway / Postgres productivo / deploy | ✅ No tocados |

## Pendiente para MC-FOTOS-MVP-2

1. **Upload real del binario**: multipart en el endpoint de creación (o flujo
   de URL firmada de subida), SDK S3, validación efectiva de MIME y tamaño
   (constantes ya definidas), escritura al bucket `orderly-suitcase`.
2. **UI de Mi Pulso**: botón "Registrar comida", tomar foto con cámara o
   subir desde galería, selector de tipo, comentario, estado "Pendiente de
   revisión".
3. **Entrega de imágenes**: URL firmada o endpoint controlado para que la
   profesional vea la foto (MC-FOTOS-MVP-3).
4. Decidir variables/permisos reales del bucket en Railway (no en el repo).

> **Freno aquí.** No se avanza a upload real, UI, bucket, dominio, Play
> Store, MC-11 ni MC-12 sin autorización explícita.
