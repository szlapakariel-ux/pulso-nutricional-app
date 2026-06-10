# Mi Pulso — Playbook de verificación en modo API

> MC-MIPULSO-2 — verificación end-to-end de Mi Pulso contra la API Railway.
> Mi Pulso corre localmente (`localhost:3001`); la API Railway ya está desplegada.
> Ver [ADR 0024](../decisiones/0024-mi-pulso-smoke-playbook.md).

## URLs de referencia

| Servicio | URL |
|----------|-----|
| API Railway | `https://api-production-42e99.up.railway.app` |
| Mi Pulso (local) | `http://localhost:3001` |

## Smoke test automatizado (cadena API)

El script verifica: `/health` → login paciente → `/auth/me` con `patientId`
(MC-PATIENT-ID-1) → `/patients/:id/today` con plan y agenda.

```bash
# desde la raíz del repo
pnpm smoke:mi-pulso:railway

# o con URL explícita
PULSO_API_BASE_URL=https://api-production-42e99.up.railway.app \
pnpm smoke:mi-pulso:railway
```

**Exit code:** `0` → todo OK · `1` → alguna verificación falló.

> **Nota de entorno:** este script no corre desde el entorno remoto de
> Claude Code (egress bloqueado, ver ADR 0018). Ejecutar desde local o desde
> un entorno con acceso de red.

## Verificación manual en navegador (Mi Pulso local en modo api)

### Arrancar Mi Pulso en modo api

```bash
NEXT_PUBLIC_PULSO_DATA_MODE=api \
NEXT_PUBLIC_PULSO_API_BASE_URL=https://api-production-42e99.up.railway.app \
pnpm --filter @pulso/mi-pulso-web dev
```

Abrir `http://localhost:3001`.

### Checklist de verificación

- [ ] **Indicador de modo:** aparece el badge **"Conectado a API"** (no "Modo mock").
- [ ] **Formulario de login:** visible con credenciales demo precargadas
  (`paciente-demo-uno@pulsonutricional.demo`).
- [ ] **Sin error de CORS:** DevTools → Console → no hay errores `CORS`
  ni `blocked by CORS policy` al cargar la página.
- [ ] **Login:** hacer click en **Conectar**. La llamada `POST /auth/login`
  devuelve 200 (verificar en DevTools → Network).
- [ ] **Badge tras login:** aparece **"Sesión demo paciente"**.
- [ ] **Sin selector demo:** NO debe aparecer el selector de paciente demo
  (ese es modo mock). Si aparece, hay una mezcla de modos.
- [ ] **Vista Hoy carga:** plan alimentario y/o agenda del paciente visibles.
  - Si aparece "Cargando tu día…" y se queda así, revisar Network → la
    llamada a `/patients/:id/today` devuelve 200.
  - Si aparece mensaje de error naranja (bloqueo patientId): la API no
    expone `patientId` en `/auth/me` — verificar que el código de
    MC-PATIENT-ID-1 está desplegado.
- [ ] **Sin nota profesional:** la vista Hoy NO debe mostrar ningún
  `professionalNote` ni nota interna del profesional.
- [ ] **Cerrar sesión:** el botón **"Cerrar sesión"** aparece y al hacer click
  vuelve al formulario de login con badge **"Conectado a API"**.
- [ ] **Sin token en consola:** el token JWT nunca se imprime completo en
  DevTools Console ni en los logs del servidor de desarrollo.

## Verificación CORS (por qué no se puede automatizar)

CORS lo aplica el **navegador**, no `fetch` de Node. El smoke test confirma
que la API responde la cadena de llamadas, pero no puede detectar si el
navegador bloqueará un origen específico. La verificación real de CORS
requiere abrir Mi Pulso en el navegador y comprobar que no hay errores
`CORS` en DevTools Console.

CORS actual para Mi Pulso:
- `localhost:3000`, `localhost:3001`, `localhost:8080` — **permitidos** (ya
  configurados, CORS local funciona sin cambios).
- Origen Railway de Mi Pulso (futuro deploy) — **pendiente**: habrá que
  agregar el origen a `CORS_ORIGIN` / `PULSO_ALLOWED_ORIGINS` cuando Mi
  Pulso se despliegue en Railway.

## Diagnóstico rápido

| Síntoma | Causa probable | Acción |
|---------|---------------|--------|
| Badge "Modo mock" al iniciar | `NEXT_PUBLIC_PULSO_DATA_MODE` no es `api` | Reconstruir con la variable correcta (`pnpm build`) |
| Error CORS en consola | Origen no en allowlist | Verificar `CORS_ORIGIN` en la API Railway |
| Login devuelve 401 | Credenciales incorrectas o auth desactivada | Verificar `PULSO_AUTH_MODE=demo` en la API |
| Badge naranja "Error de conexión" | API Railway caída o sin red | Abrir `https://api-production-42e99.up.railway.app/health` |
| Vista Hoy no carga, sin mensaje de error | `patientId` nulo (MC-PATIENT-ID-1 no desplegado) | Verificar que la API Railway tiene el código de MC-PATIENT-ID-1 |
| Selector demo aparece en modo api | Mezcla de modos en el build | Limpiar caché y reconstruir con `NEXT_PUBLIC_PULSO_DATA_MODE=api` |

## Límites explícitos (MC-MIPULSO-2)

- Solo verifica la cadena API (backend) y la experiencia local (frontend local).
- No toca código de Mi Pulso ni de la API.
- No toca Railway, Postgres, Prisma schema, seed ni variables de producción.
- No hace deploy de Mi Pulso ni registra dominio propio.
- No avanza a MC-11 ni MC-12.

> **Freno aquí.** No se avanza a deploy de Mi Pulso, dominio, MC-11 ni MC-12
> sin autorización explícita.
