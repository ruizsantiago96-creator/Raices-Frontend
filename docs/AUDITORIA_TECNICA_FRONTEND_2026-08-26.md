# 🔍 Auditoría Técnica Frontend Exhaustiva — raices-frontend

**Fecha:** 26 de agosto, 2026  
**Alcance:** `src/` completo (~30,000 líneas de código)  
**Stack:** React 18 + Vite + Zustand + Axios + React Router  
**Rama:** dev  

---

## 1. 📊 Matriz de Diagnóstico y Priorización

### Leyenda de Severidad
- **Crítica (C):** Rompe funcionalidad, causa memory leaks, o vulnerabilidades en producción
- **Alta (A):** Deuda técnica significativa, viola arquitectura, dificulta mantenimiento
- **Media (M):** Malas prácticas, inconsistencias, code smell
- **Baja (B):** Oportunidades de mejora, estilo, optimizaciones menores

---

| # | Severidad | Archivo(s) | Líneas | Problema Detectado | Violación Técnica | Impacto |
|---|-----------|-----------|--------|-------------------|-------------------|---------|
| 1 | **C** | `jobs/pages/JobsPage.jsx` | 1–1998 | **Archivo monolítico de 1,998 líneas** con 6 componentes internos (`CreateJobModal`, `CandidateOption`, `CvDocumentPreview`, `ApplicationModal`, `MessageModal`, `JobCard`, `ApplicationCard` + el componente principal) | Límite de 700 líneas | Imposible mantener, testear o reutilizar. Costo de carga cognitiva extremo. |
| 2 | **C** | `auth/components/RegistrationWizard.jsx` | 1–1469 | **1,469 líneas** — Wizard multi-paso completo en un solo archivo con lógica de negocio, UI, validación y llamadas API mezcladas | Límite de 700 líneas | Componente ingobernable, imposible hacer unit tests granulares |
| 3 | **C** | `auth/pages/AuthPage.jsx` | 1–1157 | **1,157 líneas** — Página de autenticación con login, registro, validaciones, SVGs inline, y lógica condicional de roles | Límite de 700 líneas | Archivo caótico con responsabilidades múltiples |
| 4 | **C** | `landing/pages/LandingPage.jsx` | 1–998 | **998 líneas** — Landing page monolítica | Límite de 700 líneas | Difícil de iterar en diseños parciales |
| 5 | **C** | `tutor/pages/TutorPage.jsx` | 1–979 | **979 líneas** — Panel de tutor con gestión de dependientes, permisos, chat AI y sub-componentes | Límite de 700 líneas | Incluye lógica compleja sin separación de concerns |
| 6 | **A** | `jobs/pages/JobsPage.jsx` | 4, 5, 6, 7, 11 | **Imports profundos entre features** — importa directamente de `@features/institutions/hooks/useInstitutions`, `@features/social/hooks/useMessages`, `@features/tutor` | Violación de Feature-Driven Architecture | Acoplamiento entre features, imposible reemplazar o migrar una feature independientemente |
| 7 | **A** | `favorites/hooks/useFavorites.js` | 3 | **Import profundo** — `import { mapInstitucion } from '@features/institutions/hooks/useInstitutions'` | Violación de Feature-Driven Architecture | `mapInstitucion` es una utilidad que debería vivir en `shared/lib/` |
| 8 | **A** | `rutas/pages/EscalasVidaPage.jsx` | 3 | **Import profundo** — `import { useSaveEscalasVida } from '@features/profile/hooks/useProfile'` | Violación de Feature-Driven Architecture | Acoplamiento innecesario rutas→profile |
| 9 | **A** | `admin/index.js` | 17, 19, 21 | **Re-exporta hooks de otras features** — `useAdminUsers` de `@features/users`, `useAllInstitutions` de `@features/institutions`, `useAdminReviews` de `@features/reviews` | Violación de aislamiento de features | `admin` se convierte en un módulo上帝 que sabe de todo |
| 10 | **A** | `shared/lib/api.js` | 5 | **Acoplamiento directo al store de Zustand** — `import { useAuthStore } from '@features/auth/store/authStore'` | `shared/lib/` no debería conocer stores de React/Zustand | Dificulta testing del módulo API y crea dependencia circular potencial |
| 11 | **A** | `shared/components/shared.jsx` | 1–265 | **Cajón de sastre** — Mezcla Icons (40+ iconos inline), BrandMark, TopNav, CategoryTag, AppFooter, estilos exportados (`labelStyle`, `inputStyle`), utilidad `hashColor`, constante `CATEGORY_LABELS` | Violación de responsabilidad única | Archivo difícil de mantener, genera re-renders innecesarios al importar todo |
| 12 | **A** | `jobs/pages/JobsPage.jsx` | 469, 1647 | **`eslint-disable react-hooks/set-state-in-effect`** — setState llamado dentro de `useEffect` deliberadamente | Mutaciones en fase de render / Anti-patrón | Puede causar renders extras y bugs de concurrencia |
| 13 | **A** | `institutions/pages/EditarInstitucionPage.jsx` | 66 | **`eslint-disable react-hooks/set-state-in-effect`** — Mismo patrón anti-patrón | Anti-patrón React | Renders innecesarios |
| 14 | **A** | `jobs/pages/JobsPage.jsx` | 501 | **`setTimeout` sin cleanup** en `handleFileChange` — Simula carga de archivo con `setTimeout(() => {...}, 1000)` sin limpiar si el componente se desmonta | Memory leak potencial | Intento de settear estado en componente desmontado |
| 15 | **A** | Múltiples archivos | — | **75+ usos directos de `localStorage`** dispersos en componentes y hooks — `raices_user_phone_`, `raices_user_cp_`, `raices_user_cv_`, `raices_dep_birth_date_`, `raices_user_interests`, `recent_searches`, etc. | Cero hardcodeo violado | Lógica de persistencia fragmentada, imposible migrar a otro storage, keys duplicadas, sin validación de esquema |
| 16 | **A** | `auth/hooks/useAuth.js` | 73, 78, 96, 101, 133, 149, 152 | **~8 `console.log` con datos operativos** — Loguea tokens, respuestas del backend, estado de Firebase bridge | Cero console.log en producción | Fuga de información sensible en consola del navegador |
| 17 | **A** | `notifications/hooks/useFCM.js` | 40, 42, 51, 56, 62, 72, 78, 85, 90, 104, 108, 116, 129, 131, 155 | **~15 `console.log/warn/error`** — Log excesivo incluyendo tokens FCM (parcialmente truncados pero aún visibles) | Cero console.log en producción + Seguridad | Información de debug visible en producción |
| 18 | **A** | `shared/lib/storage.js` | 51, 53, 60, 61 | **`console.log` con datos de refresh token** — Loguea si el refresh token fue guardado, en qué storage, y verifica con otro log | Seguridad | Expone flujo de tokens en consola |
| 19 | **A** | `institutions/hooks/useInstitutions.js` | 208, 211, 225, 228, 232 | **`[DEBUG]` console.log hardcodeados** — Logs de debug que quedaron en el código de producción | Cero console.log en producción | Ruido en consola, información interna expuesta |
| 20 | **A** | `auth/lib/firebaseBridge.js` | 44, 99, 114 | **`console.warn` y `console.log`** con información de Firebase bridge | Seguridad / Producción | Expone estado de autenticación Firebase |
| 21 | **A** | `auth/components/RegistrationWizard.jsx` | 681, 708, 733, 741, 756 | **`console.warn`/`console.error` en catch blocks** — Errores de registro, escalas, profiling y uploads | Mal manejo de errores | Datos de error visibles en producción |
| 22 | **M** | `institutions/pages/ExplorePage.jsx` | 1–322 | **useRef innecesario** — `prevFilterKeyRef` declarado pero el patrón sugiere que podría causar problemas de concurrencia | Mal uso de useRef para tracking | Code smell |
| 23 | **M** | `auth/pages/AuthPage.jsx` | 37–130 | **SVGs inline masivos** — 4 componentes SVG (~30 líneas cada uno: `PcdDoodle`, `TutorDoodle`, `InstitutionDoodle` + otro) definidos inline en el componente | Archivo inflado innecesariamente | Contribuyen 200+ líneas al archivo monolítico |
| 24 | **M** | `jobs/pages/JobsPage.jsx` | 168–245 | **SVGs inline** — `flagIcon`, `filePdfIcon` definidos como constantes JSX en el archivo | Deberían estar en shared/components/icons | Infla el archivo |
| 25 | **M** | `jobs/pages/JobsPage.jsx` | 186–240 | **CvDocumentPreview** — Componente de ~130 líneas con layout de CV completamente hardcodeado (nombre, habilidades, idiomas, experiencia laboral son strings estáticos) | Hardcoded content + Archivo inflado | El componente muestra datos ficticios que confunden al usuario |
| 26 | **M** | `jobs/pages/JobsPage.jsx` | 554 | **`console.warn('Could not update profile location:', err)`** | Console.log en producción | Información de error visible |
| 27 | **M** | `shared/constants/backendEndpoints.js` | 1–1088+ | **1,088 líneas** — Archivo gigante de constantes | Límite de 700 líneas | Difícil de navegar (aunque es un archivo de constants, la escala complica el mantenimiento) |
| 28 | **M** | `a11y/components/AccessibilityBar.jsx` | 1–814 | **814 líneas** — Barra de accesibilidad con lógica TTS, keyboard navigation y UI | Excede 700 líneas | Difícil de mantener |
| 29 | **M** | `institutions/pages/CrearInstitucionPage.jsx` | 1–685 | **685 líneas** — Cerca del límite, formulario de creación de institución con lógica compleja | Cerca del límite | En riesgo de crecer |
| 30 | **M** | `social/pages/MessagesPage.jsx` | 1–668 | **668 líneas** — Página de mensajes con chat UI | Cerca del límite | En riesgo de crecer |
| 31 | **M** | `profile/pages/ProfilePage.jsx` | 1–620 | **620 líneas** — Perfil de usuario | Cerca del límite | En riesgo de crecer |
| 32 | **M** | `auth/components/TopNav.jsx` | 1–602 | **602 líneas** — Barra de navegación superior con buscador, historial de búsquedas, notificaciones | Excesivo para un componente de navegación | Incluye lógica de búsqueda que debería ser un hook |
| 33 | **M** | `jobs/pages/JobsPage.jsx` | 423, 431, 450, 452, 456, 518, 530, 531, 571, 972 | **10+ llamadas directas a `localStorage` con keys dinámicas** — `raices_user_phone_${id}`, `raices_user_cp_${id}`, etc. | Hardcoded localStorage keys | Sin encapsulamiento, sin validación, propenso a errores de typos |
| 34 | **M** | `tutor/pages/TutorPage.jsx` | 101, 118, 130, 412, 602 | **`localStorage` para `raices_dep_birth_date_`** — Guarda fechas de nacimiento en localStorage sin encriptar | Seguridad / Privacidad | Datos sensibles de PCD en storage no cifrado |
| 35 | **M** | `dashboard/pages/DashboardPage.jsx` | 347 | **`JSON.parse(localStorage.getItem('raices_user_interests') || '[]')`** — Parsing sin try/catch | Error handling | Si el JSON está corrupto, crashea el componente |
| 36 | **M** | `auth/components/TopNav.jsx` | 35 | **`JSON.parse(localStorage.getItem('recent_searches') ?? '[]')`** — Mismo patrón sin try/catch | Error handling | Crashee potencial |
| 37 | **M** | Múltiples archivos | — | **Estilos inline masivos** — Casi todos los componentes usan `style={{...}}` con objetos de 10-20 propiedades en lugar de CSS modules o styled-components | Mantenibilidad / Consistencia | Imposible mantener consistencia visual, duplicación masiva de estilos |
| 38 | **M** | `jobs/pages/JobsPage.jsx` | 1782–1810 | **Duplicación de código de paginación** — El bloque de paginación se repite idéntico dos veces (para jobs y applications) | DRY violation | ~60 líneas duplicadas |
| 39 | **M** | `auth/components/RegistrationWizard.jsx` | 681–756 | **Cascada de `try/catch` con `console.warn`** — 4 llamadas secuenciales al backend, cada una con su propio try/catch y console.warn | Patrón frágil | Si una falla, las demás se ejecutan sin contexto |
| 40 | **B** | `shared/lib/mexicoLocations.js` | 1–897 | **897 líneas de datos estáticos** — Catálogo de estados y municipios de México | Podría moverse a un JSON estático | Impacto en bundle size |
| 41 | **B** | `jobs/pages/JobsPage.jsx` | 186–245 | **Datos ficticios hardcodeados en CvDocumentPreview** — Habilidades, experiencia, educación son strings literales | Hardcoded content | Confunde al usuario final |
| 42 | **B** | `shared/lib/feedPreferences.js` | — | **Módulo de preferencias sin integración clara** | Posible código muerto o subutilizado | Mantenimiento innecesario |

