# @pulso/api

API **común** de Pulso Nutricional: la única capa que (en el futuro) hablará con
la base de datos y servirá a las tres experiencias.

## Propósito

Centralizar autenticación, autorización por rol, lógica de negocio y acceso a
datos. Es la pieza que debe **garantizar la separación** entre datos revisables
(paciente) y datos validados (profesional).

## Estado (MC-1)

Paquete **preparado** pero **sin servidor ni endpoints**. `src/index.ts` es un
placeholder que solo exporta una marca de versión. **No** hay:

- servidor HTTP en ejecución;
- rutas de pacientes, consultas, mediciones, etc.;
- autenticación ni roles;
- conexión a base de datos;
- variables de entorno ni credenciales.

## Stack previsto (pendiente)

- **Fastify** como framework HTTP — se introduce en **MC-2** (API mínima con
  healthcheck, sin datos reales).
- **Postgres** vía **Prisma** — pendiente; sin migraciones ni schema definitivo
  en MC-1. No se conecta Railway todavía.

> No contiene datos reales ni secretos.
