# 0009 — Bandeja de revisión profesional

- **Estado:** Aceptada
- **Fecha:** 2026-06-10
- **Microciclo:** MC-8
- **Contexto:** con los registros del paciente listos como datos revisables
  (MC-7), se agrega la bandeja profesional donde la nutricionista ve, comenta
  y ejecuta acciones explícitas sobre esos registros. El objetivo es validar
  que **las acciones de revisión cambian el estado del registro pero NO lo
  convierten en dato profesional/validado**, y que **no hay validación
  automática**.

---

## Decisión

### Tipos de dominio en `@pulso/shared`

Se agregaron en `packages/shared/src/types/review-inbox.ts`:

- `ReviewActionType` — enum: `"mark_reviewed" | "accept" | "flag" | "comment"`.
- `ReviewActionId` — identificador de acción (string opaco).
- `ReviewActionDraft` — draft de una acción de revisión.
- `ReviewActionPreview` — preview simulado de la acción ejecutada.
- `ReviewInboxItem` — ítem en la bandeja del profesional.
- `ReviewInboxResponse` — respuesta de la bandeja (lista + metadatos).
- `ReviewInboxStats` — estadísticas de la bandeja (pendientes, revisados, etc.).
- Versión bumpeada a `0.0.0-mc8`.

**Regla central aplicada:**
- Los registros del paciente permanecen como `ReviewableData<T>` incluso
  después de una acción de revisión.
- Las acciones ("mark_reviewed", "accept", "flag", "comment") cambian el
  `reviewStatus` pero **NUNCA crean un `ValidatedData`**.
- No hay validación automática.
- No hay creación de datos profesionales (mediciones, consultas).
- Cada acción es explícita.
- No hay persistencia en MC-8.

### Endpoints mock en `@pulso/api`

Provisionales de MC-8, read-only + preview simulado, sin persistencia:

- `GET /professionals/demo/review-inbox` — devuelve registros pendientes de
  todos los pacientes. Respuesta: `{ data: ReviewInboxResponse, meta: { demo: true } }`
- `GET /patients/:patientId/review-inbox` — devuelve registros del paciente
  específico. Respuesta: `{ data: ReviewInboxResponse, meta: { demo: true } }`
- `POST /review-inbox/:entryId/action/preview` — simula una acción de revisión.
  Body: `{ actionType, comment?, notes? }`
  Respuesta: `{ data: ReviewActionPreview, meta: { demo: true } }`

Se mantiene estructura de capas:
`routes → controllers → services → mock-data/review-inbox.mock.ts`.

Cada respuesta marca explícitamente:
- `origin: "patient_reported"` — el registro sigue siendo del paciente
- `reviewStatus: "pending" | "reviewed" | "accepted" | "flagged"` — estado
  actualizado por la acción
- Aviso de no persistencia y que permanece como `ReviewableData`
- `meta.demo: true`

### UI en `apps/pulso-nutricional-web`

Se agregó nueva pestaña "Revisión" en el panel profesional:

- **Pestaña "Revisión"**: nueva opción en `activeTab` junto a Ficha,
  Consultas, Plan y agenda.
- **Bandeja de registros**: muestra registros del paciente seleccionado con:
  - Tipo (🍽️ Comida, ⚖️ Peso, 💬 Nota)
  - Fecha/hora
  - Resumen del contenido
  - Estado: `pending`, `reviewed`, `accepted`, `flagged`
  - Aviso: "Dato revisable del paciente"
- **Panel de detalles y acciones**: al seleccionar un registro:
  - Detalles completos del contenido
  - Aviso: "Este es un dato revisable (ReviewableData). Permanece así incluso
    después de tus acciones."
  - Botones de acción (demo, sin persistencia):
    - 👁️ Marcar revisado
    - ✅ Aceptar
    - 🚩 Marcar para seguimiento
  - Aviso de simulación sin persistencia

### Datos ficticios

- **Bandeja con 4 registros de ejemplo:**
  - Comida de demo-1 (pendiente)
  - Peso de demo-1 (revisado — muestra acción previa)
  - Nota/pregunta de demo-1 (pendiente)
  - Peso de demo-2 (pendiente)
- Todos marcados `isDemoData: true`.
- No representan registros clínicos reales.

---

## Deferidos (NO implementados en MC-8)

- Persistencia real (DB, Prisma, migraciones).
- Conexión web ↔ API — Panel sigue usando mock local.
- Creación de `ValidatedData` desde `ReviewableData`.
- Creación automática de mediciones profesionales.
- Creación automática de consultas.
- Historial de revisión real.
- Auditoría real de acciones.
- Notificaciones al paciente cuando se revisa su registro.
- Filtros avanzados de bandeja.
- Exportación/reporte de bandeja.
- Autenticación real y sesión profesional.
- Roles y permisos reales.
- Base de datos, Railway, deploy.
- PDF de bandeja.
- Actividad física (MC-10).
- Avance a MC-9.

---

## Consecuencias

- Existen tres endpoints que entregan la bandeja de revisión.
- La bandeja muestra registros como `ReviewableData` con múltiples estados
  de revisión (`pending`, `reviewed`, `accepted`, `flagged`).
- Las acciones de revisión cambian el `reviewStatus` dentro de
  `ReviewableData` pero **NO convierten a `ValidatedData`**.
- La UI profesional valida explícitamente que los registros permanecen como
  `ReviewableData`.
- El patrón de "acción explícita sin validación automática" queda establecido
  para futuras transiciones de estado (MC+).
- Cambiar `ReviewableData`, `ReviewStatus` o `ReviewInboxItem` impacta API
  y web a la vez.

---

## Verificaciones

| Verificación | Resultado |
|---|---|
| Todos los registros en bandeja son `ReviewableData` | ✅ |
| `origin: "patient_reported"` se preserva en todas las acciones | ✅ |
| Las acciones cambian `reviewStatus` dentro de `ReviewableData` | ✅ |
| Ninguna acción crea `ValidatedData` | ✅ |
| Ninguna acción persiste realmente | ✅ |
| No hay validación automática | ✅ |
| No hay DB/Prisma/migraciones | ✅ |
| No hay auth real ni roles | ✅ |
| No hay datos reales | ✅ |
