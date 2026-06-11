# Fotos de comidas — Preflight funcional y técnico (MC-FOTOS-MVP-0)

> **Estado: DISEÑO. Nada implementado.**
> Este documento define el módulo de fotos de comidas de Mi Pulso como parte
> del MVP. **No hay código, no hay schema, no hay bucket configurado, no hay
> endpoints.** Ver la sección **"Qué queda fuera por ahora"**.
>
> Ver [ADR 0028](../decisiones/0028-fotos-comidas-mvp.md).

---

## 1. Por qué las fotos de comidas son parte del MVP

La demo online ya funciona end-to-end (API Railway, web profesional, Mi Pulso
con login paciente y Vista Hoy). La nueva definición de MVP incorpora las
fotos de comidas porque permiten que:

- el paciente **registre visualmente** lo que come;
- la nutricionista **vea porciones reales**, no descripciones aproximadas;
- la profesional pueda **dejar comentarios o ajustes antes de la consulta**;
- quede **material para trabajar durante la consulta**;
- los registros del paciente sean **revisables**, nunca datos profesionales
  automáticos.

---

## 2. Definición funcional

### Flujo del paciente (Mi Pulso)

1. El paciente toca **"Registrar comida"** en Mi Pulso.
2. Saca una foto o sube una existente.
3. Indica el **tipo de comida**: desayuno, almuerzo, merienda, cena,
   colación, otro.
