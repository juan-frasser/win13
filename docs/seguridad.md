# Seguridad

## Controles implementados
| Control | Detalle |
|---|---|
| Autenticación | JWT firmado (HS256) con vencimiento de 8 h; claims `sub` y `rol` |
| Contraseñas | `bcrypt` (costo 10); mínimo 8 caracteres; el hash nunca sale del backend (`select: false`) |
| Autorización | `@Roles(...)` en cada ruta protegida: `JwtAuthGuard` (401) y `RolesGuard` (403); la administración se protege a nivel de clase |
| Propiedad de recursos | La empresa solo opera sobre sus vacantes y candidatos; el estudiante solo ve sus postulaciones |
| Cuentas desactivadas | El guard consulta la base en cada petición: un token vigente de una cuenta desactivada se rechaza (401); el login también la rechaza |
| Administradores | No se auto-registran, no se desactivan y no se les restablece la clave por la API; se siembran al arrancar |
| Validación de entrada | `ValidationPipe` con `whitelist` + `forbidNonWhitelisted`; DTOs con `class-validator` |
| Inyección SQL | Consultas por TypeORM con parámetros; sin SQL en texto |
| CORS | Solo el origen de `FRONTEND_URL` |
| Enumeración de usuarios | El login responde igual para correo inexistente y clave incorrecta |

## Hallazgo corregido
Prueba **IT-04**: la lista de candidatos devolvía el hash de contraseña del estudiante por la relación `eager`. Corregido con `select: false` en `Usuario.password`.

## Riesgos pendientes (antes de producción)
| Riesgo | Mitigación recomendada |
|---|---|
| `JWT_SECRET` y clave del administrador con valores por defecto | Definirlos por entorno; rechazar el arranque si faltan en producción |
| Token en `localStorage` (expuesto a XSS) | Cookie `HttpOnly` + `SameSite`, o CSP estricta |
| Sin límite de intentos de login | Rate limiting y bloqueo temporal |
| Restablecer clave no invalida sesiones abiertas | Versión de token en `usuario` o lista de revocación |
| Sin HTTPS en local | En producción, TLS vía Cloudflare/VPS como prevé el Taller 2 (RNF-03) |
| Política de claves mínima (solo longitud) | Reglas de complejidad y verificación contra listas de claves filtradas |
| La clave restablecida viaja del administrador al usuario por un canal externo | Flujo de recuperación por correo con enlace de un solo uso |
| `synchronize` puede alterar el esquema | Migraciones versionadas |
| Sin auditoría de acciones del administrador | Registro de eventos (quién, qué, cuándo) |
| Respuestas incluyen el correo de la contraparte (empresa ↔ estudiante) | Intencional para contacto; revisar con la política de datos de la universidad |
