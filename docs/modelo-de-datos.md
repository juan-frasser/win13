# Modelo de datos

Parte del modelo ER del Taller 2 (se omite `INFORME_SEGUIMIENTO`, fuera de alcance de este prototipo). El esquema lo crea TypeORM con `synchronize`.

```mermaid
erDiagram
  USUARIO ||--o| ESTUDIANTE : "perfil"
  USUARIO ||--o| EMPRESA : "perfil"
  EMPRESA ||--o{ VACANTE : "publica"
  ESTUDIANTE ||--o{ POSTULACION : "realiza"
  VACANTE ||--o{ POSTULACION : "recibe"

  USUARIO {
    uuid id PK
    string email UK
    string password "hash bcrypt, select false"
    string rol "ESTUDIANTE, EMPRESA o ADMIN"
    boolean activo "default true"
  }
  ESTUDIANTE {
    uuid id PK
    string documentoIdentidad UK
    string nombres
    string programaAcademico
    int semestreActual
    uuid usuarioId FK
  }
  EMPRESA {
    uuid id PK
    string nit UK
    string razonSocial
    string sector
    uuid usuarioId FK
  }
  VACANTE {
    uuid id PK
    string titulo
    string descripcion
    string requisitos
    string programa
    string modalidad "PRESENCIAL, REMOTA o HIBRIDA"
    int apoyoSostenimiento "COP, default 0"
    string estado "PENDIENTE, APROBADA o RECHAZADA"
    boolean activa "default true"
    uuid empresaId FK
    datetime creadaEn
  }
  POSTULACION {
    uuid id PK
    string estado "POSTULADO, EN_ENTREVISTA, SELECCIONADO o RECHAZADO"
    uuid estudianteId FK
    uuid vacanteId FK
    datetime fechaPostulacion
  }
```

## Restricciones
| Tabla | Restricción |
|---|---|
| `usuario` | `email` único. Los administradores no tienen perfil: son filas de `usuario` con `rol=ADMIN`, sembradas al arrancar. |
| `estudiante` | `documentoIdentidad` único; relación 1 a 1 con `usuario`. |
| `empresa` | `nit` único; relación 1 a 1 con `usuario`. |
| `postulacion` | Única por (`estudiante`, `vacante`). |

## Dos estados independientes en la vacante
| Campo | Quién lo cambia | Efecto |
|---|---|---|
| `estado` | Coordinación (solo desde `PENDIENTE` a `APROBADA` o `RECHAZADA`) | Visible al estudiante solo si es `APROBADA` |
| `activa` | Empresa dueña | Si es `false`: no aparece en la búsqueda ni admite postulaciones nuevas |

Una vacante es **postulable** si `estado=APROBADA` **y** `activa=true`.

## Notas de implementación
- `Usuario.password` tiene `select: false`: no se carga en consultas ni en relaciones `eager`. Solo el login la selecciona de forma explícita. Evita filtrar el hash (defecto detectado por la prueba IT-04).
- Las relaciones `Estudiante.usuario`, `Empresa.usuario`, `Vacante.empresa` y `Postulacion.estudiante/vacante` son `eager`.
- Los identificadores son UUID generados por TypeORM.
