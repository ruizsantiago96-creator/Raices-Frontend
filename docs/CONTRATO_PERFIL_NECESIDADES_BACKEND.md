# Contrato: Perfil de Necesidades (`perfilNecesidades`) — Pendientes para Backend

> Documento de handoff al equipo de backend (fecha: 2026-09-03).
> Resumen del problema detectado y lo que hace falta acordar/validar para que el perfil de necesidades quede correcto de punta a punta.

---

## 1. Resumen del problema

El frontend y el backend tenían 3 desajustes en los registros:

| Situación | Detalle | Estado |
|---|---|---|
| Backend espera `ciudad` y `estado` y el frontend **no los mandaba** | El registro de **PCD** (`RegistrationWizard.jsx`) no enviaba `ciudad`/`estado` en `POST /autenticacion/registro` ni en `PUT /usuarios/perfil` | ✅ **Corregido en frontend** (09-2026): ahora el wizard PCD captura Estado + Municipio y los envía en ambos llamados |
| Frontend mandaba `perfilNecesidades` donde el backend **no lo espera** | `perfilNecesidades` iba embebido dentro de `PUT /usuarios/perfil` | ✅ **Corregido en frontend** (09-2026): se movió a `POST /usuarios/perfil-necesidades` |
| El **contenido** del perfil de necesidades estaba incompleto / mal mapeado | 5 campos llegaban siempre vacíos y 3 campos llevan datos que no corresponden a su nombre | ⚠️ **Parcialmente resuelto en frontend (09-2026)**: los 5 campos vacíos ya se capturan en el wizard (sección 4); los 3 con semántica incorrecta siguen pendientes de acordar (sección 5) |

---

## 2. Endpoints y payloads actuales (lo que el frontend envía hoy)

### 2.1 `POST /autenticacion/registro` — registro de cuenta

```json
{
  "email": "string",
  "password": "string",
  "nombreCompleto": "string",
  "rol": "pcd | padre_tutor | institucion",
  "ciudad": "string",        // ← ahora SÍ se envía (todos los roles)
  "estado": "string",        // ← ahora SÍ se envía (todos los roles)
  "curp": "string | opcional",
  "fechaNacimiento": "YYYY-MM-DD | opcional"
}
```

### 2.2 `PUT /usuarios/perfil` — datos generales del usuario

```json
{
  "nombreCompleto": "string",
  "ciudad": "string",
  "estado": "string"
}
```

> **Importante:** el frontend **ya no envía `perfilNecesidades` aquí** (se eliminó en 09-2026).
> Si el backend lo ignora cuando llega, perfecto; si lo rechaza, ya no debería volver a ocurrir.
> **Confirmar:** ¿el endpoint acepta únicamente estos campos?

### 2.3 `POST /usuarios/perfil-necesidades` — perfil de necesidades

Body = objeto `PerfilNecesidades` completo (16 campos, detallados en la sección 3).

> ¿Este es el endpoint canónico para guardar el perfil de necesidades? El frontend asumió que sí
> (existe también `GET /usuarios/perfil-necesidades` documentado como "obtener perfil guardado").

---

## 3. Esquema esperado de `PerfilNecesidades` (16 campos)

El frontend mapea a este esquema en español (función `mapPerfilNecesidadesToBackend`, `src/features/auth/hooks/useAuth.js`):

