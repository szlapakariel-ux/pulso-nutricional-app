# ADR 0034 — MC-FOTOS-MVP-4: entrega de imagen al panel (streaming proxy con guard)

**Estado:** Aceptado ✅ — desplegado en producción, imágenes reales visibles en el panel
**Fecha:** 2026-06-22
**Microciclo:** MC-FOTOS-MVP-4

---

## Contexto

Tras MC-FOTOS-PROD-1 (ADR 0033), el upload de fotos funciona end-to-end: el
binario se persiste en el bucket `orderly-suitcase`. Pero el panel profesional
seguía mostrando un **placeholder** (`PhotoPlaceholder`) en vez de la imagen
real — comportamiento diferido deliberadamente en ADR 0032 (MVP-3), que dejó la
entrega de imagen para "MVP-4".

Síntoma reportado: en el tab Fotos, las 5 fotos del paciente mostraban "Imagen
pendiente de disponibilidad". El binario estaba en S3, pero **nadie lo pedía**.

Esto incumplía el criterio de aceptación original ("descarga de fotos funcionan
en ambas apps"). Este microciclo cierra esa brecha.

## Decisión

**Endpoint de streaming proxy con guard**, no URL firmada:

`GET /patients/:patientId/meal-photos/:photoId/image`

- Protegido por `requirePatientSelf` (mismo guard que el detalle): el paciente
  accede solo a lo propio; el profesional, a sus pacientes.
- El controller pide el binario al storage adapter y lo sirve con el
  `Content-Type` correcto y `Cache-Control: private, max-age=300`.
- **Nunca expone una URL pública permanente**: la `storageKey` no se convierte
  en URL; el binario se sirve desde el endpoint controlado.

### Por qué streaming proxy y no URL firmada (presigned)

| Criterio | Streaming proxy (elegido) | URL firmada |
|----------|---------------------------|-------------|
| Dependencias | Ninguna (ya está `@aws-sdk/client-s3`) | Requiere `@aws-sdk/s3-request-presigner` |
| Control de acceso | Guard de Fastify por request | TTL en la URL; una vez emitida, viaja sola |
| Exposición de endpoint S3 | Ninguna (el cliente solo ve la API) | La URL revela host/región del bucket |
| Reutilización | Reusa `requirePatientSelf` | Lógica nueva de firma |

El proxy es más simple y más seguro para el tamaño actual (imágenes ≤5 MB, bajo
volumen). Si el volumen crece, se puede migrar a URL firmada sin cambiar el
contrato del frontend (mismo método `getMealPhotoImageUrl`).

### Frontend: descarga autenticada → object URL

`<img src>` no envía el header `Authorization`. Por eso el panel:

1. Descarga el binario con `fetch` + Bearer (`getMealPhotoImageUrl`).
2. Crea un `URL.createObjectURL(blob)` y lo usa como `src`.
3. Revoca la URL al desmontar (sin fugas de memoria).

El componente `PhotoImage` **cae al placeholder con gracia** si el binario no
está disponible (404 / fallback local / modo no-API). Las fotos seed mock y los
registros sin binario en bucket siguen mostrando el placeholder sin error.

## Storage adapter

`MealPhotoStorageAdapter` suma `getObject(key): Promise<StoredObject | null>`:

- `S3MealPhotoStorage`: `GetObjectCommand` + `transformToByteArray()`. Captura
  `NoSuchKey`/`NotFound` → `null` (degradación con gracia).
- `LocalFallbackStorage`: devuelve `null` (sin bucket no hay binario).

## Componentes tocados

| Archivo | Cambio |
|---------|--------|
| `packages/api/src/config/storage.ts` | `MIME_BY_IMAGE_EXTENSION` + `contentTypeFromKey()`. |
| `packages/api/src/storage/meal-photo-storage.ts` | `StoredObject` + `getObject()` en interfaz, S3 y fallback. |
| `packages/api/src/services/meal-photos.service.ts` | `getMealPhotoImage()` (valida pertenencia + recupera binario). |
| `packages/api/src/controllers/meal-photos.controller.ts` | `getMealPhotoImageController` (sirve binario / 404). |
| `packages/api/src/routes/meal-photos.routes.ts` | Ruta `GET .../image` con `requirePatientSelf`. |
| `apps/pulso-nutricional-web/lib/api-client.ts` | `getMealPhotoImageUrl()` (fetch auth → object URL). |
| `apps/pulso-nutricional-web/app/meal-photos-view.tsx` | `PhotoImage` (real + fallback); banner actualizado. |
| `scripts/smoke-fotos-s3-upload.mjs` | Cobertura de descarga (status 200, image/*, bytes>0). |

## Verificación

| Check | Resultado |
|-------|-----------|
| `pnpm --filter @pulso/api type-check` | ✅ |
| `pnpm --filter @pulso/api build` | ✅ |
| `pnpm --filter pulso-nutricional-web type-check` | ✅ |
| `pnpm --filter pulso-nutricional-web build` (Next prod) | ✅ |
| Integración local (`fastify.inject`): ruta registrada, fallback → 404 con código | ✅ |
| Deploy en producción (merge `b524155` a `main` → Railway) | ✅ |
| Imágenes reales visibles en el panel profesional (verificado por Ariel) | ✅ |

## MC-FOTOS-MVP-4b — el paciente recupera sus fotos desde el backend

Extensión del mismo patrón al lado paciente (Mi Pulso). Cierra el round-trip
verificable desde la app del paciente, no solo desde el panel profesional.

| Archivo | Cambio |
|---------|--------|
| `apps/mi-pulso-web/lib/api-client.ts` | `listMealPhotos()` + `getMealPhotoImageUrl()` (espejo del panel). |
| `apps/mi-pulso-web/app/meal-photos-history.tsx` | Vista "Mis fotos": lista desde el backend + descarga cada binario con token. |
| `apps/mi-pulso-web/app/registrar-view.tsx` | Preview local en la pantalla de éxito + historial real bajo el tab Comida; refetch tras subir. |
| `scripts/smoke-fotos-s3-upload.mjs` | Check 8c: **sesión nueva** del paciente (re-login) → lista + binario recuperados desde S3. |

### Distinción importante: preview local vs. recuperación real

- La **preview** de la pantalla "Comida registrada" es el archivo local recién
  elegido (objectURL del `File`). Mejora la UX inmediata pero **no prueba** que
  S3 guardó nada.
- La sección **"Mis fotos"** lista desde Postgres (`GET /meal-photos`) y trae
  cada binario desde el bucket (`GET .../image`) con token. **Esto sí** prueba
  persistencia + recuperación: al refrescar o entrar desde otro dispositivo, las
  fotos cargan desde el backend, no desde una preview local.

### Criterio de cierre del round-trip (verificable en Railway)

`Paciente sube → archivo persiste → paciente lo revé en sesión nueva → profesional lo ve autenticado.`

El smoke `scripts/smoke-fotos-s3-upload.mjs` cubre la cadena completa de forma
automatizada, incluida la **sesión nueva** (check 8c: re-login del paciente y
recuperación del binario desde S3 con token fresco). La verificación manual
desde navegador (subir desde el celular, refrescar, ver en el panel) sigue
recomendada como confirmación visual.

## Pendiente

1. **Limpieza:** huérfanos pre-fix bajo `patients/demo-1/` en el bucket (sin fila
   DB, inocuos) — borrar desde el dashboard cuando se quiera.

> **Seguridad:** sin URL pública permanente, binario tras guard, `storageKey`
> nunca convertida en URL navegable. Coherente con los invariantes de ADR 0029/0032.
