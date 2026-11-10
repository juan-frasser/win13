# Decisiones técnicas, limitaciones y trabajo futuro

## Decisiones
| Decisión | Motivo |
|---|---|
| Stack del Taller 2 (Next.js, NestJS, PostgreSQL) | Coherencia con el diseño previo (rúbrica: coherencia con Talleres 1 y 2) |
| NestJS 11 en lugar de 12 | La versión 12 es solo ESM y no funciona con la configuración CommonJS de Jest/ts-node |
| TypeScript 5 en lugar de 7 | ts-jest no es compatible con TypeScript 7 |
| sql.js para pruebas de integración | Permite probar la API completa sin servidor de base de datos ni compilación nativa |
| `simple-enum` en columnas de enumeración | Mismo esquema en PostgreSQL y sql.js |
| `synchronize` de TypeORM | Prototipo: evita migraciones; no apto para producción |
| `select: false` en `Usuario.password` | Evita filtrar el hash por relaciones `eager` |
| Desactivar cuentas en lugar de borrarlas | Conserva la trazabilidad de vacantes y postulaciones |
| `activa` separada de `estado` en la vacante | La auditoría de la coordinación y el cierre de la empresa son decisiones de actores distintos |
| El guard consulta la base en cada petición | Hace efectiva la desactivación de cuentas sobre tokens ya emitidos, a costa de una lectura por petición |
| La coordinación define la clave a restablecer | No existe servicio de correo; evita un flujo de recuperación incompleto |
| `dev.sh` mata el grupo de procesos | `npx` lanza procesos hijos que de otro modo quedan ocupando los puertos |
| Los PDFs del curso están en `.gitignore` | Evitar publicar material del curso en un repositorio posiblemente público |

## Limitaciones del prototipo
- Sin informes de seguimiento, carga de documentos académicos ni notificaciones por correo.
- Sin migraciones; sin paginación en listados.
- Sin eliminación de perfiles ni de vacantes (solo desactivación).
- Restablecer clave no cierra sesiones abiertas.
- Sin pruebas automáticas del frontend ni de rendimiento; el frontend se validó manualmente.
- No se ejecutó el despliegue en VPS con Cloudflare; el entorno de prueba es local.
- Cobertura de pruebas del backend: 95,6 % sentencias, 97,0 % líneas, 92,9 % funciones, 69,0 % ramas.

## Trabajo futuro (orden sugerido)
1. Migraciones y `JWT_SECRET`/credenciales obligatorios por entorno.
2. Informes de seguimiento y carga de documentos.
3. Recuperación de clave por correo y notificaciones de cambio de estado.
4. Despliegue en VPS con Cloudflare (HTTPS, DNS, protección DDoS) y CI con las pruebas.
5. Paginación, pruebas del frontend (componentes y extremo a extremo) y rate limiting.
6. Cookies `HttpOnly` y revocación de sesiones.
