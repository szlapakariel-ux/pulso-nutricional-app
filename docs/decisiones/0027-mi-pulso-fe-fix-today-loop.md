# ADR 0027 — Mi Pulso: fix loop infinito en Vista Hoy (MC-MIPULSO-FE-2)

**Estado:** Aceptado
**Microciclo:** MC-MIPULSO-FE-2
**Fecha:** 2026-06-10

---

## Contexto

Después de aplicar MC-MIPULSO-FE-1 (que corrigió el `patientId`), Mi Pulso
en producción seguía sin renderizar la Vista Hoy. Los síntomas observados:

- La UI quedaba bloqueada en "Cargando tu día...".
- Las DevTools de red mostraban 36+ llamadas repetidas a `GET /patients/demo-1/today`.
- La API respondía 200 correctamente en cada llamada.
- No había errores CORS ni de autenticación.

## Causa raíz

En `apps/mi-pulso-web/app/hoy-view.tsx`, el componente `HoyApiView` definía:

```typescript
const loadToday = useCallback(async (patientId: string) => {
  ...
  auth.logout();  // ← usa auth
  ...
}, [auth]);  // ← ❌ depende del objeto completo auth
```

y el efecto:

```typescript
useEffect(() => {
  if (auth.user?.patientId) {
    void loadToday(auth.user.patientId);
  }
  ...
}, [auth.user, loadToday]);  // ← loadToday inestable → loop
```

`usePatientAuth()` devuelve un **nuevo objeto** en cada render (React no
memoriza los valores de retorno de hooks). Por tanto:

1. Render N → `auth` es un nuevo objeto → `useCallback([auth])` devuelve
   una nueva función `loadToday`.
2. `useEffect([auth.user, loadToday])` ve `loadToday` cambiada → dispara el efecto.
3. El efecto llama `setTodayLoading(true)` → render N+1.
4. Nuevo render → `auth` es un nuevo objeto → `loadToday` es nueva → loop.

## Decisión

Cambiar la dependencia del `useCallback` de `[auth]` a `[auth.logout]`.

`logout` se define en `usePatientAuth` con `useCallback(() => { ... }, [])` —
dependencias vacías — por lo que tiene una **referencia estable** entre renders.
Usar `auth.logout` (en lugar del objeto `auth` completo) como dependencia
garantiza que `loadToday` no cambie entre renders, rompiendo el loop.

```typescript
const loadToday = useCallback(async (patientId: string) => {
  ...
  auth.logout();  // ← sigue usando auth.logout
  ...
  // auth.logout has a stable reference (useCallback with [] deps in usePatientAuth).
  // Using [auth] caused a new loadToday on every render → infinite fetch loop.
}, [auth.logout]);  // ← ✅ solo depende del logout estable
```

Con este cambio:
- `loadToday` tiene referencia estable entre renders.
- `useEffect([auth.user, loadToday])` solo se dispara cuando `auth.user`
  cambia realmente (de null a user object tras el login).
- Después de que `/patients/demo-1/today` responde, `setTodayView(view)` no
  cambia `auth.user` → el effect no se vuelve a disparar.
- Sin loop.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `apps/mi-pulso-web/app/hoy-view.tsx` | `useCallback` dep: `[auth]` → `[auth.logout]` |
| ADR 0027 (este archivo) | Documenta la decisión y sus límites. |
| `docs/microciclos/plan-microciclos.md` | Agrega sección MC-MIPULSO-FE-2 y fila en la tabla de estado. |

## Verificación

| Check | Resultado |
|-------|-----------|
| `pnpm type-check` | ✅ |
| `pnpm build` | ✅ |
| `pnpm lint` | ✅ |
| Modo mock sin cambios | ✅ (`HoyMockView` no afectado) |
| API, CORS, login, `/auth/me`, `patientId` | ✅ Ya correctos (no tocados) |

## Límites explícitos (MC-MIPULSO-FE-2)

- Solo modifica `hoy-view.tsx` (una línea: el dep array de `useCallback`).
- No toca código de API.
- No toca Railway, variables de entorno, CORS, Postgres, Prisma schema ni seed.
- No toca la web profesional.
- No avanza a deploy de Mi Pulso, dominio, MC-11 ni MC-12.

## Próximo paso recomendado

Con este fix, el redeploy de `mi-pulso-web` en Railway debería resolver
completamente el bucle de fetches y permitir que la Vista Hoy renderice.
