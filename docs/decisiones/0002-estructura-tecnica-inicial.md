# 0002 — Estructura técnica inicial

- **Estado:** Aceptada
- **Fecha:** 2026-06-09
- **Microciclo:** MC-1
- **Contexto:** con la documentación base ya mergeada (MC-0), se necesita
  establecer el **esqueleto técnico** del monorepo sin implementar todavía
  funcionalidad de negocio. Esta decisión fija las herramientas, la forma de
  organizar el código y qué se deja explícitamente pendiente.

---

## Decisión

### Gestor de monorepo y herramientas

- **pnpm + pnpm workspaces** como gestor de paquetes y de workspaces.
  Workspaces declarados en `pnpm-workspace.yaml`: `apps/*` y `packages/*`.
- **Turborepo** (`turbo.json`) como orquestador de tareas (`build`,
  `type-check`, `lint`, `dev`) con caché y dependencias entre paquetes.
- **TypeScript** como lenguaje base, con una configuración compartida en
  `packages/config/tsconfig.base.json` que el resto de los paquetes extiende.

### Organización del código

- `apps/` contiene las tres experiencias; `packages/` el código compartido y la
  API. Cada workspace tiene su propio `package.json`, `README.md` y, cuando
  aplica, `tsconfig.json`.
- **`@pulso/config`**: configuración compartida (hoy, solo el `tsconfig` base).
- **`@pulso/shared`**, **`@pulso/ui`**, **`@pulso/api`**: paquetes preparados con
  un placeholder mínimo que compila; sin contratos, componentes ni servidor.

### Stack por experiencia

- **Pulso Nutricional PC** (`apps/pulso-nutricional-web`) y **Mi Pulso**
  (`apps/mi-pulso-web`): **Next.js** (App Router) con una **única pantalla
  placeholder** cada una. Es la opción recomendada y deja una base verificable
  (`next build`), pero **sin funcionalidad de negocio**.
- **Pulso Nutricional Mobile** (`apps/pulso-nutricional-mobile`): **solo
  placeholder/documentación** en MC-1. No se construye app mobile real; su
  enfoque tecnológico se decide en MC-11.

### Scripts mínimos

Cada workspace expone `type-check`, `lint` y `build`:

- `type-check`: `tsc --noEmit` donde hay código TypeScript.
- `lint`: **placeholder** (`echo`) — ESLint se configurará en un microciclo
  posterior, tal como se previó para esta etapa.
- `build`: `next build` en las apps web; `tsc` en los paquetes; `echo`
  placeholder donde no aplica (config, mobile).

---

## Deferidos (pendientes, NO implementados en MC-1)

Se documentan como decisiones de rumbo, **sin** implementación en esta etapa:

- **Fastify** como framework de la API: se introduce en **MC-2** (API mínima con
  healthcheck). En MC-1 `@pulso/api` no levanta servidor ni define endpoints.
- **Postgres + Prisma**: pendientes. **No** se crea schema definitivo ni
  migraciones, **no** se conecta ninguna base de datos. Se difiere para evitar
  introducir acceso a datos antes de tiempo y mantener el microciclo acotado.
- **Railway**: existe como proyecto pero **no se conecta**. Sin variables de
  entorno ni credenciales.
- **ESLint / Prettier**: configuración compartida pendiente (`lint` es
  placeholder por ahora).
- **PWA / service workers / TWA / Play Store**: pendientes (MC-12).

> La razón de deferir Fastify, Prisma y la base es mantener MC-1 como un
> esqueleto técnico puro y verificable, sin lógica de negocio ni acceso a datos,
> en línea con la filosofía de microciclos seguros.

---

## Alcance de MC-1 (qué SÍ se hizo)

- Monorepo pnpm + Turbo + TypeScript con configuración compartida.
- `package.json` raíz, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`.
- `package.json` + `README.md` por cada app y paquete.
- Placeholders mínimos verificables (apps web con pantalla placeholder; paquetes
  con export mínimo; mobile como documentación).
- Scripts `type-check`, `lint` (placeholder) y `build`.

## Qué quedó explícitamente fuera de MC-1

Login, autenticación, roles reales, endpoints reales, base de datos, schema/
migraciones de Prisma, Railway, variables de entorno, credenciales, datos
reales, importación de pacientes, PDF, carga de archivos, PWA real, service
workers, TWA, deploy y workflows/CI. Tampoco se avanzó a MC-2.

---

## Consecuencias

- El repositorio queda con una base técnica clara sobre la que construir los
  próximos microciclos sin re-decidir herramientas.
- La separación **revisable** (paciente) vs **validada** (profesional) todavía
  no se implementa en código, pero queda señalada como invariante a respetar en
  `@pulso/shared` y `@pulso/api` cuando se implementen.
- Cambiar el gestor de monorepo, el framework web o el de la API requeriría una
  **nueva decisión** (ADR) que reemplace o complemente a esta.