---

## 2. 📁 Plan de Reestructuración Modular

### 2.1. Archivos que violan el límite de 700 líneas

#### `src/features/jobs/pages/JobsPage.jsx` (1,998 líneas → reestructurar)

```
src/features/jobs/
├── index.js                          # API pública de la feature
├── constants/
│   └── jobsMessages.js               # (ya existe)
├── hooks/
│   ├── useJobs.js                    # (ya existe)
│   └── useJobsWorkflow.js            # 🆕 Hook de orquestación: paginación, filtros, tabs
├── components/
│   ├── CreateJobModal.jsx            # 🆕 ~70 líneas (extraído)
│   ├── ApplicationModal.jsx          # 🆕 ~450 líneas (extraído, incluye sub-pasos)
│   │   ├── CandidateStep.jsx         # 🆕 Paso 0: selección de candidato
│   │   ├── LocationStep.jsx          # 🆕 Paso 1: ubicación
│   │   ├── CvUploadStep.jsx          # 🆕 Paso 2: carga de CV
│   │   └── ReviewStep.jsx            # 🆕 Paso 3: revisión
│   ├── CvDocumentPreview.jsx         # 🆕 ~130 líneas (extraído)
│   ├── MessageModal.jsx              # 🆕 ~120 líneas (extraído)
│   ├── JobCard.jsx                   # 🆕 ~120 líneas (extraído)
│   └── ApplicationCard.jsx           # 🆕 ~80 líneas (extraído)
├── pages/
│   └── JobsPage.jsx                  # 🔄 ~200 líneas (solo shell + orquestación)
└── __tests__/
    └── useJobs.test.jsx              # (ya existe)
```

