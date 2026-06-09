# Documento Maestro de Producto — Pulso Nutricional (v2)

> Documento de visión y alcance de producto. Resume las experiencias, la
> arquitectura compartida y el MVP por etapas. **No describe implementación
> técnica final**; sirve como referencia conceptual para los microciclos.

---

## 1. Visión general

Pulso Nutricional es un sistema de seguimiento nutricional que conecta el
trabajo de la profesional (nutricionista) con el seguimiento diario del
paciente. Busca que la profesional tenga una herramienta de gestión completa y
que el paciente tenga una app simple para registrar su día a día.

El principio que ordena todo el producto es la **separación entre datos
revisables (paciente) y datos validados (profesional)**: el sistema nunca
mezcla automáticamente ambos.

---

## 2. Experiencias del sistema

### 2.1 Pulso Nutricional PC
Panel profesional completo, pensado para escritorio.

Funcionalidad prevista:
- Gestión de pacientes (alta, ficha, historial).
- Registro de consultas y mediciones.
- Creación y asignación de planes alimentarios.
- Definición de agenda del paciente (plantillas y agenda diaria).
- Bandeja de revisión de los registros que carga el paciente.
- Prescripción de actividad física (módulo opcional).
- Generación de documentos PDF.
- Importación de pacientes.

### 2.2 Pulso Nutricional Mobile
Versión **reducida** del panel profesional para el celular de la nutricionista.

Funcionalidad prevista (subconjunto del PC):
- Consultar pacientes y su ficha resumida.
- Ver y resolver la bandeja de revisión.
- Consultas rápidas de planes y agenda.
- No busca replicar toda la edición pesada del panel PC.

### 2.3 Mi Pulso
PWA **mobile-first** para el paciente.

Funcionalidad prevista:
- Pantalla **Hoy**: plan y agenda del día.
- Registro de comidas (meal logs).
- Registro de peso (weight logs).
- Registro de actividad física (exercise logs) — opcional.
- Visualización de su plan y agenda asignados.
- Todo lo que carga el paciente entra como **dato revisable**.

---

## 3. API común

- Existe **una sola API** que sirve a las tres experiencias.
- Centraliza la lógica de negocio, la autenticación y los permisos por rol.
- Es la única capa que accede a la base de datos.
- Es responsable de **respetar la separación** entre datos revisables y datos
  validados, y de exponer a cada rol solo lo que le corresponde.

---

## 4. Base de datos común

- Existe **una sola base de datos** (Postgres) compartida por todo el sistema.
- Almacena tanto los datos profesionales como los registros del paciente,
  diferenciados por su origen y su estado de revisión.
- El detalle de entidades está en
  [`../arquitectura/modelo-datos-inicial.md`](../arquitectura/modelo-datos-inicial.md).

---

## 5. MVP por etapas

El producto se construye por **microciclos** incrementales. El MVP se entiende
como una secuencia de etapas, no como un único lanzamiento. Resumen de etapas
(detalle completo en
[`../microciclos/plan-microciclos.md`](../microciclos/plan-microciclos.md)):

1. Documentación y estructura base.
2. Estructura técnica del monorepo.
3. API mínima.
4. Panel PC: pacientes y ficha.
5. Nueva consulta.
6. Planes y agenda.
7. Mi Pulso: pantalla Hoy.
8. Registros del paciente.
9. Bandeja de revisión.
10. PDF simple.
11. Actividad física opcional.
12. Pulso Nutricional Mobile.
13. PWA/TWA futura.

El criterio es: **cada etapa entrega algo verificable y no rompe lo anterior.**

---

## 6. Actividad física (módulo opcional)

- La actividad física es un **módulo opcional**, no central al producto.
- La profesional puede prescribir ejercicio (exercise prescriptions).
- El paciente puede registrar actividad (exercise logs) como dato revisable.
- Si el módulo está desactivado, el resto del sistema funciona igual.
- Se incorpora en una etapa tardía del MVP para no condicionar el núcleo.

---

## 7. Bandeja de revisión

- Es el espacio donde la profesional ve **todo lo que cargó el paciente**.
- Cada registro del paciente tiene un **estado de revisión** (pendiente,
  revisado, etc.).
- La profesional decide explícitamente qué hacer con cada registro.
- **Ningún dato del paciente pasa a ser dato validado sin esa revisión.**
- Es la pieza que materializa la regla central de separación de datos.

---

## 8. Importación de pacientes

- La profesional podrá **importar pacientes** existentes (por ejemplo, desde
  una planilla) para no cargarlos a mano uno por uno.
- Los datos importados se tratan como datos profesionales (los carga la
  profesional), no como datos revisables del paciente.
- El detalle del formato y validación se define en su microciclo
  correspondiente (no en MC-0).

---

## 9. PDF

- El sistema permitirá generar **documentos PDF** (por ejemplo, plan
  alimentario, resumen de consulta).
- En el MVP se contempla un **PDF simple** primero, y mejoras posteriores.
- Los PDF reflejan datos profesionales/validados, no datos sin revisar.

---

## 10. Separación entre datos revisables y datos validados

Este es el principio rector del producto:

| Aspecto                 | Dato revisable (paciente)        | Dato validado (profesional)        |
|-------------------------|----------------------------------|------------------------------------|
| Origen                  | Cargado por el paciente          | Cargado o validado por la profesional |
| Estado inicial          | Pendiente de revisión            | Válido                             |
| Promoción automática    | ❌ Nunca                          | —                                  |
| Aparece en              | Bandeja de revisión              | Ficha, planes, consultas, PDF      |
| Quién lo confirma       | La profesional, explícitamente   | La profesional                     |

Reglas:
- El sistema **no** convierte automáticamente un dato del paciente en dato
  validado.
- La transición de "revisable" a "validado" siempre es una **acción explícita**
  de la profesional.
- La interfaz debe dejar claro en todo momento qué dato es de qué tipo.
