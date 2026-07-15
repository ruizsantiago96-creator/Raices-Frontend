# 🌿 Raíces — Flujo de Pantallas

> Documentación del ecosistema digital para personas con discapacidad, tutores y familias.

---

## 📊 Diagrama General de Flujo

```
┌─────────────────────────────────────────────────────────────────────┐
│                         LANDING PAGE (/)                            │
│         Hero · Categorías · Funcionalidades · CTA                  │
└─────────┬───────────────────────────────────────────┬───────────────┘
          │                                           │
          │ "Explorar" ──────────────────────────────►│
          │ (⚠️ BUG: debería redirigir a /auth)       │
          │                                           ▼
          │                              ┌─────────────────────────────┐
          │                              │   COMUNIDAD (/social)       │
          │                              │   (⚠️ requiere login)       │
          │                              │   Feed · Grupos · Chat      │
          │                              └─────────────────────────────┘
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      AUTH PAGE (/auth)                              │
│            Login · Registro (3 pasos) · Cuentas demo               │
└─────────┬───────────────────────────────────────────────────────────┘
          │ Login exitoso                │ Registro exitoso
          ▼                              ▼
┌─────────────────────┐     ┌─────────────────────────────────────────┐
│  DASHBOARD          │     │        ONBOARDING (/onboarding)         │
│  (/dashboard)       │     │    6 pasos de profiling personalizado   │
│  o                  │     └─────────────────┬───────────────────────┘
│  ADMIN (/admin)     │                       │
│  (según rol)        │◄──────────────────────┘
└─────────┬───────────┘
          │
          ├──► EXPLORE (/explore) ──► INSTITUCIÓN (/institution/:id)
          ├──► SOCIAL (/social) ──► Posts / Mensajes Directos
          ├──► FAVORITOS (/favorites) ──► INSTITUCIÓN (/institution/:id)
          ├──► PERFIL (/profile) ──► ONBOARDING
          ├──► FAMILIA (/familia) ──► Agregar/Editar dependientes
          ├──► EMPLEO (/jobs) ──► Postularme / Mis solicitudes
          └──► ADMIN (/admin) ──► Panel administrativo completo
```

---

## ⚠️ BUGS CONOCIDOS

### Bug: "Explorar" desde Landing no redirige a registro

| Aspecto | Detalle |
|---------|---------|
| **Ubicación** | `LandingPage.jsx` → botón "Explorar" en topbar |
| **Ruta destino** | `/explore` (ruta protegida) |
| **Comportamiento actual** | Al hacer click, el usuario llega a una página en blanco o sin contenido |
| **Comportamiento esperado** | Debería redirigir a `/auth?mode=register` (o mostrar un preview público de instituciones + CTA de registro) |
| **Causa probable** | `ProtectedRoute` redirige a `/auth`, pero la Landing llama `nav('/explore')` directamente sin verificar autenticación |

**Opciones de fix:**
1. **Rápida:** Cambiar `nav('/explore')` por `nav('/auth?mode=register')` en la Landing
2. **Mejor:** Crear una vista pública parcial de `/explore` con instituciones destacadas y un CTA de registro
3. **Intermedia:** En la Landing, si no hay token, redirigir a auth; si hay token, a explore

---

## 📄 Detalle por Pantalla

### 1. Landing Page (`/`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/` |
| **Autenticación** | No requerida (pública) |
| **Componente** | `LandingPage.jsx` |

**Contenido:**
- **Topbar fija:** Logo "Raíces", botones "Explorar", "Comunidad", "Iniciar sesión", "Registrarse"
- **Hero:** Título "Encontramos tu camino hacia florecer", subtítulo, CTAs "Comenzar gratis" y "Ver instituciones"
- **Categorías:** 6 tarjetas clickeables (Salud, Educación, Empleo, Comunidad, Terapia, Vida independiente)
- **Funcionalidades:** 4 tarjetas (Recomendaciones IA, Confianza, Familia, Progreso)
- **CTA inferior:** Botón "Crear mi cuenta"
- **Footer:** Links de navegación, copyright

