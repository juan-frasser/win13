# Referencia de la API

Base: `http://localhost:3001`. JSON en peticiones y respuestas. Las rutas protegidas exigen `Authorization: Bearer <accessToken>`.

## Convenciones
- **Códigos:** `201` en `POST` que crean (también el login), `200` en `PATCH`/`GET`.
- **Errores:** `{ "statusCode": 409, "message": "…", "error": "Conflict" }`. En validación (`400`) `message` es un arreglo de textos.
- `401` sin token, token inválido/vencido, credenciales inválidas o cuenta desactivada · `403` rol sin permiso o recurso ajeno · `404` no existe · `409` duplicado · `400` datos inválidos o regla de negocio.
- Las respuestas nunca incluyen la contraseña ni su hash.

## Autenticación (público)
| Método y ruta | Cuerpo | Respuesta |
|---|---|---|
| `POST /auth/registro/estudiante` | `email`, `password` (≥8), `documentoIdentidad`, `nombres`, `programaAcademico`, `semestreActual` (1–12) | `{ accessToken, rol }` |
| `POST /auth/registro/empresa` | `email`, `password` (≥8), `nit`, `razonSocial`, `sector` | `{ accessToken, rol }` |
| `POST /auth/login` | `email`, `password` | `{ accessToken, rol }` |

Errores: `409` correo, documento o NIT ya registrados; `401` credenciales inválidas o cuenta desactivada. El token vence a las 8 h y contiene `sub` (id de usuario) y `rol`.

## Vacantes
| Método y ruta | Rol | Descripción |
|---|---|---|
| `POST /vacantes` | EMPRESA | Crea una vacante (`titulo`, `descripcion`, `requisitos`, `programa`, `modalidad`, `apoyoSostenimiento` ≥0). Queda `PENDIENTE`. |
| `GET /vacantes?q=&programa=&modalidad=` | ESTUDIANTE | Busca solo vacantes `APROBADA` y `activa`. `q` filtra por título o descripción; `programa` y `modalidad` son coincidencia exacta. |
| `GET /vacantes/mias` | EMPRESA | Vacantes de la empresa autenticada (cualquier estado). |
| `PATCH /vacantes/:id/activa` | EMPRESA | `{ "activa": boolean }`. Cierra o reabre la vacante. `403` si es de otra empresa. |
| `GET /vacantes/pendientes` | ADMIN | Vacantes pendientes de auditoría. |
| `PATCH /vacantes/:id/estado` | ADMIN | `{ "estado": "APROBADA" \| "RECHAZADA" }`. `400` si ya no está pendiente. |

## Postulaciones
| Método y ruta | Rol | Descripción |
|---|---|---|
| `POST /postulaciones` | ESTUDIANTE | `{ "vacanteId": uuid }`. `400` si la vacante no está aprobada o fue cerrada; `409` si ya se postuló. |
| `GET /postulaciones/mias` | ESTUDIANTE | Seguimiento del estudiante (incluye vacantes cerradas a las que ya se postuló). |
| `GET /postulaciones/candidatos` | EMPRESA | Postulaciones a las vacantes de la empresa, con datos del estudiante. |
| `PATCH /postulaciones/:id/estado` | EMPRESA | `{ "estado": "POSTULADO" \| "EN_ENTREVISTA" \| "SELECCIONADO" \| "RECHAZADO" }`. `403` si la vacante es de otra empresa. |

## Administración (solo ADMIN)
| Método y ruta | Cuerpo | Descripción |
|---|---|---|
| `GET /admin/estudiantes` · `GET /admin/empresas` | — | Listados con `usuario { id, email, rol, activo }`. |
| `POST /admin/estudiantes` · `POST /admin/empresas` | Igual que el registro | Crea la cuenta sin iniciar sesión; devuelve el perfil. |
| `PATCH /admin/estudiantes/:id` | Opcionales: `documentoIdentidad`, `nombres`, `programaAcademico`, `semestreActual` | Edita el perfil. `409` si el documento ya existe. |
| `PATCH /admin/empresas/:id` | Opcionales: `nit`, `razonSocial`, `sector` | Edita el perfil. `409` si el NIT ya existe. |
| `PATCH /admin/usuarios/:id/activo` | `{ "activo": boolean }` | Activa o desactiva la cuenta. `:id` es el id del **usuario**. `400` si es administrador. |
| `PATCH /admin/usuarios/:id/password` | `{ "password": string (≥8) }` | Restablece la clave. `400` si es administrador. No cierra sesiones abiertas. |

## Ejemplo
```bash
TOKEN=$(curl -s -X POST localhost:3001/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"admin@ucn.edu.co","password":"Admin12345"}' | jq -r .accessToken)
curl -s localhost:3001/vacantes/pendientes -H "Authorization: Bearer $TOKEN"
```
