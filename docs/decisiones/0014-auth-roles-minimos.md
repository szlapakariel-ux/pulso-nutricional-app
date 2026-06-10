# ADR 0014 — Auth y roles mínimos sin protección obligatoria (MC-10.5C)

**Estado:** Aceptado  
**Microciclo:** MC-10.5C  
**Fecha:** 2026-06-10

## Contexto

MC-10.5B dejó la API funcionando con mocks (default) y lectura Prisma opcional.
MC-10.5C introduce la base mínima de autenticación y roles sin romper el comportamiento
actual: los endpoints existentes siguen funcionando sin token.

## Decisión

Agregar un modo de auth controlado por variable de entorno:

```
PULSO_AUTH_MODE=off    # default — no exige login, comportamiento anterior
PULSO_AUTH_MODE=demo   # habilita login demo y emisión de JWT
```

### Regla central

**El comportamiento visible actual no se rompe.** Con `PULSO_AUTH_MODE=off` (default),
todos los endpoints existentes funcionan exactamente igual que antes, sin requerir token.

Los nuevos endpoints `/auth/*` devuelven `501 Not Implemented` en modo `off`, dejando
claro que la funcionalidad existe pero está desactivada por configuración.

### Sin protección masiva todavía

En MC-10.5C, ningún endpoint de negocio existente queda protegido obligatoriamente.
La protección por rol se habilitará en microciclos posteriores cuando la UI esté
conectada y el flujo completo sea verificable.

## Archivos nuevos

```
packages/shared/src/types/auth.ts              ← AuthRole, AuthUser, LoginRequest,
                                                  LoginResponse, AuthSession
packages/api/src/config/auth.ts               ← AuthMode selector + resolveJwtSecret()
                                                  + declare module "@fastify/jwt"
packages/api/src/mock-data/auth.mock.ts       ← credenciales demo en memoria
packages/api/src/services/auth.service.ts     ← verifyDemoCredentials()
packages/api/src/controllers/auth.controller.ts ← login, me, protected-demo
packages/api/src/routes/auth.routes.ts        ← POST /auth/login, GET /auth/me,
                                                  GET /auth/protected-demo
```

## Archivos modificados

```
packages/api/src/app.ts          ← registra @fastify/jwt + authRoutes
packages/api/.env.example        ← PULSO_AUTH_MODE=off, JWT_SECRET=...
packages/shared/src/index.ts     ← exporta tipos de auth
```

## Dependencias agregadas

| Paquete | Versión | Motivo |
|---|---|---|
| `@fastify/jwt` | ^10.1.0 | Plugin JWT nativo de Fastify; sign/verify integrados |

## Endpoints nuevos

| Endpoint | Método | Descripción |
|---|---|---|
| `POST /auth/login` | POST | Login demo; devuelve JWT. 501 en modo off. |
| `GET /auth/me` | GET | Devuelve usuario del token. 501 en modo off. |
| `GET /auth/protected-demo` | GET | Endpoint demo protegido. 501 en modo off. |

## Tipos nuevos en @pulso/shared

| Tipo | Descripción |
|---|---|
| `AuthRole` | `"professional" \| "patient"` |
| `AuthUser` | `{ id, email, role }` |
| `LoginRequest` | `{ email, password }` |
| `LoginResponse` | `{ token, user, isDemoData }` |
| `AuthSession` | `AuthUser & { iat?, exp? }` — payload del JWT |

## Credenciales demo (en memoria, no en DB)

El modelo `User` en Prisma no tiene campo `password` (la auth fue diferida).
Las credenciales demo viven únicamente en `src/mock-data/auth.mock.ts`:

| Email | Contraseña | Rol |
|---|---|---|
| `profesional-demo@pulsonutricional.demo` | `demo-profesional-2026` | professional |
| `paciente-demo-uno@pulsonutricional.demo` | `demo-paciente-2026` | patient |
| `paciente-demo-dos@pulsonutricional.demo` | `demo-paciente-2026` | patient |
| `paciente-demo-tres@pulsonutricional.demo` | `demo-paciente-2026` | patient |

Los emails coinciden con los del seed Prisma para coherencia entre modos mock y prisma.
Las contraseñas son solo demo — no se almacenan, no se hashean, no van a la DB.

## Secreto JWT

- `PULSO_AUTH_MODE=off` → JWT_SECRET no requerido; se usa placeholder nunca utilizado.
- `PULSO_AUTH_MODE=demo`, `NODE_ENV != production` → JWT_SECRET del env o fallback demo.
- `PULSO_AUTH_MODE=demo`, `NODE_ENV = production` → JWT_SECRET obligatorio (throw si falta).

## Estado MC-10.5C

- Endpoints existentes no quedan protegidos. Siguen sin requerir token.
- Auth desactivada por default. No rompe el modo mock ni el modo prisma.
- Railway sigue fuera de alcance.
- UI sigue sin conectar a la API real.
- Sin OAuth, SSO, 2FA, refresh token complejo, recuperación de contraseña.
- Sin cookies httpOnly (diferido a cuando la UI esté conectada).

## Consecuencias

- **Positivo:** La base de auth existe y es verificable en modo demo.
- **Positivo:** Modo off por default garantiza que nada se rompe.
- **Positivo:** Los roles PROFESSIONAL y PATIENT están representados en el token.
  Esto desbloquea la futura protección de endpoints por rol.
- **Neutral:** Las credenciales demo están en memoria; agregar password real al
  schema de Prisma es el siguiente paso en la evolución del auth.
- **Neutral:** `@fastify/jwt` registrado siempre (con placeholder en modo off).
  El overhead es mínimo.
- **Negativo:** Las contraseñas demo no están hasheadas. Solo es aceptable porque
  son datos ficticios de desarrollo; antes de producción hay que implementar hashing
  real.

## Próximo paso recomendado

- Agregar campo `passwordHash` al schema Prisma (con migración).
- Implementar hashing con `bcrypt` o `argon2` en el servicio de auth.
- Proteger endpoints de negocio por rol (preHandler hook condicional).
- Conectar la UI al flujo de login real.
