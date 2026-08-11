# 🌿 Raíces para Florecer — Descripción Visual del Proyecto

> **Ecosistema digital para personas con discapacidad, tutores e instituciones en México.**
> Versión: v1.6.0 · Stack: React + Vite + Tailwind CSS + Zustand + React Query

---

## 📐 Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                      LANDING (pública)                       │
│  LandingPage ─── AboutPage ─── ExplorePage (sin auth)        │
└────────────┬────────────────────────────────────────────────┘
             │  Login / Register
             ▼
┌─────────────────────────────────────────────────────────────┐
│                    AUTH (split layout)                        │
│  AuthPage ── Login ── Register (2 pasos) ── ForgotPassword   │
└────────────┬────────────────────────────────────────────────┘
             │  Token → Redirect según rol
             ▼
┌─────────────────────────────────────────────────────────────┐
│              APP LOGGED-IN (sidebar + topnav)                │
│                                                              │
│  ┌─────────┬──────────────────────────────────────────┐     │
│  │         │  DashboardPage                            │     │
│  │  Side   │  ExplorePage (auth)                       │     │
│  │  bar    │  InstitutionPage (detalle)                │     │
│  │         │  CrearInstitucionPage                      │     │
│  │  ┌────┐ │  EditarInstitucionPage                     │     │
│  │  │    │ │  InstitutionPortalPage                     │     │
│  │  │    │ │  ProfilePage                              │     │
│  │  │    │ │  OnboardingPage                           │     │
│  │  │    │ │  TutorPage                                │     │
│  │  │    │ │  JobsPage                                 │     │
│  │  │    │ │  SocialPage                               │     │
│  │  │    │ │  NotificationsPage                        │     │
│  │  │    │ │  FavoritesPage                            │     │
│  │  └────┘ │  AdminPage                                │     │
│  └─────────┴──────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏠 1. Landing Page

**Ruta:** `/`
**Acceso:** Pública (sin autenticación)

```
┌──────────────────────────────────────────────────────────┐
│ [🌿 Logo]          Conócenos   Explorar   [Iniciar sesión] [Registrarse] │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────┐  ┌──────────────────────┐  │
│  │ 🌿 Ecosistema digital   │  │                      │  │
│  │    para personas con     │  │   [Imagen Hero       │  │
│  │    discapacidad          │  │    Raíces Logo]      │  │
│  │                          │  │                      │  │
│  │  Encontramos             │  │                      │  │
│  │  tu camino               │  │                      │  │
│  │  hacia florecer.         │  │                      │  │
│  │                          │  │                      │  │
│  │  Conectamos a personas   │  └──────────────────────┘  │
│  │  con discapacidad...     │                            │
│  │                          │                            │
│  │  [Comenzar gratis →]     │                            │
│  │  [Ver instituciones →]   │                            │
│  │  🔒 Sin costo · Curado   │                            │
│  └──────────────────────────┘                            │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  🌿 Caminos hacia el florecimiento                       │
│                                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ ❤️ Salud │ │ 🎓 Educa │ │ 💼 Empleo│ │ 👥 Comuni│    │
│  │ Funcional│ │ Educativo│ │ Laboral  │ │ Social   │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘    │
│  ┌──────────┐ ┌──────────┐                               │
│  │ 🏃 Terapia│ │ 🎯 Recrea│                               │
│  └──────────┘ └──────────┘                               │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  🌿 ¿Por qué Raíces para florecer?                       │
│                                                          │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────┐│
│  │ ✨ Recomend│ │ 🛡️ Confianz│ │ 👥 Centrado│ │ 🏃 Segui││
│  │ personaliza│ │ y seguridad│ │ familia    │ │ progreso││
│  └────────────┘ └────────────┘ └────────────┘ └────────┘│
│                                                          │
├──────────────────────────────────────────────────────────┤
│  🌿 Empieza hoy, sin costo                               │
│  [Crear mi cuenta]                                        │
│  Demo: demo@raices.mx / Demo1234                         │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Footer: Raíces · Términos · Privacidad · Contacto        │
└──────────────────────────────────────────────────────────┘
```

**Elementos visuales clave:**
- Paleta: Teal principal (`#004E52`), rosa/terciopelo secundario, fondo cálido
- Iconos: Lucide React
- Animaciones: Scroll reveal con fade-in-up
- Responsive: Grid 4 columnas → 2 → 1 en móvil
- Branding: Logo raíces.png en hero

---

## 🔐 2. Auth Page (Login / Registro / Recuperar contraseña)

**Ruta:** `/auth?mode=login|register`
**Acceso:** Pública

### 2.1 Layout Split

