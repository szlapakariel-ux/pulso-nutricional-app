# Preflight Producción — Fotos de comidas (MC-FOTOS-PROD-0)

> **Estado: PREPARACIÓN. NADA EJECUTADO.**
> Este documento es un **runbook**: describe cómo llevar el módulo de fotos de
> comidas a producción (Postgres + bucket + deploy) **de forma controlada en un
> ciclo futuro autorizado**. **Nada de lo aquí descrito se ha ejecutado.** No hay
> `db:push`, no hay bucket configurado, no hay variables cargadas, no hay deploy,
> no hay credenciales reales. Ver la sección **"No ejecutar todavía"**.
>
> Cada paso operativo de este runbook requiere **autorización explícita de Ariel**
> y se ejecuta en **MC-FOTOS-PROD-1 / MC-FOTOS-PROD-2**, no aquí.

---

## 0. Contexto y estado actual

El módulo de fotos de comidas ya está **completo en código y mergeado en `main`**:

| Pieza | Estado | Referencia |
|-------|--------|------------|
| Tipos compartidos (`MealPhotoType`, `MealPhotoLog`, drafts) | ✅ en `main` | MC-FOTOS-MVP-1 (`024e057`) |
| Modelo Prisma `MealPhotoLog` + enum `MealPhotoType` + relación en `Patient` | ✅ en `main` (schema) | MC-FOTOS-MVP-1 |
| Endpoints API (`POST/GET /patients/:id/meal-photos`, detalle, review) | ✅ en `main` | MC-FOTOS-MVP-1/2 |
| Upload multipart real + `S3MealPhotoStorage` + `LocalFallbackStorage` | ✅ en `main` | MC-FOTOS-MVP-2 (`8a424c2`) |
| UI Mi Pulso (`RegisterPhotoForm`, preview, FormData) | ✅ en `main` | MC-FOTOS-MVP-2 |
| Cierre documental MVP-2 | ✅ en `main` | `1df4f82` |

Lo que **falta** para que funcione en producción:

1. La tabla `MealPhotoLog` (y enum `MealPhotoType`) **no existe todavía en el
   Postgres de Railway** — el schema está en el repo, pero el `db:push` que lo
   sincroniza nunca se corrió contra producción.
2. El bucket `orderly-suitcase` **no está configurado** — faltan las 5 variables
   `S3_*` en el servicio `api`. Sin ellas, el API corre en **fallback local**
   (descarta el binario con aviso, guarda metadata igual).
3. El **deploy** del API (y Mi Pulso) con esas variables y el schema actualizado
   no se ha hecho.

> **Importante:** el código es seguro de desplegar incluso sin bucket: en
> ausencia de las `S3_*`, `getMealPhotoStorage()` devuelve `LocalFallbackStorage`
> y el endpoint sigue respondiendo `201` (metadata only). El binario no se
> persiste, pero nada se rompe. Esto permite separar "deploy del código" de
> "activación del bucket" si se quiere bajar el riesgo.

---

## 1. Revisión de scripts y comportamiento actual (verificado contra el repo)

### 1.1 Scripts Prisma (`packages/api/package.json`)

```jsonc
"scripts": {
  "build":       "prisma generate && tsc -p tsconfig.json",
  "start":       "node dist/server.js",
  "db:generate": "prisma generate",   // NO toca la DB; solo genera el cliente
  "db:push":     "prisma db push",    // SÍ toca la DB (sincroniza schema)
  "db:seed":     "tsx prisma/seed.ts",// SÍ toca la DB (inserta demo)
  "db:studio":   "prisma studio"      // SÍ conecta a la DB (inspección)
}
```

Hechos relevantes:

- **No existe** `db:deploy` ni `prisma migrate deploy`. El proyecto usa
  **`prisma db push`** (sincronización de schema sin historial de migraciones),
  no migraciones versionadas. → No hay carpeta `prisma/migrations/`.