#### `src/features/auth/components/RegistrationWizard.jsx` (1,469 líneas → reestructurar)

```
src/features/auth/components/
├── RegistrationWizard.jsx            # 🔄 ~200 líneas (shell del wizard)
├── registration/
│   ├── StepRole.jsx                  # 🆕 Selección de rol
│   ├── StepBasicInfo.jsx             # 🆕 Datos básicos
│   ├── StepScales.jsx                # 🆕 Escalas de vida
│   ├── StepProfiling.jsx             # 🆕 Perfil de necesidades
│   ├── StepDocuments.jsx             # 🆕 Documentos de identidad
│   ├── StepInterests.jsx             # 🆕 Intereses y preferencias
│   └── useRegistrationWorkflow.js    # 🆕 Hook de estado del wizard
```

#### `src/features/auth/pages/AuthPage.jsx` (1,157 líneas → reestructurar)

```
src/features/auth/pages/
├── AuthPage.jsx                      # 🔄 ~150 líneas (shell con routing)
├── auth/
│   ├── LoginForm.jsx                 # 🆕 ~150 líneas
│   ├── RegisterForm.jsx              # 🆕 ~200 líneas
│   ├── ForgotPasswordForm.jsx        # 🆕 ~100 líneas
│   ├── useAuthForm.js                # 🆕 Hook de formulario
│   ├── passwordStrength.js           # 🆕 Utilidad pura (getPasswordStrength)
│   └── mapErrorMessage.js            # 🆕 Utilidad pura
```

