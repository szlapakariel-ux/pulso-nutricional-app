# Guion Comercial — Pulso Nutricional

> Guion para presentar la demo a una nutricionista, potencial socio o inversor.
> Preparado para quien no es técnico. Adaptable a 7 o 15 minutos.
> Última actualización: 2026-06-12 (MC-DEMO-COMERCIAL-1).

---

## Antes de empezar — leer siempre

- Este es un **producto en desarrollo activo**. Lo que se muestra es una demo
  funcional real, no un mock ni una presentación estática.
- Los datos son **ficticios**. No hay pacientes reales, no hay datos personales.
- **No prometer** nada que no esté en la sección
  ["Qué NO prometer"](#qué-no-prometer) de este documento.
- Si el navegador muestra algo raro, hacer **Ctrl+Shift+R** (hard reload).

---

## Guion de apertura (para ambas versiones)

> Decir esto antes de tocar la pantalla. Duración: 1 minuto.

**Guion sugerido:**

> "Te voy a mostrar Pulso Nutricional: una plataforma que le da a la
> nutricionista y al paciente una herramienta compartida para el trabajo entre
> consultas.
>
> El problema que resuelve es simple: entre consulta y consulta, el paciente
> queda solo con un plan en papel, y la nutricionista no sabe qué está pasando
> realmente hasta que el paciente vuelve. Pulso conecta a los dos: el paciente
> registra su día desde el celular, y la nutricionista lo ve antes de la
> próxima consulta.
>
> Lo que voy a mostrar funciona en tiempo real, contra una base de datos real.
> Los datos son de prueba, pero el sistema es el mismo que usaría en producción.
> Tarda unos [7 / 15] minutos."

---

## Recorrido de 7 minutos

> Para presentaciones rápidas o cuando el interlocutor ya entiende el contexto.
> Ritmo: una acción por pantalla, sin pausas largas.

### Minuto 1 — Login y lista de pacientes

1. Abrir el panel profesional en el navegador.
2. Ingresar con la cuenta del profesional (credenciales en el
   [checklist de presentación](checklist-presentacion-demo.md)).
3. Mostrar la **lista de pacientes** con la barra de búsqueda.

**Qué decir:**
> "Acá está el panel de la nutricionista. Todos sus pacientes de un vistazo,
> con búsqueda. Si tiene 50 pacientes, llega a cualquiera en dos segundos."

---

### Minuto 2 — Ficha del paciente

1. Hacer clic en el primer paciente.
2. Mostrar el tab **Ficha**.
3. Señalar el bloque "Datos profesionales" (notas internas).

**Qué decir:**
> "Esta es la ficha clínica. Lo que la nutricionista escribe acá nunca lo ve
> el paciente. Es su espacio de trabajo interno."

---

### Minuto 3 — Plan y descarga de PDF

1. Ir al tab **Plan y agenda**.
2. Mostrar el plan del día con las comidas y los horarios.
3. Mostrar el botón de descarga de PDF.

**Qué decir:**
> "El plan que la nutricionista arma acá es exactamente lo que el paciente ve
> en su app. Y si quiere dárselo en papel también, un clic y tiene el PDF."

---

### Minuto 4 — La app del paciente (Mi Pulso)

1. Cambiar al segundo navegador o celular con Mi Pulso.
2. Ingresar con la cuenta del paciente.
3. Mostrar la **Vista Hoy**: el mismo plan que configuró la profesional.

**Qué decir:**
> "Esto es lo que ve el paciente desde su celular. Sin instalar nada: entra
> desde el navegador. Ve exactamente el plan que le armó su nutricionista."

---

### Minuto 5 — Registro de comida

1. Ir al tab **Registrar** en Mi Pulso.
2. Completar una comida con tipo (desayuno, almuerzo, etc.) y un comentario
   corto.
3. Enviar y mostrar el mensaje de confirmación.

**Qué decir:**
> "El paciente registra lo que comió. La nutricionista lo ve antes de la
> consulta. Sin WhatsApp, sin fotos sueltas, todo organizado por fecha y tipo
> de comida."

---

### Minuto 6 — Revisión en el panel

1. Volver al panel profesional.
2. Ir al tab **Revisión**.
3. Mostrar el registro que acaba de cargar el paciente.

**Qué decir:**
> "El registro apareció acá de inmediato. La nutricionista puede revisarlo,
> aceptarlo o marcarlo para comentar. Nada se valida automáticamente: el
> criterio clínico siempre es de ella."

---

### Minuto 7 — Tab Fotos y cierre

1. Ir al tab **Fotos** del paciente en el panel.
2. Mostrar el mensaje de fallback amigable.

**Qué decir:**
> "El módulo de fotos ya está integrado en la app del paciente: puede sacar
> una foto de lo que comió y enviarla. Acá en el panel, la visualización de
> imágenes se activa en la versión productiva — todavía no está conectada
> porque requiere configurar el almacenamiento seguro de archivos. Lo que ves
> es el mensaje que va a ver la nutricionista en la demo: claro, sin errores
> técnicos."

**Cierre:**
> "Eso es Pulso Nutricional. Panel para la nutricionista, app para el paciente,
> todo conectado. ¿Qué parte te pareció más relevante para tu forma de
> trabajar?"

---

## Recorrido de 15 minutos

> Para reuniones donde hay tiempo para profundizar y explorar preguntas.
> Misma estructura que los 7 minutos, pero con pausas para el interlocutor
> y énfasis en el valor para cada rol.

### Apertura ampliada (2 minutos)

Usar el guion de apertura de arriba. Agregar:

> "La idea es que la relación nutricionista-paciente no termina en el
> consultorio. El paciente pasa 6 días y 23 horas lejos de la consulta.
> Pulso existe para ese espacio."

---

### Login y lista de pacientes (2 minutos)

Mismo que en 7 minutos. Agregar:

> "La nutricionista empieza su día acá. Ve quién tiene consulta, quién tiene
> pendientes de revisión. La información llega a ella, no al revés."

Mostrar la barra de búsqueda en uso real.

---

### Ficha del paciente (2 minutos)

Mismo que en 7 minutos. Agregar:

> "Esto reemplaza el cuaderno o la planilla. Todo en el mismo lugar, accesible
> desde cualquier dispositivo. Si la nutricionista atiende desde dos lugares,
> su información viaja con ella."

Señalar los tabs disponibles y mencionar brevemente qué hay en cada uno.

---

### Plan, agenda y PDF (2 minutos)

Mismo que en 7 minutos. Agregar:

> "La agenda tiene los horarios de comida. El paciente sabe a qué hora come,
> no solo qué come. Y el PDF sirve para el paciente que quiere tener algo
> impreso, o para compartirlo con la familia."

Mostrar el PDF generado brevemente.

---

### Mi Pulso: la experiencia del paciente (3 minutos)

Mismo que en 7 minutos. Agregar:

> "El paciente no necesita aprender ninguna app nueva. Es un sitio web que
> funciona como app en el celular. Se puede agregar al inicio como cualquier
> aplicación, pero no requiere Play Store ni App Store."

Mostrar el tab **Registrar** con calma. Mostrar los tipos de comida disponibles.
Si es posible, usar el celular para mostrar la experiencia mobile-first real.

**Valor para el paciente:**
> "El paciente tiene su plan siempre a mano, puede registrar con dos toques,
> y sabe que la nutricionista va a ver lo que registró. Eso cambia el
> comportamiento: no es lo mismo anotar en un papel que en un sistema que la
> profesional revisa."

---

### Revisión en el panel (2 minutos)

Mismo que en 7 minutos. Agregar:

> "La bandeja de revisión es el corazón del seguimiento entre consultas. La
> nutricionista no tiene que preguntar '¿cómo te fue esta semana?': ya sabe.
> Puede preparar la consulta con datos reales, no con lo que el paciente
> recuerda."

Mostrar el flujo de revisar y aprobar un registro.

---

### Tab Fotos y visión futura (1 minuto)

Mismo que en 7 minutos. Agregar, con honestidad:

> "El módulo de fotos está construido y funciona en la app del paciente. La
> parte que falta es el almacenamiento seguro de imágenes en el servidor —
> eso requiere un paso de infraestructura que todavía no está activado. Es
> el próximo paso natural después de validar el flujo base con pacientes
> reales."

**Lo que NO decir:** "Las fotos ya funcionan en producción." No es cierto todavía.

---

### Cierre y próximo paso (1 minuto)

> "Esto es lo que está hoy: un sistema funcional para la nutricionista y el
> paciente, conectados en tiempo real. Hay cosas que siguen en desarrollo —
> el almacenamiento de fotos, el dominio propio, la versión para datos
> reales de pacientes. Pero el flujo central ya existe.
>
> El próximo paso natural sería un piloto controlado: una o dos nutricionistas
> que usen el sistema con pacientes reales, con datos reales, para entender
> qué funciona y qué hay que ajustar antes del lanzamiento formal.
>
> ¿Tiene sentido para vos arrancar con algo así?"

---

## Qué NO prometer

> Esta sección es obligatoria. Leerla antes de cualquier presentación.

| Tema | Qué decir si preguntan |
|------|----------------------|
| Fotos de comida en producción | "El módulo está construido, el almacenamiento de imágenes es el próximo paso de infraestructura." |
| Play Store / App Store | "Funciona desde el navegador sin instalar nada. La versión empaquetada para tiendas es futura." |
| Cobros / precios finales | "Estamos en fase de validación. Los precios se definen antes del lanzamiento." |
| Auth productiva completa | "El login actual es demo. La autenticación con contraseñas seguras está en la hoja de ruta." |
| Dominio propio | "Las URLs actuales son de desarrollo. El dominio propio se configura antes del lanzamiento." |
| Datos reales de pacientes ya | "El sistema no está listo para datos reales todavía. Requiere completar la infraestructura de producción antes." |
| Integración con otros sistemas | "No hay integración con software de nutrición de terceros en esta versión." |

---

## Manejo de objeciones frecuentes

### "¿Esto ya se puede usar con pacientes reales?"

> "Todavía no. El sistema funciona, pero hay pasos de infraestructura que
> hay que completar antes de manejar datos reales de pacientes de manera
> responsable: el almacenamiento seguro de imágenes, la autenticación
> robusta, el dominio propio. La demo existe para validar el flujo y el
> valor con personas reales antes de dar ese paso."

---

### "¿Dónde se guardan las fotos?"

> "Las fotos que el paciente saca desde Mi Pulso se registran en el sistema.
> La visualización en el panel del profesional se activa cuando está
> configurado el almacenamiento seguro de archivos — eso es el próximo paso
> de infraestructura. Por ahora el flujo base funciona sin imágenes."

No mencionar S3, bucket, ni nombres de servicios técnicos.

---

### "¿Esto reemplaza mi consulta?"

> "No, para nada. Pulso es una herramienta de seguimiento entre consultas,
> no un reemplazo. La consulta sigue siendo el centro. Pulso hace que esa
> consulta sea más valiosa porque la nutricionista llega con información
> real de lo que pasó durante la semana."

---

### "¿El paciente tiene que instalar una app?"

> "No. Entra desde el navegador del celular, igual que cualquier sitio web.
> Puede agregarlo al inicio como si fuera una app, pero no requiere Play
> Store ni App Store. Funciona en iPhone y Android."

---

### "¿Cuánto costaría?"

> "Los precios todavía están en definición. Estamos en fase de validación
> del producto — el objetivo ahora es entender cómo lo usan las
> nutricionistas en la práctica antes de fijar el modelo de negocio.
> ¿Te interesaría ser parte de ese piloto?"

Redirigir siempre hacia el piloto, no hacia un precio.

---

### "¿Se puede adaptar a mi forma de trabajar?"

> "El sistema está diseñado para ser flexible. Los planes, la agenda, las
> categorías de comida son configurables. Si hay algo específico de tu
> flujo de trabajo que no está cubierto, es exactamente el tipo de feedback
> que estamos buscando en el piloto."

---

## Cierre comercial

### Próximo paso recomendado

El próximo paso no es "comprarlo" ni "lanzarlo". Es un **piloto controlado**:

- Una o dos nutricionistas dispuestas a probarlo con pacientes reales.
- Período de prueba: 4 a 8 semanas.
- Objetivo: validar el flujo real, identificar fricciones, priorizar los
  siguientes pasos de desarrollo.
- Lo que necesita el piloto: completar la infraestructura de producción
  (auth robusta, dominio, almacenamiento de imágenes).

### Qué hay que construir antes del piloto real

| Componente | Estado actual | Requerido para piloto |
|------------|---------------|-----------------------|
| Flujo base paciente ↔ profesional | ✅ Funcional | — |
| Tab Fotos (fallback) | ✅ Validado | — |
| Almacenamiento de imágenes | ⏳ Pendiente | Sí |
| Auth robusta (contraseñas reales) | ⏳ Pendiente | Sí |
| Dominio propio | ⏳ Pendiente | Recomendado |
| Términos de uso / privacidad | ⏳ Pendiente | Sí (datos de pacientes) |

### Propuesta de cierre para la reunión

> "Si el flujo que viste tiene sentido para tu trabajo, el próximo paso sería
> definir cómo sería un piloto: qué pacientes, qué período, qué querés
> evaluar. No implica ningún costo ni compromiso ahora — es para entender si
> esto resuelve un problema real en tu práctica antes de seguir construyendo."

---

## Notas para el presentador

- **Si algo no funciona en la demo:** no entrar en pánico. Decir "parece que
  la demo necesita un momento" y hacer Ctrl+Shift+R. Si persiste, describir
  el flujo verbalmente.
- **Si preguntan por una funcionalidad que no existe:** anotar. Es feedback
  valioso. No inventar que ya está.
- **Si el interlocutor quiere probarlo ahora:** dejar que interactúe. Es la
  mejor demo posible.
- **No usar jerga técnica** frente al interlocutor: no decir API, S3, bucket,
  Railway, SHA, deploy, endpoint. Usar "servidor", "sistema", "app", "base
  de datos", "almacenamiento".
