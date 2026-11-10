# Evidencias de pruebas

Ejecución: `cd backend && npx jest --testRegex "\.(spec|e2e-spec)\.ts$" --coverage` — **4 suites, 13 pruebas, 13 aprobadas** (≈4,7 s).
Cobertura global: 97,3 % sentencias · 98,9 % líneas · 95,8 % funciones · 70 % ramas.

## Pruebas unitarias (Jest, repositorios simulados)
| ID | Requisito | Caso | Resultado esperado | Resultado |
|---|---|---|---|---|
| CP-01 | RF-01, RNF-01 | Registrar estudiante | Rol ESTUDIANTE, contraseña hasheada (bcrypt), devuelve JWT | Aprobado |
| CP-02 | RF-01 | Registrar con correo existente | `ConflictException`, no se guarda el perfil | Aprobado |
| CP-03 | RF-01 | Login con clave incorrecta / correcta | `401` / token y rol | Aprobado |
| CP-04 | RF-02, RF-04 | Crear vacante | Estado `PENDIENTE` asociada a la empresa | Aprobado |
| CP-05 | RF-03 | Búsqueda de estudiante | Consulta solo `APROBADA` y aplica filtros | Aprobado |
| CP-06 | RF-04 | Auditar vacante | Solo pendientes; inexistente → 404; pendiente → aprobada | Aprobado |
| CP-07 | RF-03, RF-04 | Postular a vacante no aprobada | `BadRequestException`, no se guarda | Aprobado |
| CP-08 | RF-03 | Postular dos veces | `ConflictException` | Aprobado |
| CP-09 | RF-05 | Cambiar estado de candidato | Otra empresa → `Forbidden`; la dueña → actualiza | Aprobado |

## Pruebas de integración (API real + TypeORM en memoria, `supertest`)
| ID | Caso | Resultado |
|---|---|---|
| IT-01 | Registro de empresa y estudiante; login del administrador sembrado | Aprobado |
| IT-02 | Validación de DTO (400), credenciales inválidas (401), sin token (401), rol incorrecto (403) | Aprobado |
| IT-03 | Vacante nueva invisible al estudiante → aprobada por admin → visible con filtros | Aprobado |
| IT-04 | Postulación, duplicado (409), listado de candidatos sin exponer el hash, cambio de estado visible al estudiante | Aprobado |

## Defecto encontrado por las pruebas
IT-04 detectó que `GET /postulaciones/candidatos` devolvía el hash de contraseña del estudiante dentro de `estudiante.usuario` (relación `eager`). Corregido con `@Column({ select: false })` en `Usuario.password`; el login lo selecciona explícitamente. Tras el cambio la prueba pasa (cumple RNF-01).

## Verificación manual en PostgreSQL
Backend arrancado contra PostgreSQL 16 (Docker): se crearon las 5 tablas (`usuario`, `empresa`, `estudiante`, `vacante`, `postulacion`) y se recorrió el flujo completo desde la interfaz; capturas en `docs/capturas/`.
