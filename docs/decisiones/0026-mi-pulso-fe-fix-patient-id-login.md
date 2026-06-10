# ADR 0026 — Mi Pulso: fix frontend patientId desde /auth/me tras login (MC-MIPULSO-FE-1)

**Estado:** Aceptado
**Microciclo:** MC-MIPULSO-FE-1
**Fecha:** 2026-06-10

---

## Contexto

Mi Pulso está desplegado en Railway y la cadena API funciona correctamente:
- `OPTIONS /auth/login` → 204 (CORS ok).
- `POST /auth/login` → 200 con `{ token, user, isDemoData }`.
- `GET /auth/me` → 200 con `{ data: AuthUser }` donde `patientId: "demo-1"`.
- `GET /patients/demo-1/today` → 200 con plan y agenda.

Sin embargo, la UI queda atascada en "Cargando tu día..." y muestra el error:
> "La API no devolvió el patientId del paciente autenticado."

## Causa raíz

En `apps/mi-pulso-web/lib/use-patient-auth.ts`, el callback `login` hacía:

```typescript
const response = await client.login(email, password);
setToken(response.token);
setUser(response.user);  // ❌ response.user viene de POST /auth/login
```

`POST /auth/login` construye `response.user` desde el payload del JWT en el
momento de la firma (antes de MC-PATIENT-ID-1), por lo que **no incluye
`patientId`**. Solo `GET /auth/me` devuelve `patientId` para el rol paciente
(implementado en MC-PATIENT-ID-1).

La ruta de rehidratación (en `useEffect`) ya era correcta: llamaba
`client.getMe()` y usaba ese resultado para `setUser()`. Solo el callback
`login` estaba desalineado.

## Decisión

Después de `client.login()`, llamar inmediatamente `client.getMe()` y usar
ese resultado para `setUser()`. `client.login()` ya almacena el token en el
singleton `ApiClient`, por lo que `client.getMe()` lo incluye automáticamente
en el header `Authorization`.

```typescript
const response = await client.login(email, password);
// login() stores the token in ApiClient internally; getMe() uses it.
// /auth/login response.user lacks patientId — only /auth/me includes it.
const me = await client.getMe();

setToken(response.token);
setUser(me);  // ✅ me.patientId presente para role="patient"
```

### Componentes modificados

| Archivo | Cambio |
|---------|--------|
| `apps/mi-pulso-web/lib/use-patient-auth.ts` | En `login`: añadir `const me = await client.getMe()` y usar `setUser(me)` en lugar de `setUser(response.user)`. |
| ADR 0026 (este archivo) | Documenta la decisión y sus límites. |
| `docs/microciclos/plan-microciclos.md` | Agrega sección MC-MIPULSO-FE-1 y fila en la tabla de estado. |

## Verificación

| Check | Resultado |
|-------|-----------|
| `pnpm type-check` | ✅ |
| `pnpm build` | ✅ |
| `pnpm lint` | ✅ |
| Modo mock sin cambios | ✅ (la rama `if (config.mode !== "api")` no se toca) |
| Rehydratación ya era correcta | ✅ (sin cambios en `useEffect`) |

## Límites explícitos (MC-MIPULSO-FE-1)

- Solo modifica `use-patient-auth.ts` (una línea lógica: añadir `getMe()`).
- No toca código de API.
- No toca Railway, variables de entorno, CORS, Postgres, Prisma schema ni seed.
- No toca la web profesional.
- No avanza a deploy de Mi Pulso, dominio, MC-11 ni MC-12.
- Token nunca se imprime completo en consola (invariante mantenida).
- Modo mock sigue funcionando sin cambios (invariante mantenida).

## Próximo paso recomendado

Con este fix, Mi Pulso desplegado en Railway debería resolver el error de
`patientId`. Para verificar: redeploy del servicio `mi-pulso-web` en Railway
(fuera del alcance de este ciclo) o correr local con
`NEXT_PUBLIC_PULSO_DATA_MODE=api`.