**Navegación saliente:**
| Botón/Elemento | Destino | Notas |
|----------------|---------|-------|
| "Explorar" (topbar) | `/explore` | ⚠️ BUG: debería ir a auth o mostrar preview |
| "Comunidad" (topbar) | `/social` | ⚠️ BUG: requiere auth, debería ir a auth |
| "Iniciar sesión" | `/auth` | ✅ Correcto |
| "Registrarse" | `/auth?mode=register` | ✅ Correcto |
| Categoría (click) | `/explore?category={nombre}` | ⚠️ BUG: requiere auth |
| "Comenzar gratis" | `/auth?mode=register` | ✅ Correcto |
| "Ver instituciones" | `/explore` | ⚠️ BUG: requiere auth |

**Condición especial:** Si el usuario ya tiene token, redirige automáticamente a `/dashboard` (o `/admin` si es admin).

---

### 2. Auth Page (`/auth`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/auth` |
| **Autenticación** | No requerida |
| **Componente** | `AuthPage.jsx` |

**Contenido:**
- **Logo** clickeable (vuelve a `/`)
- **Modo Login:**
  - Formulario: Email + Contraseña + "Mantener sesión"
  - Cuentas de demostración (3): PCD, Tutor, Admin
  - Link a registro
- **Modo Registro (3 pasos):**
  - Paso 1: Selección de rol (PCD, Tutor, Institución)
  - Paso 2: Nombre, email, contraseña
  - Paso 3: Carga de identificación (opcional en demo)

**Navegación saliente:**
| Acción | Destino |
|--------|---------|
| Login exitoso (PCD/Tutor) | `/dashboard` |
| Login exitoso (Admin) | `/admin` |
| Registro exitoso | `/onboarding` |
| Logo | `/` |
| "Regístrate aquí" | Cambia a modo register |
| "Inicia sesión" | Cambia a modo login |

---

### 3. Onboarding Page (`/onboarding`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/onboarding` |
| **Autenticación** | Requerida (ProtectedRoute) |
| **Componente** | `OnboardingPage.jsx` |

**Contenido:**
Wizard de 6 pasos con panel lateral de progreso:

| Paso | Título | Contenido |
|------|--------|-----------|
| 1 | Datos generales | Rol, edad, ciudad |
| 2 | Condición y necesidades | Tipo de discapacidad, nivel de apoyo, necesidades |
| 3 | Etapa de vida | 6 opciones de etapa |
| 4 | Historial y recorrido | Educación, terapias, experiencia laboral/social |
| 5 | Tus objetivos | Checkboxes de metas |
| 6 | Estado actual | Campos de texto libre |

**Navegación saliente:**
| Acción | Destino |
|--------|---------|
| "Completar después" (paso 1) | `/dashboard` |
| Finalizar perfil | `/dashboard` |
| Logo | `/dashboard` |

---

### 4. Dashboard Page (`/dashboard`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/dashboard` |
| **Autenticación** | Requerida |
| **Componente** | `DashboardPage.jsx` |

**Contenido:**
- **Saludo personalizado** con avatar e inicial
- **Campana de notificaciones**
- **Banner de perfil incompleto** (con link a `/onboarding`)
- **Panel de Análisis IA:** Próximos pasos personalizados + sugerencias de instituciones
- **Recomendaciones para ti:** Grid de 6 tarjetas de instituciones

**Navegación saliente:**
| Elemento | Destino |
|----------|---------|
| Sidebar: Dashboard | `/dashboard` |
| Sidebar: Explorar | `/explore` |
| Sidebar: Comunidad | `/social` |
| Sidebar: Favoritos | `/favorites` |
| Sidebar: Mi Familia | `/familia` |
| Sidebar: Empleo | `/jobs` |
| Sidebar: Perfil | `/profile` |
| "Completar ahora" | `/onboarding` |
| "Ver todas" (recomendaciones) | `/explore` |
| Institución (click) | `/institution/:id` |
| Sugerencia IA (click) | `/explore?category=...` |

---

### 5. Explore Page (`/explore`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/explore` |
| **Autenticación** | Requerida |
| **Componente** | `ExplorePage.jsx` |

**Contenido:**
- **Barra de búsqueda** (debounced, busca por nombre, servicio, ciudad)
- **Filtros por categoría:** Pills clickeables (Salud, Educación, Empleo, Comunidad, Terapia, Recreación)
- **Vistas:** Cuadrícula, Lista, Mapa (toggle)
- **Paginación:** "Ver más" con lazy loading (6 por página)
- **Tarjetas de institución:** Categoría, nombre, descripción corta, ubicación, rating, favorito
- **Estado vacío:** Mensaje "Sin resultados" con ícono de búsqueda
- **Estado de error:** Mensaje de error con opción de reintentar

