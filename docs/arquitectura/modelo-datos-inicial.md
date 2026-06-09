# Modelo de Datos Inicial — Pulso Nutricional

> Borrador conceptual de entidades. **No es un esquema SQL definitivo ni una
> migración.** Sirve para alinear el lenguaje del dominio. Los nombres de campos
> son *sugeridos* y se afinarán en los microciclos técnicos (MC-1 / MC-2).
>
> **Convención de visibilidad:** indica quién puede acceder al dato a través de
> la API. "Profesional" se entiende como la profesional dueña del vínculo con
> ese paciente. "Admin" siempre tiene acceso técnico.
>
> **Convención de origen / revisión:** las entidades marcadas como *dato
> revisable* nacen del paciente y pasan por la bandeja de revisión; nunca se
> validan automáticamente.

---

## Índice de entidades

1. [users](#1-users)
2. [professionals](#2-professionals)
3. [patients](#3-patients)
4. [professional_patient_links](#4-professional_patient_links)
5. [consultations](#5-consultations)
6. [measurements](#6-measurements)
7. [meal_plan_templates](#7-meal_plan_templates)
8. [meal_plans](#8-meal_plans)
9. [patient_plan_assignments](#9-patient_plan_assignments)
10. [patient_agenda_templates](#10-patient_agenda_templates)
11. [patient_agenda_items](#11-patient_agenda_items)
12. [patient_daily_agendas](#12-patient_daily_agendas)
13. [meal_logs](#13-meal_logs)
14. [weight_logs](#14-weight_logs)
15. [exercise_prescriptions](#15-exercise_prescriptions)
16. [exercise_logs](#16-exercise_logs)
17. [patient_notes](#17-patient_notes)
18. [professional_notes](#18-professional_notes)
19. [attachments](#19-attachments)
20. [review_statuses](#20-review_statuses)
21. [audit_logs](#21-audit_logs)

---

## 1. users

- **Propósito:** identidad base de cualquier persona que entra al sistema
  (profesional, paciente o admin). Maneja autenticación y rol.
- **Campos principales sugeridos:** `id`, `email`, `password_hash`, `role`
  (`patient` | `professional` | `admin`), `display_name`, `status`,
  `created_at`, `updated_at`.
- **Relaciones:** 1:1 con `professionals` o `patients` según el rol.
- **Visibilidad:** propio (cada quien ve su usuario) · profesional (datos
  básicos de sus pacientes) · admin (todo).
- **Datos sensibles:** **Sí** (credenciales, email).

## 2. professionals

- **Propósito:** datos del perfil profesional de la nutricionista.
- **Campos principales sugeridos:** `id`, `user_id`, `full_name`,
  `license_number` (matrícula), `specialty`, `contact_info`, `created_at`.
- **Relaciones:** 1:1 con `users`; 1:N con `professional_patient_links`.
- **Visibilidad:** propio · admin. (El paciente ve solo datos públicos básicos
  de su profesional.)
- **Datos sensibles:** **Sí** (matrícula, contacto).

## 3. patients

- **Propósito:** datos del paciente como sujeto de seguimiento nutricional.
- **Campos principales sugeridos:** `id`, `user_id` (opcional si el paciente
  aún no tiene login), `full_name`, `birth_date`, `sex`, `contact_info`,
  `goals`, `created_at`.
- **Relaciones:** 1:1 con `users` (opcional); 1:N con consultas, planes,
  registros, etc.
- **Visibilidad:** propio (lo suyo) · profesional (sus pacientes) · admin.
- **Datos sensibles:** **Sí** (datos personales y de salud).

## 4. professional_patient_links

- **Propósito:** vínculo entre una profesional y un paciente (quién atiende a
  quién). Base del control de acceso.
- **Campos principales sugeridos:** `id`, `professional_id`, `patient_id`,
  `status` (`active` | `inactive`), `started_at`, `ended_at`.
- **Relaciones:** N:1 con `professionals` y con `patients`.
- **Visibilidad:** profesional (sus vínculos) · admin. El paciente puede ver
  con qué profesional está vinculado.
- **Datos sensibles:** Moderado (relación clínica).

## 5. consultations

- **Propósito:** registro de cada consulta/encuentro profesional con el paciente.
- **Campos principales sugeridos:** `id`, `patient_id`, `professional_id`,
  `date`, `summary`, `objectives`, `created_at`.
- **Relaciones:** N:1 con `patients` y `professionals`; 1:N con `measurements`.
- **Visibilidad:** profesional (completo) · paciente (resumen propio que la
  profesional decida compartir) · admin.
- **Datos sensibles:** **Sí** (datos clínicos). *Dato profesional / validado.*

## 6. measurements

- **Propósito:** mediciones antropométricas/clínicas tomadas (peso, talla,
  perímetros, % graso, etc.).
- **Campos principales sugeridos:** `id`, `patient_id`, `consultation_id`
  (opcional), `type`, `value`, `unit`, `measured_at`, `source`
  (`professional`), `created_at`.
- **Relaciones:** N:1 con `patients` y `consultations`.
- **Visibilidad:** profesional · paciente (las propias, según se comparta) ·
  admin.
- **Datos sensibles:** **Sí** (datos de salud). *Dato profesional / validado.*

## 7. meal_plan_templates

- **Propósito:** plantillas reutilizables de planes alimentarios (biblioteca
  interna de la profesional).
- **Campos principales sugeridos:** `id`, `professional_id`, `name`,
  `description`, `structure` (estructura de comidas), `created_at`.
- **Relaciones:** N:1 con `professionals`; origen de `meal_plans`.
- **Visibilidad:** profesional · admin. **Nunca el paciente.**
- **Datos sensibles:** No (herramienta interna).

## 8. meal_plans

- **Propósito:** plan alimentario concreto (puede derivar de una plantilla).
- **Campos principales sugeridos:** `id`, `professional_id`, `template_id`
  (opcional), `name`, `content` (comidas, porciones, indicaciones),
  `version`, `created_at`.
- **Relaciones:** N:1 con `professionals` y `meal_plan_templates`; se asigna vía
  `patient_plan_assignments`.
- **Visibilidad:** profesional · paciente (solo el que tenga asignado) · admin.
- **Datos sensibles:** Moderado. *Dato profesional / validado.*

## 9. patient_plan_assignments

- **Propósito:** asigna un `meal_plan` a un paciente durante un período.
- **Campos principales sugeridos:** `id`, `patient_id`, `meal_plan_id`,
  `assigned_by` (professional_id), `start_date`, `end_date`, `status`.
- **Relaciones:** N:1 con `patients` y `meal_plans`.
- **Visibilidad:** profesional · paciente (sus asignaciones) · admin.
- **Datos sensibles:** Moderado. *Dato profesional / validado.*

## 10. patient_agenda_templates

- **Propósito:** plantillas de agenda/rutina para el paciente (estructura tipo
  reutilizable).
- **Campos principales sugeridos:** `id`, `professional_id`, `name`,
  `description`, `structure`, `created_at`.
- **Relaciones:** N:1 con `professionals`; origen de `patient_agenda_items`.
- **Visibilidad:** profesional · admin. **Nunca el paciente.**
- **Datos sensibles:** No (herramienta interna).

## 11. patient_agenda_items

- **Propósito:** ítems concretos de agenda (comidas, recordatorios, tareas) que
  componen la agenda del paciente.
- **Campos principales sugeridos:** `id`, `template_id` (opcional),
  `patient_id`, `title`, `type`, `time_hint`, `order`, `created_at`.
- **Relaciones:** N:1 con `patient_agenda_templates` y `patients`; referenciados
  por `patient_daily_agendas`.
- **Visibilidad:** profesional · paciente (los suyos) · admin.
- **Datos sensibles:** Bajo. *Dato profesional / validado.*

## 12. patient_daily_agendas

- **Propósito:** agenda concreta de un día para un paciente (lo que ve en la
  pantalla **Hoy** de Mi Pulso).
- **Campos principales sugeridos:** `id`, `patient_id`, `date`, `items`
  (referencias a `patient_agenda_items`), `generated_from` (template/plan),
  `created_at`.
- **Relaciones:** N:1 con `patients`; compone ítems de agenda.
- **Visibilidad:** profesional · paciente (la suya) · admin.
- **Datos sensibles:** Bajo. *Dato profesional / validado.*

## 13. meal_logs

- **Propósito:** registro de comidas que carga **el paciente**.
- **Campos principales sugeridos:** `id`, `patient_id`, `logged_at`,
  `description`, `photo_attachment_id` (opcional), `agenda_item_id` (opcional),
  `review_status_id`, `created_at`.
- **Relaciones:** N:1 con `patients`; 1:1/N con `attachments`; N:1 con
  `review_statuses`.
- **Visibilidad:** paciente (lo suyo) · profesional (de sus pacientes) · admin.
- **Datos sensibles:** **Sí** (hábitos, posibles fotos). *Dato revisable.*

## 14. weight_logs

- **Propósito:** registro de peso que carga **el paciente** (autorreporte).
- **Campos principales sugeridos:** `id`, `patient_id`, `weight`, `unit`,
  `logged_at`, `review_status_id`, `created_at`.
- **Relaciones:** N:1 con `patients` y `review_statuses`.
- **Visibilidad:** paciente (lo suyo) · profesional · admin.
- **Datos sensibles:** **Sí** (dato de salud). *Dato revisable.*
- **Nota:** distinto de `measurements` (que es peso tomado por la profesional).

## 15. exercise_prescriptions

- **Propósito:** prescripción de actividad física hecha por la profesional
  (**módulo opcional**).
- **Campos principales sugeridos:** `id`, `patient_id`, `professional_id`,
  `description`, `frequency`, `start_date`, `end_date`, `created_at`.
- **Relaciones:** N:1 con `patients` y `professionals`.
- **Visibilidad:** profesional · paciente (las suyas) · admin.
- **Datos sensibles:** Moderado. *Dato profesional / validado.*

## 16. exercise_logs

- **Propósito:** registro de actividad física que carga **el paciente**
  (**módulo opcional**).
- **Campos principales sugeridos:** `id`, `patient_id`, `activity_type`,
  `duration`, `intensity`, `logged_at`, `review_status_id`, `created_at`.
- **Relaciones:** N:1 con `patients`, `review_statuses` y (opcional)
  `exercise_prescriptions`.
- **Visibilidad:** paciente (lo suyo) · profesional · admin.
- **Datos sensibles:** Moderado (dato de salud). *Dato revisable.*

## 17. patient_notes

- **Propósito:** notas escritas por **el paciente** (comentarios, sensaciones).
- **Campos principales sugeridos:** `id`, `patient_id`, `content`, `logged_at`,
  `review_status_id`, `created_at`.
- **Relaciones:** N:1 con `patients` y `review_statuses`.
- **Visibilidad:** paciente (las suyas) · profesional · admin.
- **Datos sensibles:** Moderado. *Dato revisable.*

## 18. professional_notes

- **Propósito:** notas **internas** de la profesional sobre el paciente.
- **Campos principales sugeridos:** `id`, `patient_id`, `professional_id`,
  `content`, `visibility` (`private`), `created_at`.
- **Relaciones:** N:1 con `patients` y `professionals`.
- **Visibilidad:** profesional · admin. **NUNCA el paciente.**
- **Datos sensibles:** **Sí** (juicio clínico privado). *Dato profesional.*

## 19. attachments

- **Propósito:** archivos adjuntos (fotos de comidas, documentos, PDFs
  generados).
- **Campos principales sugeridos:** `id`, `owner_type`, `owner_id`,
  `uploaded_by`, `file_ref`, `mime_type`, `created_at`.
- **Relaciones:** polimórfica con varias entidades (meal_logs, consultas, etc.).
- **Visibilidad:** depende del recurso dueño (hereda su visibilidad).
- **Datos sensibles:** **Puede serlo** (fotos, documentos clínicos).

## 20. review_statuses

- **Propósito:** representa el **estado de revisión** de un dato revisable.
  Pieza central de la separación revisable/validado.
- **Campos principales sugeridos:** `id`, `status` (`pending` | `reviewed` |
  `accepted` | `flagged`), `reviewed_by` (professional_id, opcional),
  `reviewed_at`, `comment`, `created_at`.
- **Relaciones:** referenciada por `meal_logs`, `weight_logs`, `exercise_logs`,
  `patient_notes` (y todo dato revisable).
- **Visibilidad:** profesional · admin. El paciente puede ver, como mucho, un
  estado simplificado de **sus propios** registros (no el comentario interno).
- **Datos sensibles:** Bajo, pero **crítico** para la regla central.

## 21. audit_logs

- **Propósito:** trazabilidad de acciones relevantes (quién hizo qué y cuándo).
- **Campos principales sugeridos:** `id`, `actor_user_id`, `action`,
  `entity_type`, `entity_id`, `metadata`, `created_at`.
- **Relaciones:** referencia genérica a cualquier entidad/usuario.
- **Visibilidad:** **admin** (parcial para profesional si se decide). Nunca el
  paciente.
- **Datos sensibles:** **Sí** (metadatos de actividad).

---

## Resumen de visibilidad y sensibilidad

| Entidad                     | Paciente | Profesional | Admin | Sensible | Tipo de dato        |
|-----------------------------|:--------:|:-----------:|:-----:|:--------:|---------------------|
| users                       | propio   | básico      | ✅    | Sí       | sistema             |
| professionals               | público* | propio      | ✅    | Sí       | profesional         |
| patients                    | propio   | sus pac.    | ✅    | Sí       | profesional         |
| professional_patient_links  | propio   | ✅          | ✅    | Medio    | sistema             |
| consultations               | resumen  | ✅          | ✅    | Sí       | validado            |
| measurements                | propio   | ✅          | ✅    | Sí       | validado            |
| meal_plan_templates         | ❌       | ✅          | ✅    | No       | interno             |
| meal_plans                  | asignado | ✅          | ✅    | Medio    | validado            |
| patient_plan_assignments    | propio   | ✅          | ✅    | Medio    | validado            |
| patient_agenda_templates    | ❌       | ✅          | ✅    | No       | interno             |
| patient_agenda_items        | propio   | ✅          | ✅    | Bajo     | validado            |
| patient_daily_agendas       | propio   | ✅          | ✅    | Bajo     | validado            |
| meal_logs                   | propio   | ✅          | ✅    | Sí       | **revisable**       |
| weight_logs                 | propio   | ✅          | ✅    | Sí       | **revisable**       |
| exercise_prescriptions      | propio   | ✅          | ✅    | Medio    | validado (opcional) |
| exercise_logs               | propio   | ✅          | ✅    | Medio    | **revisable** (opc.)|
| patient_notes               | propio   | ✅          | ✅    | Medio    | **revisable**       |
| professional_notes          | ❌       | ✅          | ✅    | Sí       | profesional privado |
| attachments                 | hereda   | hereda      | ✅    | Puede    | según dueño         |
| review_statuses             | simplif. | ✅          | ✅    | Bajo     | sistema (crítico)   |
| audit_logs                  | ❌       | parcial     | ✅    | Sí       | sistema             |

\* "público" = solo datos básicos de la profesional vinculada al paciente.
