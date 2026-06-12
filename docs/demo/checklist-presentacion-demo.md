# Checklist de Presentación — Demo Pulso Nutricional

> Completar este checklist **antes** de cualquier presentación.
> Tiempo estimado: 5 minutos.
> Última actualización: 2026-06-12 (MC-DEMO-COMERCIAL-1).

---

## Credenciales (tener a mano)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Profesional | `profesional-demo@pulsonutricional.demo` | `demo-profesional-2026` |
| Paciente 1 | `paciente-demo-uno@pulsonutricional.demo` | `demo-paciente-2026` |
| Paciente 2 | `paciente-demo-dos@pulsonutricional.demo` | `demo-paciente-2026` |

> Todos los datos son ficticios. Ninguna credencial corresponde a una persona real.

---

## Checklist previo a la demo

### 1. Preparación del dispositivo

- [ ] Cerrar pestañas innecesarias (menos distracciones, mejor rendimiento).
- [ ] Silenciar notificaciones del sistema.
- [ ] Si es presencial: pantalla/proyector conectado y funcionando.
- [ ] Brillo de pantalla adecuado para el entorno.

---

### 2. Abrir las URLs

- [ ] Abrir **panel profesional** en una ventana/pestaña:
  `https://pulso-nutricional-web-production.up.railway.app`
- [ ] Abrir **Mi Pulso (paciente)** en otra ventana o dispositivo:
  `https://mi-pulso-web-production.up.railway.app`
- [ ] (Opcional) Abrir Mi Pulso en el celular para mostrar experiencia mobile real.

---

### 3. Hard reload en ambas ventanas

- [ ] En el panel profesional: presionar **Ctrl+Shift+R** (Windows/Linux) o
  **Cmd+Shift+R** (Mac).
- [ ] En Mi Pulso: presionar **Ctrl+Shift+R** / **Cmd+Shift+R**.

> Esto garantiza que el navegador usa el bundle más reciente. Si se omite
> este paso, puede aparecer una versión anterior en caché.

---

### 4. Verificar que el sistema responde

- [ ] El panel profesional carga la pantalla de login (o ya está logueado).
- [ ] Mi Pulso carga la pantalla de login.
- [ ] No hay errores de red visibles (no hay mensajes de "sin conexión" ni
  pantallas en blanco).

---

### 5. Login previo (recomendado)

- [ ] Ingresar al **panel profesional** con la cuenta del profesional.
- [ ] Verificar que aparece la lista de pacientes.
- [ ] Abrir el primer paciente y navegar por los tabs para confirmar que cargan.
- [ ] Ingresar a **Mi Pulso** con la cuenta del paciente.
- [ ] Verificar que aparece la Vista Hoy con el plan del día.

---

### 6. Verificar tab Fotos

- [ ] En el panel profesional, abrir el tab **Fotos** del primer paciente.
- [ ] Confirmar que aparece el mensaje amigable:
  *"Fotos no disponibles en este momento"* (o similar).
- [ ] Confirmar que **NO** aparece ningún error técnico visible.

> El tab Fotos muestra un fallback amigable porque el almacenamiento de
> imágenes todavía no está activado. Eso es el comportamiento esperado y
> correcto — se puede mostrar durante la demo sin problema.

---

### 7. Probar registro desde Mi Pulso

- [ ] En Mi Pulso, ir al tab **Registrar**.
- [ ] Cargar una comida de prueba (tipo + comentario corto).
- [ ] Confirmar que aparece el mensaje de confirmación.
- [ ] Volver al panel profesional → tab **Revisión** del mismo paciente.
- [ ] Confirmar que el registro aparece en la bandeja.

---

### 8. Tener a mano

- [ ] Credenciales de la tabla de arriba (abiertas o anotadas).
- [ ] Este documento o el [guion comercial](guion-demo-comercial.md) abierto
  en una pestaña separada como referencia.
- [ ] Frase preparada para explicar que los datos son ficticios:

  > *"Los datos que ves son de prueba — nombres y valores inventados. El
  > sistema está diseñado para manejar datos reales de manera segura cuando
  > esté configurado para producción."*

---

## Durante la demo — recordatorios rápidos

| Situación | Acción |
|-----------|--------|
| La pantalla muestra algo inesperado | Ctrl+Shift+R, esperar 3 segundos |
| El login falla | Verificar credenciales de la tabla de arriba |
| El tab Revisión no muestra el registro nuevo | Recargar la página (F5) |
| Preguntan por una función que no existe | Anotar, responder "lo estamos evaluando para una próxima versión" |
| Preguntan si ya funciona con pacientes reales | Ver sección "¿Esto ya se puede usar con pacientes reales?" en el guion |
| Preguntan por el precio | "Estamos en fase de validación, los precios se definen con el piloto" |

---

## Después de la demo

- [ ] Tomar nota de las preguntas y objeciones que surgieron.
- [ ] Tomar nota de qué parte generó más interés.
- [ ] Si el interlocutor quiere seguir: proponer un piloto controlado (ver
  sección "Cierre comercial" en el guion).
- [ ] No enviar URLs de Railway como "la URL oficial del producto" — son URLs
  de demo de desarrollo.