**Navegación saliente:**
| Elemento | Destino |
|----------|---------|
| Sidebar | (mismos que Dashboard) |
| Institución (click "Ver más") | `/institution/:id` |
| Breadcrumb "Explorar" | `/explore` |

---

### 6. Social Page (`/social`) — COMUNIDAD

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/social` |
| **Autenticación** | Requerida |
| **Componente** | `SocialPage.jsx` |

#### Vista Comunidad (pestana "Comunidad")

**Layout:** Dos columnas — sidebar de grupos + feed principal

**Sidebar izquierda (260px):**
- Título "GRUPOS" con conteo
- Botón "Todos" (muestra todos los posts)
- Lista de grupos con:
  - Nombre del grupo
  - Número de miembros
  - Descripción corta
  - Highlight del grupo activo
- Scroll sticky (se queda fijo al hacer scroll)

**Columna principal:**

1. **Caja de composición:**
   - Avatar del usuario
   - Textarea: "¿Qué quieres compartir con la comunidad?"
   - Botón "Publicar" con ícono de envío

2. **Feed de publicaciones (posts):**
   Cada post contiene:
   - Avatar del autor (con imagen o inicial)
   - Nombre del autor
   - Tiempo relativo ("hace 2h", "hace 3d")
   - Nombre del grupo (si aplica)
   - Contenido del post (texto pre-wrap)
   - Barra de interacción:
     - ❤️ Like (corazón) + conteo
     - 💬 Comentarios (ícono) + conteo

3. **Sección de comentarios (expandible):**
   - Lista de comentarios con avatar, nombre, contenido, fecha
   - Input para nuevo comentario + botón enviar
   - Estado vacío: "Sin comentarios aún"

**Estados especiales:**
- **Cargando:** 3 skeleton cards con animación pulse
- **Sin posts:** Mensaje "Sé el primero en escribir en este grupo" con ícono y descripción
- **Sin grupos:** El sidebar muestra "Todos" como única opción

#### Vista Mensajes Directos (pestana "Mensajes directos")

**Layout:** Dos columnas — lista de conversaciones + panel de chat

**Panel izquierdo (260px):**
- Título "MENSAJES"
- Lista de conversaciones:
  - Avatar del partner (inicial)
  - Nombre del partner
  - Último mensaje (truncado)
  - Badge de mensajes no leídos (número en circle)
- Estado vacío: "Sin conversaciones aún. Escribe a alguien desde la comunidad."

**Panel de chat (derecha):**
- Header: Avatar + nombre del partner
- Área de mensajes:
  - Mensajes propios: fondo primario, alineados a la derecha
  - Mensajes del otro: fondo cálido, alineados a la izquierda
  - Timestamp en cada burbuja
  - Auto-scroll al último mensaje
- Input de envío:
  - Campo de texto: "Escribe un mensaje…"
  - Botón enviar circular
- Estado sin conversación seleccionada: "Selecciona una conversación para chatear"

**Navegación saliente:**
| Elemento | Destino |
|----------|---------|
| Sidebar | (mismos que Dashboard) |
| Tab "Comunidad" | Vista de feed |
| Tab "Mensajes directos" | Vista de chat |
| Grupo (click) | Filtra posts del grupo |
| Like (click) | Toggle like en post |
| Comentarios (click) | Expandir/contraer comentarios |
| Conversación (click) | Abrir chat |

---

### 7. Favorites Page (`/favorites`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/favorites` |
| **Autenticación** | Requerida |
| **Componente** | `FavoritesPage.jsx` |

**Contenido:**
- **Título:** "Instituciones guardadas"
- **Conteo:** Número de guardadas
- **Grid de tarjetas:** Categoría, nombre, ubicación, rating, botón quitar favorito (corazón lleno)
- **Estado vacío:** CTA "Explorar instituciones" con link a `/explore`

**Navegación saliente:**
| Elemento | Destino |
|----------|---------|
| Sidebar | (mismos que Dashboard) |
| "Explorar instituciones" | `/explore` |
| Institución (click "Ver más") | `/institution/:id` |

---

### 8. Institution Page (`/institution/:id`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/institution/:id` |
| **Autenticación** | Requerida |
| **Componente** | `InstitutionPage.jsx` |

