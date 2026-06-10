# Smoke Test Operativo — API Railway (MC-RWY-2)

> **Para qué sirve:** verificar en cualquier momento que la API Railway de
> Pulso Nutricional está viva, autenticada y respondiendo correctamente en
> los endpoints clave. Es un test de humo post-deploy repetible, no un test
> de integración completo.

---

## Cómo ejecutar

```bash
# Desde la raíz del monorepo, en tu terminal local
PULSO_API_BASE_URL=https://api-production-42e99.up.railway.app pnpm smoke:api:railway

# O directamente con node:
PULSO_API_BASE_URL=https://api-production-42e99.up.railway.app node scripts/smoke-api-railway.mjs
```

Si `PULSO_API_BASE_URL` no se define, el script usa el default:
`https://api-production-42e99.up.railway.app`.

> ⚠️ **Importante:** el script hace llamadas HTTP a la URL pública de Railway.
> Debe correr desde tu **terminal local** (o desde un entorno con acceso a
> internet abierto). No funcionará desde el entorno remoto de Claude Code, que
> aplica una política de red que bloquea llamadas salientes a URLs externas.

---

## Qué valida

| # | Endpoint | Token | Código esperado | Notas |
|---|----------|-------|-----------------|-------|
| 1 | `GET /health` | No | 200 | Endpoint público, siempre disponible |
| 2 | `GET /patients` | No | 401 | Verifica que `PULSO_AUTH_ENFORCEMENT=demo` esté activo |
| 3 | `POST /auth/login` | No | 200 + token | Credencial demo ficticia del repo |
| 4 | `GET /auth/me` | Profesional | 200 | Verifica que el token es válido |
| 5 | `GET /patients` | Profesional | 200 | Lista no vacía de pacientes demo |
| 6 | `GET /patients/:id` | Profesional | 200 | Usa el primer `patientId` de la lista |
| 7 | `GET /patients/:id/meal-plan` | Profesional | 200 o 404 | 404 aceptado (puede no tener plan asignado) |
| 8 | `GET /patients/:id/agenda` | Profesional | 200 | Agenda diaria del paciente |
| 9 | `GET /auth/me` | Inválido | 401 | Verifica que tokens falsos son rechazados |

**Total:** 9 verificaciones.

---

## Qué NO valida

- **Endpoints de paciente** (`/patients/:id/today`, `/meal-logs`, `/weight-logs`, etc.): quedan para un test más completo.
- **Rol paciente** (acceso a sus propios datos, protección de datos de otros pacientes).
- **Endpoints de PDF** (`/pdf/plan/*`).
- **Bandeja de revisión** (`/review-inbox`).
- **Actividad física** (`/activity/*`).
- **Consultas** (`/consultations`).
- **Performance** (timeouts, carga, latencia).
- **Persistencia** (no escribe datos — solo lee).

---

## Cómo interpretar errores

### `❌ FAIL | 403 (exp 200) | /health`
La API puede estar offline en Railway (el servicio cayó), o hay un bloqueo
de red entre tu máquina y Railway. Verificar el dashboard de Railway.

### `❌ FAIL | 200 (exp 401) | GET /patients (sin token)`
`PULSO_AUTH_ENFORCEMENT` no está en `demo`. Revisar variables del servicio `api`
en Railway.

### `❌ FAIL | 501 (exp 200) | POST /auth/login`
`PULSO_AUTH_MODE` no está en `demo`. Revisar variables del servicio `api`.

### `❌ FAIL | 401 (exp 200) | GET /patients (con token)`
El token no se generó (login falló antes) o expiró. Verificar paso 3.

### `⚠ Sin patientId — sin datos demo?`
`db:seed` no se ejecutó o la DB está vacía. Correr seed:
```bash
PULSO_API_BASE_URL=... # no necesario para seed
export DATABASE_URL="<url-postgres-railway>"
pnpm --filter @pulso/api db:seed
```

---

## Ejemplo de salida exitosa

```
🔍  Pulso Nutricional — API Smoke Test
    Base URL : https://api-production-42e99.up.railway.app
    Fecha    : 2026-06-10T11:00:00.000Z

  Status | Código      | Endpoint
  ────────────────────────────────────────────────────────────────────────
  ✅ OK   | 200 (exp 200    ) | /health
  ✅ OK   | 401 (exp 401    ) | GET /patients (sin token)
  ✅ OK   | 200 (exp 200    ) | POST /auth/login
         → token obtenido: eyJhbGciOi… (no imprimido completo)
  ✅ OK   | 200 (exp 200    ) | GET /auth/me (con token)
         → role: professional
  ✅ OK   | 200 (exp 200    ) | GET /patients (con token)
         → pacientes: 3
         → patientId: d0000000-0000-0001-0000-000000000011
  ✅ OK   | 200 (exp 200    ) | GET /patients/:id
  ✅ OK   | 200 (exp 200|404 ) | GET /patients/:id/meal-plan
  ✅ OK   | 200 (exp 200    ) | GET /patients/:id/agenda
  ✅ OK   | 401 (exp 401    ) | GET /auth/me (token inválido)

  ────────────────────────────────────────────────────────────────────────
  Resultado: 9 OK, 0 FAIL

  ✅ Smoke test PASÓ — API lista.
```

---

## Seguridad del script

- **No toca Railway** (solo hace peticiones HTTP de lectura).
- **No toca Postgres** (no ejecuta queries directos).
- **No toca web apps** (`pulso-nutricional-web`, `mi-pulso-web` no se mencionan).
- **No usa datos reales** (credenciales ficticias documentadas en el repo).
- **No imprime token completo** (solo los primeros 12 caracteres + "…").
- **No escribe datos** (todas las peticiones de escritura son preview/simuladas).
- **Exit code:** 0 = todo OK, 1 = algún fallo.

---

## Cuándo ejecutarlo

- **Post-deploy:** después de cualquier redeploy de `api`.
- **Post-seed:** después de correr `db:push` / `db:seed`.
- **Verificación periódica:** si la API no recibe tráfico por un tiempo.
- **Antes de una demo:** confirmar que la API está viva.

---

## Variables de entorno relevantes

| Variable | Propósito | Valor actual Railway |
|----------|-----------|---------------------|
| `PULSO_API_BASE_URL` | URL base del smoke test | `https://api-production-42e99.up.railway.app` |
| `PULSO_AUTH_MODE` | Habilita login demo | `demo` (en Railway) |
| `PULSO_AUTH_ENFORCEMENT` | Activa guards de rol | `demo` (en Railway) |
| `PULSO_DATA_SOURCE` | Fuente de datos | `prisma` (en Railway) |

> Los valores de Railway no se configuran aquí; se verifican de forma
> indirecta por el comportamiento del smoke test (401 sin token, 200 con
> token, etc.).
