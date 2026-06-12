# Guía de Demo — Pulso Nutricional

> Cómo mostrar Pulso Nutricional a una nutricionista o potencial comprador.
> La demo funciona completamente online sin instalación.

---

## Antes de empezar

Tener abiertos en el navegador:

| Ventana | URL |
|---------|-----|
| Panel profesional | `https://pulso-nutricional-web-production.up.railway.app` |
| Mi Pulso (paciente) | `https://mi-pulso-web-production.up.railway.app` |

> ✅ **Ambas apps están online** (deploy MC-MIPULSO-RWY-1). El flujo completo
> paciente → profesional es demostrable end-to-end contra la API en producción.

Opcional: abrir Mi Pulso en el celular (visitar la URL en Chrome/Safari móvil)
para mostrar la experiencia mobile-first real.

> ⚠️ **No abrir el tab Fotos del panel profesional** durante la demo: devuelve
> HTTP 500 por falta de bucket S3 productivo. El resto del flujo funciona. Ver
> `docs/demo/estado-demo-comercial.md`.

**Modo recomendado para la demo:** modo `api` (conectado a Railway con datos
reales demo). Es el modo por defecto en producción.

---

## Credenciales demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Profesional | `profesional-demo@pulsonutricional.demo` | `demo-profesional-2026` |
| Paciente 1 | `paciente-demo-uno@pulsonutricional.demo` | `demo-paciente-2026` |
| Paciente 2 | `paciente-demo-dos@pulsonutricional.demo` | `demo-paciente-2026` |

> Todas las credenciales son ficticias y de dominio demo. No representan
> personas reales.

---

## Flujo de demo sugerido

### Paso 1 — Panel profesional: primera impresión

1. Abrir el panel profesional.
2. Si aparece pantalla de login, ingresar con la cuenta del profesional.
3. Mostrar la **lista de pacientes** con búsqueda.
4. **Mensaje clave:** "Desde acá la nutricionista ve todos sus pacientes de
   un vistazo, puede buscar por nombre y acceder a la ficha de cada uno."

### Paso 2 — Ficha del paciente

1. Hacer clic en el primer paciente de la lista.
2. Mostrar los tabs: Ficha, Consultas, Plan y agenda, Revisión, Actividad.
3. En la **Ficha**, señalar el bloque "Datos profesionales" (notas internas
   que el paciente nunca ve).
4. **Mensaje clave:** "Hay una separación clara entre lo que ve la profesional
   internamente y lo que accede el paciente."

### Paso 3 — Plan y agenda

1. Ir al tab **Plan y agenda**.
2. Mostrar el plan alimentario del día y la agenda con horarios.
3. Mostrar el botón de descarga de PDF.
4. **Mensaje clave:** "El plan que la nutricionista arma acá es exactamente
   lo que el paciente ve en su app."

### Paso 4 — Bandeja de revisión

1. Ir al tab **Revisión**.
2. Mostrar registros pendientes (comidas, peso, notas cargadas por el paciente).
3. **Mensaje clave:** "Todo lo que el paciente registra aparece acá para que
   la nutricionista lo revise antes de la consulta. Nada se valida
   automáticamente."

### Paso 5 — La app del paciente (Mi Pulso)

1. Cambiar al navegador/celular con Mi Pulso abierto.
2. Iniciar sesión con la cuenta del paciente.
3. Mostrar la **Vista Hoy**: plan y agenda del día (los mismos datos que
   configuró la profesional).
4. Ir al tab **Registrar**.
5. Mostrar el formulario de comidas y el botón de foto de comida.
6. **Mensaje clave:** "El paciente ve exactamente el plan que le asignó su
   nutricionista y puede registrar su día desde el celular."

### Paso 6 — Registro de foto de comida (si el feature está activo)

> Este paso funciona completamente en la UI. El upload real al bucket requiere
> activación (PROD-1). En el estado actual, el registro se guarda como metadata
> sin imagen persistida.

1. En Mi Pulso, tocar "Registrar foto de comida".
2. Seleccionar una foto de prueba (no sensible).
3. Mostrar el preview antes de enviar.
4. Elegir el tipo de comida (desayuno, almuerzo, etc.) y agregar comentario.
5. Enviar y mostrar el mensaje "Comida registrada. Pendiente de revisión."
6. **Mensaje clave:** "El paciente sube una foto de lo que comió. La
   nutricionista puede verla y comentarla antes de la consulta."

---

## Qué está activado en la demo

| Feature | Estado |
|---------|--------|
| Login demo (profesional y paciente) | ✅ Activo |
| Panel profesional completo | ✅ Online |
| Identidad visual (colores, tipografía) | ✅ Online (MC-DESIGN-1) |
| Mi Pulso (Vista Hoy + Registrar) | ✅ Online (MC-MIPULSO-RWY-1) |
| Registro de comida Mi Pulso → bandeja del panel | ✅ Operativo end-to-end |
| Upload fotos de comidas (UI + metadata) | ✅ UI activa, imagen sin persistir |
| PDF del plan | ✅ Activo |
| Datos persistidos en Postgres | ✅ Activo (usuarios, planes, agenda, consultas) |
| Tab Fotos del panel profesional | ❌ HTTP 500 sin S3 (requiere MC-FOTOS-GRACEFUL-1) |
| Upload real de fotos al bucket | ⏳ Pendiente (MC-FOTOS-PROD-1) |

---

## Preguntas frecuentes en una demo

**¿Los datos son reales?**
No. Todos los datos de la demo son ficticios y no representan personas reales.
El sistema está diseñado para manejar datos reales de manera segura cuando se
configure para un cliente.

**¿El paciente tiene que descargarse una app?**
No. Mi Pulso es una PWA: funciona desde el navegador del celular sin instalación.
Opcionalmente se puede agregar al inicio del teléfono como cualquier app.

**¿La nutricionista controla qué ve el paciente?**
Sí. El paciente solo ve su propio plan, agenda y sus propios registros. Las notas
profesionales internas nunca son accesibles para el paciente.

**¿Funciona en Argentina?**
Sí. El sistema está en español, funciona en cualquier dispositivo con navegador
moderno, y los datos se almacenan en servidores cloud seguros.

---

## Limitaciones conocidas de la demo actual

- **Tab Fotos del panel devuelve HTTP 500.** Sin bucket S3 productivo, el tab
  Fotos del panel profesional falla. No abrirlo durante la demo. Resolución
  recomendada: MC-FOTOS-GRACEFUL-1 (fallback visual seguro, sin activar S3).
- El bucket de imágenes no está activo en producción (las fotos se guardan como
  metadata, pendiente MC-FOTOS-PROD-1). La UI de upload funciona pero la imagen
  no persiste.
- Sin dominio personalizado (pendiente de activación futura).
- **Auto-deploy habilitado en las apps front-end:** tras MC-MIPULSO-RWY-1, los
  servicios web tienen auto-deploy activo (antes era manual controlado). Cada
  push a `main` puede actualizar la demo sin verificación previa. Estado a
  decidir en un microciclo posterior.

---

## Notas para el presentador

- Si la demo es presencial, abrir el panel en la pantalla grande y Mi Pulso en
  el celular para contrastar ambas experiencias simultáneamente.
- El modo `api` (con Railway) requiere login. Si la sesión expira, simplemente
  volver a hacer login con las credenciales de la tabla.
- No compartir las URLs de Railway como URLs públicas permanentes: son URLs de
  demo de desarrollo, no la URL final del producto.
