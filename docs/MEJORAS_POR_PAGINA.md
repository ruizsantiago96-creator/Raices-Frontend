# 🌿 Raíces — Mejoras Sugeridas por Página

> Documento de backlog de mejoras organizadas por página. Prioridad: 🔴 Alta | 🟡 Media | 🟢 Baja

---

## 1. Landing Page (`/`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 1.1 | **Redirección de "Explorar"** | 🔴 | Los botones "Explorar", "Comunidad" y las categorías llevan a `/explore` que es ruta protegida. Deberían redirigir a `/auth?mode=register` o mostrar una vista pública con CTA |
| 1.2 | **Topbar responsive** | 🟡 | En laptops pequeñas (~992px) los nav items y botones de auth se desbordan. Agregar `flexWrap` o menú hamburguesa |
| 1.3 | **Animaciones de entrada** | 🟢 | Agregar animaciones fade-in/slide-up al hero y secciones al hacer scroll (intersection observer) |
| 1.4 | **Testimonios** | 🟢 | Agregar sección de testimonios de usuarios reales entre Funcionalidades y CTA inferior |
| 1.5 | **Contadores animados** | 🟢 | Agregar contadores animados: "500+ instituciones", "10,000+ usuarios", "50+ ciudades" |
| 1.6 | **SEO y meta tags** | 🟡 | Agregar título, descripción y Open Graph tags en `index.html` |
| 1.7 | **Dark mode** | 🟢 | Soporte para modo oscuro usando los tokens CSS existentes |

---

## 2. Auth Page (`/auth`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 2.1 | **Recuperar contraseña** | 🔴 | No hay funcionalidad de "Olvidé mi contraseña". Agregar flujo de reset por email |
| 2.2 | **Validación en tiempo real** | 🟡 | Mostrar errores de validación mientras el usuario escribe (email inválido, contraseña corta) |
| 2.3 | **OAuth / Social Login** | 🟡 | Agregar login con Google para reducir fricción |
| 2.4 | **Animación de transición** | 🟢 | Animación suave al cambiar entre modo login y registro |
| 2.5 | **Mostrar fortaleza de contraseña** | 🟡 | Barra de progreso que muestra qué tan segura es la contraseña en el registro |

---

## 3. Onboarding Page (`/onboarding`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 3.1 | **Guardar progreso parcial** | 🔴 | Si el usuario cierra el navegador, pierde todo. Guardar en localStorage o backend |
| 3.2 | **Saltar pasos** | 🟡 | Permitir saltar pasos opcionales sin perder el progreso de los demás |
| 3.3 | **Validación por paso** | 🟡 | Validar campos requeridos antes de avanzar al siguiente paso |
| 3.4 | **Resumen antes de enviar** | 🟢 | Pantalla de resumen en el paso 6 antes de finalizar |
| 3.5 | **Perfiles pre-cargados** | 🟢 | Sugerir opciones basadas en el rol seleccionado en el paso 1 |

---

## 4. Dashboard Page (`/dashboard`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 4.1 | **Notificaciones push** | 🟡 | Implementar notificaciones push para mensajes y actualizaciones |
| 4.2 | **Widget de actividad reciente** | 🟡 | Mostrar últimas interacciones: posts liked, instituciones guardadas, mensajes |
| 4.3 | **Calendario de citas** | 🟢 | Widget que muestre próximas citas con instituciones |
| 4.4 | **Exportar datos** | 🟢 | Botón para exportar perfil y datos en PDF/CSV |
| 4.5 | **Onboarding tooltips** | 🟢 | Tooltips que guíen al usuario nuevo por las funcionalidades del dashboard |

---

## 5. Explore Page (`/explore`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 5.1 | **Vista pública** | 🔴 | Crear una versión pública de esta página para usuarios no autenticados (con instituciones destacadas y CTA) |
| 5.2 | **Filtros avanzados** | 🟡 | Agregar filtros por: precio, distancia, tipos de discapacidad, horarios |
| 5.3 | **Ordenamiento** | 🟡 | Opciones de orden: relevance, rating, distancia, nombre |
| 5.4 | **Comparar instituciones** | 🟢 | Funcionalidad para seleccionar 2-3 instituciones y verlas lado a lado |
| 5.5 | **Guardar búsqueda** | 🟢 | Guardar filtros frecuentes como "búsquedas guardadas" |
| 5.6 | **Vista de mapa mejorada** | 🡆 | Popups con info resumida al hacer click en marcadores del mapa |

---

## 6. Social Page (`/social`) — COMUNIDAD

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 6.1 | **Crear grupo** | 🔴 | Los usuarios deberían poder crear nuevos grupos de comunidad |
| 6.2 | **Unirse a grupo** | 🔴 | Botón para unirse/salir de grupos |
| 6.3 | **Imágenes en posts** | 🟡 | Permitir adjuntar imágenes a las publicaciones |
| 6.4 | **Mencionar usuarios** | 🟡 | Sistema de @mentions para notificar a otros usuarios |
| 6.5 | **Notificaciones de mensajes** | 🔴 | Badge en sidebar y sonido/notificación al recibir mensaje nuevo |
| 6.6 | **Buscar en聊天** | 🟡 | Barra de búsqueda dentro de las conversaciones |
| 6.7 | **Emojis/reacciones** | 🟢 | Agregar reacciones con emojis además del like |
| 6.8 | **Editar/eliminar posts** | 🟡 | Permitir al autor editar o eliminar sus propios posts |
| 6.9 | **Paginación del feed** | 🟡 | Infinite scroll o paginación para el feed de posts |
| 6.10 | **Perfil al hacer click** | 🟢 | Click en nombre/avatar de autor abre un mini-perfil o su perfil completo |

