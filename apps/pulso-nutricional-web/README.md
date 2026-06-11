# Panel Profesional — Pulso Nutricional (`@pulso/pulso-nutricional-web`)

Herramienta de escritorio para nutricionistas. Parte del sistema
[Pulso Nutricional](../../README.md).

## Qué incluye

- **Pacientes:** lista con búsqueda, ficha con datos básicos y bloque de notas
  profesionales (nunca visible para el paciente).
- **Consultas:** historial y registro de nuevas consultas con mediciones.
- **Plan y agenda:** plan alimentario asignado, agenda del día, descarga de plan
  en PDF.
- **Bandeja de revisión:** registros del paciente pendientes de revisión (comidas,
  peso, notas). La profesional revisa y actúa explícitamente.
- **Actividad física:** módulo opcional con prescripciones y registros.

## Demo online

URL: `https://pulso-nutricional-web-production.up.railway.app`

Credenciales: `profesional-demo@pulsonutricional.demo` / `demo-profesional-2026`

## Modo de datos

La app soporta dos modos configurables por variable de entorno:

- **`mock`** (default): datos ficticios locales, sin conexión a la API.
  Útil para desarrollo sin Railway.
- **`api`**: conecta a la API Railway con autenticación JWT. Requiere
  `NEXT_PUBLIC_PULSO_API_BASE_URL`.

## Comandos

```bash
pnpm --filter @pulso/pulso-nutricional-web dev        # desarrollo local
pnpm --filter @pulso/pulso-nutricional-web build      # build de producción
pnpm --filter @pulso/pulso-nutricional-web type-check # chequeo de tipos
```

## Variables de entorno

Ver `.env.example` en esta carpeta.

```
NEXT_PUBLIC_PULSO_DATA_MODE=mock        # "mock" | "api"
NEXT_PUBLIC_PULSO_API_BASE_URL=         # URL de la API (solo en modo api)
```

> No usar datos reales. No hardcodear credenciales.
