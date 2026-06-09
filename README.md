# Pulso Nutricional

Sistema PWA para seguimiento nutricional, pensado para conectar el trabajo
profesional de un/a nutricionista con el seguimiento diario de sus pacientes.

> ⚠️ **Proyecto en estado inicial (MC-0).** En este momento el repositorio
> solo contiene documentación y la estructura base de carpetas. **No hay código
> funcional, no hay despliegue y no se debe usar ningún dato real.**

---

## Descripción del proyecto

Pulso Nutricional es una plataforma de seguimiento nutricional compuesta por
varias experiencias que comparten **una sola API** y **una sola base de datos**.

El objetivo del producto es que la profesional pueda gestionar pacientes,
consultas, mediciones, planes alimentarios y agenda, mientras que el paciente
registra su día a día (comidas, peso, actividad física) desde una app móvil
simple. Todo el seguimiento del paciente queda disponible para revisión
profesional sin mezclarse automáticamente con los datos validados.

---

## Experiencias del sistema

El sistema ofrece tres experiencias diferenciadas:

### 1. Pulso Nutricional PC
Panel profesional completo para nutricionistas. Pensado para escritorio.
Permite gestionar pacientes, fichas, consultas, planes, agenda, revisión de
registros y generación de documentos.

### 2. Pulso Nutricional Mobile
Versión reducida del panel profesional, pensada para que la nutricionista
pueda consultar y resolver tareas frecuentes desde el celular.

### 3. Mi Pulso
PWA mobile-first orientada al paciente. Permite registrar comidas, peso,
actividad física y ver su agenda y plan del día. Es la cara visible para el
paciente.

---

## Arquitectura general

```
+---------------------------+   +----------------------+   +------------------+
|  Pulso Nutricional PC     |   | Pulso Nutricional    |   |     Mi Pulso     |
|  (panel profesional)      |   | Mobile (profesional) |   |    (paciente)    |
+-------------+-------------+   +----------+-----------+   +--------+---------+
              |                            |                        |
              +----------------------------+------------------------+
                                           |
                                   +-------v--------+
                                   |   API común    |
                                   +-------+--------+
                                           |
                                   +-------v--------+
                                   | Base de datos  |
                                   |  (Postgres)    |
                                   +----------------+
```

- Las **tres experiencias** son clientes que se conectan a **una única API**.
- La **API** es la única que habla con la **base de datos**.
- La base de datos es **una sola** y compartida entre todas las experiencias.

La estructura del repositorio es un monorepo:

```
apps/
  pulso-nutricional-web/      # Panel profesional (PC)
  mi-pulso-web/               # PWA del paciente (Mi Pulso)
  pulso-nutricional-mobile/   # Versión móvil reducida del profesional

packages/
  api/                        # API común
  shared/                     # Tipos, contratos y utilidades compartidas
  ui/                         # Componentes de interfaz compartidos
  config/                     # Configuración compartida (lint, tsconfig, etc.)

docs/
  producto/                   # Documento maestro y visión de producto
  arquitectura/               # Arquitectura funcional y modelo de datos
  microciclos/                # Plan de microciclos de desarrollo
  decisiones/                 # Registro de decisiones (ADR)
```

---

## Estado actual

- ✅ Repositorio GitHub creado: `pulso-nutricional-app`.
- ✅ Proyecto Railway preparado con servicios (todos **offline** salvo Postgres):
  - Postgres — *online*
  - api — *offline*
  - pulso-nutricional-web — *offline*
  - mi-pulso-web — *offline*
- ✅ MC-0 en curso: documentación base y estructura de carpetas.
- ⛔ Sin código funcional.
- ⛔ Sin despliegue.
- ⛔ Sin conexión real a Railway.
- ⛔ Sin variables de entorno ni credenciales.

---

## Regla central: separación de datos

> **Los datos cargados por el paciente son datos revisables.**
> **Los datos cargados o validados por la profesional son datos profesionales.**
> **Nunca deben mezclarse automáticamente.**

Esto significa que:

- Lo que registra el paciente (comidas, peso, actividad) entra como
  **dato revisable**: queda pendiente de que la profesional lo mire.
- Lo que carga o valida la profesional es **dato profesional / validado**.
- El sistema **no** promueve automáticamente un dato revisable a dato validado.
  Siempre hay un paso explícito de revisión por parte de la profesional.
- La separación se refleja tanto en el modelo de datos como en la interfaz.

---

## Servicios previstos en Railway

> Estos servicios **existen** en el proyecto Railway pero **todavía no se
> conectan** desde el código. Se documentan solo como referencia.

| Servicio                  | Rol                                   | Estado  |
|---------------------------|---------------------------------------|---------|
| Postgres                  | Base de datos única                   | online  |
| api                       | API común                             | offline |
| pulso-nutricional-web     | Panel profesional (PC)                | offline |
| mi-pulso-web              | PWA del paciente (Mi Pulso)           | offline |

---

## ⚠️ Advertencia importante

- **No usar datos reales todavía.** No cargar información real de pacientes,
  mediciones, ni datos de salud de personas reales.
- No conectar Railway ni desplegar nada en este momento.
- No crear credenciales ni variables de entorno con secretos reales.
- Todo el trabajo se realiza por **microciclos seguros** (ver
  [`docs/microciclos/plan-microciclos.md`](docs/microciclos/plan-microciclos.md)).

---

## Documentación

- [Documento maestro de producto](docs/producto/documento-maestro-v2.md)
- [Arquitectura funcional](docs/arquitectura/arquitectura-funcional.md)
- [Modelo de datos inicial](docs/arquitectura/modelo-datos-inicial.md)
- [Plan de microciclos](docs/microciclos/plan-microciclos.md)
- [Decisión 0001 — Nombres y alcance](docs/decisiones/0001-nombres-y-alcance.md)