- `prisma generate` **no requiere `DATABASE_URL`** (solo lee `schema.prisma`).
- `db:push` / `db:seed` / `db:studio` **sí requieren `DATABASE_URL`**.

### 1.2 ¿Railway ejecuta algo automáticamente al iniciar?

- **Build del API** (recomendado en `railway-preflight.md`):
  `pnpm turbo run build --filter=@pulso/api`. El `build` del API corre
  `prisma generate` (genera el cliente), **no** `db push`.
- **Start del API**: `pnpm --filter @pulso/api start` →
  `node dist/server.js`. **No** corre migraciones ni `db push` al arrancar.

→ **El deploy del API NO modifica la DB por sí mismo.** El schema solo cambia si
**alguien corre `db:push` manualmente**. Este es el comportamiento deseado: el
deploy es seguro respecto al schema; el cambio de DB es un acto explícito y
separado.

### 1.3 Riesgo de que el deploy modifique la DB sin querer

**Bajo, pero hay que mantenerlo así:**

- No agregar `db:push` ni `prisma migrate deploy` al `start` ni al `build`.
- No configurar un "release command" / "deploy hook" en Railway que corra
  `db:push` automáticamente.
- `db:push` siempre se corre **a mano**, una vez, con `DATABASE_URL` verificada
  (ver §2).

### 1.4 Selector de fuente de datos (`config/data-source.ts`)

- `PULSO_DATA_SOURCE=mock` (default) → la API **no toca Postgres**; las fotos van
  al mock store en memoria.
- `PULSO_DATA_SOURCE=prisma` → la API lee/escribe `MealPhotoLog` en Postgres vía
  el repositorio. **Requiere** `DATABASE_URL` y que la tabla exista (de ahí el
  `db:push`).
- **Sin fallback silencioso:** en modo `prisma`, si la DB no está disponible o la
  tabla no existe, el error se propaga (no vuelve a mock).

### 1.5 Storage (`config/storage.ts`, `storage/meal-photo-storage.ts`)

- `getStorageConfig()` lee 5 variables: `S3_ENDPOINT`, `S3_REGION`,
  `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`. Si **falta una**,
  devuelve `null` → `LocalFallbackStorage`.
- `S3MealPhotoStorage` usa `forcePathStyle: true` (compatible con buckets
  S3-compatibles como los de Railway/MinIO).
- **El API guarda solo `storageKey`** (`patients/{patientId}/meal-photos/{year}/{month}/{uuid}.{ext}`),
  **nunca** una URL pública ni el binario en Postgres.
- **No existe `S3_PUBLIC_BASE_URL`** en el código (verificado): no hay forma de
  que el API arme URLs públicas. La entrega de imágenes (URL firmada / endpoint
  controlado) queda para **MC-FOTOS-MVP-3**.

---

## 2. Preflight DB / Prisma — runbook (NO ejecutar aquí)

Objetivo: que el Postgres de Railway tenga la tabla `MealPhotoLog` y el enum
`MealPhotoType` que el schema ya define, **sin pisar datos existentes** y sin
tocar la DB equivocada.

### 2.1 Comando

```bash
pnpm --filter @pulso/api db:push
# = prisma db push  (sincroniza schema.prisma con la DB de DATABASE_URL)
```

### 2.2 Desde dónde y contra qué entorno

- **Desde dónde:** preferible **localmente** (o desde un shell controlado),
  exportando **temporalmente** la `DATABASE_URL` **pública** del Postgres de
  Railway en la sesión — **nunca** commiteada, nunca en `.env` versionado.
- **Contra qué entorno:** el Postgres del proyecto Railway `pulso-nutricional`.
- **Variable usada:** `DATABASE_URL` → la cadena del Postgres de Railway. En el
  servicio `api`, en runtime, se referencia como `${{Postgres.DATABASE_URL}}`;
  para correr `db:push` desde afuera se usa la **connection string pública** del
  Postgres (la privada `.railway.internal` solo resuelve dentro de Railway).