```
┌────────────────────────────┬────────────────────────────┐
│        FORMULARIO          │        BRANDING             │
│                            │                            │
│  ← Volver al inicio       │  Gradiente teal oscuro     │
│                            │  (grid pattern overlay)    │
│  ┌──────────────────────┐  │                            │
│  │   [Logo / Título]    │  │  "Raíces para florecer"   │
│  │                      │  │                            │
│  │  Correo: [________]  │  │  Conectando personas con  │
│  │  Pass:   [________]👁│  │  discapacidad, tutores e  │
│  │                      │  │  instituciones en un      │
│  │  ☑ Mantener sesión   │  │  ecosistema digital de    │
│  │  ¿Olvidaste pass?    │  │  confianza...             │
│  │                      │  │                            │
│  │  [Entrar →]          │  │  ● Circulos decorativos   │
│  │                      │  │    con opacidad sutil     │
│  │  ¿No tienes cuenta?  │  │                            │
│  │  Regístrate aquí     │  │                            │
│  └──────────────────────┘  │                            │
│                            │                            │
└────────────────────────────┴────────────────────────────┘
```

### 2.2 Registro (2 pasos)

```
Paso 1/2                    Paso 2/2
─────────────               ─────────────
[===== 50%]                 [==========]

¿Cómo te gustaría         Crea tu cuenta
unirte?                    ──────────────
                           Nombre completo *
┌──────────────────────┐   [_____________]
│ 👤 Persona con       │   Correo electrónico *
│    discapacidad      │   [_____________]
│                    ✓ │   Contraseña *
├──────────────────────┤   [_____________]
│ 👥 Tutor o familiar  │   Seguridad: ████████ Fuerte
│                      │   (mín 8 chars, mayús, nums, símb)
├──────────────────────┤   Estado * [▼]  Municipio * [▼]
│ 🏢 Institución       │
│                      │   [← Volver]  [Finalizar registro →]
│ [Continuar →]        │
└──────────────────────┘   ¿Ya tienes cuenta? Inicia sesión
```

### 2.3 Recuperar contraseña

```
¿Olvidaste tu contraseña?
Ingresa tu correo y te enviaremos un enlace seguro

Correo electrónico *
[ejemplo@correo.com]

[Enviar enlace →]

¿Recordaste tu contraseña? Inicia sesión aquí
```

**Elementos visuales clave:**
- Layout split: 50/50 en desktop, columna derecha oculta en móvil (< 820px)
- Columna branding: Gradiente teal oscuro `#071e22 → #0d363c` con grid pattern
- Inputs: Bordes redondeados 8px, focus ring teal
- Indicador fuerza contraseña: Barra de 3 niveles (débil/media/fuerte)
- Toggle mostrar/ocultar contraseña con icono ojo
- Errores inline con fondo rojo claro + icono escudo

---

## 🏡 3. Dashboard Page

**Ruta:** `/dashboard`
**Acceso:** Autenticado (cualquier rol)
**Layout:** Sidebar izquierdo + TopNav

```
┌──────┬──────────────────────────────────────────────────┐
│      │ TopNav: [🔔 notif] [👤 avatar] [⚙️]             │
│ SIDE │                                                  │
│ BAR  │ Hola, [nombre] 👋                                │
│      │ Tu ecosistema personalizado                      │
│ 🏠   │                                                  │
│ 🏢   │ ┌──────────────────────────────────────────────┐ │
│ 👤   │ │ 🟢 COMPLETA TU PERFIL                        │ │
│ 📋   │ │ Cuéntanos sobre tus necesidades...           │ │
│ 💼   │ │ [████████████░░░░░] 65% completado            │ │
│ 👥   │ │                        [Completar ahora →]   │ │
│ 🏢   │ └──────────────────────────────────────────────┘ │
│ 🔔   │                                                  │
│ ❤️   │ 🌿 Próximos pasos                               │
│ 👤   │ ┌──────────────────────────────────────────────┐ │
│      │ │ ① Busca instituciones en tu zona             │ │
│ 📋   │ │ ② Completa tu perfil de necesidades          │ │
│ 💼   │ │ ③ Conecta con la comunidad                   │ │
│      │ │                                               │ │
│      │ │ 💡 Razón: [explicación IA]                    │ │
│      │ │                                               │ │
│      │ │ 🏢 Instituciones sugeridas:                   │ │
│      │ │ [Salud — Terapia] [Educación — Inclusiva]    │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ 🌿 Recomendaciones para ti    [Ver todas →]      │
│      │ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│      │ │ ❤️ Salud │ │ 🎓 Educa │ │ 💼 Empleo│          │
│      │ │ [Nombre] │ │ [Nombre] │ │ [Nombre] │          │
│      │ │ [Descrip]│ │ [Descrip]│ │ [Descrip]│          │
│      │ │ 📍 Ciudad│ │ 📍 Ciudad│ │ 📍 Ciudad│          │
│      │ │ ⭐ 4.8   │ │ ⭐ 4.6   │ │ ⭐ 4.9   │          │
│      │ │ [♡ fav]  │ │ [♡ fav]  │ │ [♡ fav]  │          │
│      │ └──────────┘ └──────────┘ └──────────┘          │
└──────┴──────────────────────────────────────────────────┘
```