4. Opcionalmente agrega un **comentario corto** ("comí afuera", "no había
   verdura").
5. Envía. La foto queda registrada como **dato reportado por paciente**,
   con estado **"Pendiente de revisión"** visible en la UI.

### Flujo de la profesional (panel)

1. Ve la sección **"Fotos de comidas"** de cada paciente.
2. Revisa la foto, el tipo de comida y el comentario del paciente.
3. Puede dejar un **comentario profesional** ("buena porción de proteína",
   "sumá una fruta acá").
4. Puede **marcar como revisada** la foto (acción explícita).
5. Las fotos quedan disponibles como **material para la consulta**.

---

## 3. Regla de datos (no negociable)

Se aplica la **regla central del producto** (`packages/shared/src/types/domain.ts`):

- Las fotos cargadas por el paciente **NO son datos profesionales validados**.
- Toda foto nace con:
  - `origin: "patient_reported"`
  - `reviewStatus: "pending"`
- **No se mezclan automáticamente** con datos profesionales.
- **No aparecen como validadas** hasta una intervención profesional explícita.
- La transición de estado usa el `ReviewStatus` existente:
  `pending → reviewed | accepted | flagged` — solo por acción de la profesional,
  igual que los registros de MC-7/MC-8.

---

## 4. Modelo conceptual — `meal_photo_logs`

Entidad nueva, hermana de `meal_logs` (MC-7). **No reemplaza** el registro de
comida por texto; lo complementa.

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | string (opaco) | Identificador del registro. |
| `patientId` | string | FK al paciente. Obligatorio. |
| `storageKey` | string | Key del objeto en el bucket. **Preferida sobre `photoUrl`**: la URL se deriva (firmada) al servir; la key es estable. Postgres NUNCA guarda el binario. |
| `mealType` | enum | `breakfast` \| `lunch` \| `snack` (merienda) \| `dinner` \| `collation` (colación) \| `other`. Ver nota de alineación abajo. |
| `patientComment` | string? | Comentario corto opcional del paciente. |
| `professionalComment` | string? | Comentario de la nutricionista. Solo escribible por rol profesional. |
| `reviewStatus` | `ReviewStatus` | `pending` (default) \| `reviewed` \| `accepted` \| `flagged`. Reusa el tipo existente. |
| `origin` | `DataOrigin` | Siempre `"patient_reported"`. |
| `createdAt` | timestamp | Alta del registro. |
| `reviewedAt` | timestamp? | Cuándo la profesional lo revisó. |
| `reviewedBy` | string? | Id del profesional que revisó. |

> **Nota de alineación:** `PatientMealLog` (MC-7) usa `timeOfDay` con momentos
> (`breakfast`, `mid_morning`, `lunch`, `afternoon`, `snack`, `dinner`, `night`).
> El `mealType` pedido para fotos (desayuno/almuerzo/merienda/cena/colación/otro)
> es una lista distinta y más simple. En MC-FOTOS-MVP-1 se decidirá si:
> (a) `mealType` propio de fotos (como aquí), o
> (b) converger con `timeOfDay` para no tener dos vocabularios.
> Esta es una **decisión abierta** registrada en ADR 0028.

---

## 5. Storage

- **Bucket:** se usará el bucket Railway/S3 **`orderly-suitcase`** (futuro;
  hoy no se toca ni se configura nada).
- **La imagen vive en el storage; Postgres solo guarda la referencia**
  (`storageKey`), nunca el binario.
- **Criterio preliminar de path:**

  ```
  patients/{patientId}/meal-photos/{year}/{month}/{fileId}
  ```

  - `patientId` en el path facilita controles de acceso por prefijo y borrado
    por paciente.
  - `year/month` evita directorios gigantes y facilita archivado.
  - `fileId` generado por el servidor (no nombre original del archivo, para
    evitar colisiones y fuga de metadatos del dispositivo).
- **No se implementa nada de esto sin autorización explícita** (MC-FOTOS-MVP-1).

---

## 6. Permisos

| Acción | Paciente | Profesional |
|--------|----------|-------------|
| Crear foto propia | ✅ | — |
| Ver fotos propias (historial, si se incluye) | ✅ | — |
| Ver fotos de sus pacientes | ❌ | ✅ |
| Comentar / revisar | ❌ | ✅ |
| Ver fotos de OTRO paciente | ❌ NUNCA | solo de sus pacientes |

Reglas duras:

- **Nunca exponer fotos de un paciente a otro paciente.** Los guards existentes
  (`requirePatientSelf`, MC-10.5D) son el patrón a reusar.
- **No hacer URLs públicas** sin decisión explícita.
- **Preferir URLs firmadas** (expirables) o un mecanismo controlado equivalente
  cuando se implemente la entrega de imágenes.

---

## 7. UI futura

### Mi Pulso (paciente)

- Botón **"Registrar comida"**.
- Sacar foto / subir desde galería.
- Selector de **tipo de comida**.
- Campo de **comentario opcional**.
- Estado visible: **"Pendiente de revisión"**.

### Panel profesional

- Sección **"Fotos de comidas"** por paciente.
- **Filtros** por fecha y tipo de comida.
- Indicador de estado **pendiente / revisado**.
- Campo de **comentario profesional**.
- Acción **"Marcar como revisado"** (explícita, nunca automática).

---

## 8. Qué queda fuera por ahora

🚫 Explícitamente **fuera de alcance** hasta nueva autorización:

- **No** estimación automática de calorías.
- **No** diagnóstico automático por IA.
- **No** datos reales.
- **No** subida real de archivos todavía.
- **No** bucket productivo sin permisos definidos.
- **No** exportar fotos a PDF sin decisión posterior.
- **No** Play Store.
- **No** dominio propio.
- **No** MC-11.

---

## 9. Roadmap propuesto

| Microciclo | Contenido | Estado |
|------------|-----------|--------|
| **MC-FOTOS-MVP-0** | Preflight y documentación (este documento + ADR 0028). | ✅ Completado |
| **MC-FOTOS-MVP-1** | API + storage + modelo mínimo: modelo `MealPhotoLog` en Prisma, endpoints con guards, contrato del storage adapter. **Upload real del binario diferido a MVP-2** (ver ADR 0029). | ✅ Completado (backend metadata-only) |
| **MC-FOTOS-MVP-2** | Mi Pulso: UI "Registrar comida" (tomar foto / subir desde galería, tipo, comentario) + **upload real del binario** (multipart/form-data, `@fastify/multipart`, SDK S3, fallback local). Ver ADR 0030. | ✅ Completado (código implementado; sin deploy ni bucket productivo) |
| **MC-FOTOS-MVP-3** | Panel profesional: sección "Fotos de comidas", revisar/comentar + entrega de imagen por URL firmada/endpoint controlado. | Pendiente |
| **MC-FOTOS-MVP-4** | Smoke test Railway de la cadena completa. | Pendiente |

> **Decisión resuelta en MC-FOTOS-MVP-1 (ADR 0029):** `mealType` usa enum
> propio `MealPhotoType` (`breakfast | lunch | snack | dinner | collation |
> other`) — no converge con `timeOfDay` de MC-7. El endpoint de review usa
> **POST** (no PATCH) por consistencia con review-inbox y porque CORS solo
> permite GET/POST/OPTIONS.

Cada ciclo requiere autorización explícita antes de ejecutarse.

---

## 10. Brechas y riesgos identificados

| # | Brecha / Riesgo | Mitigación propuesta |
|---|-----------------|----------------------|
| 1 | El bucket `orderly-suitcase` no tiene credenciales/permisos definidos en el repo. | MC-FOTOS-MVP-1 define variables de entorno (sin valores reales en el repo) y política de acceso antes de subir nada. |
| 2 | Tamaño/formato de imagen sin límite definido. | Definir en MC-FOTOS-MVP-1: límite de tamaño (p. ej. unos pocos MB), formatos (JPEG/PNG/WebP/HEIC→conversión), y si hay resize server-side. |
| 3 | Dos vocabularios de tipo de comida (`timeOfDay` de MC-7 vs `mealType` de fotos). | Decisión abierta en ADR 0028; resolver en MC-FOTOS-MVP-1 antes de tocar Prisma. |
| 4 | Privacidad: las fotos son datos sensibles del paciente. | URLs firmadas, path por paciente, guards `requirePatientSelf`, sin URLs públicas. |
| 5 | Mi Pulso hoy es solo lectura contra la API. | MC-FOTOS-MVP-2 será la **primera escritura** desde Mi Pulso; requiere ampliar CORS_METHODS si se usan métodos nuevos (hoy solo GET/POST/OPTIONS — POST ya está permitido). |

---

> **Freno aquí. MC-FOTOS-MVP-0 es solo documentación. No se implementa storage,
> API, Prisma ni UI sin autorización explícita de MC-FOTOS-MVP-1 en adelante.**
