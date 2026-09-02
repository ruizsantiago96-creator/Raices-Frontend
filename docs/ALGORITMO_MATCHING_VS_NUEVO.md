# Algoritmo de Matching — Comparación: Antes vs Después

## Resumen

El backend implementó un **algoritmo de emparejamiento progresivo** con scoring ponderado en tiempo real. Este documento describe los cambios en los endpoints, la lógica de scoring y lo que el frontend debe implementar.

---

## 1. Endpoints — Cambios

### ❌ Antes (Frontend actual)

| Endpoint | Uso | Método |
|----------|-----|--------|
| `GET /usuarios/recomendaciones` | Obtener instituciones recomendadas | Hook `useRecomendaciones()` |
| `POST /usuarios/interacciones` | Registrar interacciones | Hook `useRegistrarInteraccion()` |
| `GET /usuarios/interacciones/pesos` | Obtener pesos de interacción | Hook `useInteraccionesPesos()` |

### ✅ Ahora (Backend nuevo)

| Endpoint | Uso | Método |
|----------|-----|--------|
| `GET /recommendations` | Instituciones recomendadas (interés + comportamiento) | `useRecomendacionesInstituciones()` |
| `GET /recommendations/especialistas` | Especialistas recomendados (4 factores) | `useRecomendacionesEspecialistas()` |
| `POST /recommendations/interaccion` | Registrar interacciones | `useRegistrarInteraccion()` |
| `GET /recommendations/onboarding` | Verificar onboarding completo | `useOnboardingStatus()` |
| `POST /ai/chat` | Chat conversacional con IA | `useChat()` |
| `POST /ai/recommend` | Recomendación personalizada IA | `useAINextSteps()` |
| `POST /ai/recommend/:dependienteId` | Recomendación para dependiente | `useAIForDependent()` |

---

## 2. Algoritmo de Scoring — Instituciones

### ❌ Antes (Frontend: `scoreItem()` en DashboardPage)

El scoring era **100% client-side** usando:

```javascript
// 1. Coincidencia de categoría (peso de registro)
score += interestWeights[category] * 10

// 2. Engagement local (guardados/clicks en localStorage)
score += engagementWeights[category]

// 3. Matching de texto (nombre/descripción vs intereses)
if (name.includes(interest)) score += 5
if (desc.includes(interest)) score += 3

// 4. Popularidad (likes + comments)
score += likes * 2
score += comments * 1.5

// 5. Recencia (< 1h = +20, < 24h = +10, < 72h = +5)
```

**Problemas:**
- No consideraba el historial real de interacciones del backend
- No usaba el perfil extendido del usuario
- Scoring genérico, no personalizado por el backend

### ✅ Ahora (Backend: `GET /recommendations`)

El scoring es **server-side** con 2 componentes:

#### Score de intereses (60%)
```javascript
score_intereses = (tokens_coincidentes) / (total_tokens_usuario)
// Tokens de: metasActuales + areasInteres del usuario
// vs: nombre, descripción, categoría, servicios de la institución
```

#### Score de comportamiento (40%)
```javascript
// Basado en interacciones de los últimos 30 días
// Pesos: guardar=10, ver_detalle=5, click_card=2
score_comportamiento = (peso_categoria) / (peso_maximo)
```

#### Score final
```javascript
final_score = (score_intereses × 0.6) + (score_comportamiento × 0.4)
```

**Ventajas:**
- Scoring calculado en el backend con acceso completo al perfil
- Considera historial real de interacciones (no solo localStorage)
- Resultados paginados y ordenados por `final_score`

---

## 3. Algoritmo de Scoring — Especialistas (NUEVO)

### ❌ Antes
No existía recomendación de especialistas.

### ✅ Ahora (Backend: `GET /recommendations/especialistas`)

**4 factores con pesos ponderados:**

| Factor | Peso | Qué evalúa |
|--------|------|------------|
| **Tipo de discapacidad** | 40% | Coincidencia entre tipos del usuario y especialista |
| **Rango de edad** | 30% | Si la edad del usuario está dentro del rango aceptado |
| **Reputación** | 20% | `calificacionPromedio` (escala 0–5) |
| **Ubicación** | 10% | Coincidencia de ciudad; +0.5 si es virtual/online |

#### Respuesta
```json
{
  "id": "abc123",
  "nombre": "Dra. María López",
  "final_score": 0.85,
  "score_edad": 1,
  "score_discapacidad": 1,
  "ciudad": "CDMX",
  "modalidad": "presencial",
  "calificacionPromedio": 4.8,
  "edadMinima": 5,
  "edadMaxima": 18,
  "tiposDiscapacidad": "[\"tea\",\"tea\"]"
}
```

---

## 4. Interacciones — Cambios

### ❌ Antes

```javascript
// Endpoint
POST /usuarios/interacciones

// Body
{ institucionId, tipo, categoria }

// Hook
useRegistrarInteraccion() → invalidateQueries(['interacciones-pesos'])
```

### ✅ Ahora