**Contenido:**
- **Breadcrumb:** Explorar / {Nombre}
- **Tarjeta de encabezado:**
  - Categoría + badge Premium (si aplica)
  - Botón Guardar/Quitar favorito
  - Nombre, dirección, ubicación
  - Rating con estrellas + conteo de reseñas
  - Descripción completa
  - Tipos de discapacidad atendidos (chips)
  - Contacto: teléfono, email, sitio web
  - Mapa embebido (OpenStreetMap) + "Cómo llegar" (Google Maps)
- **Panel de Asistente IA:** Chat contextual sobre la institución
  - Mensajes de sugerencia: "¿Atienden TEA?", "¿Cuáles son sus horarios?"
  - Input para preguntas
- **Sección de Reseñas:**
  - Formulario: Estrellas interactivas (1-5) + textarea
  - Lista de reseñas de otros usuarios con avatar, nombre, fecha, rating, comentario

**Navegación saliente:**
| Elemento | Destino |
|----------|---------|
| Sidebar | (mismos que Dashboard) |
| "Explorar" (breadcrumb) | `/explore` |
| "Cómo llegar" | Google Maps (externo) |
| Sitio web | URL externa |

---

### 9. Profile Page (`/profile`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/profile` |
| **Autenticación** | Requerida |
| **Componente** | `ProfilePage.jsx` |

**Contenido:**
- **Tarjeta de encabezado:**
  - Avatar con iniciales + color hasheado
  - Nombre, badge de rol
  - Email, ubicación
  - Botón "Editar"
- **Estadísticas:** Tipos de discapacidad, perfil de necesidades, verificación
- **Formulario de edición** (inline): Nombre, ciudad, estado
- **Perfil de necesidades:**
  - Etapa de vida
  - Tipos de discapacidad
  - Modos de comunicación
  - Necesidades de movilidad
  - Link "Actualizar" → `/onboarding`
- **Estado sin profiling:** CTA "Completar ahora" → `/onboarding`

**Navegación saliente:**
| Elemento | Destino |
|----------|---------|
| Sidebar | (mismos que Dashboard) |
| "Actualizar" (perfil de necesidades) | `/onboarding` |

---

### 10. Tutor / Familia Page (`/familia`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/familia` |
| **Autenticación** | Requerida |
| **Componente** | `TutorPage.jsx` |

**Contenido:**
- **Header:** "Mi familia" + botón "Agregar persona"
- **Grid de tarjetas de dependientes:**
  - Avatar con iniciales + color hasheado
  - Nombre, relación, etapa de vida
  - Tipos de discapacidad (chips)
  - Notas
  - Botones: Recomendaciones IA, Editar, Eliminar
- **Panel de recomendaciones IA** (expandible por dependiente):
  - Próximos pasos personalizados
  - Razonamiento de la IA
- **Modal de formulario:** Nombre, relación, etapa, discapacidad, notas
- **Diálogo de confirmación** para eliminar

**Navegación saliente:**
| Elemento | Destino |
|----------|---------|
| Sidebar | (mismos que Dashboard) |

---

### 11. Jobs Page (`/jobs`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/jobs` |
| **Autenticación** | Requerida |
| **Componente** | `JobsPage.jsx` |

**Contenido:**
- **Header:** "Bolsa de Trabajo Inclusiva"
- **Tabs:** Vacantes | Mis solicitudes
- **Filtros de modalidad:** Todos, presencial, remoto, híbrido
- **Tarjetas de empleo:**
  - Título, institución (verificada), ubicación
  - Modalidad, horario, rango salarial
  - Badge "Empresa inclusiva para personas con discapacidad"
  - Botón "Postularme" / "Postulado"
  - Detalles expandibles: descripción, requisitos, discapacidades bienvenidas
- **Modal de postulación:** Carta de presentación (opcional)
- **Lista de solicitudes:** Estado (Enviada, En revisión, Aceptada, No seleccionado)

**Navegación saliente:**
| Elemento | Destino |
|----------|---------|
| Sidebar | (mismos que Dashboard) |

---

### 12. Admin Page (`/admin`)

| Aspecto | Detalle |
|---------|---------|
| **Ruta** | `/admin` |
| **Autenticación** | Requerida (rol admin) |
| **Componente** | `AdminPage.jsx` |

