# 🔍 Análisis de Deficiencias y Mejoras — Algoritmo de Feed

**Fecha:** 1 de septiembre de 2026  
**Proyecto:** Raíces  
**Objetivo:** Identificar deficiencias del algoritmo de feed y proponer mejoras para revisión por QA

---

## 🔴 DEFICIENCIAS CRÍTICAS

### D1. Las instituciones del feed NO están protegidas por verificación

**Archivo:** `src/features/dashboard/pages/DashboardPage.jsx`  
**Línea:** ~389-401

**Problema:**  
El feed muestra instituciones de `useDiscovery()` sin verificar si están activas o verificadas:

```javascript
for (const inst of recommendations) {
  // Solo filtra por categoría del usuario, NO por is_active o is_verified
  if (hasPreferences && !activeCategories.has(inst.category)) continue
  
  items.push({
    _type: 'institution',
    _category: inst.category,
    // ...
  })
}
```

**Riesgo:** Una institución no verificada o inactiva podría aparecer en el feed de usuarios.

**Mejora propuesta:**
```javascript
for (const inst of recommendations) {
  // Filtrar instituciones no activas o no verificadas
  if (!inst.is_active || !inst.is_verified) continue
  if (hasPreferences && !activeCategories.has(inst.category)) continue
  // ...
}
```

---

### D2. El score no penaliza contenido viejo (solo boost, sin decaimiento)

**Archivo:** `src/features/dashboard/pages/DashboardPage.jsx`  
**Línea:** ~309-315

**Problema:** El algoritmo actual solo da boost a contenido reciente, pero NO penaliza contenido viejo:

```javascript
// 5. Recency boost (newer = higher score)
const age = item._createdAt ? (Date.now() - new Date(item._createdAt).getTime()) / (1000 * 60 * 60) : 999
if (age < 1) score += 20       // < 1 hour
else if (age < 24) score += 10  // < 1 day
else if (age < 72) score += 5   // < 3 days
// > 3 días: sin penalización
```

**Consecuencia:** Un post de comunidad con muchos likes de hace 3 meses siempreará sobre uno nuevo con pocos likes. No hay "decay" como en Reddit o Hacker News.

**Mejora propuesta:**
```javascript
// Agregar decaimiento exponencial
const HOURS = age
const decay = Math.pow(0.95, HOURS) // Se reduce ~5% por hora
score *= decay

// O estilo Reddit: score / (hours + 2)^1.8
score = score / Math.pow(HOURS + 2, 1.8)
```

---

### D3. No hay diversificación de categorías en el feed

**Archivo:** `src/features/dashboard/pages/DashboardPage.jsx`  
**Línea:** ~342-346

**Problema:** El ordenamiento por "Relevantes" simplemente ordena por score descendente. Si el usuario tiene fuerte preferencia por `laboral`, TODO el feed será de tipo laboral.

```javascript
case 'relevantes':
default:
  sorted.sort((a, b) => (b._score ?? 0) - (a._score ?? 0))
  break
```

**Consecuencia:** El usuario ve contenido monótono. No descubre instituciones de otras categorías.

**Mejora propuesta:** Interleaving por categorías:
```javascript
function diversifyFeed(sorted) {
  const buckets = {}
  for (const item of sorted) {
    const cat = item._category ?? 'other'
    if (!buckets[cat]) buckets[cat] = []
    buckets[cat].push(item)
  }
  
  const result = []
  const catKeys = Object.keys(buckets)
  let idx = 0
  
  // Round-robin entre categorías
  while (result.length < sorted.length) {
    const cat = catKeys[idx % catKeys.length]
    if (buckets[cat].length > 0) {
      result.push(buckets[cat].shift())
    }
    idx++
  }
  return result
}
```

---

## 🟡 DEFICIENCIAS FUNCIONALES

### D4. El engagement tracking es solo localStorage, no se sincroniza con el backend

**Archivo:** `src/shared/lib/feedPreferences.js`  
**Problema:** Hay DOS sistemas de tracking paralelos:

| Sistema | Ubicación | Persistencia |
|---------|-----------|-------------|
| `trackEngagement()` | `localStorage` (`raices_engagement`) | Solo en el navegador actual |
| `registrarInteraccion()` | Backend (`POST /usuarios/interacciones`) | Servidor |

