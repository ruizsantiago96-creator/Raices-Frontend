# 📋 Reporte: Algoritmo de Feed (Estilo Reddit)

**Fecha:** 1 de septiembre de 2026  
**Proyecto:** Raíces — Plataforma de inclusión  
**Archivo principal:** `src/features/dashboard/pages/DashboardPage.jsx`


---

## 2. Fuentes de Datos (3 endpoints)

| Fuente | Endpoint | Hook | Límite |
|--------|----------|------|--------|
| Instituciones | `GET /descubrimiento` | `useDiscovery()` | Sin límite explícito |
| Publicaciones | `GET /comunidad/publicaciones` | `usePosts({ limite: 20 })` | 20 |
| Foros | `GET /comunidad/foros` | `useForos()` | Sin límite explícito |

---

## 3. Pipeline Completo del Algoritmo

### Paso 1: Obtener datos crudos

```javascript
const { data: recommendations = [] } = useDiscovery()    // Instituciones
const { data: posts = [] } = usePosts({ limite: 20 })    // Publicaciones
const { data: foros = [] } = useForos()                   // Foros
```

### Paso 2: Construir feed unificado

Todos los items se normalizan a una forma común:

```javascript
{
  _type: 'institution' | 'post' | 'forum',
  _id: string,
  _score: 0,                    // Se calcula después
  _createdAt: ISO string,
  _category: 'funcional' | 'educativo' | 'laboral' | 'social',
  _title: string,
  _description: string,
  _likes: number,
  _comments: number,
  _raw: object                  // Datos originales del backend
}
```

**Filtrado de instituciones:**
- Si el usuario tiene preferencias de registro → solo muestra instituciones que coincidan con sus categorías activas
- Si NO tiene preferencias → muestra todas las instituciones

```javascript
// Solo instituciones que coincidan con las categorías del usuario
if (hasPreferences && !activeCategories.has(inst.category)) continue
```

**Publicaciones y foros:** Siempre se muestran todos (no se filtran por preferencias por ahora, se planea hacer).

### Paso 3: Scoring (función `scoreItem`)

Cada item recibe un puntaje calculado con **5 factores**:

#### Factor 1: Coincidencia de categoría con intereses del registro (×10)

```javascript
// Mapeo de ~50 intereses → 4 categorías del backend
// Ejemplo: 'Deporte adaptado' → 'funcional'
//          'Primer empleo' → 'laboral'
//          'Música' → 'social'

score += interestWeights[cat] * 10
```

| Categoría backend | Intereses que la alimentan | Peso base |
|-------------------|---------------------------|-----------|
| `funcional` | Deporte, bienestar, salud, movilidad, comunicación, vida independiente | ~20 intereses |
| `educativo` | Pintura, literatura, manualidades, finanzas, organización, orientación, futuro | ~8 intereses |
| `laboral` | Empleo, capacitación, emprendimiento, autoempleo, negocio propio | ~12 intereses |
| `social` | Música, danza, teatro, cultura, amistades, eventos, comunidad | ~14 intereses |

**Peso calculado:** Cada interés que el usuario seleccionó en el registro suma +1 a la categoría correspondiente. Luego se multiplica ×10.

**Ejemplo:** Si el usuario seleccionó "Música" + "Danza" + "Amistades":
- `interestWeights = { funcional: 0, educativo: 0, laboral: 0, social: 3 }`
- Una publicación de categoría `social` recibe: `3 × 10 = 30 puntos`

#### Factor 2: Engagement del usuario (localStorage)

```javascript
score += engagementWeights[cat]
```

Se trackean interacciones del usuario en `localStorage` con clave `raices_engagement`:

| Acción | Peso | Ejemplo |
|--------|------|---------|
| `save` (guardar favorito) | 10 | Guardar una institución |
| `view_detail` (ver detalle) | 5 | Hacer clic en "Ver más" |
| `click_card` (clic en tarjeta) | 2 | Hacer clic en el nombre |

**Cálculo:** Se suman los pesos de todas las interacciones de los últimos 30 días, agrupadas por categoría.

**Ejemplo:** Si el usuario guardó 2 instituciones de tipo `laboral` y hizo clic en 1 de tipo `social`:
- `engagementWeights = { funcional: 0, educativo: 0, laboral: 20, social: 2 }`

#### Factor 3: Matching textual (fallback)

```javascript
// Busca si el título o descripción contienen palabras de los intereses
for (const interest of interests) {
  if (name.includes(interest)) score += 5    // Match en título
  if (desc.includes(interest)) score += 3    // Match en descripción
}
```