**Contenido:**
Panel administrativo con sidebar oscura y 7 secciones (tabs):

| Tab | Contenido |
|-----|-----------|
| **Resumen** | KPIs (usuarios, instituciones, reseñas, publicaciones), gráficas de barras y donas, top instituciones, cobertura geográfica |
| **Inteligencia** | Motor de necesidades: demanda vs oferta, insights automáticos, matriz de cobertura, necesidades más reportadas, objetivos de usuarios |
| **Instituciones** | Tabla de pendientes/todas, acciones: aprobar, verificar, eliminar |
| **Usuarios** | Tabla con búsqueda, filtros por rol, activar/desactivar, cambiar rol |
| **Reseñas** | Lista de reseñas, moderación (eliminar) |
| **Alertas** | Alertas de riesgo (crítica/media/info), filtros, acciones de navegación |
| **Configuración** | Settings de plataforma (nombre, email, toggles de features) |

**Navegación saliente:**
| Elemento | Destino |
|----------|---------|
| "Ir a app" (sidebar) | `/dashboard` |
| Alertas (acción) | Redirige a tab relevante |
| Top bar "Cerrar sesión" | `/` |

---

## 🔐 Rutas Protegidas

Las siguientes rutas requieren autenticación (envueltas en `ProtectedRoute`):

```
/onboarding
/dashboard
/explore
/social
/favorites
/institution/:id
/profile
/familia
/jobs
/admin
/institution-portal
```

Si el usuario no está autenticado, `ProtectedRoute` redirige a `/auth`.

---

## 🔄 Resumen de Flujo Principal

```
Visitante
    │
    ├──► Landing (/) ──► Auth (/auth)
    │                         │
    │                    ┌────┴────┐
    │                    │ Login   │ Register
    │                    │         │ (3 pasos)
    │                    │         │
    │                    ▼         ▼
    │              Dashboard   Onboarding (6 pasos)
    │                    │         │
    │                    ▼         ▼
    │              Dashboard ──────────
    │                    │
    ├──► Explorar ──► Institución ──► Reseñas / Chat IA
    │
    ├──► Comunidad ──► Posts / Mensajes Directos
    │     ├── Feed de publicaciones con likes/comentarios
    │     ├── Sidebar de grupos para filtrar
    │     ├── Caja de composición para crear posts
    │     └── Chat 1:1 con otros usuarios
    │
    ├──► Favoritos ──► Institución
    │
    ├──► Perfil ──► Onboarding
    │
    ├──► Mi Familia ──► Agregar/Editar dependientes + IA
    │
    ├──► Empleo ──► Postularme / Mis solicitudes
    │
    └──► Admin ──► Resumen / Inteligencia / Instituciones / Usuarios / Reseñas / Alertas / Config
```

---

## 🎨 Sidebar Compartida

Las páginas internas (Dashboard, Explore, Social, Favorites, Profile, Familia, Jobs) comparten una **sidebar izquierda** fija con los siguientes enlaces:

| Ícono | Etiqueta | Ruta | Página activa |
|-------|----------|------|---------------|
| 🏠 | Inicio | `/dashboard` | Dashboard |
| 🔍 | Explorar | `/explore` | Explore |
| 👥 | Comunidad | `/social` | Social |
| ❤️ | Favoritos | `/favorites` | Favorites |
| 👨‍👩‍👧 | Mi Familia | `/familia` | Tutor |
| 💼 | Empleo | `/jobs` | Jobs |
| 👤 | Perfil | `/profile` | Profile |
| 🚪 | Cerrar sesión | — | — |

La página de **Admin** tiene su propia sidebar oscura con acceso al panel administrativo y un botón "Ir a app" para volver a `/dashboard`.

---

## 📱 Componentes Globales

| Componente | Ubicación | Función |
|------------|-----------|---------|
| `ToastContainer` | Global | Notificaciones toast |
| `AccessibilityBar` | Global | Barra de accesibilidad (fijo inferior) |
| `AppSidebar` | Páginas internas | Navegación lateral |
| `TopNav` | Páginas internas | Barra superior con usuario |
| `NotificationBell` | Dashboard | Campana de notificaciones |
| `MapView` | Explore | Mapa de instituciones |

---

*Documento actualizado el 14 de julio de 2026 para el proyecto Raíces Frontend.*
