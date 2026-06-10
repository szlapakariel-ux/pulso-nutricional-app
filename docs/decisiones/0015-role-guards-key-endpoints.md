# ADR 0015 — Protección por rol en endpoints clave (MC-10.5D)

**Estado:** Aceptado  
**Fecha:** 2026-06-10  
**MC:** MC-10.5D

---

## Contexto

Con MC-10.5C se estableció la base de autenticación (JWT demo, `PULSO_AUTH_MODE`).
El siguiente paso natural es que los endpoints del dominio rechacen peticiones
sin rol adecuado. Sin embargo, los modos anteriores deben seguir funcionando
sin cambio para no romper el desarrollo existente ni las apps web que consumen
la API con mocks.

---

## Decisión

Se introduce la variable `PULSO_AUTH_ENFORCEMENT` con dos valores:

- `off` (default): guards completamente inactivos; todos los endpoints responden
  igual que antes de MC-10.5D.
- `demo`: guards activos, pero **solo cuando además `PULSO_AUTH_MODE=demo`**.
  Si `PULSO_AUTH_MODE=off`, el enforcement no puede activarse aunque la variable
  diga `demo`.

Los guards se implementan como `preHandler` de Fastify en cada archivo de rutas,
sin tocar los controladores ni los contratos de respuesta.

### Guards implementados

| Guard | Comportamiento |
|-------|---------------|
| `requireProfessional` | Verifica JWT y exige `role === "professional"`. Paciente → 403. |
| `requirePatientSelf` | Profesional → pasa. Paciente → solo si `patientId` coincide con su propio id (mapping demo). |

### Asignación por endpoint

| Grupo de rutas | Guard |
|---------------|-------|
| patients (list, get) | `requireProfessional` |
| consultations (list, get, preview) | `requireProfessional` |
| meal-plans (meal-plan, agenda) | `requireProfessional` |
| patient-today | `requirePatientSelf` |
| patient-logs (meal, weight, notes preview) | `requirePatientSelf` |
| review-inbox (all, patient, action preview) | `requireProfessional` |
| pdf (preview, download) | `requireProfessional` |
| activity settings, prescriptions | `requireProfessional` |
| activity-logs/preview | `requirePatientSelf` |

### Mapping demo userId → patientId

| JWT `user.id` | `patientId` |
|--------------|-------------|
| `d0000000-…-0011` | `demo-1` |
| `d0000000-…-0012` | `demo-2` |
| `d0000000-…-0013` | `demo-3` |

---

## Consecuencias

- **`PULSO_AUTH_ENFORCEMENT=off`** (default): comportamiento idéntico a MC-10.5C.
  Ningún endpoint existente se rompe.
- **`PULSO_AUTH_MODE=demo` + `PULSO_AUTH_ENFORCEMENT=demo`**: guards activos.
  Token ausente → 401. Rol incorrecto → 403. Token válido con rol correcto → pasa.
- Los contratos de respuesta exitosa no cambian.
- Los códigos de error nuevos (401, 403) son coherentes con los ya introducidos
  en MC-10.5C.
- No hay cookies, refresh tokens, OAuth ni conexión a Railway.
- No se avanza a MC-11 sin una nueva indicación explícita.

---

## Alternativas descartadas

- **Middleware global en `app.ts`**: requeriría allowlist de rutas públicas y
  acoplaría la lógica de auth al core de la app. Preferimos guards declarativos
  por ruta.
- **Proteger todos los endpoints de golpe**: contradice la regla de MC-10.5D
  de no romper el comportamiento existente y agrega complejidad innecesaria.
