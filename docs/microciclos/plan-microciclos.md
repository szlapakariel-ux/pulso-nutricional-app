# Plan de Microciclos — Pulso Nutricional

> El desarrollo avanza por **microciclos seguros**: pasos pequeños, verificables
> y acotados. Cada microciclo define **objetivo**, **alcance permitido**, **qué
> NO tocar** y **criterios de aceptación**. No se avanza al siguiente sin cerrar
> el anterior.
>
> **Reglas transversales (válidas en todos los microciclos):** no usar datos
> reales, no exponer credenciales, no desplegar sin pedirlo, no romper lo ya
> entregado, y respetar siempre la separación entre datos revisables y validados.

---

## MC-0 — Documentación base

- **Objetivo:** dejar asentada la visión, la arquitectura, el modelo de datos y
  el plan de trabajo, y crear la estructura inicial de carpetas.
- **Alcance permitido:**
  - README inicial.
  - Estructura de carpetas (`apps/`, `packages/`, `docs/`) con `.gitkeep`.
  - Documentos en `/docs` (producto, arquitectura, microciclos, decisiones).
- **Qué NO tocar:** nada de código funcional, dependencias, base de datos,
  Railway, variables de entorno ni despliegue.
- **Criterios de aceptación:**
  - Existe la estructura de carpetas esperada.
  - Existen README y los documentos base.
  - El repo no contiene código ejecutable ni configuración de servicios.

---

## MC-1 — Estructura técnica inicial

- **Objetivo:** preparar el esqueleto técnico del monorepo (sin lógica de
  negocio).
- **Alcance permitido:**
  - Definir herramienta de monorepo y estructura de paquetes vacíos.
  - Configuración base compartida (lint, formato, tsconfig) en `packages/config`.
  - Placeholders mínimos en cada app/paquete para que el monorepo sea coherente.
- **Qué NO tocar:** no implementar endpoints reales, no conectar base de datos,
  no Railway, no datos reales.
- **Criterios de aceptación:**
  - El monorepo instala/compila el esqueleto sin errores.
  - Cada app y paquete existe con su configuración mínima.
  - Sigue sin haber lógica de negocio ni acceso a datos reales.

---

## MC-2 — API mínima

- **Objetivo:** levantar una API mínima con healthcheck y estructura de rutas,
  sin datos reales.
- **Alcance permitido:**
  - Endpoint de salud (`/health`).
  - Estructura de capas (rutas, controladores, servicios) vacía o simulada.
  - Modelos/contratos derivados del modelo de datos inicial (sin DB real).
- **Qué NO tocar:** no conectar Postgres real, no credenciales, no Railway,
  no datos reales (usar mocks o memoria si hace falta).
- **Criterios de aceptación:**
  - La API arranca localmente y responde el healthcheck.
  - Hay contratos/tipos compartidos en `packages/shared`.
  - No hay conexión a servicios externos ni secretos.

---

## MC-3 — Pulso Nutricional PC: pacientes y ficha

- **Objetivo:** primera pantalla del panel profesional: listado de pacientes y
  ficha.
- **Alcance permitido:**
  - Vista de lista de pacientes y vista de ficha (datos básicos).
  - Consumo de la API mínima (con datos de ejemplo, no reales).
- **Qué NO tocar:** no consultas/planes/agenda todavía, no datos reales,
  no Railway.
- **Criterios de aceptación:**
  - Se puede navegar lista → ficha de un paciente de ejemplo.
  - La separación de datos se respeta a nivel de visibilidad.

---

## MC-4 — Nueva consulta

- **Objetivo:** registrar una consulta con mediciones desde el panel PC.
- **Alcance permitido:**
  - Formulario de nueva consulta y mediciones asociadas.
  - Persistencia a través de la API (entorno controlado, datos de ejemplo).
- **Qué NO tocar:** no planes/agenda, no PDF, no datos reales de pacientes.
- **Criterios de aceptación:**
  - Se crea una consulta con sus mediciones y aparece en la ficha.
  - Las mediciones quedan como dato profesional/validado.

---

## MC-5 — Planes y agenda

- **Objetivo:** crear planes alimentarios y agenda del paciente, y asignarlos.
- **Alcance permitido:**
  - Plantillas de plan/agenda, planes concretos y asignaciones.
  - Generación de agenda diaria a partir de plantillas.
- **Qué NO tocar:** no la app del paciente todavía, no datos reales.
- **Criterios de aceptación:**
  - Se crea un plan, se asigna a un paciente y se genera agenda diaria.
  - Plantillas no son visibles para el rol paciente (a nivel de diseño/API).

