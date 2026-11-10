# Plataforma de Prácticas Profesionales — UCN (Prototipo Unidad 3)

Prototipo funcional del Taller Integrador de Unidad 3 (Ingeniería de Software). Ver [PLAN.md](PLAN.md).

- **Frontend:** Next.js 16 + React 19 (`frontend/`)
- **Backend:** NestJS 11 + TypeORM + JWT + bcrypt (`backend/`)
- **Base de datos:** PostgreSQL 16 (`docker-compose.yml`)

## Módulos implementados
(Además del módulo de administración de perfiles, descrito más abajo, que cubre el caso de uso UC1 del Taller 2.)
1. **Registro y autenticación por roles** (RF-01, RNF-01): estudiantes y empresas se auto-registran; el administrador (coordinación) se siembra al arrancar. JWT + contraseñas con bcrypt.
2. **Vacantes y postulaciones** (RF-02 a RF-05): la empresa publica (queda `PENDIENTE`), la coordinación aprueba o rechaza, el estudiante busca/filtra solo vacantes aprobadas y se postula, la empresa actualiza el estado del candidato.

## Ejecutar en local
Un solo comando levanta PostgreSQL, backend y frontend (Ctrl+C detiene todo):
```bash
./dev.sh            # PostgreSQL en Docker
./dev.sh --sin-db   # base en memoria, sin Docker
./dev.sh --demo      # además carga cuentas y vacantes de ejemplo (combinable)
```
Cuentas de demostración (`--demo`): administrador `admin@ucn.edu.co` / `Admin12345`; empresa `rrhh@acme.co` y estudiante `ana.perez@ucn.edu.co`, ambos con `Clave12345`.

### Qué hace cada rol
- **Administrador:** audita las vacantes que envían las empresas y administra perfiles: lista, crea, edita y activa/desactiva estudiantes y empresas y restablece sus claves (pestañas del panel). Desactivar bloquea el acceso de inmediato, incluso con una sesión abierta.
- **Empresa:** publica vacantes y gestiona candidatos. Se crea en “Regístrate”.
- **Estudiante:** busca vacantes aprobadas y se postula. Se crea en “Regístrate”.
O por separado:
```bash
docker-compose up -d            # PostgreSQL (o: docker compose up -d)
cd backend && npm install && npm run start:dev      # API en :3001
cd frontend && npm install && npm run dev           # UI en :3000
```
Sin Docker: `DB_TYPE=sqljs npm run start:dev` usa una base en memoria (se pierde al apagar).

Usuario administrador de desarrollo: `admin@ucn.edu.co` / `Admin12345` (sobrescribible con `ADMIN_EMAIL` y `ADMIN_PASSWORD`).
Variables: `JWT_SECRET`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `FRONTEND_URL`, `NEXT_PUBLIC_API_URL`.
Cambia `JWT_SECRET` y la clave del administrador fuera de desarrollo.

## Pruebas
```bash
cd backend
npm test            # 13 pruebas unitarias (CP-01 a CP-13)
npm run test:e2e    # 6 pruebas de integración sobre la API (IT-01 a IT-06)
```
Resultados y trazabilidad: [docs/evidencias-pruebas.md](docs/evidencias-pruebas.md).

## API
| Método y ruta | Rol | Descripción |
|---|---|---|
| `POST /auth/registro/estudiante`, `/auth/registro/empresa`, `/auth/login` | público | Alta y sesión |
| `POST /vacantes` · `GET /vacantes/mias` | EMPRESA | Publicar / listar propias |
| `GET /vacantes?q=&programa=&modalidad=` | ESTUDIANTE | Buscar vacantes aprobadas |
| `GET /vacantes/pendientes` · `PATCH /vacantes/:id/estado` | ADMIN | Auditar |
| `GET/POST /admin/estudiantes` · `PATCH /admin/estudiantes/:id` | ADMIN | Listar, crear y editar estudiantes |
| `GET/POST /admin/empresas` · `PATCH /admin/empresas/:id` | ADMIN | Listar, crear y editar empresas |
| `PATCH /admin/usuarios/:id/activo` | ADMIN | Activar o desactivar una cuenta |
| `PATCH /admin/usuarios/:id/password` | ADMIN | Restablecer la clave de un estudiante o empresa |
| `POST /postulaciones` · `GET /postulaciones/mias` | ESTUDIANTE | Postularse / seguimiento |
| `GET /postulaciones/candidatos` · `PATCH /postulaciones/:id/estado` | EMPRESA | Gestionar candidatos |
