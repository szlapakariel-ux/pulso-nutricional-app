# @pulso/config

Configuración **compartida** del monorepo de Pulso Nutricional.

## Propósito

Centralizar configuración reutilizable por todas las apps y packages para evitar
duplicación. En MC-1 contiene únicamente la base de TypeScript.

## Contenido actual (MC-1)

- `tsconfig.base.json` — opciones base de compilación de TypeScript. El resto de
  los packages y apps extienden este archivo vía
  `"extends": "@pulso/config/tsconfig.base.json"`.

## Pendiente (microciclos futuros)

- Configuración compartida de ESLint.
- Configuración compartida de Prettier.

> No contiene secretos, variables de entorno ni datos. Solo configuración.
