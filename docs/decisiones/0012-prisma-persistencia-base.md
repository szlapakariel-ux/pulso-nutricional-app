# ADR 0012 — Prisma como base técnica de persistencia (MC-10.5A)

**Estado:** Aceptado  
**Microciclo:** MC-10.5A  
**Fecha:** 2026-06-10

## Contexto

Después de MC-10, el sistema tiene ~6,000 líneas de código funcional y 20+ endpoints, pero toda la persistencia es en-memoria (mocks). MC-10.5A introduce Prisma como capa técnica de persistencia sin conectar producción ni reemplazar los mocks existentes.

## Decisión

Usar **Prisma ORM** como capa de acceso a datos, con **PostgreSQL** como base de datos.

### Por qué Prisma

- Type-safety nativa integrada con TypeScript (auto-generación de tipos desde el schema)
- Prisma Migrate para gestión de migraciones controladas
- Prisma Studio para inspección visual de datos en desarrollo
- Alineación con el modelo de datos conceptual documentado en `modelo-datos-inicial.md`
- Ampliamente adoptado en el ecosistema Node.js + TypeScript

### Ubicación del schema

```
packages/api/prisma/schema.prisma
packages/api/prisma/seed.ts
packages/api/src/lib/prisma.ts  ← singleton del cliente (no conectado aún)
```

El schema vive en `packages/api/` porque la API es el único consumidor de la DB (regla de la arquitectura: las apps web NO acceden directamente a la DB).

### Modelos implementados

| Modelo | Tipo de dato | Notas |
|---|---|---|
| `User` | Sistema | Auth base. Rol: `professional` \| `patient` |
| `Professional` | Validado | Nunca mezclar con registros del paciente |
| `Patient` | Validado | `professionalNote` = NUNCA al paciente |
| `ProfessionalPatientLink` | Sistema | Relación many-to-many |
| `Consultation` | Validado (profesional) | `professionalNote` = NUNCA al paciente |
| `Measurement` | Validado (profesional) | Tomada por profesional, no auto-calculada |
| `MealPlan` | Validado (profesional) | `generalIndications` visible al paciente; `professionalNote` no |
| `MealPlanItem` | Validado (profesional) | Comidas del plan |
| `PatientPlanAssignment` | Validado (profesional) | Asignación de plan a paciente |
| `PatientAgendaItem` | Validado (profesional) | Agenda diaria; `professionalNote` nunca al paciente |
| `ActivitySettings` | Validado (profesional) | Habilita módulo opcional por paciente |
| `ExercisePrescription` | Validado (profesional) | Prescripción de actividad |
| `MealLog` | **Revisable (paciente)** | `origin=patient_reported`, `reviewStatus=pending` |
| `WeightLog` | **Revisable (paciente)** | `origin=patient_reported`, `reviewStatus=pending` |
| `PatientNote` | **Revisable (paciente)** | `origin=patient_reported`, `reviewStatus=pending` |
| `ExerciseLog` | **Revisable (paciente)** | `origin=patient_reported`, `reviewStatus=pending` |
| `ReviewAction` | Sistema | Acciones de revisión profesional (auditoría) |

### Separación de dominio en el schema

Los modelos revisables tienen dos campos obligatorios que refuerzan la regla central:

```prisma
origin       DataOrigin   @default(patient_reported)   // siempre patient_reported
reviewStatus ReviewStatus @default(pending)             // siempre pending al crear
```

La `ReviewAction` registra eventos de revisión pero **nunca convierte un registro en `ValidatedData`**.

### Scripts disponibles

| Script | Requiere DB | Descripción |
|---|---|---|
| `db:generate` | ❌ No | Genera el cliente TypeScript desde el schema |
| `db:push` | ✅ Sí | Sincroniza el schema con la DB (desarrollo) |
| `db:seed` | ✅ Sí | Inserta datos ficticios demo |
| `db:studio` | ✅ Sí | Abre interfaz visual Prisma Studio |

### Primera ejecución (dev local)

```bash
# 1. Configurar DB local
cp packages/api/.env.example packages/api/.env
# Editar DATABASE_URL con credenciales locales (no Railway)

# 2. Generar cliente (no requiere DB)
pnpm --filter @pulso/api db:generate

# 3. Crear tablas (requiere DB local)
pnpm --filter @pulso/api db:push

# 4. Insertar datos demo
pnpm --filter @pulso/api db:seed
```

### Estado MC-10.5A: persistencia preparada, no activada

En MC-10.5A:
- El schema existe y es válido
- El cliente está generado (`src/lib/prisma.ts`)
- Los servicios existentes siguen usando mocks
- NO se conectó Railway
- NO se reemplazó ningún endpoint

La conexión de servicios a la DB real se hará en MC-10.5B+.

## Deprecación en Prisma 7

Prisma 6 advierte que `package.json#prisma.seed` está deprecated en favor de un archivo `prisma.config.ts`. Esta migración puede hacerse en un microciclo de mantenimiento técnico antes de upgradear a Prisma 7, sin urgencia.

## Mock duplicado: patrón mantenido

Sigue el patrón establecido desde MC-5: los mocks se duplican entre API y apps web hasta que se conecte la API real. El seed de MC-10.5A no reemplaza los mocks — los complementa para cuando se active la DB.

## Consecuencias

- **Positivo:** La capa de persistencia está lista sin romper lo que funciona.
- **Positivo:** El schema refuerza la separación revisable/validado a nivel de DB.
- **Positivo:** `db:generate` corre automáticamente en `pnpm build`, garantizando types actualizados.
- **Negativo:** `type-check` sin previa ejecución de `db:generate` fallará si se corre en entorno limpio. Solución: CI debe ejecutar `db:generate` antes de `type-check`.
- **Neutral:** El seed usa datos ficticios idempotentes (upsert con IDs fijos).

## Alternativas descartadas

- **SQLite para dev:** Aceptable pero el modelo de datos usa tipos PostgreSQL (UUID, enums nativos). Mejor mantener paridad dev/prod.
- **TypeORM / Drizzle:** Prisma ofrece mejor experiencia con TypeScript auto-generated types y migrations CLI.
- **Direct SQL / pg:** Menos type-safety, más overhead de mantenimiento.