Busca coincidencias directas de texto entre los intereses del usuario y el título/descripción del item.

#### Factor 4: Popularidad (likes + comentarios)

```javascript
score += (item._likes ?? 0) * 2
score += (item._comments ?? 0) * 1.5
```

| Métrica | Peso |
|---------|------|
| Like | ×2 |
| Comentario/respuesta | ×1.5 |

#### Factor 5: Recencia (boost temporal)

```javascript
const age = (Date.now() - createdAt) / hours

if (age < 1)  score += 20    // < 1 hora
if (age < 24) score += 10    // < 1 día
if (age < 72) score += 5     // < 3 días
// > 3 días: sin boost
```

### Paso 4: Ordenamiento (función `sortFeed`)

3 modos de ordenamiento:

| Modo | Criterio | Fórmula |
|------|----------|---------|
| 🔥 **Relevantes** (default) | Score calculado | `b._score - a._score` |
| 🕐 **Recientes** | Fecha de creación | `b.createdAt - a.createdAt` |
| ⭐ **Populares** | Likes + comentarios | `(b.likes + b.comments × 1.5) - (a.likes + a.comments × 1.5)` |

---

## 4. Flujo Visual Completo

```
Usuario abre Dashboard
        │
        ▼
┌───────────────────┐
│  useDiscovery()    │──── GET /descubrimiento
│  usePosts(limite)  │──── GET /comunidad/publicaciones?limite=20
│  useForos()        │──── GET /comunidad/foros
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Filtro:           │
│  ¿Tiene prefs?     │── SÍ → Solo categorías activas
│                    │── NO → Todos
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Normalizar:       │
│  → _type           │
│  → _category       │
│  → _likes/comments │
│  → _createdAt      │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  scoreItem() × N   │
│                    │
│  + catMatch × 10   │  ← Intereses del registro
│  + engagement      │  ← localStorage (últimos 30 días)
│  + textMatch       │  ← Título/descripción × intereses
│  + likes × 2       │  ← Popularidad
│  + comments × 1.5  │  ← Popularidad
│  + recencyBoost    │  ← <1h: +20, <24h: +10, <72h: +5
│                    │
│  = _score total    │
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  sortFeed(mode)    │
│                    │
│  relevantes → desc by _score
│  recientes  → desc by createdAt
│  populares  → desc by (likes+comments×1.5)
└───────┬───────────┘
        │
        ▼
┌───────────────────┐
│  Renderizar UI     │
│                    │
│  FeedCard (inst)   │── Tarjeta estilo Reddit con imagen
│  CommunityPostCard │── Post de comunidad con likes
│  ForumFeedCard     │── Foro con pregunta detonante
└───────────────────┘
```

---

## 5. Tracking de Engagement

### Qué se trackea (en localStorage)

```javascript
// Estructura en localStorage:
{
  "funcional": [
    { "id": "inst-123", "action": "save", "ts": 1693500000000 },
    { "id": "inst-456", "action": "click_card", "ts": 1693500100000 }
  ],
  "laboral": [
    { "id": "inst-789", "action": "view_detail", "ts": 1693500200000 }
  ]
}
```

### Qué se trackea en el backend

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `POST /usuarios/interacciones` | `registrarInteraccion()` | Registra interacción server-side |
| `GET /usuarios/interacciones/pesos` | `useInteraccionesPesos()` | Pesos acumulados últimos 30 días |

### Dónde se dispara el tracking

| Acción | Dónde | Método |
|--------|-------|--------|
| Guardar favorito | `DashboardPage → handleToggleFav` | `trackEngagement(id, 'save', category)` + `useRegistrarInteraccion` |
| Clic en tarjeta | `FeedCard → <Link onClick>` | `trackEngagement(id, 'click_card', category)` |
| Ver detalle | `ExplorePage → trackClick` | `trackInteraccion.mutate({ tipo: 'click_card' })` |

---

## 6. Mapeo de Intereses del Registro

El RegistrationWizard ofrece ~50 intereses en 8 secciones:

| Sección | Intereses | Categoría mapeada |
|---------|-----------|-------------------|
| Deporte / Movimiento | Actividad física, deporte adaptado, rehabilitación | `funcional` |
| Bienestar | Terapias, salud mental, atención médica | `funcional` |
| Empleo | Primer empleo, empleo adaptado, capacitación | `laboral` |
| Autoempleo | Emprendimiento, negocio propio, marca personal | `laboral` |
| Arte / Cultura | Música, danza, teatro, pintura | `social` / `educativo` |
| Independencia | Vida cotidiana, movilidad, comunicación | `funcional` |
| Vida social | Amistades, eventos, relaciones, comunidad | `social` |
| Explorar | Descubrir intereses, nuevas experiencias | `social` |

