# ADR 0030 — Fotos de comidas: upload real + UI Mi Pulso (MC-FOTOS-MVP-2)

**Estado:** Aceptado
**Microciclo:** MC-FOTOS-MVP-2
**Fecha:** 2026-06-11

---

## Contexto

MC-FOTOS-MVP-1 (ADR 0029) dejó el backend con metadata-only: registros
`MealPhotoLog` con `storageKey` reservada pero sin binario real. Este
ciclo completa el upload: el paciente puede tomar o subir una foto desde
Mi Pulso, y el backend la persiste en el bucket S3-compatible si las
credenciales están configuradas.

## Decisiones

### 1. Dependencias nuevas (mínimas justificadas)

| Paquete | Justificación |
|---------|---------------|
| `@fastify/multipart` v9 | Necesario para parsear `multipart/form-data` en Fastify v5. Sin él no hay forma de recibir el binario. |
| `@aws-sdk/client-s3` v3 | SDK oficial modular (solo `S3Client` + `PutObjectCommand`). Permite subir al bucket S3-compatible Railway sin implementar Signature V4 manualmente. |

No se agregó ningún paquete al frontend (`mi-pulso-web`): el browser
implementa `File`, `FormData` y `fetch` nativamente.

### 2. Endpoint de creación: multipart/form-data

`POST /patients/:patientId/meal-photos` ahora acepta
`multipart/form-data` con los campos:

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `file` | imagen (jpeg/png/webp, máx 5 MB) | ✅ |
| `mealType` | string del enum `MealPhotoType` | ✅ |
| `patientComment` | string (máx 500 chars) | ❌ |

**Campos prohibidos** (`professionalComment`, `reviewStatus`, `origin`) son
descartados por el parser manual del controller — equivalente a
`additionalProperties: false` del MVP-1. El schema de JSON no se usa para
este endpoint (multipart no es JSON).

**415 Unsupported Media Type** si el cliente manda `application/json`.

**Por qué multipart y no base64 JSON:** multipart es el mecanismo estándar
del browser (`<input type="file">` + `FormData`), no requiere dependencias
en el cliente, y el tamaño del payload no se expande (base64 crece ~33%).

### 3. Carga del binario en app.ts

`@fastify/multipart` se registra globalmente con:
- `limits.fileSize = MAX_IMAGE_SIZE_BYTES` (5 MB) → el plugin lanza
  `FST_REQ_FILE_TOO_LARGE` si se excede.
- `limits.files = 1` → se acepta un solo archivo por request.
- `limits.fields = 5` → suficiente para los campos del form.

El plugin solo intercepta peticiones `multipart/form-data`; el resto de
las rutas (JSON) no se ven afectadas.

### 4. Storage adapter: S3 real + fallback local

Dos implementaciones de `MealPhotoStorageAdapter`:

**`S3MealPhotoStorage`** (cuando todas las variables S3_* están definidas):
- Usa `@aws-sdk/client-s3` con `PutObjectCommand`.
- `forcePathStyle: true` para buckets S3-compatibles (Railway, MinIO, etc.).
- Si falla, la excepción propaga y el metadata **NO se guarda** (no quedan
  keys huérfanas sin binario en bucket).

**`LocalFallbackStorage`** (cuando falta alguna variable S3_*):
- Descarta el binario con `console.warn`.
- El metadata se guarda igual.
- Útil para desarrollo local y smoke tests sin credenciales.
- `isConfigured()` devuelve `false` para distinguirlo del S3 real.

La fábrica `getMealPhotoStorage()` elige automáticamente según
`getStorageConfig()`.

### 5. Invariantes de dato revisable (sin cambios)

- `origin: "patient_reported"` siempre, desde el service. No modificable.
- `reviewStatus: "pending"` al crear siempre.
- El paciente no puede inyectar `professionalComment`, `reviewStatus` ni
  `origin` (validación manual en controller con parsing selectivo de fields).

### 6. UI Mi Pulso (MC-FOTOS-MVP-2)

En `hoy-view.tsx`, en la vista autenticada API:
- Botón **"Registrar foto de comida"** visible cuando `auth.user.patientId`
  está disponible.
- Abre `RegisterPhotoForm` en línea (sin navegación):
  - `<input type="file" accept="image/jpeg,image/png,image/webp">` — sin
    atributo `capture`: el SO muestra opciones (cámara + galería) en mobile.
  - Validación client-side de MIME y tamaño antes de enviar (mejor UX).
  - Preview con `URL.createObjectURL`, liberado al desmontar.
  - Selector de `MealPhotoType` (6 opciones: desayuno/almuerzo/merienda/
    cena/colación/otro).
  - Campo de comentario opcional (máx 500).
  - Estado de carga ("Enviando…").
  - Mensaje de éxito: **"Comida registrada. Pendiente de revisión por tu
    profesional."** — opciones de "Registrar otra" o "Cerrar".
  - Mensaje de error con texto del servidor.

### 7. Método `createMealPhoto` en `ApiClient`

Envía `FormData` con `fetch` sin `Content-Type` manual (el browser lo
establece con el boundary automáticamente). El token Bearer se incluye
en el header `Authorization`.

### 8. Variables de entorno (sin valores reales)

Las mismas definidas en ADR 0029, ya documentadas en `.env.example`:
`S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
`S3_BUCKET`. Sin valores hardcodeados en el repo.

## Verificación

| Check | Resultado |
|-------|-----------|
| `pnpm --filter @pulso/api db:generate` | ✅ (schema sin cambios) |
| `pnpm type-check` | ✅ |
| `pnpm build` | ✅ |
| `pnpm lint` | ✅ |
| Smoke local multipart (22 casos) | ✅ |
| Sin archivo → 400 MISSING_FILE | ✅ |
| mealType inválido → 400 INVALID_MEAL_TYPE | ✅ |
| MIME inválido → 400 INVALID_MIME_TYPE | ✅ |
| Content-Type JSON → 415 | ✅ |
| Crear válido → 201 patient_reported/pending | ✅ |
| Campos prohibidos descartados | ✅ |
| Review "pending" → 400 | ✅ |
| Review válido → 200, origin no cambia | ✅ |
| Sin credenciales reales | ✅ |
| Sin deploy / Railway | ✅ |
| Sin db:push productivo | ✅ |

## Pendiente para MC-FOTOS-MVP-3

1. **Entrega de la imagen**: URL firmada (expirable) o endpoint controlado
   `GET /patients/:patientId/meal-photos/:photoId/download` para que la
   profesional vea la foto sin URLs públicas permanentes.
2. **Panel profesional**: sección "Fotos de comidas" por paciente, filtros
   por fecha/tipo, indicador pendiente/revisado, comentario profesional,
   acción "Marcar como revisado".

## Pendiente para MC-FOTOS-MVP-4

- Smoke test Railway de la cadena completa (upload → storage → metadata DB).
- Requiere `db:push` autorizado y bucket configurado en Railway.

> **Freno aquí.** No se avanza a panel profesional, smoke Railway, dominio,
> Play Store, MC-11 ni MC-12 sin autorización explícita.