---

## MC-6 — Mi Pulso: pantalla Hoy

- **Objetivo:** primera pantalla del paciente mostrando plan y agenda del día.
- **Alcance permitido:**
  - PWA mobile-first con la pantalla **Hoy** (solo lectura).
  - Consumo de plan/agenda asignados vía API.
- **Qué NO tocar:** todavía sin registros del paciente (solo lectura),
  no datos reales.
- **Criterios de aceptación:**
  - El paciente de ejemplo ve su agenda y plan del día.
  - El paciente no accede a datos profesionales internos.

---

## MC-7 — Registros del paciente

- **Objetivo:** que el paciente cargue comidas, peso y notas desde Mi Pulso.
- **Alcance permitido:**
  - Formularios de meal_logs, weight_logs y patient_notes.
  - Cada registro nace como **dato revisable / pendiente**.
- **Qué NO tocar:** la bandeja de revisión profesional (MC-8), actividad física
  (MC-10), datos reales.
- **Criterios de aceptación:**
  - El paciente carga registros y quedan con estado de revisión pendiente.
  - Ningún registro se valida automáticamente.

---

## MC-8 — Bandeja de revisión

- **Objetivo:** que la profesional vea y resuelva los registros del paciente.
- **Alcance permitido:**
  - Bandeja con los datos revisables pendientes.
  - Acciones explícitas de revisión (marcar revisado, comentar, etc.).
- **Qué NO tocar:** no automatizar la validación, no PDF, no datos reales.
- **Criterios de aceptación:**
  - Los registros del paciente aparecen en la bandeja.
  - La transición revisable → validado es siempre una acción manual.

---

## MC-9 — PDF simple

- **Objetivo:** generar un PDF básico (por ejemplo, plan o resumen).
- **Alcance permitido:**
  - Generación de un PDF simple a partir de datos validados.
  - Descarga/visualización desde el panel.
- **Qué NO tocar:** no incluir datos sin revisar, no plantillas complejas,
  no datos reales.
- **Criterios de aceptación:**
  - Se genera un PDF legible con datos profesionales/validados.
  - El PDF no expone datos revisables sin validar.

---

## MC-10 — Actividad física opcional

- **Objetivo:** incorporar el módulo opcional de actividad física.
- **Alcance permitido:**
  - Prescripciones (profesional) y registros (paciente, revisables).
  - El módulo debe poder estar desactivado sin romper el resto.
- **Qué NO tocar:** no hacerlo obligatorio, no datos reales.
- **Criterios de aceptación:**
  - Con el módulo activo, se prescribe y se registra actividad.
  - Con el módulo inactivo, el sistema funciona igual.

---

## MC-11 — Pulso Nutricional Mobile

- **Objetivo:** versión reducida del panel profesional para celular.
- **Alcance permitido:**
  - Subconjunto del panel PC (pacientes, ficha resumida, bandeja de revisión).
  - Reutilización de API y componentes compartidos.
- **Qué NO tocar:** no duplicar lógica de negocio, no datos reales.
- **Criterios de aceptación:**
  - La profesional resuelve tareas frecuentes desde el celular.
  - No se rompe ni el panel PC ni Mi Pulso.

---

## MC-12 — PWA/TWA futura

- **Objetivo:** preparar la distribución como PWA instalable y, a futuro, TWA
  (Play Store).
- **Alcance permitido:**
  - Manifest, service worker e instalabilidad de Mi Pulso.
  - Plan (no ejecución) para empaquetado TWA.
- **Qué NO tocar:** no publicar en tiendas, no credenciales de publicación,
  no datos reales.
- **Criterios de aceptación:**
  - Mi Pulso es instalable como PWA.
  - El empaquetado TWA queda documentado como paso futuro, no ejecutado.

---

## Estado del plan

| Microciclo | Estado     |
|------------|------------|
| MC-0       | ✅ Completado (mergeado en `main`) |
| MC-1       | ✅ Completado (mergeado en `main`) |
| MC-2       | ✅ Completado (mergeado en `main`) |
| MC-3       | ✅ Completado (mergeado en `main`) |
| MC-4       | **En curso** (Nueva consulta + mediciones profesionales) |
| MC-5..MC-12| Pendientes |

> **MC-4 en curso.** No se avanza a MC-5 sin una nueva indicación explícita.
> La decisión técnica de esta etapa quedó registrada en
> [`../decisiones/0005-nueva-consulta-mediciones.md`](../decisiones/0005-nueva-consulta-mediciones.md).
