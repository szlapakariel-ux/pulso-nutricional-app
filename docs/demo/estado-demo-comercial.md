# Estado Demo Comercial — Pulso Nutricional

> Estado de la demo online tras MC-MIPULSO-RWY-1.
> Última actualización: 2026-06-12 (cierre MC-MIPULSO-RWY-1).
>
> Historial:
> - MC-DEMO-LIVE-0 (2026-06-12): auditoría previa al deploy de Mi Pulso.
> - MC-MIPULSO-RWY-1-CIERRE (2026-06-12): demo online completa.

---

## Veredicto

**DEMO ONLINE DISPONIBLE — apta para mostrar comercialmente.**

El flujo demo completo —paciente entra, registra, profesional ve— está
operativo end-to-end contra la API en producción. Ambas apps (panel
profesional y Mi Pulso) están online con la identidad visual nueva.

Hay **un bloqueo parcial conocido**: el tab **Fotos** del panel profesional
devuelve HTTP 500 porque no hay bucket S3 productivo. No afecta el resto del
flujo. Ver "Bloqueos conocidos".

---

## URLs finales de producción

| Servicio | URL | Estado |
|----------|-----|--------|
| API (Fastify) | `https://api-production-42e99.up.railway.app` | ✅ Online · health OK |
| Panel profesional | `https://pulso-nutricional-web-production.up.railway.app` | ✅ Online · identidad visual nueva |
| Mi Pulso (paciente) | `https://mi-pulso-web-production.up.railway.app` | ✅ Online · identidad visual nueva |
| Postgres Railway | (interno Railway) | ✅ Online con datos demo |
| Bucket S3 (fotos reales) | — | ❌ No productivo (fuera de alcance) |

> **Nota de verificación:** Los smoke tests automatizados (`pnpm smoke:*:railway`)
> y este informe NO se ejecutan desde el entorno remoto de Claude Code: la
> política de red bloquea el egress a Railway (403 `host_not_allowed`,
> ADR 0018). Los resultados de smoke test documentados abajo provienen del
> reporte de ejecución de MC-MIPULSO-RWY-1 (terminal/navegador con acceso real).

---

## Checklist de smoke tests reportados (MC-MIPULSO-RWY-1)

| # | Verificación | Resultado |
|---|--------------|-----------|
| 1 | API `/health` | ✅ OK |
| 2 | Panel profesional online con identidad visual nueva | ✅ OK |
| 3 | Mi Pulso online con identidad visual nueva | ✅ OK |
| 4 | CORS configurado para panel profesional | ✅ OK |
| 5 | CORS configurado para Mi Pulso | ✅ OK |
| 6 | Login demo profesional | ✅ OK |
| 7 | Login demo paciente | ✅ OK |
| 8 | Registro de comida desde Mi Pulso | ✅ OK |
| 9 | Flujo paciente → API → panel profesional | ✅ Operativo |
| 10 | Tab Fotos del panel profesional | ❌ HTTP 500 (sin S3 real) |

**Garantías del deploy:**
- No se ejecutó `db:push`.
- No se tocaron datos reales.
- Postgres demo intacto (datos ficticios idempotentes).

---

## Credenciales demo (vigentes)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Profesional | `profesional-demo@pulsonutricional.demo` | `demo-profesional-2026` |
| Paciente 1 | `paciente-demo-uno@pulsonutricional.demo` | `demo-paciente-2026` |
| Paciente 2 | `paciente-demo-dos@pulsonutricional.demo` | `demo-paciente-2026` |

> Credenciales ficticias. Sin datos personales reales. La DB de Railway puede
> resetearse ejecutando `pnpm --filter @pulso/api db:seed` (idempotente).

---

## Bloqueos conocidos

### BLOQUEO 1 — Tab Fotos del panel devuelve HTTP 500

**Síntoma:** Al abrir el tab **Fotos** de un paciente en el panel profesional,
la respuesta es HTTP 500.

**Causa:** No hay bucket S3 productivo configurado. El backend intenta resolver
las imágenes y falla sin un fallback seguro.

**Impacto demo:** El tab Fotos no se puede mostrar. El resto del flujo
(ficha, consultas, plan, agenda, revisión, actividad) funciona normalmente.

**Mitigación inmediata para la demo:** No abrir el tab Fotos durante la
presentación. El registro de comida desde Mi Pulso sí funciona (se guarda
como metadata).

