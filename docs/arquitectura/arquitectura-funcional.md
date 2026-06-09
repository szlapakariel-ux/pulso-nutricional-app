# Arquitectura Funcional — Pulso Nutricional

> Describe **cómo se relacionan funcionalmente** las experiencias, la API y la
> base de datos, y qué ve cada rol. No es un documento de implementación: no
> define frameworks, despliegue ni infraestructura concreta.

---

## 1. Tres experiencias conectadas

El sistema tiene tres experiencias (clientes) que comparten backend:

- **Pulso Nutricional PC** — panel profesional completo (escritorio).
- **Pulso Nutricional Mobile** — panel profesional reducido (celular).
- **Mi Pulso** — PWA mobile-first del paciente.

Las tres consumen la misma API y, por lo tanto, la misma base de datos. No hay
bases de datos separadas por experiencia ni sincronizaciones entre copias.

```
   Profesional (PC)        Profesional (Mobile)        Paciente (Mi Pulso)
          \                       |                          /
           \                      |                         /
            +---------------------+------------------------+
                                  |
                            +-----v------+
                            | API común  |   <- autenticación + permisos por rol
                            +-----+------+
                                  |
                            +-----v------+
                            | Base de    |
                            | datos única|
                            +------------+
```

---

## 2. Una API común

- Punto único de entrada para todas las experiencias.
- Responsable de:
  - **Autenticación** (quién es el usuario).
  - **Autorización por rol** (qué puede ver y hacer).
  - **Lógica de negocio**, incluida la separación revisable/validado.
  - **Acceso a datos** (única capa que habla con la base).
- Garantiza que un cliente no pueda pedir datos que su rol no debería ver.

---

## 3. Una base de datos común

- Una sola base (Postgres) para todo el sistema.
- Guarda datos profesionales y registros de pacientes, diferenciados por:
  - **origen** (paciente vs profesional), y
  - **estado de revisión** (pendiente, revisado, validado...).
- El detalle de entidades está en
  [`modelo-datos-inicial.md`](modelo-datos-inicial.md).

---

## 4. Flujo profesional

La profesional, desde el panel (PC o Mobile):

1. Da de alta o importa pacientes.
2. Abre la ficha de un paciente y registra **consultas** y **mediciones**.
3. Crea **planes alimentarios** (a partir de plantillas o desde cero) y los
   asigna al paciente.
4. Define la **agenda** del paciente (plantillas → agenda diaria).
5. Opcionalmente, prescribe **actividad física**.
6. Revisa la **bandeja de revisión** con lo que cargó el paciente.
7. Genera documentos (**PDF**) cuando lo necesita.

Todo lo que carga o valida la profesional es **dato profesional / validado**.

---

## 5. Flujo paciente

El paciente, desde **Mi Pulso**:

1. Ve su pantalla **Hoy** (plan y agenda del día).
2. Registra **comidas** (meal logs).
3. Registra **peso** (weight logs).
4. Opcionalmente registra **actividad física** (exercise logs).
5. Consulta su plan y su agenda asignados.

Todo lo que carga el paciente entra como **dato revisable**, con estado
**pendiente de revisión**. El paciente no edita datos profesionales.

---

## 6. Flujo de revisión

Es el puente controlado entre ambos mundos:

1. El paciente carga un registro → se crea como **dato revisable** con un
   **estado de revisión = pendiente**.
2. El registro aparece en la **bandeja de revisión** de la profesional.
3. La profesional lo revisa y decide explícitamente (aceptar, comentar,
   marcar revisado, etc.).
4. Solo por esa **acción explícita** un dato puede considerarse validado.
5. **Nunca** hay promoción automática de revisable → validado.

```
Paciente carga dato
        |
        v
[ dato revisable / pendiente ]
        |
        v
Bandeja de revisión (profesional)
        |
   acción explícita
        |
        v
[ revisado / validado ]   <- decisión humana, nunca automática
```

---

## 7. Qué datos ve cada rol

| Dato / entidad                 | Paciente            | Profesional        | Admin |
|--------------------------------|---------------------|--------------------|-------|
| Su propio perfil               | ✅ (lo suyo)         | ✅ (de sus pacientes) | ✅   |
| Sus comidas / peso / ejercicio | ✅ (lo suyo)         | ✅ (de sus pacientes) | ✅   |
| Su plan y agenda asignados     | ✅ (lo suyo)         | ✅                  | ✅    |
| Consultas y mediciones         | ✅ resumen propio    | ✅ completo         | ✅    |
| Notas de la profesional        | ❌                   | ✅                  | ✅    |
| Bandeja de revisión            | ❌                   | ✅                  | ✅    |
| Plantillas de plan / agenda    | ❌                   | ✅                  | ✅    |
| Otros pacientes                | ❌                   | ✅ (los suyos)      | ✅    |
| Logs de auditoría              | ❌                   | parcial / ❌        | ✅    |

> El alcance fino de cada permiso se define en los microciclos de API y panel;
> esta tabla es la guía conceptual.

---

## 8. Qué datos nunca debe ver el paciente

- **Notas profesionales internas** (`professional_notes`): observaciones
  privadas de la profesional sobre el paciente.
- **Bandeja de revisión** y los estados internos de revisión de otros.
- **Plantillas** de planes y agendas (son herramientas internas).
- **Datos de otros pacientes** (cualquier dato que no sea propio).
- **Logs de auditoría** y metadatos internos del sistema.
- Cualquier **dato profesional aún no comunicado** explícitamente al paciente.

La API debe impedir el acceso a estos datos desde la experiencia del paciente,
independientemente de lo que pida el cliente.
