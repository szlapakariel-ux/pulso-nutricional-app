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

## Capacidades PWA

Mi Pulso está configurada como Progressive Web App instalable:

- **Instalable:** en Chrome/Edge (Android/desktop) aparece el botón "Instalar" en la
  barra de dirección. En Safari iOS: "Compartir → Agregar a pantalla de inicio".
- **Experiencia nativa:** abre sin barra de navegador (`display: standalone`),
  con la barra de estado en verde primario (`#52B788`).
- **Caché offline:** las rutas ya visitadas quedan disponibles sin conexión
  (estrategia Workbox, gestionada por `@ducanh2912/next-pwa`).
- **Reconexión automática:** al recuperar la conexión la app se recarga para
  mostrar contenido fresco.

### Cómo instalar en celular

**Android (Chrome):**
1. Abrir `https://mi-pulso-web-production.up.railway.app` en Chrome.
2. Tocar el ícono de instalación en la barra de dirección (o menú ⋮ → "Instalar app").
3. Confirmar. Mi Pulso aparece en el escritorio como app nativa.

**iOS (Safari):**
1. Abrir la URL en Safari.
2. Tocar el botón de compartir (□↑) → "Agregar a pantalla de inicio".
3. Confirmar. Mi Pulso aparece en el Dock.

### Archivos PWA generados en build

Los siguientes archivos se regeneran automáticamente con cada `next build`
y están excluidos del repo via `.gitignore`:

```
public/sw.js             # Service Worker principal
public/workbox-*.js      # Librería Workbox
public/swe-worker-*.js   # Worker auxiliar
```

Los archivos estáticos sí se commitean:

```
public/manifest.json      # Web App Manifest
public/icon-192x192.png   # Ícono placeholder 192×192
public/icon-512x512.png   # Ícono placeholder 512×512
```

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
