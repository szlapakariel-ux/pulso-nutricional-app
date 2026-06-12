# Cierre — MC-FOTOS-GRACEFUL-1

> Cierre documental del fallback visual seguro para el tab Fotos sin S3.
> Fecha: 2026-06-12.
> Tipo: documental (sin cambios de código, sin acciones de Railway en este cierre).

---

## Resumen del problema

El tab **Fotos** del panel profesional devolvía **HTTP 500 visible** cuando no
hay bucket S3 productivo configurado. El error técnico crudo llegaba a la
pantalla del usuario durante la demo, lo cual no es presentable comercialmente.

MC-FOTOS-GRACEFUL-1 resolvió esto degradando con gracia: el tab ahora muestra un
**fallback amigable** en lugar de un error técnico. **No** se activó S3 real ni
se modificó la infraestructura — es un cambio de manejo de error.

---

## Cambio entregado (PR #40)

| Dato | Valor |
|------|-------|
| PR | #40 |
| Merge SHA | `f84a8709198165caf3d45067e5ced7605c7b651e` (`f84a870`) |
| Estrategia | Squash merge a `main` |
| Auto-deploy Railway | Funcionó (sin redeploy manual) |
| `pulso-nutricional-web` desplegado en | `f84a870` |
| `api` desplegada en | `f84a870` |

**Qué muestra ahora el tab Fotos (fallback seguro):**

- Título: **"Fotos no disponibles en este momento"**
- Descripción: **"No fue posible cargar los registros de fotos en este momento."**
- Pie: **"La visualización de imágenes estará disponible en la versión
  productiva. El resto del panel funciona con normalidad."**

**Qué ya NO aparece:** HTTP 500, stack trace, ni lenguaje técnico crudo en
pantalla.

---

## Resultado del smoke (manual, informado por Ariel)

**PASS.** Verificación online:

| # | Verificación | Resultado |
|---|--------------|-----------|
| 1 | Panel profesional accesible | ✅ OK |
| 2 | Login demo profesional | ✅ OK |
| 3 | Paciente demo seleccionado | ✅ OK |
| 4 | Tab Fotos abre correctamente | ✅ OK |
| 5 | Ya no aparece HTTP 500 ni error técnico crudo | ✅ OK |
| 6 | Aparece el fallback amigable | ✅ OK |

---

## Hallazgo: caché del navegador

El **primer** smoke mostró el mensaje viejo:
*"No se pudieron cargar las fotos: HTTP 500"*.

- **Causa:** caché del navegador. El bundle JavaScript antiguo seguía cacheado;
  el navegador no había descargado el build nuevo correspondiente a `f84a870`.
- **Resolución:** **hard reload** con **Ctrl+Shift+R**. Tras el hard reload, el
  navegador descargó el bundle nuevo (`f84a870`) y el fallback amigable funcionó
  correctamente.
- **No** fue un problema de despliegue: Railway ya tenía `f84a870`. Fue
  exclusivamente caché del cliente.

> **Nota operativa para futuras demos:** si tras un deploy aparece una versión
> anterior de la interfaz, hacer **Ctrl+Shift+R** (hard reload) antes de
> presentar.

---

## Garantías (qué NO se tocó)

- **S3 / bucket:** no se activó. Las fotos reales siguen sin persistir imagen.
- **DB / Postgres:** no se ejecutó `db:push` ni migraciones.
- **Variables de entorno:** sin cambios.
- **Railway:** sin acciones manuales (el auto-deploy ya configurado disparó solo).
- **Dominio / Play Store / cobros:** sin cambios.

---

## Pendientes

| Pendiente | Estado | Microciclo sugerido |
|-----------|--------|---------------------|
| Upload real de fotos al bucket S3 | Fuera de alcance | MC-FOTOS-PROD-1 |
| Decisión sobre auto-deploy front-end | Pendiente de decisión | (a definir) |
| Dominio propio | No conectado | (a definir) |

> **Aclaración importante:** lo que está validado es el **fallback seguro**, no
> el almacenamiento de fotos reales. Las fotos reales siguen pendientes de
> MC-FOTOS-PROD-1 (requiere bucket S3 productivo, fuera de alcance).

---

## Estado final

**Tab Fotos validado con fallback seguro.** Ya no expone errores técnicos
visibles en la demo. El detalle operativo vive en
`docs/demo/estado-demo-comercial.md` y el guion de presentación en
`docs/demo/guia-demo.md`.

> **Freno aquí.** No se ejecutan más acciones de producción sin autorización
> explícita.