---

## 7. Endpoints del Backend

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `GET /descubrimiento` | `useDiscovery` | Lista instituciones (con filtros opcionales) |
| `GET /usuarios/recomendaciones` | `useRecomendaciones` | Recomendaciones personalizadas (60% perfil + 40% comportamiento) |
| `POST /usuarios/interacciones` | `useRegistrarInteraccion` | Registra interacción server-side |
| `GET /usuarios/interacciones/pesos` | `useInteraccionesPesos` | Pesos de comportamiento por categoría |
| `GET /comunidad/publicaciones` | `usePosts` | Publicaciones de la comunidad |
| `GET /comunidad/foros` | `useForos` | Foros de discusión |
| `POST /ia/recomendaciones` | `useAINextSteps` | Recomendaciones IA (solo tutor) |

---

## 8. Cache de React Query

| Query Key | staleTime | Notas |
|-----------|-----------|-------|
| `['discovery', params]` | Default | Sin staleTime explícito |
| `['posts', grupoId, pagina, limite, buscar]` | Default | Sin staleTime explícito |
| `['foros']` | Default | Sin staleTime explícito |
| `['recomendaciones']` | 10 min | Más estable |
| `['interacciones-pesos']` | 5 min | Para UI de pesos |

**Invalidación:**
- Al guardar favorito: invalida `['posts']` y `['conectemos']`
- Al crear publicación: invalida `['posts']`
- Al registrar interacción: invalida `['interacciones-pesos']`

---

## 9. Componentes de UI

| Componente | Archivo | Estilo | Descripción |
|------------|---------|--------|-------------|
| `FeedCard` | `DashboardPage.jsx` | Reddit/TikTok | Tarjeta de institución con imagen, rating, favorito, ubicación |
| `CommunityPostCard` | `FeedCards.jsx` | Reddit | Post de comunidad con avatar, likes, comentarios |
| `ForumFeedCard` | `FeedCards.jsx` | Reddit | Foro con título, pregunta detonante, respuestas |
| `FeedItemSkeleton` | `FeedCards.jsx` | Skeleton | Placeholder de carga |
| `NextStepsCard` | `AICards.jsx` | AI Card | Siguientes pasos sugeridos por IA |
| `ProfileSummaryCard` | `AICards.jsx` | AI Card | Resumen del perfil generado por IA |

---

## 10. Ejemplo Numérico Completo

**Usuario:** Seleccionó "Música" (→ social) + "Deporte adaptado" (→ funcional) + "Primer empleo" (→ laboral) en el registro. Guardó 1 institución laboral.

**Instituciones disponibles:**
| Institución | Categoría | Likes | Comentarios | Edad |
|-------------|-----------|-------|-------------|------|
| A: Centro de Terapia | funcional | 5 | 3 | 2h |
| B: Escuela de Arte | social | 12 | 8 | 25h |
| C: Empleo Inclusivo | laboral | 3 | 1 | 50h |

**Cálculo de scores:**

```
interestWeights = { funcional: 1, educativo: 0, laboral: 1, social: 1 }
engagementWeights = { funcional: 0, educativo: 0, laboral: 10, social: 0 }

─── Institución A (funcional, 5 likes, 3 comments, 2h) ───
catMatch:      1 × 10 = 10
engagement:    0
textMatch:     0
likes:         5 × 2 = 10
comments:      3 × 1.5 = 4.5
recency:       <24h → +10
TOTAL:         34.5

─── Institución B (social, 12 likes, 8 comments, 25h) ───
catMatch:      1 × 10 = 10
engagement:    0
textMatch:     0
likes:         12 × 2 = 24
comments:      8 × 1.5 = 12
recency:       >24h y <72h → +5
TOTAL:         51

─── Institución C (laboral, 3 likes, 1 comment, 50h) ───
catMatch:      1 × 10 = 10
engagement:    10 (guardó 1 de laboral)
textMatch:     0
likes:         3 × 2 = 6
comments:      1 × 1.5 = 1.5
recency:       >72h → +0
TOTAL:         27.5

─── Orden "Relevantes" ───
1. B (social) → 51
2. A (funcional) → 34.5
3. C (laboral) → 27.5
```
