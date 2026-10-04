# Patron de Diseño e Instrucciones de Marca — Raíces Frontend
### Proyecto: `raices-frontend`

> **Manual y Guía de Referencia Permanente.** Este documento es la fuente de verdad de diseño, tokens, componentes y patrones estéticos para el proyecto `raices-frontend` (plataforma comunitaria de inclusión, apoyo, foros, recomendaciones y empleo para personas con discapacidad y sus familias).
> Todo desarrollo futuro, migración o maquetado de componentes en la aplicación debe alinearse a los estándares aquí descritos.

---

## 0. Diagnóstico Previo y Reglas de Entrada

Antes de tocar código en cualquier tarea de maquetado o migración, todo desarrollador o agente de IA debe ejecutar las siguientes comprobaciones:

1. **Ubicación de Tokens:**
   - La fuente primaria de tokens CSS está en `src/styles/global.css` bajo `:root` y `html[data-theme="dark"]`.
   - El mapeo con Tailwind CSS v4 se encuentra en `src/styles/tailwind-theme.css` bajo el bloque `@theme`.
2. **Grep de Verificación de Hexadecimales Hardcodeados:**
   - No se deben escribir valores hexadecimales crudos (ej. `#213052`, `#229B58`) en estilos de componentes `.tsx` / `.css`. Siempre se deben reutilizar los tokens (`var(--primary)`, `var(--secondary)`, `var(--bg-warm)`, etc.).
3. **Clasificación del Contexto de Pantalla:**
   - **Pantalla de Marketing (Pública):** Landing Page, Topbar pública, Footer institucional.
   - **Pantalla de Producto (Privada/Plataforma):** Feed de publicaciones, Foros, Perfiles (Tutor/PCD/Empresa), Sidebar, Dashboards, Modales de interacción.
4. **Listado e Inspección de Glassmorphism (Liquid Glass):**
   - Auditar si existen tarjetas, popovers o modales con clases como `backdrop-blur-*`, `bg-white/80` o `bg-opacity-*`. Todos deben ser reemplazados por superficies opacas sólidas (`var(--bg-surface)`).

---

## 1. Paleta de Color y Tokens de Marca Raíces

### 1.1 Paleta Primaria y Neutros de Superficie

| Token CSS | Valor Hex / RGBA | Uso en el Sistema |
|---|---|---|
| `--primary` | `#213052` (Azul Marino) | Color institucional principal, encabezados (`--fg1`), Sidebar, Footer |
| `--primary-dark` | `#16223D` | Estados hover primarios y encabezados profundos |
| `--primary-subtle` | `rgba(33, 48, 82, 0.10)` | Fondos de selección sutiles, badges neutros informativos |
| `--secondary` | `#229B58` (Verde Vivo) | Acciones primarias interactivas, botones de confirmación, acentos de éxito |
| `--secondary-dark` | `#1a7a44` | Hover de botones secundarios y estados activos |
| `--bg-warm` | `#fff9f2` (Crema) | **Fondo general de la plataforma/body** (Modo Claro) |
| `--bg-cool` | `#F5EDE3` | Fondos secundarios de tarjetas, barras o contenedores |
| `--bg-surface` | `#FFFFFF` | Superficie sólida de tarjetas, modales e inputs en modo claro |
| `--border-color` | `#E5DCD2` | Bordes estándar de tarjetas, modales y divisores |
| `--border-strong` | `#C8BEB2` | Bordes de inputs en estado foco o elementos destacados |

### 1.2 Acentos de Marca y Categorías del Feed

Raíces clasifica el contenido comunal y de recursos utilizando 6 colores temáticos representativos:

| Categoría / Acento | Token CSS | Hexadecimal | Uso en el Producto |
|---|---|---|---|
| **Salud** | `--color-salud` / `--color-rosa` | `#CA918E` (Rosa Cálido) | Salud, terapias, rehabilitación, cuidado |
| **Educación** | `--color-educacion` / `--color-matcha` | `#A8B86B` (Verde Matcha) | Educación, guías, aprendizaje, escuelas |
| **Empleo** | `--color-empleo` / `--color-amarillo` | `#F4C84A` (Amarillo Sol) | Vacantes, inclusión laboral, empresas |
| **Artes / Deportes** | `--color-artes` / `--color-verde` | `#229B58` (Verde Vivo) | Recreación, cultura, deportes adaptados |
| **Comunidad** | `--color-comunidad` / `--primary` | `#213052` (Azul Marino) | Foros, eventos comunitarios, avisos |
| **Vida Diaria** | `--color-vida` / `--color-coral` | `#FF4D68` (Coral) | Autonomía, vida independiente, hogar |

