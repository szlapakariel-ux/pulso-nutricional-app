# Playbook operativo — Web profesional en Railway

> MC-WEB-3 — guía repetible para verificar y operar la web profesional
> (`pulso-nutricional-web`) desplegada en Railway, conectada a la API Railway
> en modo lectura.
>
> Relacionado: [ADR 0019 (web→API lectura)](../decisiones/adr-0019-web-profesional-api-readonly.md),
> [ADR 0020 (CORS)](../decisiones/0020-api-cors-fastify-web-profesional.md),
> [ADR 0021 (este playbook)](../decisiones/0021-web-profesional-smoke-playbook.md).

## URLs de producción

| Servicio | URL |
|----------|-----|
| Web profesional | `https://pulso-nutricional-web-production.up.railway.app` |
| API | `https://api-production-42e99.up.railway.app` |

## Credenciales demo (ficticias, ya documentadas)

| Campo | Valor |
|-------|-------|
| Email | `profesional-demo@pulsonutricional.demo` |
| Password | `demo-profesional-2026` |

> Son credenciales de demostración. No son datos reales ni secretos.

---

## 1. Smoke test automatizado

Verifica que la web está servida y que la cadena de datos de la API responde.

```bash
# Con valores por defecto (URLs de producción):
pnpm smoke:web:railway

# O apuntando a otras URLs:
PULSO_WEB_BASE_URL=https://... \
PULSO_API_BASE_URL=https://... \
node scripts/smoke-web-profesional-railway.mjs
```

### Qué verifica

| # | Verificación | Esperado |
|---|--------------|----------|
| 1 | `GET /` de la web | 200 |
| 2 | HTML contiene `Pulso Nutricional` | presente |
| 3 | HTML contiene `Panel profesional` | presente |
| 4 | API `GET /health` | 200 |
| 5 | API `POST /auth/login` (demo) | 200 + token |
| 6 | API `GET /patients` (con token) | 200 + lista |
| 7 | API `GET /patients/:id` | 200 |
| 8 | API `GET /patients/:id/meal-plan` | 200 o 404 |
| 9 | API `GET /patients/:id/agenda` | 200 |

Exit code 0 = todo OK, 1 = algún fallo.

### Límite — CORS y entorno de red

- **CORS no se verifica aquí.** El CORS lo aplica el **navegador**, no `fetch`
  de Node. El smoke test confirma que la web se sirve y que el backend responde
  la misma cadena de llamadas que hace el navegador, pero la verificación real
  de CORS es **manual** (sección 2).
- **Entorno remoto de Claude Code:** este script **no** corre desde el entorno
  remoto de Claude Code (política de red / egress proxy → 403). Ejecutarlo desde
  una terminal con acceso a internet. Es el mismo límite documentado en
  [ADR 0018](../decisiones/0018-railway-api-smoke-test.md).

---

## 2. Verificación manual en el navegador

Lo que el smoke test automatizado **no** puede cubrir (CORS real, render de UI,
flujo de login interactivo). Hacer en un navegador de escritorio:

1. **Abrir** `https://pulso-nutricional-web-production.up.railway.app`.
   - ✅ La página carga sin pantalla en blanco ni error.
2. **Abrir DevTools → Console** antes de operar.
   - ✅ No hay errores `CORS`, `blocked by CORS policy` ni `Failed to fetch`.
3. **Confirmar modo API.**
   - ✅ Se muestra el indicador de modo `🔗 API` (no `📦 Mock`).
   - ✅ Aparece el formulario de login (modo API sin token).
4. **Login demo.**
   - Email/password demo de arriba → botón **Conectar**.
   - ✅ El login responde 200 (DevTools → Network → `auth/login`).
   - ✅ La vista pasa del formulario al panel.
5. **Lista de pacientes.**
   - ✅ La barra lateral muestra pacientes cargados desde la API.
   - ✅ En Network, `GET /patients` = 200.
6. **Ficha del paciente.**
   - Seleccionar un paciente → pestaña **Ficha**.
   - ✅ `GET /patients/:id` = 200, la ficha muestra datos.
7. **Plan y agenda.**
   - Pestaña **Plan y agenda**.
   - ✅ `meal-plan` (200 o 404 manejado) y `agenda` (200) abren sin error.
8. **Logout.**
   - Botón **Desconectar** → vuelve al formulario de login.

---

## 3. Diagnóstico rápido

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| `OPTIONS /auth/login` 404 | API sin redeploy tras CORS | Redeploy del servicio `api` en Railway |
| Error CORS en consola | `CORS_ORIGIN` no coincide con el origen de la web | Revisar `CORS_ORIGIN` en Railway (servicio `api`) |
| Web carga pero pide login en modo Mock | `NEXT_PUBLIC_PULSO_DATA_MODE` ≠ `api` | Revisar variable en Railway (servicio web) y redeploy |
| `Failed to fetch` en login | `NEXT_PUBLIC_PULSO_API_BASE_URL` mal o API caída | Verificar URL de la API y `pnpm smoke:api:railway` |
| Login 401 | Credenciales demo mal o auth no en modo demo | Revisar `PULSO_AUTH_MODE`/`PULSO_AUTH_ENFORCEMENT` en API |
| `GET /patients` 401 con token | Token expirado / enforcement | Re-login; revisar guards |

> El smoke test de la API es complementario: `pnpm smoke:api:railway`
> (ver [railway-api-smoke-test.md](railway-api-smoke-test.md)).

---

## Límites explícitos (MC-WEB-3)

- No toca código de la web ni de la API (solo script de verificación + docs).
- No toca Railway (solo hace peticiones HTTP de lectura).
- No toca Postgres.
- No toca Mi Pulso.
- No usa datos reales.
- No conecta dominio propio.
- No avanza a MC-11.

> **Freno aquí.** No se avanza a Mi Pulso, dominio, MC-11 ni MC-12 sin una
> nueva indicación explícita.