#### `src/features/landing/pages/LandingPage.jsx` (998 líneas → reestructurar)

```
src/features/landing/pages/
├── LandingPage.jsx                   # 🔄 ~150 líneas (composición)
├── landing/
│   ├── HeroSection.jsx               # 🆕
│   ├── FeaturesSection.jsx           # 🆕
│   ├── TestimonialsSection.jsx       # 🆕
│   ├── StatsSection.jsx              # 🆕
│   └── CtaSection.jsx                # 🆕
```

#### `src/features/tutor/pages/TutorPage.jsx` (979 líneas → reestructurar)

```
src/features/tutor/pages/
├── TutorPage.jsx                     # 🔄 ~200 líneas (shell)
├── tutor/
│   ├── DependientesList.jsx          # 🆕
│   ├── DependentDetailPanel.jsx      # 🆕
│   ├── AiChatPanel.jsx               # 🆕
│   └── useTutorWorkflow.js           # 🆕 Hook de orquestación
```

#### `src/shared/components/shared.jsx` (265 líneas → descomponer)

```
src/shared/components/
├── shared.jsx                        # ❌ ELIMINAR
├── icons/
│   └── Icons.jsx                     # 🆕 Solo el objeto Icons (40+ iconos)
├── branding/
│   ├── BrandMark.jsx                 # 🆕
│   └── AppFooter.jsx                 # 🆕
├── navigation/
│   └── TopNav.jsx                    # 🆕 (reemplaza el de shared)
├── ui/
│   ├── CategoryTag.jsx               # 🆕
│   ├── LeafIcon.jsx                  # 🆕
│   └── VerifiedBadge.jsx             # 🆕
├── styles/
│   └── sharedStyles.js               # 🆕 labelStyle, inputStyle, CATEGORY_COLORS, CATEGORY_LABELS
└── utils/
    └── hashColor.js                  # 🆕
```