| # | Campo (backend) | Tipo | Qué envía el frontend HOY | Estado |
|---|---|---|---|---|
| 1 | `tiposDiscapacidad` | `string[]` | Condiciones PCD + neurodivergencias seleccionadas | ✅ Lleno |
| 2 | `severidadDiscapacidad` | `string \| null` | La **lista de condiciones unida con comas** | ⚠️ Mal mapeado (no es una severidad) |
| 3 | `modosComunicacion` | `string[]` | Formatos de información preferidos (`texto`, `imagenes`, `audio`, `video`, `persona`) | ✅ Lleno (razonable) |
| 4 | `necesidadesMovilidad` | `string[]` | `[]` si la escala de movilidad es 4; si no `["Movilidad reducida"]` | ✅ Lleno (derivado) |
| 5 | `accesoTecnologia` | `string[]` | **Los mismos formatos de información** (duplica a `modosComunicacion`) | ⚠️ Mal mapeado (no es acceso a tecnología) |
| 6 | `zonasPreferidas` | `string[]` | Colonias/zonas escritas en el paso "Zonas y apoyos" | ✅ Lleno (opcional; `[]` si se omite) |
| 7 | `necesidades` | `string[]` | Necesidades seleccionadas en el paso "Zonas y apoyos" | ✅ Lleno (opcional; `[]` si se omite) |
| 8 | `metasActuales` | `string[]` | Los **intereses/temas** seleccionados | ⚠️ Discutible (intereses ≠ metas) |
| 9 | `areasApoyo` | `string[]` | Áreas de apoyo seleccionadas en el paso "Zonas y apoyos" | ✅ Lleno (opcional; `[]` si se omite) |
| 10 | `historialEducacion` | `string[]` | Historial escolar en el paso "Historial educativo y terapias" | ✅ Lleno (opcional; `[]` si se omite) |
| 11 | `historialTerapia` | `string[]` | Terapias en el paso "Historial educativo y terapias" | ✅ Lleno (opcional; `[]` si se omite) |
| 12 | `etapaVida` | `string \| null` | Calculado de la fecha de nacimiento (`infancia_temprana`, `infancia`, `adolescencia`, `juventud`, `adultez`, `adulto_mayor`) | ✅ Lleno (derivado) |
| 13 | `preocupacionesActuales` | `string \| null` | Diagnóstico específico escrito por el usuario | ✅ Lleno (o `null`) |
| 14 | `nivelApoyo` | `string \| null` | Derivado **solo** de la escala de comunicación (`independiente`, `con_apoyo`, `necesita_apoyo_intensivo`) | ⚠️ Débil (1 de 8 escalas) |
| 15 | `edad` | `number \| null` | Calculado de la fecha de nacimiento | ✅ Lleno |
| 16 | `fechaNacimiento` | `string \| null` | Fecha del formulario | ✅ Lleno |

---

## 4. Campos que el frontend NO capturaba (corregido en frontend 09-2026)

Estos 5 campos llegaban siempre como `[]` porque **el wizard de registro no preguntaba por ellos**:

1. `zonasPreferidas`
2. `necesidades`
3. `areasApoyo`
4. `historialEducacion`
5. `historialTerapia`

**Actualización (09-2026):** se agregaron al wizard de registro (PCD y tutor, `RegistrationWizard.jsx` y `TutorRegistrationWizard.jsx`) dos pasos nuevos:
- _Historial educativo y terapias_ → captura `historialEducacion` e `historialTerapia`.
- _Zonas y apoyos_ → captura `zonasPreferidas` (colonias en texto libre), `necesidades` y `areasApoyo` (catálogos multi-select).

Ahora esos campos llegan con los valores seleccionados por el usuario; si el usuario omite el paso, siguen llegando `[]`.

**Preguntas para backend (siguen vigentes):**
- ¿El backend **acepta** estos campos vacíos (`[]`) o los considera obligatorios?
- Si son obligatorios: ¿de dónde espera el backend que salgan? (el frontend de registro hoy no los captura; habría que agregar pasos nuevos al wizard o definirlos por default).
- ¿El endpoint `POST /usuarios/perfil-necesidades` falla (400/422) si algún campo llega vacío o ausente?

**Actualización registro tutor (09-2026):** el wizard de tutor ahora captura la fecha de nacimiento de la persona a cargo y:
1. Crea **siempre** el dependiente vía `POST /usuarios/dependientes` (también cuando el backend responde `requiereInicioSesion`, iniciando sesión con las mismas credenciales para obtener token).
2. Envía `parentesco` tomado del catálogo `/catalogos` y `tiposDiscapacidad` mapeados a códigos (tea, motriz, visual…); `etapaVida` y edad se calculan con la fecha de la persona a cargo.
3. Ya no silencia el error: si el alta del dependiente falla se muestra un aviso claro al usuario.
4. Se corrigió un bug que interrumpía el flujo antes del alta del dependiente (referencia a variable inexistente `docFile` en el registro con token).

> Nota: las escalas de vida, intereses y formatos capturados siguen guardándose en el perfil de la cuenta del tutor (el endpoint de dependientes no tiene campos para ellos). Confirmar con backend (pregunta 6) si debe existir un perfil de necesidades por dependiente.

---

## 5. Campos con semántica incorrecta (el backend recibe datos que no son lo que el campo dice)