**Elementos visuales clave:**
- Banner perfil: Gradiente teal, barra de progreso blanca, botón pill blanco
- Tarjetas IA: Icono sparkle, pasos numerados, reasoning en itálica
- Cards institución: CategoryTag coloreado, estrella dorada, corazón favorito
- Skeleton loading con pulse animation
- Scroll reveal con delays escalonados

---

## 🔍 4. Explore Page

**Ruta:** `/explore`
**Acceso:** Pública (con overlay para guests) / Autenticada

```
┌──────┬──────────────────────────────────────────────────┐
│      │                                                  │
│ SIDE │ Explorar                                         │
│ BAR  │ Instituciones que valoran la diversidad          │
│      │                                                  │
│      │ 🔍 [Buscar instituciones, servicios, ciudades...]│
│      │ [⚙️ FILTRAR ▼]                                   │
│      │                                                  │
│      │ ┌─ FILTROS AVANZADOS ─────────────────────────┐ │
│      │ │ Categoría: [Todos] [Salud] [Educa] [Empleo]│ │
│      │ │ Discapacidad: [▼ Todos]  Edad: [___]        │ │
│      │ │ Ciudad: [_________]                          │ │
│      │ └─────────────────────────────────────────────┘ │
│      │                                                  │
│      │ Mostrando 6 de 42 instituciones · funcional      │
│      │ [🗺️] [▦ grid] [☰ list]                          │
│      │                                                  │
│      │ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│      │ │ [Tag] ❤️ │ │ [Tag] ❤️ │ │ [Tag] ❤️ │          │
│      │ │ Nombre   │ │ Nombre   │ │ Nombre   │          │
│      │ │ Descrip  │ │ Descrip  │ │ Descrip  │          │
│      │ │ 📍 Ciudad│ │ 📍 Ciudad│ │ 📍 Ciudad│          │
│      │ │ ⭐ 4.8   │ │ ⭐ 4.6   │ │ ⭐ 4.9   │          │
│      │ └──────────┘ └──────────┘ └──────────┘          │
│      │                                                  │
│      │            [Ver más (36 instituciones)]           │
└──────┴──────────────────────────────────────────────────┘
```

### Vista para guests (sin auth):