### 2.2. Archivos en riesgo (>600 líneas)

| Archivo | Líneas | Acción Recomendada |
|---------|--------|--------------------|
| `AccessibilityBar.jsx` | 814 | Separar lógica TTS en `useTtsEngine.js`, keyboard handler en `useKeyboardNav.js` |
| `CrearInstitucionPage.jsx` | 685 | Extraer form sections en componentes dedicados |
| `MessagesPage.jsx` | 668 | Separar `ChatWindow`, `ConversationList`, `MessageInput` |
| `ProfilePage.jsx` | 620 | Extraer `AvatarSection`, `PersonalInfoForm`, `PreferencesPanel` |
| `TopNav.jsx` (auth) | 602 | Extraer `SearchBar` en componente propio, hook `useRecentSearches` |

---

## 3. 🔧 Violaciones de Feature-Driven Architecture

### 3.1. Imports profundos entre features (6 violaciones)

| Archivo Origen | Importa desde | Símbolo |
|---------------|---------------|---------|
| `jobs/pages/JobsPage.jsx` | `@features/institutions/hooks/useInstitutions` | `useMiInstitucion` |
| `jobs/pages/JobsPage.jsx` | `@features/social/hooks/useMessages` | `useMessages`, `useSendMessage` |
| `jobs/pages/JobsPage.jsx` | `@features/tutor` | `useDependientes`, `useUpdateDependent` |
| `favorites/hooks/useFavorites.js` | `@features/institutions/hooks/useInstitutions` | `mapInstitucion` |
| `rutas/pages/EscalasVidaPage.jsx` | `@features/profile/hooks/useProfile` | `useSaveEscalasVida` |
| `admin/index.js` | `@features/users`, `@features/institutions`, `@features/reviews` | Re-exporta hooks de otros features |

