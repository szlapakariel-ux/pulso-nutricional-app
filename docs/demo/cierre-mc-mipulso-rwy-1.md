# Cierre — MC-MIPULSO-RWY-1

> Cierre documental del despliegue de la demo online completa.
> Fecha: 2026-06-12.
> Tipo: documental (sin cambios de código, sin acciones de Railway en este cierre).

---

## Qué se ejecutó (reportado)

MC-MIPULSO-RWY-1 fue ejecutado en Railway con resultado exitoso. Acciones
reportadas:

1. **CORS de la API** configurado para admitir el origen de Mi Pulso (además
   del panel profesional).
2. **`mi-pulso-web` desplegado** en Railway en modo `api`.
3. **Redeploy** de API y panel profesional (para reflejar la identidad visual
   nueva de main).
4. **Smoke test** de la demo online.

> Este documento **no ejecuta** nada en Railway. Solo registra el resultado
> reportado y deja trazable el estado real.

---

## Resultado

| Verificación | Resultado |
|--------------|-----------|
| API `/health` | ✅ OK |
| Panel profesional online + identidad visual nueva | ✅ OK |
| Mi Pulso online + identidad visual nueva | ✅ OK |
| CORS panel profesional | ✅ OK |
| CORS Mi Pulso | ✅ OK |
| Login demo profesional | ✅ OK |
| Login demo paciente | ✅ OK |
| Registro de comida desde Mi Pulso | ✅ OK |
| Flujo paciente → API → panel profesional | ✅ Operativo |
| Tab Fotos del panel profesional | ❌ HTTP 500 (sin S3 real) |
| `db:push` | ⛔ No ejecutado |
| Datos reales | ⛔ No tocados |

---

## URLs finales

| Servicio | URL |
|----------|-----|
| API | `https://api-production-42e99.up.railway.app` |
| Panel profesional | `https://pulso-nutricional-web-production.up.railway.app` |
| Mi Pulso | `https://mi-pulso-web-production.up.railway.app` |

---

## Observaciones que requieren decisión posterior

### 1. Auto-deploy quedó habilitado en los front-end

Antes (MC-RWY-1) el deploy era **manual y controlado**. Tras MC-MIPULSO-RWY-1,
los servicios `pulso-nutricional-web` y `mi-pulso-web` quedaron con
**auto-deploy habilitado**.

- **No se modifica en este ciclo** (alcance documental).
- **Riesgo:** un push a `main` puede llegar a la demo sin verificación previa.
- **Pendiente:** decidir si se mantiene auto-deploy o se vuelve a manual.
  Tocar esa configuración requiere un microciclo con autorización de Railway.

### 2. Tab Fotos del panel devuelve HTTP 500

Sin bucket S3 productivo, el tab Fotos del panel falla con HTTP 500.

- **No se activa S3** (fuera de alcance).
- **Mitigación de demo:** no abrir el tab Fotos.
- **Resolución recomendada:** **MC-FOTOS-GRACEFUL-1** — fallback visual seguro
  (placeholder/empty state) cuando no hay S3, en lugar de 500. No implica
  activar S3 real.

---

## Fuera de alcance (sin cambios)

- S3 / bucket de fotos reales.
- Dominio propio.
- Play Store / empaquetado.
- Cobros.
- `db:push` / migraciones.
- Auth real (passwordHash).

---

## Estado final

**Demo online disponible y apta para mostrar comercialmente**, con la salvedad
del tab Fotos (no abrir). El detalle operativo vive en
`docs/demo/estado-demo-comercial.md` y el guion de presentación en
`docs/demo/guia-demo.md`.

> **Freno aquí.** No se ejecutan más acciones de producción sin autorización
> explícita.