| Campo | Qué recibe hoy | Qué debería recibir | Acción propuesta |
|---|---|---|---|
| `severidadDiscapacidad` | "Intelectual o cognitiva, Visual" (condiciones unidas) | Valor de severidad real o `null` | Definir catálogo (`leve`/`moderada`/`severa`?) o aceptar `null` |
| `accesoTecnologia` | `["texto", "video"]` (formatos de info) | Acceso real a tecnología (¿dispositivos? ¿internet?) o `[]` | Definir catálogo o aceptar `[]` |
| `metasActuales` | Intereses ("Terapias", "Primer empleo") | Metas/objetivos concretos | Aceptar intereses como metas, o separar campos |
| `nivelApoyo` | Derivado únicamente de la escala de comunicación | Derivado del conjunto de escalas, o capturado | El frontend puede mejorarlo (derivar del promedio de las 8 escalas); confirmar valores aceptados |
| `edad`/`etapaVida` (solo rol tutor) | ✅ **Corregido en frontend (09-2026)**: el wizard tutor ahora pregunta la fecha de nacimiento de la persona a cargo y `edad`, `etapaVida` y `fechaNacimiento` se calculan con **esa** fecha (ya no con la del tutor). Además el alta del dependiente (`POST /usuarios/dependientes`) se ejecuta de forma confiable al registrar, con `etapaVida` calculada del dependiente y errores visibles | Edad/etapa del dependiente | ⚠️ Sigue pendiente de acordar con backend si el perfil de necesidades en rol `padre_tutor` debe guardarse contra la cuenta del tutor o contra el dependiente (p. ej. `/usuarios/dependientes/:id/...`) |

---

## 6. Preguntas abiertas que necesitamos que backend confirme

1. ¿`POST /autenticacion/registro` valida `ciudad` y `estado` como **obligatorios** para todos los roles? (el frontend ya los envía).
2. ¿`PUT /usuarios/perfil` acepta solo `{ nombreCompleto, ciudad, estado }` o también otros campos (`urlAvatar`, `bio`, `profesion`…)? ¿Qué pasa si le llega `perfilNecesidades`?
3. ¿El guardado del perfil de necesidades es **`POST /usuarios/perfil-necesidades`**? ¿Existe **`GET /usuarios/perfil-necesidades`** y/o viene anidado en `GET /usuarios/perfil` como `perfilNecesidades`?
4. De los 16 campos de la sección 3: ¿cuáles son **obligatorios**, cuáles **opcionales**, y qué valores acepta cada uno (catálogos, formatos, rangos)?
5. ¿Los arrays vacíos (`[]`) y los `null` son aceptados en todos los campos opcionales?
6. Rol `padre_tutor`: ¿el perfil de necesidades que llega describe al tutor o al dependiente? Si describe al dependiente, ¿hay un endpoint para guardarlo contra el dependiente (p. ej. `/usuarios/dependientes/:id/...`)?
7. ¿Hay campos del modelo `PerfilNecesidades` del backend que **no estén en esta lista de 16**? (si el backend tiene más columnas, este documento está incompleto).

---

## 7. Ejemplo del payload real que envía el frontend hoy

(PCD — `POST /usuarios/perfil-necesidades`):

```json
{
  "tiposDiscapacidad": ["Motriz o de movilidad física", "TDAH"],
  "severidadDiscapacidad": "Motriz o de movilidad física, TDAH",
  "modosComunicacion": ["texto", "video"],
  "necesidadesMovilidad": ["Movilidad reducida"],
  "accesoTecnologia": ["texto", "video"],
  "zonasPreferidas": [],
  "necesidades": [],
  "metasActuales": ["Terapias", "Primer empleo"],
  "areasApoyo": [],
  "historialEducacion": [],
  "historialTerapia": [],
  "etapaVida": "adultez",
  "preocupacionesActuales": "Parálisis cerebral infantil",
  "nivelApoyo": "con_apoyo",
  "edad": 34,
  "fechaNacimiento": "1992-04-10"
}
```

**Código fuente de referencia (frontend):**
- Mapeo español ⇄ inglés: `src/features/auth/hooks/useAuth.js` (`mapPerfilNecesidadesToBackend`, `mapPerfilNecesidadesToFrontend`, `useUpdateNeedsProfile`)
- Generación del perfil en registro PCD: `src/features/auth/components/RegistrationWizard.jsx`
- Generación del perfil en registro tutor: `src/features/auth/components/TutorRegistrationWizard.jsx`
- Inventario de endpoints: `src/shared/constants/backendEndpoints.js`