**Solución:**
- `mapInstitucion` → mover a `src/shared/lib/mapInstitucion.js`
- `useSaveEscalasVida` → mover a `src/shared/hooks/useEscalasVida.js` o a `rutas/hooks/`
- Los imports de `jobs`→`institutions`, `jobs`→`social`, `jobs`→`tutor` → Crear interfaces en los `index.js` de cada feature y pasar dependencias vía props o context
- `admin/index.js` → No re-exportar; consumidor importa directamente de cada feature

### 3.2. `shared/lib/api.js` acoplado a Zustand store

```js
// ❌ ACTUAL (línea 5)
import { useAuthStore } from '@features/auth/store/authStore'

// ✅ PROPUESTO: Inyectar la función de logout
// api.js no debería conocer el store. En su lugar, el interceptor
// recibe un callback de logout inyectado desde main.jsx o App.jsx
```

---

## 4. 📋 Inventario de `console.log` en Producción

| Archivo | Líneas | Cantidad | Tipo | Riesgo |
|---------|--------|----------|------|--------|
| `auth/hooks/useAuth.js` | 73, 78, 96, 101, 133, 149, 152 | 7 | `console.log` | **Alto** — loguea tokens, estado de auth |
| `notifications/hooks/useFCM.js` | 40, 42, 51, 56, 62, 72, 78, 85, 90, 104, 108, 116, 129, 131, 155 | 15 | `console.log/warn/error` | **Alto** — tokens FCM, estado de permisos |
| `shared/lib/storage.js` | 51, 53, 60, 61 | 4 | `console.log/warn` | **Alto** — estado de refresh token |
| `institutions/hooks/useInstitutions.js` | 208, 211, 225, 228, 232 | 5 | `console.log/error` con `[DEBUG]` | **Medio** — debug code residual |
| `auth/lib/firebaseBridge.js` | 44, 99, 114 | 3 | `console.warn/log` | **Alto** — estado de Firebase bridge |
| `auth/components/RegistrationWizard.jsx` | 681, 708, 733, 741, 756 | 5 | `console.warn/error` | **Medio** — errores de registro |
| `institutions/components/PostulacionesTab.jsx` | 61 | 1 | `console.error` | **Bajo** |
| `jobs/pages/JobsPage.jsx` | 554 | 1 | `console.warn` | **Bajo** |
| `notifications/hooks/useNotifications.js` | 98 | 1 | `console.error` | **Bajo** |
| `notifications/lib/firebase.js` | 37 | 1 | `console.warn` | **Bajo** |
| `tutor/hooks/useAI.js` | 27, 64, 110 | 3 | `console.warn` | **Bajo** — rate limiting |
| `auth/hooks/useSessionVerify.js` | 74, 82 | 2 | `console.log/error` | **Medio** — datos de sesión |
| **TOTAL** | | **~49** | | |

**Solución recomendada:**
```js
// src/shared/lib/logger.js
const IS_DEV = import.meta.env.DEV

export const logger = {
  log: (...args) => IS_DEV && console.log(...args),
  warn: (...args) => IS_DEV && console.warn(...args),
  error: (...args) => IS_DEV && console.error(...args),
  debug: (...args) => IS_DEV && console.debug(...args),
}
```

Reemplazar todos los `console.log/warn/error` directos por `logger.*`. Los errores críticos que deben persistir en producción usarían un servicio de error tracking (Sentry, etc.).

---

## 5. 🗂️ Inventario de `localStorage` No Centralizado

### Keys hardcodeadas en componentes:

| Key Pattern | Archivos que la usan | Riesgo |
|------------|---------------------|--------|
| `raices_user_phone_${id}` | JobsPage.jsx (×5) | Sin validación, datos personales |
| `raices_user_cp_${id}` | JobsPage.jsx (×3) | Sin validación |
| `raices_user_address_${id}` | JobsPage.jsx (×3) | Sin validación |
| `raices_user_cv_${id}` | JobsPage.jsx (×3) | Datos de CV en localStorage |
| `raices_dep_birth_date_${id}` | TutorPage.jsx (×5) | **Datos sensibles de PCD** |
| `raices_birth_date_${userId}` | useAuth.js (×3) | Datos sensibles |
| `raices_age_${userId}` | useAuth.js (×2) | Datos personales |
| `raices_user_interests` | RegistrationWizard.jsx, DashboardPage.jsx, ProfilePage.jsx | Sin validación de esquema |
| `raices_user_viability` | RegistrationWizard.jsx | — |
| `raices_user_formatos` | RegistrationWizard.jsx | — |
| `raices_ai_narrative` | RegistrationWizard.jsx | — |
| `recent_searches` | TopNav.jsx | Sin try/catch en JSON.parse |
| `sidebar_collapsed` | AppSidebar.jsx | — |
| `admin-tab` | uiStore.js | — |
| `inst-portal-tab` | uiStore.js | — |

**Solución:** Crear `src/shared/lib/userDataStore.js` con funciones tipadas:
```js
export const userDataStore = {
  getPhone: (id) => localStorage.getItem(`raices_phone_${id}`) || '',
  setPhone: (id, val) => localStorage.setItem(`raices_phone_${id}`, val),
  getCv: (id) => { try { return JSON.parse(localStorage.getItem(`raices_cv_${id}`)) } catch { return null } },
  // ... etc
}
```

---

## 6. 🐛 Problemas de Ciclo de Vida en `useEffect`

### 6.1. `eslint-disable react-hooks/set-state-in-effect` (3 ocurrencias)

| Archivo | Línea | Contexto |
|---------|-------|----------|
| `JobsPage.jsx` | 469 | `useEffect(() => { setCurrentPage(1) }, [searchTerm, modality, tab])` |
| `JobsPage.jsx` | 1647 | Mismo patrón duplicado |
| `EditarInstitucionPage.jsx` | 66 | Patrón similar |

**Problema:** Llamar `setState` dentro de `useEffect` causa un render extra. En estos casos, la solución correcta es usar `useMemo` para derivar el estado o usar una key en el componente padre para resetear.

**Solución para JobsPage:**
```jsx
// ❌ ACTUAL
useEffect(() => {
  setCurrentPage(1)
}, [searchTerm, modality, tab])

// ✅ PROPUESTO: Derivar página actual con useMemo
const currentPage = useMemo(() => 1, [searchTerm, modality, tab])
// O mejor aún: mover paginación a un custom hook que maneje el reset internamente
```

### 6.2. `setTimeout` sin cleanup en `JobsPage.jsx`

```jsx
// ❌ ACTUAL (línea 501)
setTimeout(() => {
  // ... setCvFile, setCvFileUrl, setIsUploading
}, 1000)

// ✅ PROPUESTO
useEffect(() => {
  if (!pendingFile) return
  const timer = setTimeout(() => {
    // procesar archivo
  }, 1000)
  return () => clearTimeout(timer)
}, [pendingFile])
```

### 6.3. `ExplorePage.jsx` — `initScrollReveal` en useEffect

```jsx
// Línea 125: useEffect depende de `visible` que cambia en cada scroll
// Esto re-inicializa scroll reveal en cada cambio de página
useEffect(() => {
  const cleanup = initScrollReveal()
  return () => { if (cleanup) cleanup() }
}, [visible]) // ⚠️ visible cambia frecuentemente
```

---

## 7. 🔐 Problemas de Seguridad

| # | Problema | Ubicación | Severidad |
|---|---------|-----------|-----------|
| 1 | Tokens de refresh accedidos y logueados en consola | `shared/lib/storage.js:51-61` | **Crítica** |
| 2 | Tokens de Firebase API key en `import.meta.env` sin validación de exposición | `auth/lib/firebaseBridge.js:41` | **Media** |
| 3 | Fechas de nacimiento de PCD en `localStorage` sin cifrado | `tutor/pages/TutorPage.jsx` (×5) | **Alta** |
| 4 | Datos de CV (nombre, email, teléfono) en `localStorage` | `jobs/pages/JobsPage.jsx` (×10+) | **Alta** |
| 5 | `JSON.parse` sin `try/catch` en múltiples archivos | DashboardPage, TopNav | **Media** |