```
┌──────────────────────────────────────────────────────┐
│  [Cards desenfocadas con blur 6px]                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │        🔍 Para seguir explorando                │  │
│  │                                                 │  │
│  │  Regístrate gratis para descubrir              │  │
│  │  instituciones, guardar favoritos...            │  │
│  │                                                 │  │
│  │  [Iniciar sesión]  [Registrarse]                │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

**Elementos visuales clave:**
- Search bar: Pill rounded (9999px), icono lupa izquierda
- Filtros avanzados: Panel desplegable con categorías tipo pills
- Vista grid: Cards 280px+ con category tag, rating, favorito
- Vista lista: Rows horizontales con avatar, nombre, ubicación
- Vista mapa: Componente MapView con Leaflet
- Guest overlay: Blur + modal overlay para invitar a registrarse

---

## 🏛️ 5. Institution Detail Page

**Ruta:** `/institution/:id`
**Acceso:** Pública

```
┌──────┬──────────────────────────────────────────────────┐
│      │ Explorar / [Nombre Institución]                  │
│ SIDE │                                                  │
│ BAR  │ ┌──────────────────────────────────────────────┐ │
│      │ │ INSTITUTION HEADER                           │ │
│      │ │ [Avatar/Logo]  Nombre Institución            │ │
│      │ │ 📍 Ciudad, Estado  ·  ⭐ 4.8 (124 reseñas)  │ │
│      │ │ [❤️ Favorito]  [📋 Ver vacantes]             │ │
│      │ │                                               │ │
│      │ │ Descripción completa de la institución...     │ │
│      │ │                                               │ │
│      │ │ 📞 Teléfono  📧 Email  🌐 Sitio web          │ │
│      │ │ 🏷️ Categoría: Salud y Terapia                │ │
│      │ │ ♿ Discapacidades: Motriz, Visual             │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ 🤖 Chat con asistente IA                     │ │
│      │ │ "¿Tienen terapia de lenguaje?"              │ │
│      │ │                                               │ │
│      │ │ 💬 [Tu mensaje...]                           │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ⭐ Reseñas (124)                                │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ ⭐⭐⭐⭐⭐  "Excelente servicio"               │ │
│      │ │ Juan P. · hace 2 días                        │ │
│      │ │                                               │ │
│      │ │ ⭐⭐⭐⭐  "Muy profesionales"                  │ │
│      │ │ María G. · hace 1 semana                     │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ [Escribir reseña]                                │
└──────┴──────────────────────────────────────────────────┘
```

**Elementos visuales clave:**
- Breadcrumb: Explorar → Nombre
- Header card: Avatar grande, ratings con estrellas, chips de categorías
- AI Chat: Panel expandible con historial
- Reviews: Lista con rating, autor, fecha, texto

---

## 🏢 6. Create Institution Page

**Ruta:** `/crear-institucion`
**Acceso:** Autenticado

```
┌──────┬──────────────────────────────────────────────────┐
│      │ ← Volver                                         │
│ SIDE │                                                  │
│ BAR  │ Registrar nueva institución                       │
│      │ Completa los datos...                            │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ 🏢 Datos básicos                             │ │
│      │ │                                               │ │
│      │ │ Nombre de la institución *                    │ │
│      │ │ [Ej. Centro de Terapia Familiar]             │ │
│      │ │                                               │ │
│      │ │ Descripción                                   │ │
│      │ │ [Describe brevemente...]                      │ │
│      │ │                                               │ │
│      │ │ Categoría                                     │ │
│      │ │ [Salud] [Educación] [Empleo] [Comunidad]     │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ 📍 Ubicación                                 │ │
│      │ │ Ciudad [________]  Estado [________]         │ │
│      │ │ Dirección [________________________]         │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ 📞 Contacto                                  │ │
│      │ │ Teléfono [________]  Email [________]        │ │
│      │ │ Sitio web [________]                         │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ ♿ Discapacidades atendidas                   │ │
│      │ │ [Motriz] [Visual] [Auditiva] [Intelectual]   │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ [Registrar institución]                          │
└──────┴──────────────────────────────────────────────────┘
```

---

## 📋 7. Institution Portal Page

**Ruta:** `/institution-portal`
**Acceso:** Rol `institution` (solo instituciones verificadas activas)

```
┌──────┬──────────────────────────────────────────────────┐
│      │                                                  │
│ SIDE │ ┌─ Estado: Pendiente de verificación ──────────┐ │
│ BAR  │ │ ⏰ Tu institución está en proceso...          │ │
│      │ │ Un administrador está revisando...            │ │
│      │ │ [Revisar información] [Explorar instituciones]│ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ════════════════════════════════════════════════ │
│      │                                                  │
│      │ Postulaciones                                    │
│      │                                                  │
│      │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐            │
│      │ │ 📋 5 │ │ 👥 12│ │ ⏰ 3 │ │ ✅ 4 │            │
│      │ │Activas│ │Total │ │Pend. │ │Acept.│            │
│      │ └──────┘ └──────┘ └──────┘ └──────┘            │
│      │                                                  │
│      │ [Tab: Postulaciones] [Tab: Candidatos]           │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ Postulación #1                               │ │
│      │ │ 👤 Juan Pérez  ·  📋 Asistente Administrativo│ │
│      │ │ 📍 Mérida, Yucatán  ·  ⏰ hace 2 días       │ │
│      │ │ Estado: Pendiente                             │ │
│      │ │ [Ver CV] [Aceptar] [Rechazar]                │ │
│      │ └──────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────┘
```

**Estados del portal:**
1. **Sin institución** → "Registra tu institución" (botón crear)
2. **Pendiente verificación** → "Estamos revisando tu información"
3. **Necesita completar** → "Completa el perfil de tu institución"
4. **Activo y verificado** → Dashboard completo con tabs

---

## 💼 8. Jobs Page

**Ruta:** `/jobs`
**Acceso:** Autenticado

```
┌──────┬──────────────────────────────────────────────────┐
│      │ Empleos                                           │
│ SIDE │ Encuentra oportunidades laborales inclusivas      │
│ BAR  │                                                  │
│      │ 🔍 [Buscar empleos...]  [⚙️ FILTRAR]             │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ 📋 Asistente Administrativo                  │ │
│      │ │ 🏢 Empleo Digno A.C.                         │ │
│      │ │ 📍 Monterrey, Nuevo León  ·  💼 Presencial   │ │
│      │ │ 🕐 Lunes a Viernes 9-5  ·  💰 $12,000-$15,000│ │
│      │ │                                               │ │
│      │ │ Requisitos: Secundaria completa, disponibilidad│ │
│      │ │ [Postularme]  [💬 Mensaje]                    │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ 📋 Desarrollador Web Junior                  │ │
│      │ │ 🏢 TechInclusiva                             │ │
│      │ │ 📍 CDMX  ·  💼 Remoto                        │ │
│      │ │ ...                                          │ │
│      │ └──────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────┘
```

### Modal de Postulación (Wizard 4 pasos):

```
┌─────────────────────────────────────────────────┐
│  ←  Postulando a: Asistente Administrativo  ✕   │
│─────────────────────────────────────────────────│
│                                                  │
│  PASO 0: ¿Quién se va a postular? (tutores)     │
│  ┌────────┐ ┌────────┐ ┌────────┐               │
│  │ Yo     │ │Gestionad│ │Vinculad│               │
│  │ (mismo)│ │ (PCD)   │ │ (PCD)  │               │
│  └────────┘ └────────┘ └────────┘               │
│  Selecciona: [▼ Juan Pérez (Hijo)]              │
│                                                  │
│  PASO 1: Agrega tu ubicación                     │
│  País: México (editable)                         │
│  Código postal: [97314]                          │
│  Ciudad, estado: [Mérida, Yucatán]              │
│  Dirección: [________] (oculta hasta contratación)│
│                                                  │
│  PASO 2: Agrega un CV                            │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│  │  📄 Sube tu currículum                      │  │
│  │  Soporta PDF de hasta 10MB                  │  │
│  │  [Seleccionar archivo]                      │  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                                  │
│  Vista previa del CV:                             │
│  ┌──────────────────────────────────────┐        │
│  │  [Nombre]  CANDIDATO VERIFICADO      │        │
│  │  📞 999 338 6267                     │        │
│  │  📧 candidato@correo.com             │        │
│  │  📍 Mérida, Yucatán                  │        │
│  │  Habilidades: [Proactividad] [Team]   │        │
│  └──────────────────────────────────────┘        │
│                                                  │
│  PASO 3: Revisar postulación                     │
│  Información de contacto: [Editar]               │
│  CV cargado: documento.pdf                       │
│  Carta de presentación: [________]               │
│                                                  │
│  [✓ Enviar postulación]                          │
└─────────────────────────────────────────────────┘
```

---

## 👥 9. Social Page (Comunidad)

**Ruta:** `/social`
**Acceso:** Autenticado

```
┌──────┬──────────────────────────────────────────────────┐
│      │ Comunidad                                         │
│ SIDE │ Conecta con personas, comparte y aprende          │
│ BAR  │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ 📝 Crear publicación                         │ │
│      │ │ [Avatar] [¿Qué quieres compartir hoy?]       │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ 👤 María G. · hace 2 horas                   │ │
│      │ │ "Hoy mi hijo completó su primera terapia..."  │ │
│      │ │                                               │ │
│      │ │ ❤️ 12  💬 3  🔁 2                            │ │
│      │ │                                               │ │
│      │ │ ┌─ Comentarios ──────────────────────────┐   │ │
│      │ │ │ 👤 Juan: "¡Felicidades!"               │   │ │
│      │ │ │ 👤 Ana: "Qué hermoso momento"          │   │ │
│      │ │ └────────────────────────────────────────┘   │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌─ Stats ────────────────────────────────────┐  │
│      │ │ 👥 156 miembros  ·  📝 89 publicaciones    │  │
│      │ │ 🏆 Miembros destacados                      │  │
│      │ └────────────────────────────────────────────┘  │
└──────┴──────────────────────────────────────────────────┘
```

---

## 👨‍👩‍👧 10. Tutor Page (Personas)

**Ruta:** `/tutor`
**Acceso:** Rol `tutor`

```
┌──────┬──────────────────────────────────────────────────┐
│      │ Personas                                          │
│ SIDE │ 2 personas en tu cuidado · 1 espacio disponible  │
│ BAR  │                          [🔗 Vincular] [+ Agregar]│
│      │                                                  │
│      │ ── Registradas (2) ──────────────────────────    │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ ┌──┐ Juan Pérez                              │ │
│      │ │ │JP│ Hijo · infancia · 8 años                │ │
│      │ │ └──┘ [Discapacidad motriz] [TEA]             │ │
│      │ │                                               │ │
│      │ │ Notas: Requiere terapia de lenguaje...       │ │
│      │ │              ⋯ (menú de acciones)            │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ── Cuentas vinculadas (1) ────────────────────   │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ ┌──┐ Ana Torres   [🔗 Vinculada]            │ │
│      │ │ │AT│ Prima · adultoJoven · 25 años           │ │
│      │ │ └──┘ [Visual]                                │ │
│      │ │              ⋯ (menú de acciones)            │ │
│      │ └──────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────┘
```

### Menú de acciones (⋯):

```
┌─────────────────────────┐
│ ✨ Recomendaciones IA    │
│ 🛡️ Opciones (features)  │
│ 🛡️ Permisos             │
│ ✏️ Editar               │
│─────────────────────────│
│ 🔗 Desvincular          │  ← solo para cuentas vinculadas
│ 🗑️ Eliminar             │
└─────────────────────────┘
```

### Modal Agregar/Editar Persona:

```
┌─────────────────────────────────────────────┐
│  Agregar persona                    [✕]      │
│                                              │
│  Nombre completo *                          │
│  [Juan Pérez]                                │
│                                              │
│  Parentesco *                                │
│  [Hijo ▼]                                    │
│                                              │
│  Fecha de nacimiento                         │
│  [2016-05-15]                                │
│                                              │
│  Tipo de discapacidad                        │
│  [✓ Motriz] [Visual] [Auditiva] [TEA] ...    │
│                                              │
│  ☑ Crear cuenta de acceso                    │
│    Email: [juan@correo.com]                  │
│    Pass: [________]                          │
│                                              │
│  Notas                                       │
│  [Requiere terapia de lenguaje...]           │
│                                              │
│         [Cancelar]  [Agregar]                │
└─────────────────────────────────────────────┘
```

### Modal Vincular PCD:

```
┌─────────────────────────────────────────────┐
│  🔗 Vincular persona                         │
│                                              │
│  Correo electrónico de la persona PCD        │
│  [pcd@email.com]                             │
│  La persona debe tener una cuenta activa     │
│                                              │
│         [Cancelar]  [Vincular]               │
└─────────────────────────────────────────────┘
```

---

## 👤 11. Profile Page

**Ruta:** `/profile`
**Acceso:** Autenticado

```
┌──────┬──────────────────────────────────────────────────┐
│      │ Mi perfil                                         │
│ SIDE │ Gestiona tu información personal                  │
│ BAR  │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ Mi Perfil                        [✏️ Editar] │ │
│      │ │                                               │ │
│      │ │ ┌──┐  Nombre Completo  [ROL badge]           │ │
│      │ │ │AV│  📧 email@email.com                     │ │
│      │ │ └──┘  📍 Mérida, Yucatán                     │ │
│      │ │                                               │ │
│      │ │ Nombre: Juan  ·  Apellido: Pérez             │ │
│      │ │ Email: juan@email.com                        │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ Perfil de necesidades     [✏️ Rehacer test]  │ │
│      │ │                                               │ │
│      │ │ Etapa de vida: [Adulto joven] [25 años]      │ │
│      │ │                                               │ │
│      │ │ Discapacidades:                               │ │
│      │ │ [Visual] [Movilidad reducida]                 │ │
│      │ │                                               │ │
│      │ │ Modos de comunicación:                        │ │
│      │ │ [Lenguaje de señas] [Comunicación aumentada]  │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │ Dirección                        [✏️ Editar] │ │
│      │ │                                               │ │
│      │ │ País: México                                  │ │
│      │ │ Ciudad/Estado: Mérida, Yucatán               │ │
│      │ └──────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────┘
```

---

## 🎯 12. Onboarding Page (Profiling)

**Ruta:** `/onboarding`
**Acceso:** Autenticado

```
┌────────────────────────────┬────────────────────────────┐
│        FORMULARIO          │        BRANDING             │
│                            │                            │
│  Paso 3 de 5               │  [Logo Raíces]             │
│  [██████░░░░] 60%          │                            │
│                            │  Historial y recorrido      │
│  Historial y recorrido     │  Queremos saber qué has    │
│  Queremos saber qué has   │  hecho para continuar...    │
│  hecho para continuar...   │                            │
│                            │  ✓ Fecha de nacimiento     │
│  Educación [▼]             │  ✓ Condición y necesidades  │
│  [Escuela regular]         │  ● Historial y recorrido   │
│                            │  ○ Tus objetivos           │
│  Terapias recibidas        │  ○ Estado actual           │
│  [Física, Lenguaje...]     │                            │
│                            │                            │
│  Experiencia laboral       │                            │
│  [Buscando primer empleo]  │                            │
│                            │                            │
│  Experiencia social        │                            │
│  [¿Participa en grupos?]   │                            │
│                            │                            │
│  [← Volver]  [Continuar →] │                            │
└────────────────────────────┴────────────────────────────┘
```

**Pasos del onboarding:**

| Paso | Título | Contenido |
|------|--------|-----------|
| 1 | Fecha de nacimiento | Date picker + cálculo automático de edad/etapa |
| 2 | Condición y necesidades | Multi-select discapacidades, nivel apoyo, necesidades |
| 3 | Historial y recorrido | Educación, terapias, experiencia laboral/social |
| 4 | Tus objetivos | Multi-select metas (empleo, eventos, comunidad, instituciones) |
| 5 | Estado actual | Textarea apoyo, textarea preocupaciones, confirmación |

---

## 🔔 13. Notifications Page

**Ruta:** `/notifications`
**Acceso:** Autenticado

```
┌──────┬──────────────────────────────────────────────────┐
│      │ Notificaciones                                    │
│ SIDE │ 3 no leídas                    [✓ Marcar todo leído]│
│ BAR  │                                                  │
│      │ [Todas (12)] [No leídas (3)] [Inteligencia] [Riesgos]│
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ ││ 💙 Nueva recomendación personalizada        │ │
│      │ ││  Hemos encontrado 3 instituciones...        │ │
│      │ ││                                   hace 2h   │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │  ✅ Tu postulación fue aceptada              │ │
│      │ │  Empleo Digno A.C. te invitó...              │ │
│      │ │                                   hace 5h    │ │
│      │ └──────────────────────────────────────────────┘ │
│      │                                                  │
│      │ ┌──────────────────────────────────────────────┐ │
│      │ │  ⚠️ Actualiza tu perfil                      │ │
│      │ │  Para mejores recomendaciones...              │ │
│      │ │                                   hace 1d    │ │
│      │ └──────────────────────────────────────────────┘ │
└──────┴──────────────────────────────────────────────────┘
```

**Tipos de notificación:**
- 🔵 **info** (azul): Recomendaciones, actualizaciones
- 🟢 **success** (verde): Postulaciones aceptadas, logros
- 🟠 **warning** (naranja): Acciones pendientes
- 🔴 **error** (rojo): Errores, problemas

---

## ❤️ 14. Favorites Page

**Ruta:** `/favorites`
**Acceso:** Autenticado

```
┌──────┬──────────────────────────────────────────────────┐
│      │ Mis favoritos                                      │
│ SIDE │ Instituciones guardadas                           │
│ BAR  │                                                  │
│      │ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│      │ │ ❤️ Salud │ │ 🎓 Educa │ │ 💼 Empleo│          │
│      │ │ [Nombre] │ │ [Nombre] │ │ [Nombre] │          │
│      │ │ [Descrip]│ │ [Descrip]│ │ [Descrip]│          │
│      │ │ 📍 Ciudad│ │ 📍 Ciudad│ │ 📍 Ciudad│          │
│      │ │ ⭐ 4.8   │ │ ⭐ 4.6   │ │ ⭐ 4.9   │          │
│      │ └──────────┘ └──────────┘ └──────────┘          │
└──────┴──────────────────────────────────────────────────┘
```

---

## ⚙️ 15. Admin Page

**Ruta:** `/admin`
**Acceso:** Rol `admin`

```
┌──────┬──────────────────────────────────────────────────┐
│      │ Panel de Administración                           │
│ SIDE │                                                  │
│ BAR  │ [📊 Overview] [🏢 Instituciones] [👤 Usuarios]   │
│      │ [⭐ Reseñas] [🧠 Inteligencia] [⚠️ Alerts] [⚙️]  │
│      │                                                  │
│      │ ┌─ OVERVIEW TAB ─────────────────────────────┐  │
│      │ │                                              │  │
│      │ │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │  │
│      │ │ │ 👥 42│ │ 🏢 15│ │ ⭐ 89│ │ 📝 34│       │  │
│      │ │ │Users │ │Inst. │ │Rev.  │ │Posts │       │  │
│      │ │ └──────┘ └──────┘ └──────┘ └──────┘       │  │
│      │ │                                              │  │
│      │ │ 📈 Actividad Mensual                         │  │
│      │ │ ┌──────────────────────────────────────┐    │  │
│      │ │ │  ████                                   │    │  │
│      │ │ │  ████ ████                              │    │  │
│      │ │ │  ████ ████ ████                         │    │  │
│      │ │ │  ████ ████ ████ ████                    │    │  │
│      │ │ │  Ene  Feb  Mar  Abr  May  Jun           │    │  │
│      │ │ └──────────────────────────────────────┘    │  │
│      │ │                                              │  │
│      │ │ 📊 Usuarios Activos (Detalle)                │  │
│      │ │ [Tabla con métricas de actividad]           │  │
│      │ └────────────────────────────────────────────┘  │
│      │                                                  │
│      │ ┌─ USERS TAB ───────────────────────────────┐  │
│      │ │ Buscar usuario...                          │  │
│      │ │ ┌────────────────────────────────────────┐ │  │
│      │ │ │ 👤 Juan Pérez  ·  pcd  ·  Activo       │ │  │
│      │ │ │ 📧 juan@email.com  ·  📍 Mérida        │ │  │
│      │ │ │                                    [⋯]  │ │  │
│      │ │ ├────────────────────────────────────────┤ │  │
│      │ │ │ 👤 María López  ·  tutor  ·  Activo    │ │  │
│      │ │ │ 📧 maria@email.com  ·  📍 CDMX         │ │  │
│      │ │ │                                    [⋯]  │ │  │
│      │ │ └────────────────────────────────────────┘ │  │
│      │ └────────────────────────────────────────────┘  │
└──────┴──────────────────────────────────────────────────┘
```

### Tabs del Admin:

| Tab | Contenido |
|-----|-----------|
| **Overview** | Stats overview, gráfico de barras actividad mensual, usuarios activos detalle |
| **Instituciones** | Lista de todas las instituciones con estado (verificada/pendiente), acciones |
| **Usuarios** | Tabla de usuarios con roles, filtros, búsqueda, acciones |
| **Reseñas** | Todas las reseñas de la plataforma, moderación |
| **Inteligencia** | IA insights, analytics avanzados |
| **Alerts** | Alertas del sistema, notificaciones admin |
| **Settings** | Configuración general del sistema |

---

## 🔄 Flujo de Navegación

```
                        ┌─────────────┐
                        │  LANDING    │
                        │     /       │
                        └──────┬──────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
         ┌────▼────┐    ┌─────▼─────┐    ┌─────▼─────┐
         │  ABOUT  │    │ EXPLORE   │    │   AUTH    │
         │ /about  │    │ /explore  │    │  /auth    │
         └─────────┘    └───────────┘    └─────┬─────┘
                                               │
                              ┌─────────────────┼─────────────────┐
                              │                 │                 │
                         ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
                         │DASHBOARD│      │INSTITUTION│     │ ONBOARD │
                         │/dashboard│     │PORTAL     │     │/onboard │
                         └────┬────┘      │/inst-portal│    └─────────┘
                              │           └───────────┘
            ┌─────────────────┼─────────────────┐
            │                 │                 │
       ┌────▼────┐      ┌────▼────┐      ┌────▼────┐
       │ EXPLORE │      │  JOBS   │      │ SOCIAL  │
       │ /explore│      │ /jobs   │      │ /social │
       └────┬────┘      └─────────┘      └─────────┘
            │
       ┌────▼──────────┐
       │ INSTITUTION   │
       │ /institution/:id│
       └───────────────┘
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores

```
Primario (Teal):     #004E52  ████████
Secundario (Rosa):   #C4789A  ████████
Acento (Dorado):     #D4944C  ████████
Error (Rojo):        #EF4444  ████████
Éxito (Verde):       #22C55E  ████████
```

### Categorías (colores únicos)

```
Salud (funcional):    var(--color-salud)     🟢
Educación (educativo): var(--color-educacion) 🟣
Empleo (laboral):     var(--color-empleo)    🟠
Comunidad (social):   var(--color-comunidad) 🔵
```

### Tipografía

```
Display: var(--font-display)  → Títulos grandes
Body:    var(--font-body)     → Texto general
```

### Componentes recurrentes

- **Glass cards**: `backdrop-filter: blur(25px)`, bordes semi-transparentes
- **Glass buttons**: Hover lift, active press, active state teal
- **Glass switch**: Toggle animado con thumb blanco
- **Pill buttons**: border-radius 9999px, categorías y filtros
- **CategoryTag**: Chip coloreado por categoría
- **Scroll reveal**: Animación fade-in-up con delays
- **Skeleton loading**: Pulse animation en placeholders
- **Modal overlay**: Centered glass card con backdrop
- **Toast notifications**: Top-right, auto-dismiss

### Responsive Breakpoints

```
Desktop:  > 1024px  → Sidebar + contenido
Tablet:   768-1024px → Sidebar colapsable
Mobile:   < 768px   → Sidebar oculto, bottom nav o drawer
```