**Resolución recomendada:** Microciclo **MC-FOTOS-GRACEFUL-1** — implementar un
fallback visual seguro cuando no hay S3 (placeholder/empty state en lugar de
500). **No** implica activar S3 real. Es un cambio de manejo de error en el
frontend/backend para degradar con gracia.

> **Fuera de alcance de este ciclo (documental).** No se toca código aquí.

---

### BLOQUEO 2 — Fotos reales / bucket S3 fuera de alcance

El upload real de fotos al bucket sigue **no activado** (pendiente histórico
MC-FOTOS-PROD-1). En la demo, la foto de comida se registra como metadata; la
imagen no persiste. Comunicarlo si se llega al paso de fotos en Mi Pulso.

---

## Riesgos y pendientes

### RIESGO 1 — Auto-deploy quedó habilitado en los front-end

Durante MC-MIPULSO-RWY-1, el **auto-deploy quedó habilitado** en los servicios
front-end (`pulso-nutricional-web` y `mi-pulso-web`), cuando previamente estaba
**desactivado de forma intencional** (deploy manual controlado, definido en
MC-RWY-1).

**Implicancia:** Cada push a `main` puede disparar un deploy automático de las
apps web. Esto rompe el modelo de "deploy controlado" anterior: un cambio
mergeado podría llegar a la demo sin verificación previa.

**Estado en este ciclo:** Documentado, **no modificado**. Cambiar esta
configuración está fuera del alcance de este cierre documental.

**Pendiente:** Decidir explícitamente si se mantiene auto-deploy (más ágil,
menos control) o se vuelve a deploy manual (más control, como MC-RWY-1).
Requiere decisión y un microciclo dedicado para tocar Railway.

---

### Otros pendientes (sin cambios)

| Pendiente | Estado | Microciclo sugerido |
|-----------|--------|---------------------|
| Tab Fotos 500 sin S3 | Bloqueo de demo | MC-FOTOS-GRACEFUL-1 |
| Upload real de fotos | Fuera de alcance | MC-FOTOS-PROD-1 |
| Decisión auto-deploy front-end | Pendiente de decisión | (a definir) |
| Dominio propio | No conectado | (a definir) |
| Auth real (passwordHash) | Demo en memoria | (previo a producción real) |
| CI/CD (GitHub Actions) | No configurado | (a definir) |

---

## Qué es demo / ficticio

| Elemento | Estado |
|----------|--------|
| Datos de pacientes | Ficticios (nombres genéricos, valores inventados) |
| Credenciales de login | Ficticias (dominio `.demo`) |
| Fotos de comida | Metadata únicamente; imagen no persiste (sin bucket S3) |
| Tab Fotos del panel | HTTP 500 (sin S3); requiere MC-FOTOS-GRACEFUL-1 |
| PDF del plan | Generado en el momento por pdfkit, con datos demo |
| Postgres | Online con seed demo; sin datos reales |
| URLs | Railway `*.up.railway.app`, no son URLs finales del producto |

---

## Flujo demo recomendado (online completo)

Con ambas apps online, el flujo end-to-end es demostrable:

1. **Panel profesional** — abrir la URL, login profesional, lista de pacientes.
2. **Ficha** → datos profesionales internos (no visibles al paciente).
3. **Consultas** → historial y nueva consulta.
4. **Plan y agenda** → plan asignado + agenda + descarga PDF.
5. **Revisión** → bandeja con registros pendientes del paciente.
6. **Mi Pulso** (celular o segunda ventana) — login paciente, Vista Hoy con
   el plan que asignó la profesional.
7. **Registrar** → cargar una comida desde Mi Pulso.
8. **Volver al panel** → el registro aparece en la bandeja de Revisión.

> ⚠️ **No abrir el tab Fotos** del panel durante la demo (HTTP 500 sin S3).

Detalle paso a paso en `docs/demo/guia-demo.md`.

---

## Notas adicionales

- **Sin dominio propio:** las URLs `*.up.railway.app` son de Railway. No usar
  como URLs finales del producto en material de marketing.
- **Verificación de CORS es manual (solo en navegador):** los smoke tests
  verifican la cadena de datos, no el comportamiento CORS real del navegador.
- **`NEXT_PUBLIC_*` se inlinean en build:** cambiar el modo/URL de las apps web
  requiere rebuild, no solo cambio de variable en runtime.