### 1.3 Modo Oscuro (`html[data-theme="dark"]`)

Cuando el atributo `data-theme="dark"` está activo en la etiqueta `html`:

- **Fondo principal (`--bg-warm`):** `#141817`
- **Superficie de tarjetas y modales (`--bg-surface`):** `#1E2025` (Sólido y opaco)
- **Fondo de Sidebar (`--sidebar-bg`):** `#0d1210`
- **Texto principal (`--fg1`):** `#E8EAED`
- **Texto secundario (`--fg2`):** `#B0B5BC`
- **Primario adaptable (`--primary`):** `#3fac91` (Verde esmeralda suave para alto contraste en fondo oscuro)
- **Bordes (`--border-color`):** `rgba(255, 255, 255, 0.06)`

---

## 2. Tipografía Global

Raíces utiliza dos familias tipográficas principales:

1. **Display / Títulos (`--font-display`, `--font-bold`):** `'Poppins', Georgia, serif`
   - **Uso:** Encabezados `h1` a `h6`, títulos de tarjetas en el Feed, nombres en la Sidebar, títulos de modales.
   - **Pesos:** 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold).
2. **Cuerpo de Texto (`--font-body`):** `'Lato', system-ui, -apple-system, sans-serif`
   - **Uso:** Párrafos, descripciones, etiquetas de inputs, comentarios de foros, cuerpo general (`font-size: 17px`, `line-height: 1.6`).

---

## 3. Pilares de Diseño: Landing, Feed, Sidebar y Modales

### 3.1 La Landing Principal (Marketing / Pública)
- **TopBar:** Fondo blanco `#FFFFFF`, borde inferior `#E5DCD2`, logotipo de Raíces responsivo con texto `#213052`.
- **Hero Section:** Fondo suave `#f6eddf` con tipografía de título principal en `Poppins` `#213052`.
- **Bloques de Sección:** Fondos orgánicos en tonos crema y arena (`#b6c6cf`, `#e9dcce`). **No llevan sombras pesadas (`shadow-xl`) ni bordes oscuros**, manteniendo un estilo acogedor, fresco y accesible.
- **Footer:** Fondo sólido en Azul Marino `#213052`, texto en blanco `#FFFFFF` y enlaces secundarios en `rgba(255, 255, 255, 0.80)`.

### 3.2 El Feed y Dashboard (Producto)
- **Fondo de Plataforma:** Crema `#fff9f2`.
- **Tarjetas del Feed (`.card`):**
  - Fondo blanco `#FFFFFF` sólido (`var(--bg-surface)`).
  - Borde sutil `#E5DCD2` (`1px solid var(--border-color)`).
  - Sombra tenue de elevación `var(--shadow-sm)` (`0 1px 3px rgba(33,48,82,0.10)`).
  - Esquinas redondeadas moderadas de `12px` (`var(--radius-md)` / `rounded-xl`).
- **Badges de Categoría:** Utilizan fondos sutiles de la paleta con texto en el color de la categoría (ej. Rosa para Salud, Matcha para Educación).

### 3.3 La Sidebar (`AppSidebar`)
- **Fondo:** Azul Marino profundo `#213052` (`--sidebar-bg`) en modo claro.
- **Dimensiones:** Ancho fijo de `220px` (`--sidebar-width`).
- **Items de Navegación:**
  - Texto e icono inactivo: `rgba(255, 255, 255, 0.55)` (`--sidebar-fg`).
  - Estado Hover/Activo: Fondo `rgba(255, 255, 255, 0.08)`, texto/icono en blanco puro `#FFFFFF`.
  - Separadores: `rgba(255, 255, 255, 0.08)`.

---

## 4. Radios, Superficies y Reglas Estrictas de Apariencia

