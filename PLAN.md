# Plan de trabajo — Taller Integrador Unidad 3

Plataforma de prácticas profesionales UCN. Continúa los Talleres 1 y 2 (stack Next.js + NestJS + PostgreSQL, Scrumban).

## Alcance (rúbrica de la guía)
| Criterio | Entrega |
|---|---|
| Administración de perfiles (UC1) | Módulo `admin`: el administrador lista, crea, edita y activa/desactiva estudiantes y empresas (RF-01). |
| Cierre de vacantes (requisito nuevo) | La empresa desactiva su vacante: deja de verse y de admitir postulantes, pero los procesos en curso continúan. |
| Prototipo (≥2 módulos) | **M1** Registro y autenticación por roles (RF-01, RNF-01). **M2** Publicación, auditoría y búsqueda de vacantes + postulación (RF-02, RF-03, RF-04, RF-05). |
| Pruebas (≥3 unitarias) | Jest: pruebas unitarias de servicios + prueba de integración e2e del flujo completo. Resultados en `docs/evidencias-pruebas.md`. |
| Despliegue inicial | Entorno local reproducible con `docker-compose` (PostgreSQL) + guion de video. VPS/Cloudflare queda como despliegue futuro. |
| Documentación | `docs/informe-unidad3.docx` (portada, índice, desarrollo, pruebas, conclusiones, APA). |
| Coherencia T1/T2 | Entidades = modelo ER del T2 (Usuario, Empresa, Estudiante, Vacante, Postulación); roles y flujo de aprobación = casos de uso del T2. |

## Tablero Scrumban
| Estado | Tarea |
|---|---|
| Terminado | Plan, estructura del repo, backend NestJS (auth, vacantes, postulaciones), frontend Next.js, pruebas, docker-compose |
| Pendiente (usuario) | Crear repo remoto en GitHub y hacer push; grabar video (≤5 min); capturas finales en el Word; completar APA con fuentes propias |

## Fuera de alcance (limitaciones declaradas)
- Informes de seguimiento (`INFORME_SEGUIMIENTO`), carga de documentos y notificaciones por correo.
- Migraciones: el prototipo usa `synchronize` de TypeORM.
- Despliegue en VPS con Cloudflare.
