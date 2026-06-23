# Pulso Nutricional

Sistema SaaS de seguimiento nutricional que conecta el trabajo de una
nutricionista con el registro diario de sus pacientes.

La profesional gestiona pacientes, consultas, planes y revisa registros desde
el panel web. El paciente registra comidas, peso, actividad y fotos desde
**Mi Pulso**, una PWA mobile-first.

---

## Demo online

| Experiencia | URL |
|-------------|-----|
| Panel profesional | `https://pulso-nutricional-web-production.up.railway.app` |
| Mi Pulso (paciente) | `https://mi-pulso-web-production.up.railway.app` |
| API | `https://api-production-42e99.up.railway.app/health` |

**Credenciales demo:**

| Rol | Email | Contraseña |
|-----|-------|------------|
| Profesional | `profesional-demo@pulsonutricional.demo` | `demo-profesional-2026` |
| Paciente 1 | `paciente-demo-uno@pulsonutricional.demo` | `demo-paciente-2026` |
| Paciente 2 | `paciente-demo-dos@pulsonutricional.demo` | `demo-paciente-2026` |

Para el flujo recomendado de presentación, ver
[`docs/demo/guia-demo.md`](docs/demo/guia-demo.md).

---

## Qué hace el sistema

La plataforma conecta dos experiencias en torno a una sola API y base de datos:

### Panel profesional — Pulso Nutricional
Herramienta de escritorio para nutricionistas. Permite:
- Gestionar pacientes, fichas y estado de seguimiento.
- Registrar consultas con mediciones.
- Crear y asignar planes alimentarios y agenda.
- Revisar lo que cargó el paciente (bandeja de revisión).
- Módulo opcional de actividad física.
- Descarga de plan en PDF.

### App del paciente — Mi Pulso
PWA mobile-first orientada al paciente. Permite:
- Ver el plan y la agenda del día (Vista Hoy).
- Registrar comidas, peso, notas y actividad.
- Subir fotos de comidas con tipo y comentario opcional.

### Regla central de datos
Los registros del paciente nacen siempre como **dato revisable** (`patient_reported`, `pending`). La nutricionista los revisa y actúa explícitamente. Nunca se valida automáticamente nada.

---

## Arquitectura

```
┌──────────────────────────┐   ┌──────────────────┐
│  Panel profesional       │   │   Mi Pulso       │
│  (pulso-nutricional-web) │   │ (mi-pulso-web)   │
└────────────┬─────────────┘   └────────┬─────────┘
             │                          │
             └──────────────┬───────────┘
                            │
                    ┌───────▼────────┐
                    │   API Fastify  │
                    │   (@pulso/api) │
                    └───────┬────────┘
                            │
                    ┌───────▼────────┐
                    │   PostgreSQL   │
                    │   (Railway)    │
                    └────────────────┘
```

Monorepo pnpm + Turborepo:

```
apps/
  pulso-nutricional-web/   # Panel profesional (Next.js, App Router)
  mi-pulso-web/            # PWA del paciente (Next.js, App Router)

packages/
  api/                     # API común (Fastify v5)
  shared/                  # Tipos y contratos compartidos
  config/                  # Configuración compartida (tsconfig, lint)

docs/
  demo/                    # Guía de demo y presentación
  decisiones/              # ADRs
  microciclos/             # Plan de desarrollo por ciclos
  deploy/                  # Playbooks operativos
  fotos-comidas/           # Diseño del módulo de fotos
```

---

## Estado actual

| Servicio | Estado |
|----------|--------|
| API | ✅ Operativa en Railway |
| Panel profesional | ✅ Operativo en Railway |
| Mi Pulso | ✅ Operativo en Railway · ✅ PWA instalable configurada |
| PostgreSQL | ✅ Online en Railway |
| Upload fotos (bucket S3) | Pendiente de activación (PROD-1) |

Módulos implementados: gestión de pacientes, consultas, planes, agenda,
bandeja de revisión, actividad física opcional, upload de fotos (código listo,
pendiente de activación en producción), PDF de plan, PWA instalable (MC-PWA-1).

Ver el estado completo en
[`docs/microciclos/plan-microciclos.md`](docs/microciclos/plan-microciclos.md).

---

## Desarrollo local

Requisitos: Node ≥ 20, pnpm ≥ 10.

```bash
pnpm install
pnpm dev          # levanta todas las apps en paralelo (turbo)
```

Variables de entorno: ver `packages/api/.env.example`,
`apps/mi-pulso-web/.env.example` y `apps/pulso-nutricional-web/.env.example`.

Por defecto, todas las apps arrancan en modo **mock** (sin base de datos, sin
Railway). Para conectar a la API Railway, configurar
`NEXT_PUBLIC_PULSO_DATA_MODE=api` y `NEXT_PUBLIC_PULSO_API_BASE_URL` en las
apps web.

---

## Documentación

- [Guía de demo](docs/demo/guia-demo.md)
- [Plan de microciclos](docs/microciclos/plan-microciclos.md)
- [Decisiones de arquitectura (ADRs)](docs/decisiones/)
- [Playbooks de deploy](docs/deploy/)
