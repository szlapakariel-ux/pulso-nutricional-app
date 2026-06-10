# Mi Pulso — lectura desde la API Railway

> MC-MIPULSO-1 — conecta la app del paciente (`apps/mi-pulso-web`) a la API
> Railway en modo lectura inicial, manteniendo el modo mock como default.
> Ver [ADR 0022](../decisiones/0022-mi-pulso-api-readonly.md).

## Modos de datos

| Modo | Cuándo | Comportamiento |
|------|--------|----------------|
| `mock` | default | Mocks locales (`today.mock.ts`), selector demo. Experiencia previa intacta. |
| `api` | explícito | Login demo paciente + lectura desde la API Railway. |

Si `NEXT_PUBLIC_PULSO_DATA_MODE` no existe → `mock`.
Si `=api` pero falta `NEXT_PUBLIC_PULSO_API_BASE_URL` → fallback a `mock`.

## Variables frontend

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `NEXT_PUBLIC_PULSO_DATA_MODE` | No (default `mock`) | `mock` o `api`. |
| `NEXT_PUBLIC_PULSO_API_BASE_URL` | Sí en modo `api` | Base de la API. Ej: `https://api-production-42e99.up.railway.app` |

> ⚠️ Las variables `NEXT_PUBLIC_*` se **inlinean en build**. Para cambiar de
> modo hay que reconstruir (`pnpm build`), no basta con cambiar el entorno en
> `next start`.

## Login demo paciente

- Endpoint: `POST /auth/login`.
- Credenciales demo (ficticias, precargadas en el formulario):
  - Email: `paciente-demo-uno@pulsonutricional.demo`
  - Password: `demo-paciente-2026`
- Token guardado en `localStorage` (`pulso_mi_pulso_demo_token`), solo para demo.
- El token nunca se imprime completo en UI ni en logs.
- Botón "Cerrar sesión" disponible.

## Endpoints consumidos (solo lectura)

| Endpoint | Uso |
|----------|-----|
| `POST /auth/login` | Login demo paciente |
| `GET /auth/me` | Usuario del token (userId, email, role, **patientId** para pacientes) |
| `GET /patients/:patientId/today` | Vista Hoy (plan + agenda) |

## Estados de UI (indicador de modo)

- `Modo mock` — mocks locales.
- `Conectado a API` — modo api, antes/durante login.
- `Sesión demo paciente` — modo api, autenticado y cargando datos.
- `Error de conexión` — fallo de red/API.

Manejo de errores:
- 401 → limpia sesión y vuelve a pedir login.
- 404 en `/today` → mensaje explícito.
- Error de red → mensaje claro, no rompe la pantalla.

## ✅ Resuelto (MC-PATIENT-ID-1): patientId expuesto en GET /auth/me

`GET /auth/me` ahora devuelve `patientId` cuando el usuario tiene rol `patient`.
El mapping demo temporal `lib/patient-mapping.ts` fue eliminado del frontend.
Ver [ADR 0023](../decisiones/0023-patient-id-en-auth-me.md).

## Probar modo api en local

CORS ya permite `localhost`. Desde la raíz del repo:

```bash
NEXT_PUBLIC_PULSO_DATA_MODE=api \
NEXT_PUBLIC_PULSO_API_BASE_URL=https://api-production-42e99.up.railway.app \
pnpm --filter @pulso/mi-pulso-web dev
```

Luego abrir el navegador, iniciar sesión con la credencial demo paciente y
verificar que la vista Hoy carga plan + agenda desde la API.

> **Nota de entorno:** el flujo real contra Railway no se puede ejecutar desde
> el entorno remoto de Claude Code (egress bloqueado, ver ADR 0018). Verificar
> desde un entorno con acceso de red.

## Fuera de alcance (MC-MIPULSO-1)

- **Escritura**: registrar comidas, peso, actividad, notas. (El módulo
  Registrar sigue en mock, no se conecta a la API.)
- **Deploy de Mi Pulso** en Railway.
- **Ampliar CORS** para el futuro origen de Mi Pulso en Railway.
- **Dominio propio.**
- **MC-11** (panel mobile profesional) y **MC-12** (PWA/TWA).

> **Freno aquí.** No se avanza a deploy de Mi Pulso, dominio, MC-11 ni MC-12
> sin autorización explícita.
