# Pulso Nutricional PC (`@pulso/pulso-nutricional-web`)

**Panel profesional completo** para nutricionistas (experiencia de escritorio).

## Propósito

Es la herramienta de gestión de la profesional: pacientes, fichas, consultas,
mediciones, planes, agenda, bandeja de revisión y documentos.

## Estado (MC-3)

App **Next.js** (App Router) con la **primera pantalla del panel**: módulo de
**pacientes** con lista, buscador simple y **ficha mínima**. Todos los datos son
**ficticios de demostración** (ver `app/patients.mock.ts`).

- **No** hay login, roles ni permisos reales.
- **No** hay base de datos ni Prisma.
- **No** se conecta todavía con la API (los datos son mock locales tipados con
  los contratos de `@pulso/shared`).
- La ficha muestra un bloque **"Datos profesionales"** que, por contrato, nunca
  debe exponerse a la experiencia del paciente.

## Comandos

- `pnpm --filter @pulso/pulso-nutricional-web dev` — servidor de desarrollo local.
- `pnpm --filter @pulso/pulso-nutricional-web build` — build de producción.
- `pnpm --filter @pulso/pulso-nutricional-web type-check` — chequeo de tipos.

## Pendiente (microciclos futuros)

- MC-3 en adelante: pacientes y ficha, consultas, planes y agenda.

> No usar datos reales. No conectar Railway. Sin variables de entorno ni secretos.
