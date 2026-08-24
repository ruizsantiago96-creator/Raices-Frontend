# Requisitos para Backend — Sistema de Recomendación Personalizado

## Contexto

El frontend ya implementó un sistema de scoring que conecta los intereses del usuario (seleccionados en el registro) con las categorías de instituciones. Sin embargo, para que el feed sea verdaderamente personalizado, necesitamos cambios en el backend.

**Arquitectura del proyecto:** Feature-driven (cada funcionalidad vive en su feature folder).

---

## 1. Endpoint: Descubrimiento con filtro por categorías

### Endpoint actual
```
GET /api/descubrimiento
```

### Cambio requerido
Agregar soporte para filtrar y **ordenar por categorías de prioridad**:

```
GET /api/descubrimiento?categorias=laboral,funcional&pagina=1&limite=20
```

**Parámetro nuevo:** `categorias` (opcional)
- Tipo: `string` (separado por comas)
- Ejemplo: `categorias=laboral,funcional`
- Comportamiento: Las instituciones cuya `categoria` esté en la lista deben aparecer **primero**, ordenadas por relevancia. Las demás aparecen después en el orden normal.

**Orden de prioridad sugerido:**
1. Coincidencia exacta de categoría (primera categoría de la lista)
2. Coincidencia con segunda categoría
3. Resto de instituciones

### Respuesta
Sin cambios en la estructura de respuesta. Solo cambia el **orden** de los resultados.

---

## 2. Endpoint: Registrar interacciones del usuario

### Nuevo endpoint
```
POST /api/usuarios/interacciones
```

**Body:**
```json
{
  "institucionId": "string (required)",
  "tipo": "string (required)",   // Valores: 'guardar' | 'ver_detalle' | 'click_card'
  "categoria": "string (optional)"
}
```

**Valores de `tipo`:**
| Valor | Descripción | Peso sugerido |
|-------|-------------|---------------|
| `guardar` | El usuario guardó la institución en favoritos | 10 |
| `ver_detalle` | El usuario hizo click en "Ver más" y vio el detalle | 5 |
| `click_card` | El usuario hizo click en la tarjeta del feed | 2 |

### Respuesta
```json
{
  "exito": true
}
```

### Tabla sugerida en la base de datos

```sql
CREATE TABLE usuario_interacciones (
  id              SERIAL PRIMARY KEY,
  usuario_id      INTEGER NOT NULL REFERENCES usuarios(id),
  institucion_id  INTEGER NOT NULL REFERENCES instituciones(id),
  tipo            VARCHAR(20) NOT NULL CHECK (tipo IN ('guardar', 'ver_detalle', 'click_card')),
  categoria       VARCHAR(50),
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_interacciones_usuario ON usuario_interacciones(usuario_id);
CREATE INDEX idx_interacciones_categoria ON usuario_interacciones(categoria);
```

---

## 3. Endpoint: Pesos de engagement del usuario

### Nuevo endpoint
```
GET /api/usuarios/interacciones/pesos
```

**Descripción:** Devuelve los pesos acumulados de interacciones del usuario agrupados por categoría. Sirve para que el frontend sepa qué categorías le interesan más al usuario basándose en su comportamiento real.

**Respuesta:**
```json
{
  "pesos": {
    "funcional": 15,
    "laboral": 8,
    "social": 3,
    "educativo": 0
  }
}
```

**Lógica de cálculo en backend:**
- `guardar` = 10 puntos
- `ver_detalle` = 5 puntos
- `click_card` = 2 puntos
- Solo contar interacciones de los últimos 30 días

---

## 4. Endpoint: Recomendaciones personalizadas (opcional, fase 2)

### Nuevo endpoint
```
GET /api/usuarios/recomendaciones
```

**Descripción:** Devuelve instituciones ordenadas según el perfil del usuario (intereses + comportamiento). Este endpoint haría el trabajo pesado en el servidor.

**Parámetros:**
- `pagina` (number, default 1)
- `limite` (number, default 20)

**Lógica sugerida:**
1. Obtener intereses del usuario desde `usuarios.profiling.goals`
2. Obtener pesos de interacciones desde `usuario_interacciones` (últimos 30 días)
3. Combinar ambos pesos (60% intereses, 40% comportamiento)
4. Calcular score por cada institución según su `categoria`
5. Devolver ordenadas por score descendente

**Respuesta:** Misma estructura que `/descubrimiento`

---

## 5. Mapeo de intereses → categorías (referencia)

Los intereses del registro son textos libres. El frontend ya tiene el mapeo, pero el backend debería conocerlo para futuras implementaciones:

| Sección de intereses | Categoría backend |
|---------------------|-------------------|
| Deporte / Movimiento | `funcional` |
| Bienestar / Atención especializada | `funcional` |
| Empleo | `laboral` |
| Autoempleo | `laboral` |
| Arte / Cultura / Música | `social` |
| Independencia | `funcional` |
| Vida Social | `social` |
| Explorar Posibilidades | `social` |

---

## Resumen de cambios

| # | Cambio | Prioridad | Esfuerzo estimado |
|---|--------|-----------|-------------------|
| 1 | Filtro `categorias` en `/descubrimiento` | 🔴 Alta | 1-2 días |
| 2 | Endpoint `POST /usuarios/interacciones` | 🔴 Alta | 1 día |
| 3 | Endpoint `GET /usuarios/interacciones/pesos` | 🟡 Media | 0.5 días |
| 4 | Endpoint `GET /usuarios/recomendaciones` | 🟢 Baja (fase 2) | 2-3 días |

**Mínimo viable:** Cambios 1 y 2. Con eso el frontend puede funcionar con scoring local + datos del backend.

---

*Documento generado desde el frontend — Arquitectura Feature-Driven*
