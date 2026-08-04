# 🎨 Guía: Tailwind CSS v4 + Motion en Raíces

> Guía completa para usar las nuevas librerías de estilos y animaciones en el proyecto.

**Fecha:** 3 de Agosto 2026  
**Librerías:** Tailwind CSS v4.3.3 + Motion 12.43.0

---

## 📑 Índice

1. [Visión General](#1-visión-general)
2. [Tailwind CSS v4](#2-tailwind-css-v4)
3. [Motion (Framer Motion)](#3-motion-framer-motion)
4. [Design Tokens](#4-design-tokens)
5. [Ejemplos de Uso](#5-ejemplos-de-uso)
6. [Migración Gradual](#6-migración-gradual)
7. [Preguntas Frecuentes](#7-preguntas-frecuentes)

---

## 1. Visión General

### ¿Qué se instaló?

| Librería | Versión | Propósito |
|----------|---------|-----------|
| **Tailwind CSS v4** | 4.3.3 | Utilidades CSS para layouts rápidos |
| **@tailwindcss/vite** | 4.3.3 | Plugin de Vite para Tailwind |
| **Motion** | 12.43.0 | Animaciones avanzadas para React |

### ¿Por qué estas librerías?

- **Tailwind**: Complementa tu CSS vanilla sin reemplazarlo
- **Motion**: Mejora tus animaciones actuales con física realista
- **Ambas**: Se integran con tus design tokens existentes

---

## 2. Tailwind CSS v4

### Configuración

```js
// vite.config.mjs
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### Uso Básico

```jsx
// Layout con Tailwind
<div className="flex gap-4 p-6 bg-bg-surface rounded-md shadow-sm">
  <h2 className="text-fg1 text-xl font-bold">Título</h2>
  <button className="bg-primary text-white px-4 py-2 rounded-pill">
    Click
  </button>
</div>
```

### Clases Más Usadas

| Categoría | Ejemplos |
|-----------|----------|
| **Flexbox** | `flex`, `flex-col`, `items-center`, `justify-between` |
| **Espaciado** | `p-4`, `px-6`, `gap-4`, `m-2` |
| **Colores** | `bg-primary`, `text-fg1`, `border-border` |
| **Borde** | `rounded-md`, `rounded-pill`, `rounded-full` |
| **Sombra** | `shadow-sm`, `shadow-md`, `shadow-lg` |
| **Tipografía** | `text-xl`, `font-bold`, `font-body` |

### Design Tokens Disponibles

```jsx
// Colores
bg-primary        // var(--primary)
bg-primary-dark   // var(--primary-dark)
text-fg1          // var(--fg1)
text-fg2          // var(--fg2)
border-border     // var(--border-color)

// Tipografía
font-display      // var(--font-display)
font-body         // var(--font-body)

// Border Radius
rounded-sm        // var(--radius-sm)
rounded-md        // var(--radius-md)
rounded-pill      // var(--radius-pill)

// Sombras
shadow-sm         // var(--shadow-sm)
shadow-md         // var(--shadow-md)
shadow-lg         // var(--shadow-lg)
```

---

## 3. Motion (Framer Motion)

### Importación

```jsx
import { motion, AnimatePresence } from 'motion/react'
```

### Animaciones Básicas

```jsx
// Fade in + slide up
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45 }}
>
  Contenido
</motion.div>

// Scale in
<motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: 'spring', stiffness: 300 }}
>
  Contenido
</motion.div>
```

### Animaciones con Props

```jsx
// Animación al aparecer/desaparecer
<AnimatePresence>
  {isVisible && (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      Contenido condicional
    </motion.div>
  )}
</AnimatePresence>
```

### Gestures (Hover, Tap)

```jsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  transition={{ type: 'spring', stiffness: 400 }}
>
  Botón interactivo
</motion.button>
```

### Animaciones de Lista

```jsx
<motion.ul>
  {items.map((item, i) => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.1 }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>
```

---

## 4. Design Tokens

### Mapeo Tailwind → CSS Variables

Tu archivo `src/styles/tailwind-theme.css` contiene el mapeo:

```css
@theme {
  --color-primary: var(--primary);
  --color-fg1: var(--fg1);
  --color-bg-surface: var(--bg-surface);
  // ... más tokens
}
```

### Uso en Componentes

```jsx
// Antes (CSS variable directa)
<div style={{ background: 'var(--primary)' }}>

// Después (Tailwind)
<div className="bg-primary">

// Ambos funcionan igual
```

### Dark Mode

Tailwind se integra con tu sistema de dark mode existente:

```jsx
// Tus clases Tailwind respetan data-theme="dark"
<div className="bg-bg-surface text-fg1">
  {/* Se adapta automáticamente al dark mode */}
</div>
```

---

## 5. Ejemplos de Uso

### Ejemplo 1: Botón Simple

```jsx
// Con Tailwind
<button className="bg-primary text-white px-6 py-3 rounded-pill font-semibold hover:bg-primary-dark transition-colors">
  Click me
</button>

// Con Motion
<motion.button
  className="bg-primary text-white px-6 py-3 rounded-pill font-semibold"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>
```

### Ejemplo 2: Card con Animación

```jsx
<motion.div
  className="bg-bg-surface rounded-md shadow-sm p-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
  whileHover={{ y: -4, boxShadow: 'var(--shadow-md)' }}
>
  <h3 className="text-fg1 text-lg font-bold mb-2">Título</h3>
  <p className="text-fg2">Descripción</p>
</motion.div>
```

### Ejemplo 3: Modal con AnimatePresence

```jsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-bg-surface rounded-lg p-8 max-w-md"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        Contenido del modal
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
```

---

## 6. Migración Gradual

### Estrategia Recomendada

1. **No migrar componentes existentes** que funcionan bien
2. **Usar Tailwind en componentes NUEVOS**
3. **Usar Motion para animaciones NUEVAS**
4. **Mezclar** CSS vanilla + Tailwind cuando sea útil

### Cuándo Usar Cada Uno

| Situación | Herramienta |
|-----------|-------------|
| Layout rápido (flex, grid) | Tailwind |
| Estilos específicos (colors, fonts) | CSS variables |
| Animaciones simples | CSS keyframes |
| Animaciones complejas | Motion |
| Transiciones de estado | Motion + AnimatePresence |
| Hover/tap effects | Motion whileHover/whileTap |

### Ejemplo de Mezcla

```jsx
// Layout con Tailwind, estilos con CSS
<div className="flex gap-4 p-6">
  <button 
    className="px-4 py-2 rounded-pill"
    style={{ background: 'var(--primary)', color: 'white' }}
  >
    Mezcla de Tailwind + CSS
  </button>
</div>
```

---

## 7. Preguntas Frecuentes

### ¿Puedo seguir usando inline styles?

**Sí.** Tailwind complementa, no reemplaza. Puedes mezclar ambos.

### ¿Tailwind reemplaza mi global.css?

**No.** Tu CSS vanilla sigue funcionando. Tailwind se agrega encima.

### ¿Motion reemplaza mis keyframes?

**No.** Puedes seguir usando keyframes. Motion es para animaciones más avanzadas.

### ¿Cómo funciona el dark mode?

Tailwind respeta tu sistema existente (`data-theme="dark"`). No necesitas cambios.

### ¿Puedo desactivar Tailwind?

Sí. Simplemente no uses clases Tailwind en tus componentes.

---

## 📚 Recursos

- [Tailwind CSS v4 Docs](https://tailwindcss.com/docs)
- [Motion Docs](https://motion.dev/docs)
- [Tailwind + Vite](https://tailwindcss.com/docs/installation/vite)

---

*Guía creada el 3 de agosto de 2026 para el proyecto Raíces Frontend.*
