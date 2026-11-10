# Guía de desarrollo

## Requisitos
Node.js ≥ 20 (probado con 23), npm, Docker (opcional; sin él se usa la base en memoria).

## Arranque
```bash
./dev.sh                 # PostgreSQL (Docker) + backend :3001 + frontend :3000
./dev.sh --sin-db        # base en memoria, sin Docker
./dev.sh --demo          # además carga cuentas y vacantes de ejemplo
```
Las banderas se combinan. `Ctrl+C` detiene backend y frontend; el contenedor de PostgreSQL sigue activo (`docker-compose down` lo apaga). Instala dependencias si falta `node_modules`.

Por separado:
```bash
cd backend  && npm install && npm run start:dev
cd frontend && npm install && npm run dev
```

## Variables de entorno
| Variable | Defecto | Uso |
|---|---|---|
| `DB_TYPE` | (postgres) | `sqljs` = base en memoria |
| `DB_HOST` `DB_PORT` `DB_USER` `DB_PASSWORD` `DB_NAME` | `localhost` `5432` `practicas` `practicas` `practicas` | Conexión a PostgreSQL |
| `PORT` | `3001` | Puerto del backend |
| `FRONTEND_URL` | `http://localhost:3000` | Origen permitido por CORS |
| `JWT_SECRET` | `dev-secret-cambiar` | **Cambiar fuera de desarrollo** |
| `ADMIN_EMAIL` `ADMIN_PASSWORD` | `admin@ucn.edu.co` `Admin12345` | Administrador sembrado al arrancar (si no existe) |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | URL de la API para el navegador |
| `API_URL` | `http://localhost:3001` | Solo `scripts/seed-demo.mjs` |

## Datos de demostración
`node scripts/seed-demo.mjs` (o `./dev.sh --demo`) es idempotente: crea la empresa `rrhh@acme.co` y el estudiante `ana.perez@ucn.edu.co` (clave `Clave12345`), tres vacantes (dos aprobadas, una pendiente) y una postulación en entrevista.

## Pruebas
```bash
cd backend
npm test          # unitarias (*.spec.ts)
npm run test:e2e  # integración (*.e2e-spec.ts) sobre sql.js
npm run test:all
```
Las de integración fijan `DB_TYPE=sqljs` en `src/e2e-env.ts`, que debe importarse **antes** de `AppModule` (la configuración de la base se evalúa al cargar el módulo).

## Cómo extender
1. Crear la carpeta del módulo con entidad, DTO (con `class-validator`), servicio, controlador y módulo.
2. Registrar la entidad en `entities` de `app.module.ts` y el módulo en `imports`.
3. Proteger cada ruta con `@Roles(Rol.X)`; el servicio recibe el id del usuario de `req.user` y valida propiedad.
4. Escribir pruebas unitarias del servicio y un caso en `app.e2e-spec.ts`.
5. Si se agregan columnas, recordar que `synchronize` solo sirve en desarrollo (ver [decisiones-y-limitaciones.md](decisiones-y-limitaciones.md)).

## Problemas conocidos
| Síntoma | Causa y solución |
|---|---|
| `docker compose` no existe | En algunos equipos el comando es `docker-compose`; `dev.sh` detecta ambos. |
| Jest: `Cannot use import statement outside a module` | NestJS 12 es solo ESM; el proyecto fija NestJS 11 (CommonJS). |
| Jest: TypeScript no expone la API | ts-jest no soporta TypeScript 7; el proyecto fija TypeScript 5. |
| `EADDRINUSE` en 3000 o 3001 | Ya hay una instancia corriendo; deténla antes de lanzar `dev.sh`. |
| El backend no tiene las rutas nuevas | `ts-node` no recarga solo: reinícialo (el frontend sí recarga). |
| Tras reiniciar con `--sin-db` no hay datos | Es una base en memoria; usa `--demo` o PostgreSQL. |
