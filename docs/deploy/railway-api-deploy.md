# Railway API Deploy — Controlado (MC-RWY-1)

> **Estado: COMPLETADO Y OPERATIVO**
> El servicio `api` está desplegado en Railway, conectado al repo y consumiendo Postgres demo.
> Las apps web (`pulso-nutricional-web`, `mi-pulso-web`) **no están conectadas ni desplegadas**.
> No hay dominio propio conectado.

---

## 1. Resumen del deploy

| Aspecto | Estado |
|---------|--------|
| Proyecto Railway | `pulso-nutricional` |
| Servicio `api` | Online, desplegado |
| Repo conectado | `szlapakariel-ux/pulso-nutricional-app` |
| Rama | `main` |
| URL pública | `https://api-production-42e99.up.railway.app` |
| Postgres Railway | Online, demo schema + seed |
| `pulso-nutricional-web` | Sin desplegar (todavía usa mocks locales) |
| `mi-pulso-web` | Sin desplegar (todavía usa mocks locales) |
| Dominio propio | No conectado |

---

## 2. Configuración del servicio `api`

### Conexión al repo (Source)

```
Repository: szlapakariel-ux/pulso-nutricional-app
Branch: main
Auto-deploy: Desactivado (deploy manual controlado)
```

### Build & Deploy

```
Root Directory: / (raíz del repo, monorepo-aware)
Install Command: pnpm install --frozen-lockfile
Build Command: pnpm turbo run build --filter=@pulso/api
Start Command: pnpm --filter @pulso/api start
```

> El build ejecuta `prisma generate` (genera tipos Prisma), luego compila TypeScript.
> No requiere `DATABASE_URL` en tiempo de build (solo en runtime).

### Variables de entorno configuradas

| Variable | Valor (sin mostrar) | Notas |
|----------|-------------------|-------|
| `DATABASE_URL` | Referencia interna al Postgres Railway | Set via Railway reference `${{Postgres.DATABASE_URL}}` |
| `PULSO_DATA_SOURCE` | `prisma` | Lectura desde Postgres en modo controlado |
| `PULSO_AUTH_MODE` | `demo` | Login JWT demo habilitado |
| `PULSO_AUTH_ENFORCEMENT` | `demo` | Guards de rol activos (profesional/paciente) |
| `JWT_SECRET` | (secreto generado en Railway) | Generado dentro de Railway, no expuesto |
| `NODE_ENV` | `production` | Activa validaciones estrictas de secretos |
| `HOST` | `0.0.0.0` | Escucha en todas las interfaces (requerido Railway) |
| `PORT` | (inyectado por Railway) | No hardcodeado; Railway inyecta automáticamente |

---

## 3. Preparación de la Base de Datos demo

Antes del deploy, la DB demo se preparó ejecutando (desde máquina local, contra el Postgres de Railway):

```bash
pnpm --filter @pulso/api db:generate  # Genera cliente Prisma
pnpm --filter @pulso/api db:push      # Sincroniza schema
pnpm --filter @pulso/api db:seed      # Inserta datos demo
```

### Datos demo insertados

| Modelo | Cantidad | Notas |
|--------|----------|-------|
| Professional (usuario profesional) | 1 | Email: `profesional-demo@pulsonutricional.demo` |
| Patient (usuarios pacientes) | 3 | Emails: `paciente-demo-{uno,dos,tres}@pulsonutricional.demo` |
| MealPlan | 3+ | Planes demo asignados a pacientes |
| PatientAgendaItem | 6+ | Agenda diaria para hoy (ambos pacientes) |
| MealLog, WeightLog | 3+ | Logs revisables de pacientes (estado `pending`) |

**Garantías:**
- Todos los datos son **ficticios demo**.
- Los UUIDs son **fijos e idempotentes** (upsert en seed).
- Ningún dato personal real.
- La DB se puede resetear/rellenar ejecutando `db:seed` nuevamente.

---

## 4. Verificaciones post-deploy (resultados)

### `/health`

```bash
curl https://api-production-42e99.up.railway.app/health
```

✅ **Respuesta:** `200 OK`

```json
{
  "data": {
    "status": "ok",
    "service": "pulso-nutricional-api",
    "version": "0.0.0-mc5",
    "timestamp": "2026-06-10T...",
    "environment": "production"
  }
}
```

---

### Auth Demo

**Login profesional (credencial demo documente):**

```bash
curl -X POST https://api-production-42e99.up.railway.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"profesional-demo@pulsonutricional.demo","password":"demo-profesional-2026"}'
```

✅ **Respuesta:** `200 OK` + JWT token

```json
{
  "data": {
    "token": "<jwt-token>",
    "user": {
      "id": "d0000000-0000-0000-0000-000000000001",
      "email": "profesional-demo@pulsonutricional.demo",
      "role": "professional"
    },
    "isDemoData": true
  },
  "meta": { "demo": true }
}
```

**Verificar token (GET /auth/me):**

```bash
curl https://api-production-42e99.up.railway.app/auth/me \
  -H "Authorization: Bearer <token>"
```

✅ **Respuesta:** `200 OK` + usuario autenticado

---

### Endpoints de negocio

**`GET /patients` sin token:**

```bash
curl https://api-production-42e99.up.railway.app/patients
```

✅ **Respuesta:** `401 Unauthorized` (guard `requireProfessional` activo)

**`GET /patients` con token profesional:**

```bash
curl https://api-production-42e99.up.railway.app/patients \
  -H "Authorization: Bearer <token>"
```

✅ **Respuesta:** `200 OK` + lista de 3 pacientes demo

**Ejemplo de paciente (Prisma UUID):**