---

## 🛠️ Stack Técnico

| Capa | Tecnología |
|------|-----------|
| Framework | React 18 + Vite |
| Routing | React Router v6 |
| State | Zustand (global) + React Query (server) |
| Styling | Tailwind CSS + CSS custom properties |
| Forms | React Hook Form (algunas) / controlled |
| HTTP | Axios |
| Auth | Firebase Auth + JWT |
| Notifications | Firebase Cloud Messaging (FCM) |
| Icons | Lucide React |
| Maps | Leaflet / React-Leaflet |
| Charts | Custom SVG bars (Overview) |
| Testing | Vitest + React Testing Library |

---

## 📁 Estructura de Features

```
src/features/
├── a11y/              # Accesibilidad (barra flotante draggable)
├── about/             # Página About
├── admin/             # Panel de administración
├── auth/              # Autenticación, sidebar, topnav
├── dashboard/         # Dashboard principal
├── favorites/         # Favoritos
├── institutions/      # Explorar, detalle, portal, crear/editar
├── jobs/              # Empleos y postulaciones
├── landing/           # Landing page
├── notifications/     # Notificaciones FCM
├── profile/           # Perfil y onboarding
├── reviews/           # Reseñas
├── social/            # Comunidad y mensajes
├── tutor/             # Gestión de personas dependientes
└── users/             # Gestión de usuarios (admin)
```

---

*Documento generado el 10 de agosto de 2026 · Raíces para Florecer v1.6.0*