### 2.3 Cómo evitar tocar la DB equivocada (crítico)

1. **Imprimir el destino antes de ejecutar** (sin exponer la password):
   ```bash
   node -e "const u=new URL(process.env.DATABASE_URL); console.log(u.hostname, u.port, u.pathname)"
   ```
   Confirmar que el host/puerto/base corresponden al Postgres de Railway esperado
   y **no** a localhost ni a otra base.
2. **Dry-run / inspección previa:** `prisma db push` no tiene `--dry-run`
   estándar útil aquí, pero sí se puede inspeccionar el estado antes con
   `pnpm --filter @pulso/api db:studio` o un `SELECT` de las tablas (§2.4).
3. **Una sola variable activa:** asegurarse de que no haya un `.env` local con
   otra `DATABASE_URL` que tenga prioridad. Exportar la variable en la misma
   línea del comando reduce el riesgo:
   ```bash
   DATABASE_URL="postgresql://...railway..." pnpm --filter @pulso/api db:push
   ```

### 2.4 Cómo verificar ANTES

Listar tablas/enums actuales (vía `db:studio` o psql) y confirmar el estado de
partida. Tablas que **ya deberían existir** (MC-10.5A en adelante, si la DB ya
fue inicializada): `User`, `Patient`, `Consultation`, `MealPlan`,
`PatientAgendaItem`, `MealLog`, `WeightLog`, `PatientNote`, etc.

> Si la DB **nunca** tuvo `db:push` (está vacía), el primer `db:push` creará
> **todo** el schema, no solo `MealPhotoLog`. Verificar este caso: un `db:push`
> sobre DB vacía es seguro (crea); un `db:push` sobre DB con datos demo es
> aditivo para tablas nuevas, pero **revisar el diff de schema** que Prisma
> reporta antes de confirmar.

### 2.5 Qué tablas/enums deberían aparecer DESPUÉS

- **Enum nuevo:** `MealPhotoType` (`breakfast`, `lunch`, `snack`, `dinner`,
  `collation`, `other`).
- **Tabla nueva:** `MealPhotoLog` con columnas: `id`, `patientId`, `storageKey`,
  `mealType`, `patientComment`, `professionalComment`, `origin`
  (default `patient_reported`), `reviewStatus` (default `pending`), `reviewedAt`,
  `reviewedBy`, `isDemoData`, `createdAt`, `updatedAt`.
- **FK:** `MealPhotoLog.patientId → Patient.id`.

### 2.6 Cómo validar que la demo NO se rompió

Después del `db:push`, con el API en `PULSO_DATA_SOURCE=prisma`:

1. `GET /health` → `200`.
2. Login demo paciente → `200`.
3. `GET /patients/demo-1/today` → `200` con plan/agenda (datos demo previos
   intactos).
4. `GET /patients/demo-1/meal-photos` → `200` (lista vacía o con seed demo, sin
   error de "tabla no existe").

> **Importante:** NO ejecutar `db:push` en este ciclo. Solo dejar el runbook.

---

## 3. Preflight bucket `orderly-suitcase` — runbook

### 3.1 Variables requeridas (servicio `api`)

| Variable | Descripción | Dónde |
|----------|-------------|-------|
| `S3_ENDPOINT` | Endpoint del bucket S3-compatible (Railway). | Servicio `api` |
| `S3_REGION` | Región (p. ej. `auto` o la que exponga el proveedor). | Servicio `api` |
| `S3_ACCESS_KEY_ID` | Access key (secreto). | Servicio `api` |
| `S3_SECRET_ACCESS_KEY` | Secret key (secreto). | Servicio `api` |
| `S3_BUCKET` | `orderly-suitcase`. | Servicio `api` |

### 3.2 En qué servicio van — y por qué NO en el frontend

