# Trazabilidad

Del Taller 2 (requisitos y casos de uso) al código, la interfaz y las pruebas.

| Requisito / caso de uso | Endpoints | Pantalla | Pruebas |
|---|---|---|---|
| **RF-01** cuentas y roles | `POST /auth/registro/*`, `POST /auth/login` | `/`, `/registro` | CP-01, CP-02, CP-03, IT-01, IT-02 |
| **RF-02** publicar ofertas | `POST /vacantes`, `GET /vacantes/mias`, `PATCH /vacantes/:id/activa` | `/empresa` | CP-04, CP-14, IT-03, IT-07 |
| **RF-03** buscar y postularse | `GET /vacantes`, `POST /postulaciones`, `GET /postulaciones/mias` | `/estudiante` | CP-05, CP-07, CP-08, CP-15, IT-03, IT-04, IT-07 |
| **RF-04** auditar ofertas | `GET /vacantes/pendientes`, `PATCH /vacantes/:id/estado` | `/admin` → Vacantes | CP-04, CP-06, CP-07, IT-03 |
| **RF-05** estado del candidato | `GET /postulaciones/candidatos`, `PATCH /postulaciones/:id/estado` | `/empresa` → Candidatos | CP-09, IT-04, IT-07 |
| **UC1** registrar estudiantes y empresas (universidad) | `/admin/estudiantes`, `/admin/empresas`, `/admin/usuarios/:id/activo`, `/admin/usuarios/:id/password` | `/admin` → Estudiantes / Empresas | CP-10, CP-11, CP-12, CP-13, IT-05, IT-06 |
| **RNF-01** JWT y contraseñas hasheadas | guards en todas las rutas | — | CP-01, CP-13, IT-02, IT-04, IT-05, IT-06 |
| **RNF-02** React + Node + PostgreSQL | — | — | Verificación manual contra PostgreSQL 16 |
| **RNF-03** alta disponibilidad con Cloudflare, respuesta ≤ 3 s | — | — | No cubierto (ver limitaciones) |
| Informes de seguimiento (`INFORME_SEGUIMIENTO`) | — | — | No implementado |

## Requisitos agregados en esta unidad (no estaban en el Taller 2)
- Administración de perfiles: crear, editar, activar/desactivar y restablecer claves de estudiantes y empresas.
- Cierre de vacantes por la empresa sin afectar procesos en curso.