### 4.1 Cero "Liquid Glass" / Glassmorphism (Regla Absoluta)
Queda prohibido el uso de estilo cristal translúcido o glassmorphism en modales, popovers, tarjetas o menús flotantes.
- **PROHIBIDO:** Uso de `backdrop-filter: blur(...)`, clases Tailwind `backdrop-blur-*`, o fondos semitransparentes en tarjetas (ej. `bg-white/80`, `bg-opacity-*`).
- **OBLIGATORIO:** Las superficies deben ser sólidas, opacas y totalmente legibles utilizando `var(--bg-surface)` (`#FFFFFF` en modo claro y `#1E2025` en modo oscuro).
- **Backdrop Overlay:** El fondo del portal del modal debe ser un scrim oscuro atenuado y limpio (`rgba(15, 23, 42, 0.45)`), sin difuminados pesados de pantalla completa.

### 4.2 Eliminación de Bordes Hiper-Circulares (Bordes Semi-Redondeados)
Quedan prohibidos los bordes circulares exagerados (`rounded-3xl`, `rounded-[32px]`, `rounded-full` en contenedores rectangulares). Se establece una curvatura constante y homogénea:

| Elemento | Token CSS | Valor | Clases Tailwind Recomendadas |
|---|---|---|---|
| Inputs, Badges, Chips | `--radius-sm` | `8px` | `rounded-lg` |
| Tarjetas de Feed (`.card`) | `--radius-md` | `12px` | `rounded-xl` |
| Modales, Diálogos y Auth Cards | `--radius-lg` | `16px` | `rounded-2xl` (semi-redondeado sutil) |
| Botones Interactivos | `--radius-btn` | `10px` - `12px` | `rounded-lg` a `rounded-xl` (evitar botones píldora) |

### 4.3 Sombras Registradas

| Elemento | Token CSS | Valor |
|---|---|---|
| Sombra suave (Cards de Feed) | `--shadow-sm` | `0 1px 3px rgba(33,48,82,0.10)` |
| Sombra media (Hover de Cards) | `--shadow-md` | `0 4px 12px rgba(33,48,82,0.14)` |
| Sombra elevada (Modales, Popovers) | `--shadow-lg` | `0 8px 24px rgba(33,48,82,0.18)` |

---

## 5. Orden de Ejecución para Nuevos Componentes / Migraciones

1. **Tokens primero:** Asegurar que todo color o fuente se refiera a las variables CSS de `global.css` (`var(--primary)`, `var(--font-display)`, etc.).
2. **Componentes base (`Button`, `Input`, `Card`):**
   - Usar `.btn-primary` (Azul Marino con hover Verde Vivo `#229B58` o `#16223D`).
   - Usar `.auth-input` para cajas de texto con borde `#E5DCD2` y foco limpio.
3. **Overlays y Modales:**
   - Montar con React Portal.
   - Fondo del contenedor: `var(--bg-surface)` sólido (sin `backdrop-blur`).
   - Borde: `1px solid var(--border-color)`.
   - Radio: `var(--radius-lg)` (`16px`, semi-redondeado consistente).
   - Sombra: `var(--shadow-lg)`.
4. **Respetar Accesibilidad (A11y):**
   - Asegurar que la pantalla responda al zoom (`html[data-text-scale]`).
   - Soportar el esquema de alto contraste (`html[data-contrast="high"]`).
   - Soportar filtros de daltonismo (`deuteranopia`, `protanopia`, `tritanopia`).
   - No depender exclusivamente del color para transmitir información (usar iconos + texto en badges).

---

## 6. Checklist de Validación (Antes de dar por entregado un componente)

- [ ] **Cero hexadecimales hardcodeados** fuera de `global.css`.
- [ ] **Cero efectos liquid glass o `backdrop-blur`** en modales, popovers o tarjetas.
- [ ] **Cero bordes hiper-circulares** (`rounded-3xl` o píldoras exageradas en rectángulos); modales y tarjetas grandes estandarizados en `16px` (`rounded-2xl` / `--radius-lg`).
- [ ] La tipografía de títulos utiliza **Poppins** (`var(--font-display)`).
- [ ] El cuerpo de texto utiliza **Lato** (`var(--font-body)`).
- [ ] Si es una tarjeta de producto (Feed), tiene fondo `#FFFFFF` sólido, borde `#E5DCD2` y radio de `12px`.
- [ ] Si es un bloque de la Landing (Marketing), sigue el estilo orgánico sin bordes toscos ni sombras pesadas.
- [ ] La Sidebar mantiene el tono Azul Marino `#213052` con hover traslúcido `rgba(255,255,255,0.08)`.
- [ ] El componente funciona correctamente en **Modo Oscuro** (`html[data-theme="dark"]`).
- [ ] `npx tsc --noEmit` y `npm run build` compilan sin errores.
