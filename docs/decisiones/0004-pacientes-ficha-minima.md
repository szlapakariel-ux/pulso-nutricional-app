# 0004 — Pacientes y ficha mínima

- **Estado:** Aceptada
- **Fecha:** 2026-06-09
- **Microciclo:** MC-3
- **Contexto:** con la API mínima lista (MC-2), se construye la primera
  experiencia visible del panel profesional: el módulo de pacientes con lista y
  ficha mínima. El objetivo es validar la pantalla y los contratos de dominio,
  usando exclusivamente datos ficticios y sin persistencia real.

---

## Decisión

### Tipos de dominio en `@pulso/shared`

Se agregaron en `packages/shared/src/types/patient.ts`:

- `PatientId`, `ProfessionalId` — identificadores opacos.
- `PatientStatus` — `active` | `inactive` | `pending`.
- `PatientSummary` — datos no sensibles para listados.
- `PatientDetail` — extiende el resumen con `professionalNote` (dato
  profesional), `professionalId` e `isDemoData`.
- `ProfessionalSummary` — datos básicos de la profesional.
- `PatientVisibilityNote` — documenta, a nivel de tipo, qué campos son visibles
  al paciente y cuáles son exclusivos de la profesional.

**Regla central aplicada:** un paciente es un dato profesional; lo que el
paciente ve de su ficha es limitado (`PatientSummary`); la `professionalNote`
nunca debe exponerse a la experiencia del paciente.

### Endpoints mock en `@pulso/api`

Provisionales de MC-3, read-only, sobre datos mock en memoria:

- `GET /patients` — devuelve `{ data: PatientSummary[], meta: { demo: true } }`.
  Proyecta a resumen, **sin** incluir la nota profesional.
- `GET /patients/:id` — devuelve `{ data: PatientDetail, meta: { demo: true } }`
  o `404` con `ApiErrorResponse` si no existe.

Se mantiene la estructura de capas: `routes → controllers → services →
mock-data`. La capa `mock-data/patients.mock.ts` aísla los datos ficticios para
que su reemplazo por una DB real (microciclos posteriores) sea localizado.

### UI en `apps/pulso-nutricional-web`

Se reemplaza el placeholder por una pantalla mínima:

- Título "Pulso Nutricional", sección "Pacientes".
- Lista de pacientes ficticios con buscador simple (filtro por nombre).
- Ficha mínima con nombre, edad, objetivo, último control, estado y un bloque
  explícito **"Datos profesionales"**.
- Aviso visible: "Datos ficticios de demostración — MC-3".

La UI **no se conecta a la API todavía**: usa datos mock locales tipados con los
contratos de `@pulso/shared`. La conexión web↔API se difiere a un microciclo
posterior para mantener MC-3 acotado.

---

## Datos ficticios

Todos los pacientes son inventados y están marcados con `isDemoData: true`:
"Paciente Demo Uno", "Paciente Demo Dos", "Paciente Demo Tres". No representan a
ninguna persona real.

---

## Deferidos (NO implementados en MC-3)

Login, autenticación, roles, permisos, base de datos, Prisma, migraciones,
Railway, deploy, workflows/CI, datos reales, importación de pacientes, edición/
creación/eliminación de pacientes, consultas, mediciones, planes, registros del
paciente, bandeja de revisión funcional, PDF, carga de archivos, conexión
web↔API. No se avanzó a MC-4.

---

## Consecuencias

- Existe una pantalla navegable (lista → ficha) que valida los contratos de
  paciente y la frontera de visibilidad profesional/paciente.
- Los datos mock están duplicados intencionalmente en la API
  (`packages/api/src/mock-data`) y en la web (`app/patients.mock.ts`) porque
  todavía no hay conexión entre ambos. Al conectar web↔API, la web dejará de
  tener su mock local.
- Cambiar `PatientDetail` o `PatientSummary` impacta API y web a la vez.
