# 0001 — Nombres y alcance

- **Estado:** Aceptada
- **Fecha:** 2026-06-09
- **Microciclo:** MC-0
- **Contexto:** inicio del proyecto Pulso Nutricional. Se necesita fijar el
  vocabulario de las experiencias y el alcance de esta etapa para evitar
  ambigüedades y crecimiento descontrolado.

---

## Decisión

### Nombres de las experiencias

- **Pulso Nutricional** = **panel profesional** (versión PC / escritorio).
  Es la herramienta completa de gestión para la nutricionista.
- **Mi Pulso** = **app del paciente** (PWA mobile-first).
  Es la cara visible para el paciente, para registrar su día a día.
- **Pulso Nutricional Mobile** = **app reducida de la profesional**.
  Subconjunto del panel profesional pensado para el celular de la nutricionista.

### Módulos y alcance

- **Actividad física = módulo opcional.** No es central al producto; el sistema
  debe poder funcionar con el módulo desactivado.
- **Railway existe pero NO se conecta todavía.** El proyecto Railway está
  preparado (Postgres online; api, pulso-nutricional-web y mi-pulso-web
  offline), pero el código **no** se conecta a esos servicios en esta etapa.
- **Play Store / TWA queda para el futuro.** La distribución como app en tienda
  (vía TWA) se documenta como paso futuro y **no** se ejecuta ahora.

---

## Alcance de MC-0 (esta etapa)

Se permite únicamente:
- Crear el README inicial.
- Crear la estructura de carpetas.
- Crear la documentación base en `/docs`.
- Crear carpetas vacías con `.gitkeep`.

Queda explícitamente fuera de alcance en MC-0:
- Implementar código funcional.
- Instalar dependencias.
- Crear base de datos real.
- Conectar Railway.
- Crear variables de entorno.
- Generar credenciales.
- Usar datos reales.
- Copiar código de otro repositorio.
- Avanzar a MC-1.
- Hacer deploy.

---

## Consecuencias

- El vocabulario queda fijado: cuando se diga "Pulso Nutricional" se refiere al
  panel profesional, "Mi Pulso" al paciente, y "Pulso Nutricional Mobile" a la
  versión móvil reducida de la profesional.
- El trabajo continúa por microciclos (ver
  [`../microciclos/plan-microciclos.md`](../microciclos/plan-microciclos.md)).
- Cualquier cambio a estos nombres o a este alcance requiere una **nueva
  decisión** (ADR) que reemplace o complemente a esta.
