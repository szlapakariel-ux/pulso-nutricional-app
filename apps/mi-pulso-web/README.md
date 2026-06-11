# Mi Pulso (`@pulso/mi-pulso-web`)

PWA mobile-first para pacientes. Parte del sistema
[Pulso Nutricional](../../README.md).

## Qué incluye

- **Vista Hoy:** plan del día y agenda (horarios, preparaciones, hidratación).
- **Registrar:** formularios para cargar comidas, peso, notas y actividad física.
  Todo lo que registra el paciente nace como **dato revisable** — queda pendiente
  de que la nutricionista lo revise.
- **Fotos de comidas:** upload de foto (JPEG/PNG/WebP, máx 5 MB) con tipo de
  comida y comentario opcional. Preview antes de enviar.

## Demo online

URL: `https://mi-pulso-web-production.up.railway.app`

Credenciales: `paciente-demo-uno@pulsonutricional.demo` / `demo-paciente-2026`

Para abrir desde el celular, visitar la URL en el navegador móvil.

## Modo de datos

La app soporta dos modos configurables por variable de entorno:

- **`mock`** (default): datos ficticios locales, selector de paciente demo.
  Útil para desarrollo sin Railway.
- **`api`**: conecta a la API Railway con autenticación JWT. Requiere
  `NEXT_PUBLIC_PULSO_API_BASE_URL`.

## Comandos

```bash
pnpm --filter @pulso/mi-pulso-web dev        # desarrollo local
pnpm --filter @pulso/mi-pulso-web build      # build de producción
pnpm --filter @pulso/mi-pulso-web type-check # chequeo de tipos
```

## Variables de entorno

Ver `.env.example` en esta carpeta.

```
NEXT_PUBLIC_PULSO_DATA_MODE=mock        # "mock" | "api"
NEXT_PUBLIC_PULSO_API_BASE_URL=         # URL de la API (solo en modo api)
```

> No usar datos reales. No hardcodear credenciales.