- **Van en el servicio `api`**, no en `mi-pulso-web` ni en
  `pulso-nutricional-web`.
- **Por qué no en el frontend:** las variables `NEXT_PUBLIC_*` de Next.js se
  **embeben en el bundle del navegador** → cualquier credencial ahí queda
  **expuesta públicamente**. El upload lo hace el **API** (servidor), que recibe
  el `multipart/form-data` del navegador y sube al bucket con sus credenciales.
  El navegador **nunca** ve las claves S3.

### 3.3 Cómo evitar URLs públicas

- El API **solo guarda `storageKey`** y **solo devuelve metadata** (verificado en
  `controllers/meal-photos.controller.ts`: la respuesta es `{ data: photo }`,
  donde `photo.storageKey` es la key, no una URL).
- **Confirmado que NO se usa `S3_PUBLIC_BASE_URL`** ni ninguna construcción de
  URL pública en el código.
- **Política de bucket recomendada:** **privado** (sin acceso público de lectura,
  sin "public read", sin website hosting). La entrega de imágenes al panel
  profesional será por **URL firmada de corta duración** o **endpoint controlado
  con guard** — eso es **MC-FOTOS-MVP-3**, no este ciclo.

### 3.4 Política de permisos mínima esperada

- Credenciales con permiso **solo** sobre el bucket `orderly-suitcase`
  (no wildcard de cuenta).
- Acciones mínimas para MVP-2: `s3:PutObject` (subir). Para MVP-3 se sumará
  `s3:GetObject` (para firmar URLs de lectura).
- **Sin** `s3:DeleteObject` ni permisos de administración salvo necesidad
  justificada.
- Sin acceso público anónimo.

### 3.5 Cómo probar sin subir datos reales

- Usar una **imagen ficticia** pequeña (p. ej. un PNG/JPG de prueba generado, sin
  contenido sensible) — **nunca** una foto real de un paciente.
- Verificar que el objeto aparece en el bucket bajo
  `patients/{patientId}/meal-photos/{año}/{mes}/{uuid}.{ext}`.
- Verificar que **no** es accesible por URL pública (un `GET` anónimo al objeto
  debe fallar / 403).
- En entornos sin bucket, el `LocalFallbackStorage` permite probar la cadena
  (metadata + UI) **sin** subir nada: el log muestra
  `[storage] S3 no configurado — binario descartado (fallback local)`.

---

## 4. Orden recomendado de ejecución futura (cuando se autorice)

> Un paso a la vez, verificando antes de avanzar. **Nada de esto se ejecuta en
> MC-FOTOS-PROD-0.**

### A. Verificar estado actual (read-only)

- `GET /health` del API → `200`.
- Mi Pulso online (`GET /` → `200`, badge "Conectado a API").
- Login paciente demo → `200`; `GET /auth/me` → `patientId: "demo-1"`.
- Vista Hoy carga (`GET /patients/demo-1/today` → `200`).
- Postgres online en Railway.

### B. Configurar variables S3 en el servicio `api`

- Cargar las 5 `S3_*` (§3.1) en el servicio `api` de Railway.
- Si Railway permite setear variables sin redeploy inmediato, hacerlo así para
  controlar el momento del deploy. (Setear variables suele disparar redeploy;
  asumirlo y planificar el smoke justo después.)

### C. Ejecutar `db:push` (solo con autorización explícita)

- Seguir §2. Verificar destino (§2.3), correr `db:push`, validar tablas (§2.5) y
  que la demo no se rompió (§2.6).

### D. Redeploy del API

- Con `PULSO_DATA_SOURCE=prisma`, `DATABASE_URL` referenciada, y `S3_*` cargadas.
- Confirmar arranque limpio en logs: `API escuchando en http://0.0.0.0:<PORT>`.

### E. Smoke API

