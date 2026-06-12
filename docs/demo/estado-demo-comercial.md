# Estado Demo Comercial — MC-DEMO-LIVE-0

> Auditoría de preparación para mostrar la demo a una nutricionista.
> Fecha: 2026-06-12.

---

## Veredicto

**PARCIALMENTE LISTA — con bloqueadores críticos.**

La demo NO puede mostrarse comercialmente en su estado actual porque
**Mi Pulso no está desplegado online**. El flujo demo completo —paciente
entrando, registrando, profesional viendo— requiere que ambas apps estén
accesibles desde un navegador externo. Hoy solo el panel profesional y la
API están en Railway.

---

## Estado de servicios online

| Servicio | URL | Estado | Versión deployada |
|----------|-----|--------|-------------------|
| API (Fastify) | `https://api-production-42e99.up.railway.app` | ✅ Desplegada (MC-RWY-1) | Desconocida — auto-deploy off |
| Panel profesional | `https://pulso-nutricional-web-production.up.railway.app` | ✅ Desplegada (MC-WEB-3) | Desconocida — auto-deploy off |
| Mi Pulso (paciente) | `https://mi-pulso-web-production.up.railway.app` | ❌ **NO desplegada** | Preflight documentado, sin ejecutar |
| Postgres Railway | (interno Railway) | ✅ Online con datos demo | — |

> **Nota de verificación:** Los smoke tests automatizados (`pnpm smoke:*:railway`)
> no pueden ejecutarse desde el entorno remoto de Claude Code porque la política
> de red bloquea el egress a Railway (403 `host_not_allowed`). Esta limitación
> está documentada en ADR 0018 y en los playbooks de cada servicio. La
> verificación real debe hacerse desde un navegador o terminal con acceso a internet.

---

## Bloqueadores (ordenados por prioridad)

### BLOQUEADOR 1 — Mi Pulso sin deploy (crítico)

**Impacto:** El flujo demo del paciente (pasos 5-6 del guion) es imposible.
No hay URL pública de Mi Pulso.

**Qué falta para resolverlo:**
1. Ampliar la allowlist CORS de la API para incluir el origen de Mi Pulso
   (variable `PULSO_ALLOWED_ORIGINS` en Railway → redeploy de la API).
2. Configurar y desplegar el servicio `mi-pulso-web` en Railway con las
   variables `NEXT_PUBLIC_PULSO_DATA_MODE=api` y
   `NEXT_PUBLIC_PULSO_API_BASE_URL=https://api-production-42e99.up.railway.app`.
3. Verificar con el checklist del playbook (`docs/deploy/mi-pulso-railway-preflight.md`).

**Autorización requerida:** Sí. Requiere `MC-MIPULSO-RWY-1` explícito antes de ejecutar.

---

### BLOQUEADOR 2 — Versión deployada probablemente desactualizada

**Contexto:** Auto-deploy está desactivado en Railway (configuración intencional
de MC-RWY-1). Los cambios de los siguientes microciclos **no se desplegaron
automáticamente** tras su merge en main:

| Microciclo | PR | Qué cambia en producción |
|------------|----|--------------------------|
| MC-FOTOS-MVP-3 | #34 | Panel profesional ve y revisa fotos de comidas |
| MC-DEMO-VENDIBLE-1 | #35 | Limpieza visual y comercial |
| MC-DESIGN-1 | #36 | Identidad visual (colores, tipografía, tokens) |
| MC-DEMO-QA-1 | #37 | Correcciones de copy, storageKey oculto, status en español |

Si no hubo un redeploy manual de la web profesional y la API tras cada merge,
**la versión online puede tener entre 1 y 4 microciclos de atraso visual**.

**Impacto demo:** Si el panel no tiene MC-DESIGN-1, el visitante ve la
identidad visual antigua (sin Plus Jakarta Sans, sin paleta warm healthtech,
con labels técnicos en inglés).

**Cómo resolver:** Redeploy manual del servicio `pulso-nutricional-web` (y
opcionalmente del `api`) en el dashboard de Railway. Verificar con el
checklist de `docs/deploy/web-profesional-railway-playbook.md`.

**Autorización requerida:** Sí. Redeploy manual en Railway.

---

### BLOQUEADOR 3 — Guía de demo desactualizada

