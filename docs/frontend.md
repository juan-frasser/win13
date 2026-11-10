# Frontend

Next.js 16 (App Router) y React 19, sin librerías de UI: estilos en `app/globals.css`. Todas las páginas son componentes de cliente que consumen la API REST.

## Rutas
| Ruta | Rol | Contenido |
|---|---|---|
| `/` | público | Inicio de sesión; redirige al panel según el rol |
| `/registro` | público | Alta de estudiante o empresa |
| `/estudiante` | ESTUDIANTE | Búsqueda con filtros, postulación y tabla de seguimiento (avisa si la vacante fue cerrada) |
| `/empresa` | EMPRESA | Publicar vacante, ver su estado de auditoría, desactivar/reactivar, gestionar candidatos |
| `/admin` | ADMIN | Pestañas: vacantes por auditar, estudiantes y empresas (crear, editar, activar/desactivar, restablecer clave) |

## Código
| Archivo | Función |
|---|---|
| `lib/api.ts` | `api()` agrega el JWT, serializa JSON y convierte errores del backend en `Error` con el mensaje; manejo de la sesión en `localStorage` |
| `lib/useSesion.ts` | Hook que exige el rol de la pantalla y redirige al login si no coincide; entrega `salir()` |
| `app/Encabezado.tsx` | Barra superior con cierre de sesión |
| `app/admin/Gestion.tsx` | Componente genérico de administración de perfiles, configurado por `ESTUDIANTES` / `EMPRESAS` (campos y ruta) |

## Sesión
Al iniciar sesión se guarda `{ accessToken, rol }` en `localStorage` (clave `sesion`). El control de acceso real está en el backend; `useSesion` es solo una guía de navegación. Ver [seguridad.md](seguridad.md) sobre el riesgo de `localStorage`.

## Configuración
`NEXT_PUBLIC_API_URL` (por defecto `http://localhost:3001`). El backend acepta CORS solo desde `FRONTEND_URL` (por defecto `http://localhost:3000`).
