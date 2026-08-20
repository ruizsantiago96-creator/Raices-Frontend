# Reporte de revisión de calidad de código

**Proyecto:** `raices-frontend`  
**Ámbito:** `src/`  
**Fecha:** 2026-08-19  
**Enfoque:** calidad de código, modularidad, estructura de componentes, dependencias entre features, efectos React y señales de deuda técnica.

## Resumen ejecutivo

La estructura base es razonable: el proyecto intenta aplicar una organización **feature-driven**, usa aliases (`@features`, `@shared`) y concentra la lógica de acceso a datos en hooks apoyados por TanStack Query. La suite actual también ofrece una base útil: `17` archivos de prueba y `346` tests pasan.

El principal riesgo no es la ausencia de una estructura, sino su aplicación desigual. Varias páginas concentran cerca de 1,000-2,000 líneas, contienen modales y componentes auxiliares internos, y mezclan estado de formulario, llamadas de red, permisos, navegación y presentación. Además, las reglas de React detectan patrones que pueden producir renders inconsistentes o efectos con cierres obsoletos. La arquitectura documentada como API pública de features tampoco se respeta en todos los imports.

### Indicadores observados

| Indicador | Resultado |
|---|---:|
| Tests | 346 pasando en 17 archivos |
| Lint | 0 errores, 86 warnings |
| Página más grande revisada | `JobsPage.jsx`, 1,998 líneas |
| Otro foco grande | `AuthPage.jsx`, 1,117 líneas |
| Logs directos en `src` | Presentes en auth, storage, FCM e instituciones |
| Imports internos entre features | Presentes en varios módulos |

## Hallazgos priorizados

### Alta prioridad

#### H-01. Mutación de refs y estado durante el render

**Referencias:**

- `src/features/auth/pages/AuthPage.jsx:281-285`
- `src/features/institutions/pages/ExplorePage.jsx:89-94`

En `AuthPage`, la decisión de redirección depende de `didLoginRef.current` durante el render. En `ExplorePage`, se compara y actualiza `prevFilterKeyRef.current` y además se llama `setVisibleCount` durante el render. ESLint lo reporta explícitamente como `react-hooks/refs`.

Esto mezcla cálculo de UI con mutaciones imperativas y puede provocar renders difíciles de razonar, comportamiento distinto bajo `StrictMode` y warnings o incompatibilidades con optimizaciones futuras de React. En `ExplorePage`, el `setState` durante render es especialmente delicado porque cada cambio de filtros puede disparar una actualización mientras el árbol aún se está evaluando.

**Recomendación:** mover la sincronización de `visibleCount` a un `useEffect` dependiente de `filterKey`, o derivar el valor sin estado adicional. Para la redirección de auth, modelar explícitamente el estado de navegación/login y ejecutar la navegación en un efecto, o usar un estado React que represente el login en curso en lugar de leer una ref como condición de render.

#### H-02. Páginas monolíticas con demasiadas responsabilidades

**Referencias:**

- `src/features/jobs/pages/JobsPage.jsx:1-1998`
- `src/features/auth/pages/AuthPage.jsx:250-1117`
- `src/features/landing/pages/LandingPage.jsx` (componente de gran tamaño)
- `src/features/social/pages/SocialPage.jsx` (lógica de página y mensajería)

`JobsPage` contiene formularios, modales, selección de candidatos, filtros, postulaciones, mensajería y lógica específica de dependientes. `AuthPage` concentra login, registro, validaciones, navegación por rol, consentimiento y el wizard de registro. La página deja de ser un ensamblador y pasa a ser un módulo de dominio completo.

El impacto es alto en mantenibilidad y testing: un cambio visual puede tocar lógica de mutación; un cambio de endpoint puede requerir navegar un archivo enorme; y los componentes no se pueden probar aisladamente sin arrastrar gran parte del contexto.

**Recomendación:** extraer por caso de uso y responsabilidad, no solo por tamaño. En jobs, separar como mínimo `JobFilters`, `JobList`, `CreateJobModal`, `ApplyJobModal`, `ApplicationsTab` y `CandidateMessaging`. En auth, separar `LoginForm`, `RegistrationWizard`, `AuthRedirect` y validadores/modelos de formulario. Mantener las páginas como composición de hooks y componentes.