El scoring del feed usa `getEngagementWeights()` que solo lee `localStorage`. Los datos del backend (`useInteraccionesPesos`) no se usan para scoring.

**Consecuencia:** Si el usuario cambia de dispositivo o limpia el cache, pierde todo su historial de engagement y el feed se recalcula desde cero.

**Mejora propuesta:** Usar los pesos del backend para scoring:
```javascript
// En DashboardPage.jsx:
const { data: serverWeights } = useInteraccionesPesos()

const engagementWeights = useMemo(() => {
  if (serverWeights?.desglose) {
    return {
      funcional: serverWeights.desglose.guardar * 10 + serverWeights.desglose.ver_detalle * 5 + serverWeights.desglose.click_card * 2,
      // ... similar para otras categorías
    }
  }
  return getEngagementWeights() // Fallback a localStorage
}, [serverWeights])
```

---

### D5. El scoring de posts y foros usa categorías hardcodeadas

**Archivo:** `src/features/dashboard/pages/DashboardPage.jsx`  
**Líneas:** ~404-428

**Problema:** Todos los posts y foros se asignan a categoría `social`:

```javascript
// Posts
items.push({
  _type: 'post',
  _category: 'social',  // ← Hardcoded
  // ...
})

// Foros
items.push({
  _type: 'forum',
  _category: 'social',  // ← Hardcoded
  // ...
})
```

**Consecuencia:** Si el usuario tiene fuerte preferencia por `laboral`, los posts y foros siempre tendrán bajo score porque su categoría es `social`. El engagement de `laboral` no les beneficia.

**Mejora propuesta:** Inferir categoría del contenido del post/foro:
```javascript
function inferCategory(post) {
  const text = `${post.title} ${post.content}`.toLowerCase()
  if (/empleo|trabajo|capacitación|laboral/.test(text)) return 'laboral'
  if (/terapia|salud|rehabilitación/.test(text)) return 'funcional'
  if (/educación|escuela|curso/.test(text)) return 'educativo'
  return 'social'
}
```

---

### D6. No hay "inyección" de contenido no alineado (cold start para nuevos intereses)

**Problema:** Cuando el usuario cambia sus intereses (ej. agrega "laboral"), el feed solo muestra contenido de sus intereses actuales. No hay mecanismo para "inyectar" contenido de categorías nuevas para probar si le interesa.

**Mejora propuesta:** Agregar un % de contenido exploratorio:
```javascript
// 90% contenido alineado + 10% exploratorio
const EXPLORE_RATIO = 0.1
const exploreCount = Math.max(1, Math.floor(items.length * EXPLORE_RATIO))

// Tomar items de categorías NO activas
const exploratory = items
  .filter(i => !activeCategories.has(i._category))
  .sort(() => Math.random() - 0.5)
  .slice(0, exploreCount)

// Insertar en posiciones aleatorias del feed
for (const item of exploratory) {
  const pos = Math.floor(Math.random() * feed.length)
  feed.splice(pos, 0, item)
}
```

---

### D7. No hay límite de posts/foros por tipo en el feed

**Problema:** Si hay 20 posts y 15 foros, el feed podría tener 35 items de comunidad y solo 5 instituciones. No hay balance entre tipos de contenido.

**Mejora propuesta:**
```javascript
// Limitar por tipo
const MAX_INSTITUTIONS = 10
const MAX_POSTS = 8
const MAX_FORUMS = 5

const limitedInstitutions = institutions.slice(0, MAX_INSTITUTIONS)
const limitedPosts = posts.slice(0, MAX_POSTS)
const limitedForums = foros.slice(0, MAX_FORUMS)
```

---

### D8. El tracking de "click_card" se dispara en el NavLink pero no en todos los clics

**Archivo:** `src/features/dashboard/pages/FeedCards.jsx`  
**Líneas:** ~106-110

**Problema:** El tracking de `click_card` solo se dispara en el `<Link>` del FeedCard de instituciones:

```javascript
<Link to={`/institution/${inst.id}`} onClick={() => trackEngagement(inst.id, 'click_card', inst.category)}>
```

Pero NO se trackea cuando el usuario:
- Hace clic en el botón "Guardar"
- Hace clic en la imagen
- Hace clic en el botón "Ver más"

**Mejora propuesta:** Envolver toda la tarjeta en un handler de clics o usar un observer.

