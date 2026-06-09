# Mi Pulso (`@pulso/mi-pulso-web`)

**PWA mobile-first del paciente**. Es la cara visible para el paciente.

## Propósito

Permitir al paciente ver su plan y agenda del día (pantalla **Hoy**) y registrar
su día a día (comidas, peso, actividad física). Todo lo que carga el paciente es
**dato revisable**.

## Estado (MC-1)

App **Next.js** (App Router) con una **única pantalla placeholder**
(`Mi Pulso — MC-1`). **No** implementa funcionalidad de negocio ni capacidades
**PWA reales** (sin manifest funcional, sin service worker). Sin conexión a la
API ni a la base de datos.

## Comandos

- `pnpm --filter @pulso/mi-pulso-web dev` — servidor de desarrollo local.
- `pnpm --filter @pulso/mi-pulso-web build` — build de producción.
- `pnpm --filter @pulso/mi-pulso-web type-check` — chequeo de tipos.

## Pendiente (microciclos futuros)

- MC-6: pantalla Hoy. MC-7: registros del paciente. MC-12: PWA/TWA instalable.

> No usar datos reales. No conectar Railway. Sin variables de entorno ni secretos.