#### H-03. Dependencias entre features que evitan la API pública documentada

**Referencias:**

- `src/features/jobs/pages/JobsPage.jsx:4-5`
- `src/features/favorites/hooks/useFavorites.js:3`
- `src/features/profile/hooks/useProfile.js:4`
- `src/features/rutas/pages/EscalasVidaPage.jsx:3`
- `src/features/auth/components/TopNav.jsx:4`
- `src/shared/lib/api.js:3`

La documentación establece que una feature debe exponerse mediante su `index.js`, pero hay imports directos hacia `hooks`, `store` y otros detalles internos de otras features. Ejemplos: jobs consume hooks internos de institutions y social; favorites consume `mapInstitucion` desde un hook de institutions; rutas consume un hook interno de profile; y `shared/lib/api.js` depende directamente de `authStore`.

Esto crea acoplamiento estructural y hace que mover un archivo interno rompa consumidores. También dificulta detectar ciclos: `shared` depende de auth, mientras auth depende de shared para almacenamiento, como se ve en `authStore.js` y `api.js`.

**Recomendación:** definir APIs públicas por feature y exportar solo casos de uso estables. Mover mappers puros como `mapInstitucion` a `features/institutions/lib` o `shared/lib` según su alcance. Para auth/api, introducir una dependencia de infraestructura más explícita, por ejemplo un módulo de sesión/token independiente del store React, evitando que `shared/lib/api.js` conozca directamente la implementación de Zustand.

### Prioridad media

#### M-01. Efectos con dependencias incompletas y cierres implícitos

**Referencias:**

- `src/features/notifications/hooks/useFCM.js:137-174`
- `src/features/jobs/pages/JobsPage.jsx:469-474`
- `src/features/a11y/components/AccessibilityBar.jsx:323-330`

ESLint reporta dependencias ausentes para `addToast`, `requestPermission`, `initializeCandidateData` y `handleDragEnd`. En `useFCM`, el comentario afirma que ciertas dependencias son estables, pero no existe una garantía visible en este archivo que permita ignorarlas con seguridad. Si cambia la identidad o la configuración de esos callbacks, el listener puede capturar lógica anterior.

**Recomendación:** incluir las dependencias reales y estabilizar callbacks solo cuando sea necesario; o encapsular cada flujo en hooks más pequeños. Evitar silenciar la regla sin documentar una invariante verificable. Añadir pruebas de montaje/desmontaje y cambio de sesión para FCM.

#### M-02. Código muerto y warnings que reducen la señal del lint

**Referencias representativas:**

- `src/features/admin/pages/AdminPage.jsx:1,15`
- `src/features/dashboard/pages/DashboardPage.jsx:3,13`
- `src/features/institutions/pages/EditarInstitucionPage.jsx:7-33`
- `src/features/jobs/pages/JobsPage.jsx:11,334,1590-1610`
- `src/features/auth/components/RegistrationWizard.jsx:8`

Hay imports, estados, argumentos y variables sin uso. El lint termina con `86` warnings, entre ellos múltiples falsos positivos potenciales mezclados con problemas de hooks reales. Esto reduce la utilidad del pipeline: una regresión importante puede perderse entre deuda menor.

**Recomendación:** limpiar primero imports/variables no usados y eliminar props no implementadas. Convertir progresivamente `no-unused-vars` y las reglas críticas de hooks en errores en CI. Mantener excepciones puntuales, no desactivar reglas a nivel de archivo salvo que exista una razón técnica clara.

#### M-03. Logs de depuración y posible exposición de datos operativos

**Referencias:**

- `src/shared/lib/storage.js:51-61`
- `src/features/auth/hooks/useAuth.js:73-152`
- `src/features/auth/lib/firebaseBridge.js:99-114`
- `src/features/institutions/hooks/useInstitutions.js:208-232`
- `src/features/notifications/hooks/useFCM.js:40-155`

Hay `console.log` en rutas de autenticación, almacenamiento, Firebase, FCM y actualización de instituciones. Aunque algunos logs no imprimen el token completo, sí exponen estados de sesión, correos, roles, respuestas y payloads en la consola del navegador.