---

### D9. No hay tracking de tiempo de visualización (dwell time)

**Problema:** El algoritmo no sabe cuánto tiempo el usuario pasa viendo cada item. Un post que el usuario lee 5 minutos tiene el mismo peso que uno que skipea en 1 segundo.

**Mejora propuesta:**
```javascript
// Usar IntersectionObserver para medir tiempo visible
function useDwellTime(ref, itemId) {
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        start = Date.now()
      } else if (start) {
        const dwell = Date.now() - start
        if (dwell > 3000) { // > 3 segundos
          trackEngagement(itemId, 'dwell_3s', category)
        }
        if (dwell > 10000) { // > 10 segundos
          trackEngagement(itemId, 'dwell_10s', category)
        }
      }
    })
    observer.observe(ref.current)
  }, [])
}
```

---

## 🟠 DEFICIENCIAS DE UX

### D10. No hay feedback visual de por qué un item aparece primero

**Problema:** El usuario no sabe por qué ciertos items aparecen primero. No hay indicador de "relevante para ti" o "basado en tus intereses".

**Mejora propuesta:** Agregar un badge sutil:
```javascript
{item._score > 50 && (
  <span style={{ fontSize: 10, color: 'var(--primary)', fontWeight: 600 }}>
    ✨ Recomendado para ti
  </span>
)}
```

---

### D11. El feed no tiene "pull to refresh" ni auto-refresh

**Problema:** El feed no se actualiza automáticamente. Si el usuario lleva 10 minutos en la página, no ve contenido nuevo.

**Mejora propuesta:**
```javascript
// Auto-refresh cada 5 minutos
useEffect(() => {
  const interval = setInterval(() => {
    refetchDiscovery()
    refetchPosts()
  }, 5 * 60 * 1000)
  return () => clearInterval(interval)
}, [])
```

---

### D12. No hay skeleton diferenciado por tipo de item

**Archivo:** `src/features/dashboard/pages/FeedCards.jsx`  
**Línea:** ~264

**Problema:** Todos los skeletons son iguales (`FeedItemSkeleton`). No se distingue entre skeleton de institución (con imagen) vs. post vs. foro.

**Mejora propuesta:** Crear `InstitutionSkeleton`, `PostSkeleton`, `ForumSkeleton` con layouts diferentes.

---

### D13. El feed no tiene "infinite scroll" ni paginación

**Problema:** El feed carga todo de golpe (20 posts + todas las instituciones + todos los foros). No hay paginación ni carga progresiva.

**Consecuencia:** Con mucho contenido, la carga inicial es lenta y el usuario no tiene "más para ver".

**Mejora propuesta:** Implementar infinite scroll con `useInView` o paginación tipo "Cargar más".

---

## 🔵 DEFICIENCIAS TÉCNICAS

### D14. Las funciones `timeAgo` están duplicadas

**Archivos:**
- `src/features/dashboard/pages/DashboardPage.jsx` (línea ~17)
- `src/features/dashboard/pages/FeedCards.jsx` (línea ~3)

**Problema:** La función `timeAgo` está copiada idéntica en dos archivos.

**Mejora:** Extraer a `src/shared/utils/timeAgo.js`.

---

### D15. El `scoreItem` no tiene en cuenta el tipo de contenido

**Problema:** Una institución (con descripción rica) y un post (con texto corto) se scorean igual. La diferencia de longitud de texto afecta el matching textual.

**Mejora propuesta:** Normalizar por longitud de texto:
```javascript
// En textMatch, normalizar por longitud
const nameRatio = name.length > 0 ? (name.includes(i) ? 1 : 0) : 0
const descRatio = desc.length > 0 ? (desc.includes(i) ? 1 : 0) : 0
score += nameRatio * 5 + descRatio * 3
```

---

### D16. No hay testing para el algoritmo de scoring

**Problema:** No existen tests unitarios para `scoreItem()`, `sortFeed()`, `resolveCategoryWeights()`, ni `getEngagementWeights()`.

