# Estado Demo Comercial — Pulso Nutricional

> Estado de la demo online tras MC-FOTOS-GRACEFUL-1.
> Última actualización: 2026-06-12 (cierre MC-FOTOS-GRACEFUL-1).
>
> Historial:
> - MC-DEMO-LIVE-0 (2026-06-12): auditoría previa al deploy de Mi Pulso.
> - MC-MIPULSO-RWY-1-CIERRE (2026-06-12): demo online completa.
> - MC-FOTOS-GRACEFUL-1-CIERRE (2026-06-12): tab Fotos con fallback seguro validado.

---

## Veredicto

**DEMO ONLINE DISPONIBLE — apta para mostrar comercialmente.**

El flujo demo completo —paciente entra, registra, profesional ve— está
operativo end-to-end contra la API en producción. Ambas apps (panel
profesional y Mi Pulso) están online con la identidad visual nueva.

El tab **Fotos** del panel profesional **ya no expone HTTP 500 visible**: tras
MC-FOTOS-GRACEFUL-1 (PR #40, SHA `f84a870`) degrada con un **fallback seguro
validado** cuando no hay bucket S3 productivo. Las **fotos reales siguen fuera
de alcance** (no hay S3 productivo): se valida el fallback, no el
almacenamiento de imágenes. Ver "Estado del tab Fotos".

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
> ADR 0018). Los resultados de smoke test documentados abajo provienen de
> reportes de ejecución manual (terminal/navegador con acceso real):
> MC-MIPULSO-RWY-1 para el flujo general y MC-FOTOS-GRACEFUL-1 para el tab Fotos.

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
| 10 | Tab Fotos del panel profesional | ✅ Fallback seguro (sin HTTP 500 visible) — MC-FOTOS-GRACEFUL-1 |

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

## Estado del tab Fotos

### Fallback seguro validado (MC-FOTOS-GRACEFUL-1)

**Antes:** al abrir el tab **Fotos** de un paciente, la respuesta era HTTP 500
visible (sin bucket S3 productivo).

**Ahora:** tras MC-FOTOS-GRACEFUL-1 (PR #40, SHA `f84a870`), el tab **degrada
con gracia** y muestra un fallback amigable, sin error técnico visible:

- Título: **"Fotos no disponibles en este momento"**
- Descripción: **"No fue posible cargar los registros de fotos en este momento."**
- Pie: **"La visualización de imágenes estará disponible en la versión
  productiva. El resto del panel funciona con normalidad."**

**Validado por smoke manual (PASS, 2026-06-12):** el tab abre correctamente y ya
**no** muestra HTTP 500, stack trace ni lenguaje técnico crudo. El resto del
panel (ficha, consultas, plan, agenda, revisión, actividad) funciona normalmente.

**Impacto demo:** el tab Fotos **se puede mostrar** durante la presentación. Ya
no hay que evitarlo.

> **Nota operativa (caché del navegador):** si tras un deploy el navegador
> muestra una versión anterior de la interfaz —por ejemplo el mensaje viejo
> *"No se pudieron cargar las fotos: HTTP 500"*—, hacer **hard reload con
> Ctrl+Shift+R**. Eso fuerza la descarga del bundle nuevo. En el smoke de cierre,
> ese fue el único problema residual, y se resolvió con hard reload.

---

### Fotos reales / bucket S3 fuera de alcance

Lo validado es el **fallback seguro**, no el almacenamiento de fotos reales. El
upload real de fotos al bucket sigue **no activado** (pendiente histórico
MC-FOTOS-PROD-1) porque **no hay bucket S3 productivo**. En la demo, la foto de
comida se registra como metadata; la imagen no persiste. Comunicarlo si se llega
al paso de fotos en Mi Pulso.

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
| Tab Fotos sin S3 | ✅ Resuelto con fallback seguro | MC-FOTOS-GRACEFUL-1 (cerrado) |
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
| Tab Fotos del panel | Fallback seguro validado (sin HTTP 500 visible) — MC-FOTOS-GRACEFUL-1 |
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

> ℹ️ El tab **Fotos** del panel **se puede mostrar**: degrada con un fallback
> amigable (sin error técnico visible). Si el navegador muestra una versión
> anterior, hacer **Ctrl+Shift+R** antes de presentar.

Detalle paso a paso en `docs/demo/guia-demo.md`.

---

## Notas adicionales

- **Sin dominio propio:** las URLs `*.up.railway.app` son de Railway. No usar
  como URLs finales del producto en material de marketing.
- **Verificación de CORS es manual (solo en navegador):** los smoke tests
  verifican la cadena de datos, no el comportamiento CORS real del navegador.
- **`NEXT_PUBLIC_*` se inlinean en build:** cambiar el modo/URL de las apps web
  requiere rebuild, no solo cambio de variable en runtime.