**Recomendación:** sustituirlos por un logger con niveles y eliminación/limitación en producción. No registrar respuestas o payloads de autenticación por defecto. Los errores deben conservar contexto seguro y omitir tokens, refresh tokens y datos personales.

#### M-04. `shared/components/shared.jsx` es un módulo de agregación demasiado amplio

**Referencia:** `src/shared/components/shared.jsx:1-265`

El módulo mezcla iconos, constantes de categorías, helpers (`hashColor`), estilos compartidos, navegación (`TopNav`), marca, footer y datos de footer. Esto explica el warning `react-refresh/only-export-components` y hace que cualquier importación de un elemento arrastre un archivo con responsabilidades heterogéneas.

**Recomendación:** dividir al menos en `icons.jsx`, `branding.jsx`, `categoryTag.jsx`, `navigation.jsx` y `sharedStyles.js` o constantes específicas. Mantener `shared` como catálogo de piezas cohesivas, no como un archivo global de componentes y utilidades.

### Prioridad baja

#### L-01. Inconsistencia de convenciones y capas

**Referencias:**

- `src/features/auth/store/authStore.js:2`
- `src/features/auth/components/TopNav.jsx:4`
- `src/App.jsx:8,11`
- `src/features/institutions/pages/ExplorePage.jsx:96-107`

Conviven aliases, imports relativos profundos e imports directos internos desde `App.jsx`. Algunas features tienen API pública real y otras solo un `index.js` vacío. Esto no es incorrecto por sí mismo, pero la convención actual no está automatizada y puede degradarse con nuevas funcionalidades.

**Recomendación:** documentar excepciones de imports de páginas en el entrypoint, crear reglas ESLint o un check simple para imports cross-feature, y decidir qué módulos son realmente públicos. Mantener una sola política de acceso por tipo de módulo.

#### L-02. Datos mock y datos reales viven en el mismo flujo de presentación

**Referencia:** `src/features/institutions/pages/ExplorePage.jsx:102-109`

La página decide si muestra `apiInstitutions` o `MOCK_INSTITUTIONS` según autenticación, mientras también prepara query, favoritos y estado de filtros. Este fallback puede ser válido para UX pública, pero queda mezclado con la vista y hace menos explícito el contrato de datos.

**Recomendación:** encapsular la selección de fuente en un hook/adaptador (`useExploreInstitutions`) y separar estados de carga/error de la experiencia de invitado. Así se podrá retirar el mock o cambiar la política sin reescribir la página.

## Fortalezas

- La organización por dominio es más escalable que una estructura puramente por tipo técnico.
- Se usan aliases consistentes en buena parte del código.
- TanStack Query centraliza cache, queries e invalidaciones en hooks de feature.
- Existe una suite de tests para stores, hooks, componentes compartidos y rutas protegidas.
- El lint ya detecta varios riesgos de React que conviene corregir antes de que se conviertan en bugs silenciosos.
- `App.jsx` mantiene el mapa de rutas centralizado y los guards de autenticación/rol son visibles.

## Plan recomendado

1. Corregir H-01: eliminar mutaciones de refs/estado durante render y resolver los warnings de `react-hooks/refs`.
2. Corregir M-01: completar dependencias de efectos y añadir pruebas para ciclo de vida de FCM y cambio de filtros.
3. Reducir H-02 empezando por `JobsPage` y `AuthPage`, extrayendo componentes por flujo de usuario.
4. Definir las APIs públicas de cada feature y eliminar imports internos cross-feature no justificados.
5. Limpiar código muerto hasta reducir significativamente los `86` warnings.
6. Sustituir logs de depuración por logging controlado y seguro para producción.
7. Dividir `shared/components/shared.jsx` para mejorar aislamiento, fast refresh y descubribilidad.

## Verificación ejecutada

- `npm test -- --run`: **17 archivos, 346 tests pasando**.
- `npm run lint`: **0 errores, 86 warnings**.

El reporte no modifica archivos de `src`. Se detectó un cambio previo no realizado por esta revisión en `src/features/auth/components/RegistrationWizard.jsx`; se dejó intacto.
