# 🌿 Raíces para Florecer — Mejoras de Frontend Implementadas

> **Fecha:** 16 de julio de 2026
> **Proyecto:** raices-frontend
> **Versión:** 0.1.0

---

## 📑 Índice

1. [Resumen General](#1-resumen-general)
2. [Autenticación y Sesión](#2-autenticación-y-sesión)
3. [Accesibilidad (A11y)](#3-accesibilidad-a11y)
4. [Diseño Responsivo](#4-diseño-responsivo)
5. [Sistema de Componentes](#5-sistema-de-componentes)
6. [Páginas Implementadas](#6-páginas-implementadas)
7. [Hooks y Estado](#7-hooks-y-estado)
8. [Estilos y Diseño Visual](#8-estilos-y-diseño-visual)
9. [Funcionalidades Clave](#9-funcionalidades-clave)
10. [Mejoras por Commit](#10-mejoras-por-commit)

---

## 1. Resumen General

La aplicación frontend de **Raíces para Florecer** ha sido construida con un enfoque en:

- ✅ **Accesibilidad excepcional** (WCAG 2.1 AA)
- ✅ **Diseño responsivo** para múltiples breakpoints
- ✅ **Experiencia de usuario pulida** con estados de carga, vacíos y errores
- ✅ **Arquitectura limpia** con hooks, stores y componentes bien organizados

### Métricas del Proyecto

| Métrica | Cantidad |
|---------|----------|
| Páginas | 12 |
| Componentes compartidos | 12+ |
| Custom hooks | 50+ |
| Iconos SVG | 30+ |
| Líneas de código (aprox.) | ~4,500 |
| Rutas | 13 |

---

## 2. Autenticación y Sesión

### 2.1 Login y Registro Multi-Paso

| Mejora | Descripción |
|--------|-------------|
| **Registro en 3 pasos** | Selección de rol → Datos personales → Verificación |
| **Barra de progreso** | Indicador visual del paso actual (1/3, 2/3, 3/3) |
| **Selección de rol visual** | Tarjetas clickeables con icono, título y descripción |
| **Validación por paso** | Botón "Continuar" deshabilitado si faltan campos requeridos |
| **Mostrar/Ocultar contraseña** | Toggle con aria-label y aria-pressed |

### 2.2 "Recordarme" (Remember Me)

| Mejora | Descripción |
|--------|-------------|
| **Checkbox funcional** | "Mantener sesión iniciada" en el formulario de login |
| **Dual storage** | `localStorage` si Remember Me = true, `sessionStorage` si = false |
| **Persistencia de preferencia** | La preferencia se guarda siempre en localStorage para recordar el estado del checkbox |
| **Limpieza completa en logout** | `clearAllAuth()` limpia ambos storages (localStorage + sessionStorage) |

### 2.3 Redirección por Rol

| Rol | Redirección post-login |
|-----|------------------------|
| `admin` | `/admin` |
| `institution` | `/institution-portal` |
| Otros (`pcd`, `tutor`) | `/dashboard` |

### 2.4 Cuentas de Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Persona con discapacidad | `demo@raices.mx` | `Demo1234` |
| Tutor o familiar | `tutor@raices.mx` | `Tutor1234` |
| Administrador | `admin@raices.mx` | `Admin1234` |

---

## 3. Accesibilidad (A11y)

### Nivel de Cumplimiento: ⭐⭐⭐⭐ Excepcional

### 3.1 Componente AccessibilityBar

Panel flotante con las siguientes opciones:

| Característica | Estado | Descripción |
|----------------|--------|-------------|
| **Escalado de texto** | ✅ | Tamaños `lg` (1.15x) y `xl` (1.32x) vía CSS `zoom` |
| **Alto contraste** | ✅ | Reescribe variables CSS para mayor contraste |
| **Lectura fácil** | ✅ | Interlineado 1.75, espaciado de letras, sin cursiva |
| **Reducir movimiento** | ✅ | Deshabilita animaciones y transiciones |
| **Modo daltónico** | ✅ | 3 tipos: deuteranopia, protanopia, tritanopia vía SVG filters |
| **TTS (Text-to-Speech)** | ✅ | Lee elementos al hacer hover/focus |

### 3.2 Skip to Content

```html
<a href="#main" class="skip-link">Saltar al contenido principal</a>
```

- Oculto hasta recibir foco con Tab
- Posicionado fijo arriba-izquierda con z-index alto

### 3.3 RouteFocus

```jsx
function RouteFocus() {
  // Al cambiar de ruta, lleva foco al <main> y sube scroll
  // Clave para lectores de pantalla
}
```

### 3.4 ARIA Labels y Roles

| Elemento | Atributos ARIA |
|----------|----------------|
| Botones de toggle | `aria-pressed` |
| Barras de progreso | `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |
| Mensajes de error | `role="alert"`, `aria-live="assertive"` |
| Toast notifications | `aria-live="polite"`, `aria-atomic="false"` |
| Sidebar navegación | `aria-label="Navegación principal"` |
| Panel admin | `aria-label="Panel de administración"` |
| Iconos decorativos | `aria-hidden="true"`, `focusable="false"` |
| Botones expandible | `aria-expanded`, `aria-haspopup` |
| Campos de contraseña | `aria-label="Mostrar/Ocultar contraseña"` |

### 3.5 Foco Visible

```css
:focus-visible {
  box-shadow: 0 0 0 3px var(--bg-surface), 0 0 0 6px var(--primary);
}
```

- Anillo de foco consistente en toda la app
- Mínimo 48px de área táctil en botones

### 3.6 Live Regions

```jsx
// Toast notifications
<div aria-live="polite" aria-atomic="false">

// Errores de formulario
<div role="alert" aria-live="assertive">
```

---

## 4. Diseño Responsivo

### 4.1 Breakpoints

| Breakpoint | Rango | Sidebar | Main Padding |
|------------|-------|---------|--------------|
| **Desktop Large** | ≥1400px | 88px | 40px 56px |
| **Desktop** | 1200-1399px | 88px | 36px 48px |
| **Laptop** | 992-1199px | 88px | 28px 32px |
| **Small Laptop** | 768-991px | 72px | 24px 24px |

### 4.2 Clases CSS Responsivas

| Clase | Descripción |
|-------|-------------|
| `.responsive-sidebar` | Sidebar fijo con transición de ancho |
| `.responsive-main` | Contenido principal con margin-left dinámico |
| `.responsive-topnav` | Header sticky responsivo |
| `.responsive-header` | Flexbox con wrap para headers |
| `.responsive-grid-cards` | Grid auto-fill con minmax(280px, 1fr) |
| `.responsive-footer-grid` | Grid de 3 columnas → 2 → 1 |
| `.grid-2-responsive` | Grid de 2 columnas → 1 |
| `.grid-3-responsive` | Grid de 3 columnas → 2 → 1 |
| `.grid-sidebar-main` | Layout sidebar + contenido |

### 4.3 Adaptaciones por Breakpoint

| Componente | ≥1200px | 992-1199px | 768-991px |
|------------|---------|------------|-----------|
| Sidebar | 88px | 88px | 72px |
| Grid cards | 3 cols | 2-3 cols | 1-2 cols |
| Footer grid | 3 cols | 2 cols | 2 cols |
| Admin sidebar | Completo | Completo | 64px (sin texto) |
| Onboarding | Split layout | Split (30% sidebar) | Stack vertical |

---

## 5. Sistema de Componentes

### 5.1 shared.jsx — Componentes Reutilizables

| Componente | Descripción |
|------------|-------------|
| `Icons` | 30+ iconos SVG inline con estilo consistente |
| `AppSidebar` | Sidebar lateral de 88px con navegación por iconos |
| `TopNav` | Header sticky con BrandMark + usuario + logout |
| `BrandMark` | Logo texto "Raíces para florecer." |
| `AppFooter` | Footer completo con gradientes |
| `CategoryTag` | Badge de categoría con color |
| `CATEGORY_COLORS` | Mapa de colores por categoría |

### 5.2 Iconos Disponibles (30+)

```
home, search, heart, message, user, sparkles, shield, users, activity,
mapPin, star, arrowRight, arrowLeft, building, brain, briefcase, graduationCap,
target, check, chevronDown, chevronUp, plus, trash, edit, eye, eyeOff,
heartPulse, globe, bell, settings, logout, menu, x, upload, download,
filter, grid, list, calendar, clock, phone, mail, externalLink, copy
```

### 5.3 Otros Componentes

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| `ProtectedRoute` | ProtectedRoute.jsx | Guard: redirect si no token o rol no coincide |
| `ToastContainer` | Toast.jsx | Container fijo abajo-izquierda, auto-dismiss 4s |
| `AccessibilityBar` | AccessibilityBar.jsx | Panel flotante de accesibilidad |
| `NotificationBell` | NotificationBell.jsx | Badge + dropdown notificaciones SSE |
| `MapView` | MapView.jsx | MapLibre GL con markers y popups |

---

## 6. Páginas Implementadas

### 6.1 Landing Page (`/`)

| Mejora | Estado |
|--------|--------|
| Hero con título, subtítulo y CTAs | ✅ |
| Sección de 6 categorías con iconos | ✅ |
| Sección de 4 features/beneficios | ✅ |
| CTA inferior con gradiente | ✅ |
| Redirección automática si autenticado | ✅ |
| Topbar con navegación | ✅ |
| Footer completo | ✅ |
| Hover effects en tarjetas de categoría | ✅ |

### 6.2 Auth Page (`/auth`)

| Mejora | Estado |
|--------|--------|
| Login con email/contraseña | ✅ |
| Registro multi-paso (3 pasos) | ✅ |
| Selección de rol con tarjetas visuales | ✅ |
| Barra de progreso del registro | ✅ |
| Mostrar/Ocultar contraseña | ✅ |
| Checkbox "Recordarme" | ✅ |
| Cuentas de demo clickeables | ✅ |
| Mensajes de error con aria-live | ✅ |
| Link a modo login/registro | ✅ |

### 6.3 Onboarding Page (`/onboarding`)

| Mejora | Estado |
|--------|--------|
| 6 pasos de profiling | ✅ |
| Layout split (sidebar + contenido) | ✅ |
| Progreso visual | ✅ |
| Guardar en backend | ✅ |

### 6.4 Dashboard Page (`/dashboard`)

| Mejora | Estado |
|--------|--------|
| Banner de progreso de perfil | ✅ |
| Barra de progreso animada | ✅ |
| Recomendaciones IA | ✅ |
| Instituciones favoritas | ✅ |
| Grid responsivo de tarjetas | ✅ |

### 6.5 Explore Page (`/explore`)

| Mejora | Estado |
|--------|--------|
| Vista pública (guest) con cards borrosas | ✅ |
| Overlay de registro sobre contenido | ✅ |
| Búsqueda con debounce (400ms) | ✅ |
| Filtros por categoría (pills) | ✅ |
| 3 vistas: Grid, Lista, Mapa | ✅ |
| Toggle de favoritos | ✅ |
| Paginación "Ver más" | ✅ |
| Skeleton loading states | ✅ |
| Empty state con CTA | ✅ |
| Error state | ✅ |
| Header sticky con blur (guest) | ✅ |

### 6.6 Institution Page (`/institution/:id`)

| Mejora | Estado |
|--------|--------|
| Header con información | ✅ |
| Mapa embebido | ✅ |
| Chat IA | ✅ |
| Reseñas con estrellas | ✅ |
| Formulario de reseña | ✅ |

### 6.7 Favorites Page (`/favorites`)

| Mejora | Estado |
|--------|--------|
| Grid de instituciones guardadas | ✅ |
| Toggle para quitar favorito | ✅ |
| Estado vacío con CTA | ✅ |

### 6.8 Social Page (`/social`)

| Mejora | Estado |
|--------|--------|
| Dos tabs: Comunidad + Mensajes | ✅ |
| Feed de posts con likes | ✅ |
| Comentarios | ✅ |
| Chat con polling (8s) | ✅ |
| Conversaciones (polling 15s) | ✅ |

### 6.9 Jobs Page (`/jobs`)

| Mejora | Estado |
|--------|--------|
| Dos tabs: Vacantes + Mis solicitudes | ✅ |
| Filtros por modalidad | ✅ |
| Postularme con carta de presentación | ✅ |
| Estados de postulación | ✅ |

### 6.10 Profile Page (`/profile`)

| Mejora | Estado |
|--------|--------|
| Header con avatar | ✅ |
| Stats del usuario | ✅ |
| Edición inline | ✅ |
| Perfil de necesidades | ✅ |

### 6.11 Tutor Page (`/familia`)

| Mejora | Estado |
|--------|--------|
| CRUD de dependientes | ✅ |
| Tarjetas con información | ✅ |
| Recomendaciones IA expandible | ✅ |
| Modal de agregar/editar | ✅ |
| Diálogo de confirmación para eliminar | ✅ |

### 6.12 Admin Page (`/admin`)

| Mejora | Estado |
|--------|--------|
| 7 sub-tabs | ✅ |
| Overview con KPIs | ✅ |
| Inteligencia de demanda vs oferta | ✅ |
| Gestión de instituciones | ✅ |
| Gestión de usuarios | ✅ |
| Gestión de reseñas | ✅ |
| Alertas | ✅ |
| Configuración | ✅ |
| Sidebar responsivo (oculta texto en mobile) | ✅ |

---

## 7. Hooks y Estado

### 7.1 Stores Zustand

| Store | Persist | Descripción |
|-------|---------|-------------|
| `authStore` | ✅ `raices_auth` | Token, refreshToken, user, setAuth(), logout() |
| `uiStore` | ❌ | toasts[], addToast(), removeToast() |
| `a11yStore` | ✅ `raices_a11y` | textScale, highContrast, easyRead, reducedMotion, ttsEnabled, colorblindMode |

### 7.2 Custom Hooks (50+)

| Categoría | Hooks |
|-----------|-------|
| **Auth** | useLogin, useRegister, useMe, useProfile, useUpdateProfile |
| **Instituciones** | useInstitutions, useInstitution, useDiscovery |
| **Favoritos** | useFavorites, useFavoriteIds, useToggleFavorite |
| **Comunidad** | useGroups, usePosts, useCreatePost, useComments, useCreateComment, useToggleLike |
| **Mensajes** | useConversations, useMessages, useSendMessage, useUnreadCount |
| **Notificaciones** | useNotifications, useMarkRead, useMarkAllRead, useNotificationStream |
| **Trabajos** | useJobs, useJob, useAppliedJobIds, useMyApplications, useApplyJob |
| **Reseñas** | useReviews, useMyReviews, useSubmitReview |
| **Dependientes** | useDependents, useAddDependent, useUpdateDependent, useDeleteDependent |
| **IA** | useChat, useAINextSteps, useAIForDependent |
| **Admin** | useAdminStats, useAdminAnalytics, useNeedsIntelligence, useAllInstitutions, usePendingInstitutions, useApproveInstitution, useRejectInstitution, useToggleVerifyInstitution, useAdminUsers, useToggleUserActive, useChangeUserRole, useAdminReviews, useDeleteReview, useAdminAlerts, useAdminSettings, useUpdateSettings |
| **Perfil** | useSaveProfiling |

### 7.3 Comunicación en Tiempo Real

| Canal | Método | Intervalo |
|-------|--------|-----------|
| Notificaciones | SSE (EventSource) | Tiempo real |
| Conversaciones | Polling | 15 segundos |
| Chat activo | Polling | 8 segundos |
| No leídos | Polling | 30 segundos |

---

## 8. Estilos y Diseño Visual

### 8.1 Variables CSS Principales

| Variable | Valor | Uso |
|----------|-------|-----|
| `--primary` | `#2B7A84` | Color primario (teal) |
| `--primary-dark` | `#1D5960` | Variante oscura |
| `--primary-subtle` | `rgba(43,122,132,0.12)` | Fondo sutil |
| `--bg-warm` | `#FBF7F0` | Fondo principal |
| `--bg-surface` | `#FFFFFF` | Superficies (cards) |
| `--fg1` | `#243434` | Texto principal |
| `--fg2` | `#4A5C5C` | Texto secundario (~7:1 contraste) |
| `--fg3` | `#5F7070` | Texto terciario (~4.6:1, WCAG AA) |

### 8.2 Paleta de Categorías

| Categoría | Color | Hex |
|-----------|-------|-----|
| Terapia | Teal | `#2B7A84` |
| Educación | Púrpura | `#8B6BAE` |
| Empleo | Ámbar | `#D4944C` |
| Comunidad | Cyan | `#4BA3A3` |
| Salud | Rosa | `#C4789A` |
| Recreación | Verde | `#7BA05B` |

### 8.3 Formas Características

- **Avatares:** `border-radius: 50% 50% 50% 14%` (forma orgánica/hoja)
- **Tags de categoría:** `border-radius: 16px 16px 16px 5px`
- **Botones:** `border-radius: var(--radius-pill)` (pill)

### 8.4 Animaciones

| Animación | Uso |
|-----------|-----|
| `slideUp` | Elementos al aparecer |
| `spin` | Loading spinners |
| `flowerPulse` | Efecto decorativo |
| `pulse` | Skeleton loading |
| Transiciones `0.2s ease` | Hover states, toggles |

### 8.5 Tipografía

| Fuente | Pesos | Uso |
|--------|-------|-----|
| **Inter** | 400, 600, 700, 800 | Cuerpo de texto |
| **Playfair Display** | 700 | Títulos / display |

---

## 9. Funcionalidades Clave

### 9.1 Toast Notifications

| Característica | Estado |
|----------------|--------|
| Posición: abajo-izquierda | ✅ |
| Auto-dismiss: 4 segundos | ✅ |
| Tipos: success, error, warning, info | ✅ |
| Cierre manual con botón X | ✅ |
| aria-live="polite" | ✅ |
| Animación de entrada | ✅ |

### 9.2 Skeleton Loading

| Página | Skeleton |
|--------|----------|
| Explore | Grid de 3 tarjetas skeleton |
| Dashboard | Grid de cards skeleton |
| Favorites | Grid de cards skeleton |

### 9.3 Empty States

| Página | Empty State |
|--------|-------------|
| Explore | "Sin resultados" con icono y sugerencia |
| Favorites | "Aún no tienes favoritos" con CTA |
| Social (posts) | "No hay publicaciones aún" |
| Jobs | "No hay vacantes disponibles" |

### 9.4 Error States

| Página | Error State |
|--------|-------------|
| Explore | "Ocurrió un error al cargar" con retry |
| General | Toast notifications con mensaje de error |

### 9.5 Búsqueda con Debounce

```javascript
// ExplorePage.jsx
function useDebounce(value, delay) {
  // Debounce de 400ms para no saturar la API
}
```

---

## 10. Mejoras por Commit

### Commit: `168ecdd` — Registro y Refresh Token

- ✅ Implementación de endpoint de registro
- ✅ Consumo de endpoint de refresh token
- ✅ Integración con authStore

### Commit: `d02fa2e` — Navegación y Responsividad

- ✅ Actualización de páginas Community y Explore para redirección correcta
- ✅ **Diseño responsivo en todos los archivos .jsx**
- ✅ Documentación: `FLUJO_DE_PANTALLAS.md` y `MEJORAS_POR_PAGINA.md`
- ✅ Estilos globales CSS significativos

### Commit: `ca4b462` — Remember Me y Limpieza de Token

- ✅ Checkbox "Recordarme" funcional
- ✅ Corrección: tokens se limpian correctamente al cerrar sesión
- ✅ Dual storage (localStorage/sessionStorage)

### Commit: `69a3339` — Login Exitoso

- ✅ Funcionalidad de login verificada
- ✅ Actualizaciones a AuthPage y authStore

---

## 📊 Resumen de Estado

| Categoría | Estado |
|-----------|--------|
| Autenticación | ✅ Completa |
| Accesibilidad | ✅ Excepcional |
| Responsividad | ✅ Implementada |
| Componentes | ✅ Reutilizables |
| Páginas | ✅ 12/12 implementadas |
| Hooks | ✅ 50+ hooks |
| Estados de UI | ✅ Loading, Empty, Error |
| Notificaciones | ✅ Toast + SSE |
| IA | ✅ Chat + Recomendaciones |
| Admin | ✅ Panel completo |

---

*Documento generado el 16 de julio de 2026 para el proyecto Raíces Frontend.*