```javascript
// Endpoint
POST /recommendations/interaccion

// Body
{ institucionId, tipo, categoria }

// Tipos válidos: "guardar" | "ver_detalle" | "click_card"

// Respuesta
{ exito: true, id: "interaccion_id", mensaje: "Interacción registrada" }
```

**Cambio:** El endpoint cambió de `/usuarios/interacciones` a `/recommendations/interaccion`.

---

## 5. Onboarding — NUEVO

### ❌ Antes
No existía verificación de onboarding. El frontend asumía que si el usuario tenía perfil, estaba listo.

### ✅ Ahora

```javascript
// Endpoint
GET /recommendations/onboarding

// Respuesta
{
  "onboardingCompleto": false,
  "camposFaltantes": ["tiposDiscapacidad", "certificadoDiscapacidad"],
  "porcentaje": 65
}
```

**Uso:** Si `onboardingCompleto = false`, mostrar formulario de onboarding antes de recomendaciones.

---

## 6. IA — Cambios

### ❌ Antes

```javascript
// Endpoints
POST /ia/conversacion    → Chat
POST /ia/recomendaciones → Próximos pasos
POST /ia/resumen         → Resumen narrativo
```

### ✅ Ahora

```javascript
// Endpoints
POST /ai/chat            → Chat conversacional
POST /ai/recommend       → Recomendación personalizada
POST /ai/recommend/:dependienteId → Para dependiente
```

**Cambio:** Los endpoints cambiaron de `/ia/*` a `/ai/*`.

**Respuesta de `POST /ai/recommend`:**
```json
{
  "proximosPasos": [
    "Busca instituciones de TEA en CDMX",
    "Completa tu historial de terapia",
    "Únete al grupo de comunidad"
  ],
  "razonamiento": "Basándome en tu perfil de adulto con TEA en CDMX...",
  "sugerenciasInstitucion": [
    { "categoria": "Terapia", "razon": "Evaluación diagnóstica" }
  ],
  "simulado": false
}
```

---

## 7. Estructura de Respuesta — Cambios

### ❌ Antes
```javascript
// useRecomendaciones() retornaba:
Array de instituciones (sin scores)
```

### ✅ Ahora
```javascript
// GET /recommendations retorna:
{
  "datos": [
    {
      "id": "inst123",
      "nombre": "Centro Terapia Integral",
      "categoria": "Terapia",
      "score_intereses": 0.75,
      "score_comportamiento": 0.5,
      "final_score": 0.65
    }
  ],
  "paginacion": {
    "total": 45,
    "pagina": 1,
    "limite": 20,
    "totalPaginas": 3
  }
}
```

**Cambio:** Ahora viene con `final_score` y `paginación`.

---

## 8. Flujo en el Frontend (Nuevo)

```
1. Usuario abre la app
   → GET /recommendations/onboarding
   → Si onboardingCompleto = false → Mostrar formulario

2. Usuario ve dashboard
   → GET /recommendations (instituciones)
   → GET /recommendations/especialistas (especialistas)
   → Mostrar tarjetas ordenadas por final_score

3. Usuario interactúa
   → POST /recommendations/interaccion (click_card, ver_detalle, guardar)

4. Usuario abre chat IA
   → POST /ai/chat

5. Usuario pide recomendación
   → POST /ai/recommend
```

---

## 9. Acciones Requeridas en el Frontend

| # | Acción | Archivo afectado |
|---|--------|------------------|
| 1 | Actualizar `useRecomendaciones()` para usar `GET /recommendations` | `useRecommendations.js` |
| 2 | Crear `useRecomendacionesEspecialistas()` para `GET /recommendations/especialistas` | Nuevo hook |
| 3 | Actualizar `useRegistrarInteraccion()` para usar `POST /recommendations/interaccion` | `useInteractions.js` |
| 4 | Crear `useOnboardingStatus()` para `GET /recommendations/onboarding` | Nuevo hook |
| 5 | Actualizar endpoints de IA de `/ia/*` a `/ai/*` | `useAI.js` |
| 6 | Mostrar `final_score` en tarjetas de recomendación | `DashboardPage.jsx`, `ExplorePage.jsx` |
| 7 | Agregar vista de especialistas en dashboard | `DashboardPage.jsx` |

---

## 10. Índices de Firestore Requeridos

| Colección | Campos | Orden |
|-----------|--------|-------|
| `interacciones` | `usuarioId` (ASC) + `createdAt` (DESC) | Descendente por fecha |
| `perfilesExtendidos` | `usuarioId` (ASC) | Ascendente |

---

## 11. Notas Técnicas

- No se agregaron paquetes nuevos al backend
- `final_score` viene redondeado a 3 decimales
- Los resultados vienen paginados (`datos` + `paginacion`)
- El peso de comportamiento se recalcula en cada request (no cacheado)
- Ventana de comportamiento: 30 días
- Para especialistas sin calificación, `calificacionPromedio` puede ser `0` o `null`
- Para usuarios sin diagnóstico, el backend prioriza sugerencias de evaluación