**Mejora propuesta:**
```javascript
// feedPreferences.test.js
describe('resolveCategoryWeights', () => {
  it('maps music interest to social category', () => {
    const weights = resolveCategoryWeights(['Música'])
    expect(weights.social).toBe(1)
  })
  
  it('returns zero weights for unknown interests', () => {
    const weights = resolveCategoryWeights(['Interés inventado'])
    expect(weights).toEqual({ funcional: 0, educativo: 0, laboral: 0, social: 0 })
  })
})

describe('scoreItem', () => {
  it('boosts items matching user category', () => {
    const score = scoreItem({ _category: 'laboral' }, [], { laboral: 3 }, {})
    expect(score).toBe(30) // 3 × 10
  })
  
  it('adds recency boost for recent items', () => {
    const score = scoreItem({ _createdAt: new Date().toISOString() }, [], {}, {})
    expect(score).toBeGreaterThanOrEqual(20)
  })
})
```

---

### D17. El mapeo `INTEREST_TO_CATEGORY` no cubre todos los intereses

**Archivo:** `src/shared/lib/feedPreferences.js`  
**Problema:** Si el RegistrationWizard agrega nuevos intereses, el mapeo no se actualiza automáticamente. No hay validación de que todos los intereses estén mapeados.

**Mejora propuesta:**
```javascript
// Agregar validación en desarrollo
if (process.env.NODE_ENV === 'development') {
  const ALL_INTERESTS = INTEREST_SECTIONS.flatMap(s => s.items)
  const unmapped = ALL_INTERESTS.filter(i => !INTEREST_TO_CATEGORY[i])
  if (unmapped.length > 0) {
    console.warn('⚠️ Intereses sin mapear:', unmapped)
  }
}
```

---

## 📊 RESUMEN DE PRIORIDADES

| # | Deficiencia | Prioridad | Esfuerzo | Impacto |
|---|------------|-----------|----------|---------|
| D1 | Feed muestra instituciones no verificadas | 🔴 Crítica | Bajo | Seguridad |
| D2 | Sin decaimiento temporal (decay) | 🔴 Alta | Medio | Calidad del feed |
| D3 | Sin diversificación de categorías | 🔴 Alta | Medio | Descubrimiento |
| D4 | Engagement no sincroniza con backend | 🟡 Alta | Medio | Persistencia |
| D5 | Posts/foros hardcodeados como `social` | 🟡 Media | Bajo | Relevancia |
| D6 | Sin contenido exploratorio | 🟡 Media | Medio | Descubrimiento |
| D7 | Sin límite por tipo de contenido | 🟡 Media | Bajo | Balance |
| D8 | Tracking incompleto de clics | 🟡 Baja | Bajo | Datos |
| D9 | Sin dwell time tracking | 🟡 Media | Alto | Señal de calidad |
| D10 | Sin feedback visual de relevancia | 🟠 Baja | Bajo | UX |
| D11 | Sin auto-refresh | 🟠 Media | Bajo | Frescura |
| D12 | Skeletons no diferenciados | 🟠 Baja | Bajo | UX |
| D13 | Sin infinite scroll/paginación | 🟠 Media | Alto | Performance |
| D14 | `timeAgo` duplicado | 🔵 Baja | Bajo | Mantenibilidad |
| D15 | Scoring no normaliza por tipo | 🔵 Media | Bajo | Precisión |
| D16 | Sin tests para scoring | 🔵 Media | Medio | Calidad |
| D17 | Mapeo de intereses no validado | 🔵 Baja | Bajo | Mantenibilidad |

---

## ✅ LO QUE SÍ FUNCIONA BIEN

| Aspecto | Detalle |
|---------|---------|
| **Feed unificado** | Mezcla 3 tipos de contenido en un solo timeline, estilo Reddit |
| **Scoring multi-factor** | Combina 5 señales: categoría, engagement, texto, popularidad, recencia |
| **Preferencias del registro** | Conecta los ~50 intereses del wizard con las 4 categorías del backend |
| **Engagement local** | Trackea interacciones en localStorage para personalización inmediata |
| **3 modos de ordenamiento** | Relevantes / Recientes / Populares — da control al usuario |
| **Filtrado por preferencias** | Si el usuario tiene prefs, solo ve contenido de sus categorías activas |
| **UI estilo Reddit** | Tarjetas con avatar, badge de categoría, likes, comentarios, tiempo relativo |
| **Skeletons de carga** | Muestra placeholders mientras carga |
| **Fallback a backend** | Si falla discovery, muestra `BackendFallback` con retry |