```json
{
  "id": "d0000000-0000-0001-0000-000000000011",
  "fullName": "Paciente Demo Uno",
  "age": 34,
  "goal": "Objetivo ficticio: mejorar hábitos",
  "lastControl": "2026-05-20"
}
```

**`GET /patients/:patientId` (con UUID del ejemplo):**

```bash
curl https://api-production-42e99.up.railway.app/patients/d0000000-0000-0001-0000-000000000011 \
  -H "Authorization: Bearer <token>"
```

✅ **Respuesta:** `200 OK` + detalles del paciente (profesionalNote nunca expuesto)

**`GET /patients/:patientId/meal-plan`:**

```bash
curl https://api-production-42e99.up.railway.app/patients/d0000000-0000-0001-0000-000000000011/meal-plan \
  -H "Authorization: Bearer <token>"
```

✅ **Respuesta:** `200 OK` + plan asignado

**`GET /patients/:patientId/agenda`:**

```bash
curl https://api-production-42e99.up.railway.app/patients/d0000000-0000-0001-0000-000000000011/agenda \
  -H "Authorization: Bearer <token>"
```

✅ **Respuesta:** `200 OK` + agenda diaria

**Token inválido:**

```bash
curl https://api-production-42e99.up.railway.app/patients \
  -H "Authorization: Bearer invalid-token"
```

✅ **Respuesta:** `401 Unauthorized`

---

## 5. Brechas y limitaciones conocidas (igual a MC-RWY-0)

| # | Brecha | Impacto | Acción |
|---|--------|---------|--------|
| 1 | Apps web **no consumen la API** (todavía usan mocks locales). | Un usuario accediendo a `https://pulso-web.` vería datos ficticios locales, no los datos vivos de Postgres. | Implementar cliente HTTP + `NEXT_PUBLIC_API_BASE_URL` en las apps web (nuevo MC dedicado). |
| 2 | No hay `NEXT_PUBLIC_API_BASE_URL` en las apps. | Sin punto de configuración para apuntar a la API en Railway. | Definir cuando se implemente el consumo (brecha 1). |
| 3 | `User` modelo Prisma sin `passwordHash`. | Credenciales demo en memoria; no apto para auth real. | Agregar `passwordHash` + hashing (bcrypt) en un MC de auth avanzado. |
| 4 | `package.json#prisma.seed` deprecated. | Warning en Prisma 6; se removería en Prisma 7. | Migrar a `prisma.config.ts` en un MC de mantenimiento. |

---

## 6. Riesgos mitigados

| Riesgo | Mitigación | Estado |
|--------|-----------|--------|
| Secret exposure | `JWT_SECRET` generado dentro de Railway, no en chat/logs. | ✅ OK |
| DB destructiva | `db:push` con auth demo UUID; sin datos reales; schema nuevo. | ✅ OK |
| Web apps desplegadas sin intención | Deploy controlado solo de `api`; otras apps sin tocar. | ✅ OK |
| Dominio propio expuesto | No conectado; solo `*.up.railway.app` de Railway. | ✅ OK |
| Datos reales en seed | Seed todo ficticio e idempotente. | ✅ OK |

---

## 7. Próximos pasos recomendados (tres opciones mutuamente excluyentes)

Con la API viva y verificada, **tres rutas posibles sin que una implique las otras:**

### Opción A: Conectar la web profesional a la API
- **MC siguiente:** implementar cliente HTTP en `pulso-nutricional-web`.
- Definir `NEXT_PUBLIC_API_BASE_URL` → apuntar a `https://api-production-42e99.up.railway.app`.
- Reemplazar mocks con `fetch` desde la API.
- Verificar flujo profesional de punta a punta.

### Opción B: Preparar MC-11 — Mobile reducido
- Panel profesional móvil.
- Reutiliza API + componentes de PC.
- Web apps aún con mocks; API sigue aislada en Railway.

### Opción C: Smoke test operativo documentado
- Crear un documento de playbook: "Cómo validar la API en producción".
- Tests manuales verificados cada X días.
- Monitoreo básico de health check.

---

## 8. Estado de Railway tras MC-RWY-1

✅ **API operativa:**
- Servicio vivo, logs verdes.
- Postgres sincronizado.
- Auth demo funcional.
- Guarsd de rol activos.
- UUIDs Prisma en producción.

❌ **Web apps pendientes:**
- `pulso-nutricional-web` offline (todavía usa mocks).
- `mi-pulso-web` offline (todavía usa mocks).
- Sin consumo real de API.

❌ **Dominio:**
- No conectado.
- Solo `*.up.railway.app` funcional.

---

## 9. Cómo rehacer el deploy (si fuera necesario)

> ⚠️ **No ejecutar sin autorización explícita.**

Si el deploy fallara o debiera resetarse:

1. En el dashboard de Railway, servicio `api` → "Redeploy" (usa el último commit de `main`).
2. Si la DB se dañara (mínimo riesgo con datos demo):
   - Localmente: `pnpm --filter @pulso/api db:seed` (rellenará idempotentemente).
3. Si `JWT_SECRET` se perdiera: generar uno nuevo en Railway (el código exigirá que exista).

---

## 10. Restricciones de este deploy (vigentes)

- **No** tocar web apps.
- **No** conectar dominio propio.
- **No** borrar Postgres.
- **No** redeployar web apps.
- **No** agregar más secretos sin autorización.
- **No** conectar OAuth / SSO / MFA.
- **No** hacer cambios de código en la API sin cierre documental previo.

---

> **Fin del documento MC-RWY-1.** La API está lista para que los próximos ciclos
> la consuman (web profesional) o creen servicios nuevos (mobile). Freno aquí
> hasta autorización explícita.