---

## 8. 📐 Resumen de Métricas

| Métrica | Valor |
|---------|-------|
| **Total de archivos fuente (.jsx/.js)** | ~100 |
| **Total de líneas de código** | ~30,073 |
| **Archivos >700 líneas** | 6 (críticos: JobsPage, RegistrationWizard, AuthPage) |
| **Archivos >600 líneas** | 6 adicionales (en riesgo) |
| **Imports profundos entre features** | 6 violaciones |
| **`console.log/warn/error` en producción** | ~49 instancias |
| **Usos directos de `localStorage`** | 75+ (sin encapsulamiento) |
| **`eslint-disable` en hooks** | 3 ocurrencias |
| **Estilo: 100% inline styles** | ~100% de componentes |
| **Tests detectados** | 21 archivos de test |

---

## 9. 🎯 Plan de Acción Priorizado

### Fase 1 — Crítico (Semana 1-2)
1. **Descomponer `JobsPage.jsx`** en sub-componentes (~7 archivos nuevos)
2. **Descomponer `RegistrationWizard.jsx`** en steps modulares (~7 archivos nuevos)
3. **Descomponer `AuthPage.jsx`** en formularios separados (~5 archivos nuevos)
4. **Crear `src/shared/lib/logger.js`** y reemplazar los 49 console.log
5. **Centralizar `localStorage`** en `src/shared/lib/userDataStore.js`

### Fase 2 — Alto (Semana 3-4)
6. **Descomponer `shared.jsx`** en módulos (icons, branding, navigation, ui, styles)
7. **Resolver imports profundos** — mover `mapInstitucion` a shared, crear interfaces de feature
8. **Desacoplar `api.js`** del store de Zustand (inyección de dependencias)
9. **Descomponer `LandingPage.jsx`** y `TutorPage.jsx`
10. **Eliminar `eslint-disable`** — refactorizar useEffect problemáticos

### Fase 3 — Medio (Semana 5-6)
11. **Descomponer** `AccessibilityBar.jsx`, `TopNav.jsx` (auth), `ProfilePage.jsx`, `MessagesPage.jsx`
12. **Mover `mexicoLocations.js`** a JSON estático + lazy loading
13. **Implementar CSS modules** o sistema de diseño consistente (eliminar inline styles progresivamente)
14. **Eliminar `CvDocumentPreview` hardcoded** — conectar con datos reales del backend
15. **Refactorizar paginación duplicada** en `JobsPage`

### Fase 4 — Bajo (Semanas 7+)
16. **Auditar `backendEndpoints.js`** — dividir en archivos por dominio si crece
17. **Revisar `feedPreferences.js`** — determinar si se usa o eliminar
18. **Implementar error boundary global** con Sentry o similar
19. **Documentar contratos de API** con tipos JSDoc o migración a TypeScript

---

## 10. ✅ Lo Que Se Hace Bien

- **Feature-Driven Architecture base:** La estructura de carpetas `src/features/[name]/` con `index.js` está bien establecida
- **Constantes centralizadas:** La mayoría de features tienen `constants/[name]Messages.js`
- **Hooks personalizados bien nombrados:** `useAuth`, `useJobs`, `useInstitutions`, etc.
- **Backend endpoints documentados:** `backendEndpoints.js` es un contrato claro y completo
- **Stores Zustand separados:** `authStore`, `uiStore`, `a11yStore` están bien ubicados
- **Interceptores Axios robustos:** El sistema de refresh token con cola de peticiones está bien implementado en `api.js`
- **Cache ETags:** Implementación correcta de cache condicional
- **Error handling en auth:** `forceLogout`, detección de storage cleared, manejo de 401
- **Testing base:** 21 archivos de test cubriendo stores, hooks y componentes clave

---

*Documento generado el 26 de agosto de 2026 como parte de la auditoría técnica de raices-frontend.*
