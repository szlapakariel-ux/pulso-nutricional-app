# Pulso Nutricional PC (`@pulso/pulso-nutricional-web`)

**Panel profesional completo** para nutricionistas (experiencia de escritorio).

## Propósito

Es la herramienta de gestión de la profesional: pacientes, fichas, consultas,
mediciones, planes, agenda, bandeja de revisión y documentos.

## Estado (MC-1)

App **Next.js** (App Router) con una **única pantalla placeholder**
(`Pulso Nutricional — MC-1`). **No** implementa funcionalidad de negocio: sin
login, sin roles, sin pacientes, sin consultas, sin conexión a la API ni a la
base de datos.

## Comandos

- `pnpm --filter @pulso/pulso-nutricional-web dev` — servidor de desarrollo local.
- `pnpm --filter @pulso/pulso-nutricional-web build` — build de producción.
- `pnpm --filter @pulso/pulso-nutricional-web type-check` — chequeo de tipos.

## Pendiente (microciclos futuros)

- MC-3 en adelante: pacientes y ficha, consultas, planes y agenda.

> No usar datos reales. No conectar Railway. Sin variables de entorno ni secretos.
