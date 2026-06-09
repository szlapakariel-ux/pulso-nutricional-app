# 0005 — Nueva consulta + mediciones profesionales

- **Estado:** Aceptada
- **Fecha:** 2026-06-09
- **Microciclo:** MC-4
- **Contexto:** con la lista y ficha mínima de pacientes lista (MC-3), se agrega
  la primera experiencia de carga profesional: "Nueva consulta" con mediciones
  antropométricas. El objetivo es validar la separación de datos profesionales
  (validados) respecto de datos del paciente (revisables), dentro de la ficha
  del paciente.

---

## Decisión

### Tipos de dominio en `@pulso/shared`

Se agregaron en `packages/shared/src/types/consultation.ts`:

- `ConsultationId`, `ConsultationStatus` — identificadores y estado de consultas.
- `ConsultationSummary` — resumen para listados.
- `ConsultationDetail` — ficha completa con mediciones y notas profesionales.
- `NewConsultationDraft` — estructura para capturar datos de nueva consulta.
- `ProfessionalMeasurement` — medición tomada por la profesional.
- `MeasurementType`, `MeasurementUnit`, `MeasurementSource` — enumeraciones.
- `ConsultationPreviewResponse` — respuesta de simulación.

**Regla central aplicada:** una consulta y sus mediciones son DATO PROFESIONAL /
VALIDADO. No son `ReviewableData`. No necesitan pasar por bandeja de revisión.
Son distintos de `weight_logs` (que carga el paciente).

### Endpoints mock en `@pulso/api`

Provisionales de MC-4, read-only + preview simulado:

- `GET /patients/:patientId/consultations` — devuelve lista de resúmenes.
- `GET /patients/:patientId/consultations/:consultationId` — devuelve detalle
  con mediciones.
- `POST /patients/:patientId/consultations/preview` — simulación sin persistencia
  de nueva consulta (toma un draft, devuelve preview con `demo: true`).

Se mantiene estructura de capas: `routes → controllers → services →
mock-data/consultations.mock.ts`.

### UI en `apps/pulso-nutricional-web`

Se agregó experiencia de consultas:

- Componente `PanelView` que muestra sidebar (lista de pacientes) y área
  principal con tabs: "Ficha" y "Consultas".
- Tab "Consultas" lista las consultas del paciente y permite crear nuevas (en
  simulación).
- Formulario `ConsultationForm` con campos:
  - Fecha de consulta
  - Motivo / razón
  - Objetivo
  - Observaciones generales
  - **Nota profesional** (bloque explícito con fondo verde, marcado como
    "datos profesionales internos")
  - Mediciones dinámicas (peso, altura, cintura, cadera, % graso)
- Componente `ConsultationsView` muestra lista de consultas y detalle seleccionado.
- Los datos son mock locales (se duplican entre API y web, como MC-3).
- Aviso visible: "Datos ficticios de demostración — MC-4".

### Formulario de consulta

- **Nota profesional visible para la profesional**: bloque con fondo distintivo
  (`#f6ffed`) y aviso explícito: "Visible solo para la profesional · nunca se
  muestra al paciente."
- **Mediciones profesionales**: tabla editable con tipo, valor, unidad. Permite
  agregar/quitar.
- **Preview simulado**: al guardar, crea una consulta simulada en memoria (sin
  persistencia) y la muestra en la lista.

---

## Datos ficticios

Dos consultas de demostración:
- **Paciente Demo Uno** (demo-1): una consulta de "Seguimiento mensual" con
  mediciones de peso, altura y cintura.
- **Paciente Demo Dos** (demo-2): una consulta de "Evaluación inicial" con
  mediciones de peso y altura.
- **Paciente Demo Tres** (demo-3): sin consultas (pendiente de agregar nuevas en
  el formulario).

Todos los datos están marcados con `isDemoData: true` y son completamente
ficticios.

---

## Deferidos (NO implementados en MC-4)

- Base de datos, Prisma, migraciones reales.
- Persistencia de consultas (POST sin preview).
- Edición / eliminación de consultas.
- Conexión web ↔ API (web sigue usando mock local).
- Historial real de versiones de consultas.
- PDF de consulta.
- Carga de archivos (fotos, documentos).
- Validación compleja de mediciones (rangos clínicos).
- Railway, deploy, auth real, roles reales, permisos.
- Mi Pulso funcional, bandeja de revisión funcional.
- Avance a MC-5.

---

## Consecuencias

- Existe una pantalla navegable (pacientes → tab Consultas → nueva consulta →
  preview) que valida la separación entre datos profesionales (validados) y
  datos del paciente (revisables).
- Los datos mock están duplicados: API + web. La duplication es intencional
  (como MC-3) porque no hay conexión web ↔ API. Se resolverá en un microciclo
  posterior.
- La regla central (consultas = dato profesional / validado, no es
  ReviewableData) queda implementada a nivel de tipos y se refleja en la UI.
- Cambiar `ProfessionalMeasurement` o `ConsultationDetail` impacta API y web a
  la vez.