1. `GET /health` → `200`.
2. Login paciente demo → `200` (token).
3. `GET /auth/me` → `patientId: "demo-1"`.
4. `GET /patients/demo-1/today` → `200`.
5. **Crear meal-photo demo** con archivo ficticio (multipart):
   `POST /patients/demo-1/meal-photos` con `file` (PNG/JPG de prueba) + `mealType`
   → `201`.
6. Validar en la respuesta: `origin: "patient_reported"`, `reviewStatus:
   "pending"`.
7. Validar que la respuesta **no** contiene URL pública (solo `storageKey` +
   metadata).
8. Si el bucket está configurado: confirmar que el objeto existe en el bucket y
   **no** es accesible públicamente.

### F. Redeploy de Mi Pulso

- Con `NEXT_PUBLIC_PULSO_DATA_MODE=api` y `NEXT_PUBLIC_PULSO_API_BASE_URL`
  apuntando al API.

### G. Smoke Mi Pulso (navegador)

1. Login paciente demo.
2. Vista Hoy carga (sin loop de `/today`).
3. Abrir "Registrar foto de comida".
4. Seleccionar una imagen de prueba ficticia.
5. Preview funciona.
6. Enviar.
7. Mensaje "Comida registrada. Pendiente de revisión por tu profesional."
8. Sin loop de requests, sin errores CORS en consola.

---

## 5. Riesgos

| Riesgo | Severidad | Mitigación |
|--------|-----------|------------|
| `db:push` contra la DB equivocada o destructivo. | Alta | Verificar host/base antes (§2.3). Inspeccionar diff de schema. Correr una sola vez, con autorización. |
| Bucket mal configurado (público por error). | Alta | Bucket **privado**; verificar `GET` anónimo → 403 (§3.3). Sin website hosting. |
| Credenciales S3 expuestas (en frontend, repo o logs). | Alta | `S3_*` solo en el servicio `api` (§3.2). Nunca `NEXT_PUBLIC_*`. Nunca commitear. Nunca loguear las claves. |
| API deployado en modo `prisma` antes del `db:push`. | Media | El endpoint de fotos fallaría (tabla inexistente). Hacer `db:push` (paso C) **antes** del redeploy en modo prisma, o mantener `mock` hasta tener la tabla. |
| Frontend disponible pero API sin tabla → errores 500 al subir. | Media | Validar §2.6 antes de exponer la UI; orden C→D→F. |
| Fotos accesibles por URL pública. | Alta | El código no arma URLs públicas (sin `S3_PUBLIC_BASE_URL`). Bucket privado. Entrega controlada en MVP-3. |
| Tamaño excesivo de imágenes. | Baja | Límite 5 MB ya impuesto en `@fastify/multipart` (server) y validación cliente. |
| Paciente subiendo datos sensibles (DNI, documentos). | Media | UI es para fotos de comida; documentar en MVP-3 la posibilidad de borrado/moderación. No mitigable 100% en este ciclo. |
| Falta de visualización profesional (la foto se sube pero nadie la ve). | Media | Esperado hasta **MC-FOTOS-MVP-3**. Comunicar que MVP-2 sube pero no muestra en panel. |

---

## 6. Rollback plan