---

## 7. Favorites Page (`/favorites`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 7.1 | **Organizar en carpetas** | 🟢 | Permitir crear carpetas/categorías para organizar favoritos |
| 7.2 | **Exportar lista** | 🟢 | Compartir o exportar la lista de instituciones guardadas |
| 7.3 | **Notificar cambios** | 🟢 | Notificar cuando una institución guardada actualiza su información |

---

## 8. Institution Page (`/institution/:id`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 8.1 | **Agendar cita** | 🔴 | Botón para agendar una cita/visita directamente desde la página |
| 8.2 | **Galería de fotos** | 🟡 | Carrusel de fotos de la institución |
| 8.3 | **Horarios** | 🟡 | Sección de horarios de atención |
| 8.4 | **Servicios detallados** | 🟡 | Lista de servicios específicos con descripción y precios |
| 8.5 | **Compartir** | 🟢 | Botón para compartir por WhatsApp, email, copiar link |
| 8.6 | **Preguntas frecuentes** | 🟢 | Sección de FAQ específica de la institución |
| 8.7 | **Reseñas verificadas** | 🟡 | Badge para indicar que la reseña es de un usuario que visitó la institución |

---

## 9. Profile Page (`/profile`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 9.1 | **Foto de perfil** | 🔴 | Permitir subir y recortar foto de perfil |
| 9.2 | **Cambiar contraseña** | 🔴 | Opción para cambiar la contraseña desde el perfil |
| 9.3 | **Eliminar cuenta** | 🟡 | Flujo de eliminación de cuenta con confirmación |
| 9.4 | **Historial de actividad** | 🟢 | Timeline de actividad reciente del usuario |
| 9.5 | **Preferencias de notificación** | 🟡 | Configurar qué notificaciones recibir (email, push, in-app) |

---

## 10. Tutor / Familia Page (`/familia`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 10.1 | **Perfiles independientes** | 🟡 | Cada dependiente debería tener su propio perfil completo con historial |
| 10.2 | **Seguimiento de progreso** | 🟡 | Gráfico de progreso de cada dependiente (terapias, logros) |
| 10.3 | **Documentos** | 🟢 | Subir y guardar documentos médicos por dependiente |
| 10.4 | **Recordatorios** | 🟢 | Alertas/recordatorios para citas médicas o terapias |

---

## 11. Jobs Page (`/jobs`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 11.1 | **Alertas de empleo** | 🟡 | Notificar cuando se publica una vacante que coincide con el perfil |
| 11.2 | **Perfil profesional** | 🟡 | Sección para crear un CV/perfil profesional dentro de la plataforma |
| 11.3 | **Seguimiento de postulaciones** | 🟡 | Timeline detallado del estado de cada postulación |
| 11.4 | **Recomendaciones IA** | 🟢 | Sugerir empleos basados en el perfil de necesidades y objetivos |
| 11.5 | **Simulador de entrevista** | 🟢 | Herramienta IA para practicar entrevistas laborales |

---

## 12. Admin Page (`/admin`)

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| 12.1 | **Exportar reportes** | 🟡 | Generar PDFs/CSVs de las gráficas y datos |
| 12.2 | **Filtros de fecha** | 🟡 | Filtrar métricas por rango de fechas |
| 12.3 | **Gestión de contenido** | 🟢 | CRUD para gestionar grupos, categorías y configuración de la plataforma |
| 12.4 | **Audit log** | 🟡 | Registro de todas las acciones administrativas realizadas |
| 12.5 | **Dashboard en tiempo real** | 🟢 | Actualización automática de métricas sin recargar |
| 12.6 | **Gestión de alertas** | 🟡 | Configurar reglas para alertas automáticas |

---

## 🔧 Mejoras Transversales

| # | Mejora | Prioridad | Descripción |
|---|--------|-----------|-------------|
| T.1 | **Testing E2E** | 🔴 | Agregar tests end-to-end con Playwright o Cypress para los flujos críticos |
| T.2 | **Error boundaries** | 🔴 | Componentes ErrorBoundary en cada ruta para capturar errores de rendering |
| T.3 | **Loading states consistentes** | 🟡 | Unificar los skeleton loaders en un componente compartido |
| T.4 | **PWA** | 🟢 | Convertir en Progressive Web App con service worker para offline |
| T.5 | **Internacionalización (i18n)** | 🟢 | Soporte para múltiples idiomas (inglés para start) |
| T.6 | **Analytics** | 🟡 | Integrar analytics para medir uso de funcionalidades |
| T.7 | **Performance** | 🟡 | Lazy loading de rutas, code splitting, optimización de imágenes |
| T.8 | **Accesibilidad audit** | 🟡 | Auditoría completa de accesibilidad WCAG 2.1 AA |

---

*Documento generado el 14 de julio de 2026 para el proyecto Raíces Frontend.*