**Detectado:**
- La guía lista "Panel profesional ve fotos del paciente" como `⏳ Próximo ciclo
  (MC-FOTOS-MVP-3)` cuando MC-FOTOS-MVP-3 ya está mergeado en main (PR #34).
- La guía lista como limitación "El panel profesional no muestra todavía las
  fotos subidas por el paciente (pendiente MC-FOTOS-MVP-3)" — ya resuelto.
- La guía no menciona la identidad visual (MC-DESIGN-1).
- La guía menciona `https://mi-pulso-web-production.up.railway.app` como
  disponible, pero esa URL no existe online.

**Cómo resolver:** Actualizar `docs/demo/guia-demo.md`. ✅ Resuelto en este PR.

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

## Qué es demo / ficticio

| Elemento | Estado |
|----------|--------|
| Datos de pacientes | Ficticios (nombres genéricos, valores inventados) |
| Credenciales de login | Ficticias (dominio `.demo`) |
| Fotos de comida | UI funciona; la imagen no se persiste (sin bucket S3 activo) |
| PDF del plan | Generado en el momento por pdfkit, con datos demo |
| Postgres | Online con seed demo; sin datos reales |
| URL del panel | Railway `*.up.railway.app`, no es URL final del producto |

---

## Qué está funcionando (sin bloqueos de deploy)

Según los microciclos cerrados en main y la documentación de deploy:

| Feature | Estado en main | Estado online |
|---------|---------------|---------------|
| Login profesional y paciente | ✅ | ✅ (API desplegada) |
| Lista de pacientes | ✅ | ✅ (si web = versión correcta) |
| Ficha del paciente | ✅ | ✅ |
| Consultas (listado + detalle) | ✅ | ✅ |
| Plan y agenda + PDF | ✅ | ✅ |
| Bandeja de revisión | ✅ | ✅ |
| Panel ve fotos del paciente | ✅ (MC-FOTOS-MVP-3) | ❓ (depende de versión) |
| Identidad visual (tokens, tipografía) | ✅ (MC-DESIGN-1) | ❓ (depende de redeploy) |
| Mi Pulso — Vista Hoy | ✅ | ❌ (no desplegado) |
| Mi Pulso — Registrar | ✅ | ❌ (no desplegado) |
| Mi Pulso — Upload fotos | ✅ UI | ❌ (no desplegado) |

---

## Acciones requeridas para demo comercial completa

En orden de ejecución recomendado. **Ninguna puede hacerse desde el entorno
remoto de Claude Code. Todas requieren autorización explícita.**

| # | Acción | Dónde | MC sugerido |
|---|--------|-------|-------------|
| 1 | Redeploy del servicio `api` en Railway (para reflejar main) | Dashboard Railway | — |
| 2 | Redeploy del servicio `pulso-nutricional-web` en Railway | Dashboard Railway | — |
| 3 | Ampliar CORS de la API: `PULSO_ALLOWED_ORIGINS` para incluir URL de Mi Pulso + redeploy de API | Dashboard Railway | MC-MIPULSO-RWY-1 |
| 4 | Configurar y desplegar servicio `mi-pulso-web` en Railway | Dashboard Railway | MC-MIPULSO-RWY-1 |
| 5 | Smoke test desde terminal local: `pnpm smoke:web:railway` y `pnpm smoke:mi-pulso:railway` | Terminal local | — |
| 6 | Verificación manual en navegador según playbooks | Navegador | — |

---

## Flujo demo posible HOY (parcial)

Sin Mi Pulso online, la demo muestra **solo el lado profesional**:

1. Abrir `https://pulso-nutricional-web-production.up.railway.app`.
2. Login con `profesional-demo@pulsonutricional.demo` / `demo-profesional-2026`.
3. Lista de pacientes → seleccionar Paciente Demo Uno.
4. Tab **Ficha** → datos profesionales internos.
5. Tab **Consultas** → historial y nueva consulta.
6. Tab **Plan y agenda** → plan asignado + agenda del día + descarga PDF.
7. Tab **Revisión** → bandeja con registros pendientes del paciente.
8. Tab **Actividad** → historial de actividad.

**Limitación:** no se puede mostrar la experiencia del paciente desde el celular.
No hay URL pública de Mi Pulso.

---

## Notas adicionales

- **Sin CI/CD automático:** no hay GitHub Actions. Cada deploy es manual y
  controlado desde el dashboard de Railway.
- **Sin dominio propio:** las URLs `*.up.railway.app` son de Railway. No usar
  como URLs finales del producto en material de marketing.
- **Bucket S3 no activo:** la foto de comida se guarda como metadata. La imagen
  no persiste en producción. Comunicarlo en la demo si se llega al paso de fotos.
- **Verificación de CORS es manual (solo en navegador):** los smoke tests
  verifican la cadena de datos, no el comportamiento CORS real.