| Si falla… | Acción |
|-----------|--------|
| **Deploy del API** | Volver al deployment anterior en Railway (rollback de la imagen previa). Si el problema es de config, volver `PULSO_DATA_SOURCE=mock` (la API deja de depender de Postgres y de la tabla nueva). |
| **Mi Pulso** | Rollback al deployment anterior. La UI de fotos es aditiva: el resto de Mi Pulso (Vista Hoy) sigue funcionando. |
| **`db:push`** | `prisma db push` es aditivo para tablas nuevas; la tabla `MealPhotoLog` puede dejarse vacía sin afectar al resto. Si algo del schema se corrompió, restaurar desde **backup de Postgres** (ver §7, criterio de backup). No borrar tablas existentes a mano. |
| **Bucket** | Quitar/limpiar las `S3_*` del servicio `api` → vuelve a `LocalFallbackStorage` (no rompe el endpoint; deja de persistir binarios). Investigar credenciales/permisos. |
| **Upload devuelve 500** | Revisar logs del API: ¿credenciales S3 inválidas? ¿endpoint mal? ¿tabla inexistente en modo prisma? Mitigación inmediata: quitar `S3_*` (fallback local) y/o `PULSO_DATA_SOURCE=mock` para aislar la causa. |
| **Cómo volver a la demo anterior** | Los tres interruptores de seguridad sin redeploy de código: `PULSO_DATA_SOURCE=mock`, `PULSO_AUTH_ENFORCEMENT=off`/`PULSO_AUTH_MODE=off`, y quitar `S3_*`. Devuelven el API al comportamiento previo. |
| **Qué NO tocar si no hace falta** | No tocar el Postgres (no borrar tablas/datos), no tocar CORS, no tocar dominio, no tocar el panel profesional ni la web profesional, no tocar variables de otros servicios. |

---

## 7. Criterios go / no-go para MC-FOTOS-PROD-1

Checklist a cumplir **antes** de autorizar la ejecución:

- [ ] **Estrategia de resguardo de DB** confirmada (backup de Postgres o
      confirmación explícita de que la DB solo tiene datos demo descartables).
- [ ] **Variables S3** disponibles (las 5) para cargar en el servicio `api`.
- [ ] **Servicio API identificado** en Railway (proyecto `pulso-nutricional`,
      servicio `api`).
- [ ] **Root / build / start confirmados** (root del repo; build
      `pnpm turbo run build --filter=@pulso/api`; start
      `pnpm --filter @pulso/api start`).
- [ ] **Comandos Prisma claros** (`db:push` desde shell controlado con
      `DATABASE_URL` pública verificada).
- [ ] **Smoke anterior OK** (estado actual A verificado: API, Mi Pulso, login,
      Vista Hoy, Postgres online).
- [ ] **Plan de rollback escrito** (§6) y entendido.
- [ ] **Bucket privado** confirmado (sin acceso público).
- [ ] **Autorización explícita de Ariel** para ejecutar `db:push` + bucket +
      deploy.

> Si **cualquier** ítem está sin cumplir → **no-go**. Se documenta el faltante y
> se frena.

---

## 8. No ejecutar todavía

🚫 En MC-FOTOS-PROD-0 (este ciclo) **NO** se hace nada de lo siguiente:

- No `db:push` / `db:seed` / `prisma migrate` contra ninguna DB.
- No configurar variables `S3_*` en Railway.
- No crear/configurar el bucket `orderly-suitcase`.
- No deploy ni redeploy de `api` ni `mi-pulso-web`.
- No tocar Postgres, CORS, dominio ni el panel profesional.
- No agregar secretos ni credenciales reales.
- No avanzar a MC-11, MC-12 ni Play Store.

> **Freno aquí.** Este ciclo es **solo documentación**. La ejecución real es
> MC-FOTOS-PROD-1 (DB + bucket + deploy API) y MC-FOTOS-PROD-2 (deploy Mi Pulso +
> smoke), cada uno con autorización explícita.

---

## 9. Próximos pasos recomendados

1. **MC-FOTOS-PROD-1** (requiere autorización): cumplir el go/no-go (§7), correr
   `db:push` controlado (§2), configurar bucket privado (§3), redeploy API,
   smoke API (§4.E).
2. **MC-FOTOS-PROD-2** (requiere autorización): redeploy Mi Pulso, smoke de
   upload end-to-end en navegador (§4.G).
3. **MC-FOTOS-MVP-3** (requiere autorización): panel profesional para ver/revisar
   fotos con **entrega controlada de imagen** (URL firmada / endpoint con guard).
4. **MC-FOTOS-MVP-4** (requiere autorización): smoke integral en Railway de toda
   la cadena.

Ver ADR 0031 para la justificación de las decisiones de este preflight.
