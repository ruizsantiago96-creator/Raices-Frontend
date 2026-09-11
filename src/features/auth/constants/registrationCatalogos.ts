/**
 * CATÁLOGOS DE REGISTRO — PCD y TUTOR (Fase 1 · Extracción pasiva)
 * ================================================================
 * Única fuente de verdad de las listas y catálogos que usaban
 * RegistrationWizard.jsx y TutorRegistrationWizard.jsx.
 *
 * ⚠️ NOTA SOBRE VARIANTES: algunos catálogos tienen redacción distinta
 * entre PCD y Tutor (p. ej. "Participo con apoyo ocasional" vs
 * "Participa con apoyo ocasional"). Se preservan AMBAS variantes para
 * no alterar el comportamiento visual. Unificar la redacción es una
 * decisión de producto pendiente (ver auditoría · Fase 2).
 *
 * Los catálogos idénticos se exportan una sola vez; los que difieren,
 * con sufijo `_TUTOR`.
 *
 * Los `icon` de FORMATOS son componentes Fluent Emoji (estilo Modern);
 * el render define el tamaño (`size`). Ver ./fluentEmojis.ts.
 */
import { FluentEmoji } from './fluentEmojis'

// ── LISTA DE ACOMPAÑAMIENTO (PCD) ─────────────────────────────────
export const LIST_ACOMPANAMIENTO = [
  { id: 'explorar_solo', label: 'Quiero explorar por mi cuenta.', desc: 'Navega libremente por todos los recursos y comunidades' },
  { id: 'recomendaciones_paso', label: 'Me gustaría recibir recomendaciones paso a paso.', desc: 'Te guiaremos con rutas sugeridas a tu propio ritmo' },
  { id: 'apoyo_necesite', label: 'Prefiero contar con apoyo cuando lo necesite.', desc: 'Acceso directo a acompañamiento y orientación' },
]

// ── LISTA DE ACOMPAÑAMIENTO (TUTOR) ───────────────────────────────
export const LIST_ACOMPANAMIENTO_TUTOR = [
  { id: 'explorar_solo', label: 'Quiero explorar por mi cuenta.', desc: 'Navega libremente por todos los recursos, comunidades y oportunidades' },
  { id: 'recomendaciones_paso', label: 'Me gustaría recibir sugerencias paso a paso.', desc: 'Te guiaremos con rutas y recomendaciones al ritmo de tu familia' },
  { id: 'apoyo_necesite', label: 'Prefiero contar con apoyo cuando lo necesitemos.', desc: 'Acceso directo a acompañamiento, especialistas y orientación' },
]

// ── CONDICIONES PCD (idéntico en ambos) ────────────────────────────
export const CONDICIONES_PCD = [
  'Intelectual o cognitiva',
  'Motriz o de movilidad física',
  'Visual',
  'Auditiva',
  'Del habla y la comunicación',
  'Neurodivergencia (especificar)',
  'Psicosocial',
  'Prefiero no responder',
]

// ── NEURODIVERGENCIAS (idéntico en ambos) ──────────────────────────
export const NEURODIVERGENCIAS_LIST = [
  'Autismo', 'TDAH', 'Dislexia', 'Dispraxia',
  'Síndrome de Tourette', 'Altas capacidades/superdotación', 'Otro',
]

// ── TEMPORALIDAD (idéntico en ambos) ───────────────────────────────
export const LIST_TEMPORALIDAD = [
  { id: 'nacimiento', label: 'Desde el nacimiento' },
  { id: 'infancia', label: 'Se presentó durante la infancia' },
  { id: 'adolescencia', label: 'Se presentó durante la adolescencia' },
  { id: 'vida_adulta', label: 'Se presentó en la vida adulta' },
  { id: 'progresiva', label: 'Ha ido apareciendo o cambiando con el tiempo' },
  { id: 'en_evaluacion', label: 'Actualmente está en proceso de evaluación' },
]

// ── ESCALAS DE VIDA (PCD) ──────────────────────────────────────────
export const ESCALAS_OPCIONES = {
  autonomia: [
    { value: 4, label: 'Tomo decisiones con autonomía' },
    { value: 3, label: 'Participo con apoyo ocasional' },
    { value: 2, label: 'Requiero guía frecuente' },
    { value: 1, label: 'Requiero representación o apoyo constante' },
  ],
  independencia: [
    { value: 4, label: 'Me desenvuelvo con autonomía' },
    { value: 3, label: 'Requiero apoyo en algunas actividades' },
    { value: 2, label: 'Requiero apoyo frecuente' },
    { value: 1, label: 'Requiero acompañamiento constante' },
  ],
  comunicacion: [
    { value: 4, label: 'Verbal fluida' },
    { value: 3, label: 'Verbal con apoyos / limitada' },
    { value: 2, label: 'No verbal (funcional / con apoyos)' },
    { value: 1, label: 'En desarrollo o exploración' },
  ],
  comprension: [
    { value: 4, label: 'Independiente' },
    { value: 3, label: 'Con apoyo ocasional' },
    { value: 2, label: 'Con apoyo frecuente' },
    { value: 1, label: 'Con apoyo total' },
  ],
  energia: [
    { value: 4, label: 'Alta → Participo activamente en la mayoría de actividades' },
    { value: 3, label: 'Media → Participo bien con pausas o equilibrio' },
    { value: 2, label: 'Variable → Depende del día, entorno o condición' },
    { value: 1, label: 'Baja → Requiero actividades de baja demanda o periodos cortos' },
  ],
  movilidad: [
    { value: 4, label: 'Independiente' },
    { value: 3, label: 'Con apoyo ocasional' },
    { value: 2, label: 'Con apoyo frecuente' },
    { value: 1, label: 'Con apoyo total' },
  ],
  social: [
    { value: 4, label: 'Participo con facilidad' },
    { value: 3, label: 'Participo con algunas barreras' },
    { value: 2, label: 'Requiero apoyo frecuente' },
    { value: 1, label: 'Requiero acompañamiento constante' },
  ],
  emocional: [
    { value: 4, label: 'Poco o nada' },
    { value: 3, label: 'Algunas veces' },
    { value: 2, label: 'Frecuentemente' },
    { value: 1, label: 'Requiero apoyo constante' },
  ],
}

// ── ESCALAS DE VIDA (TUTOR) ────────────────────────────────────────
export const ESCALAS_OPCIONES_TUTOR = {
  autonomia: [
    { value: 4, label: 'Toma decisiones con autonomía' },
    { value: 3, label: 'Participa con apoyo ocasional' },
    { value: 2, label: 'Requiere guía frecuente' },
    { value: 1, label: 'Requiere representación o apoyo constante' },
  ],
  independencia: [
    { value: 4, label: 'Se desenvuelve con autonomía' },
    { value: 3, label: 'Requiere apoyo en algunas actividades' },
    { value: 2, label: 'Requiere apoyo frecuente' },
    { value: 1, label: 'Requiere acompañamiento constante' },
  ],
  comunicacion: [
    { value: 4, label: 'Verbal fluida' },
    { value: 3, label: 'Verbal con apoyos / limitada' },
    { value: 2, label: 'No verbal (funcional / con apoyos)' },
    { value: 1, label: 'En desarrollo o exploración' },
  ],
  comprension: [
    { value: 4, label: 'Independiente' },
    { value: 3, label: 'Con apoyo ocasional' },
    { value: 2, label: 'Con apoyo frecuente' },
    { value: 1, label: 'Con apoyo total' },
  ],
  energia: [
    { value: 4, label: 'Alta → Participa activamente en la mayoría de actividades' },
    { value: 3, label: 'Media → Participa bien con pausas o equilibrio' },
    { value: 2, label: 'Variable → Depende del día, entorno o condición' },
    { value: 1, label: 'Baja → Requiere actividades de baja demanda o periodos cortos' },
  ],
  movilidad: [
    { value: 4, label: 'Independiente' },
    { value: 3, label: 'Con apoyo ocasional' },
    { value: 2, label: 'Con apoyo frecuente' },
    { value: 1, label: 'Con apoyo total' },
  ],
  social: [
    { value: 4, label: 'Participa con facilidad' },
    { value: 3, label: 'Participa con algunas barreras' },
    { value: 2, label: 'Requiere apoyo frecuente' },
    { value: 1, label: 'Requiere acompañamiento constante' },
  ],
  emocional: [
    { value: 4, label: 'Poco o nada' },
    { value: 3, label: 'Algunas veces' },
    { value: 2, label: 'Frecuentemente' },
    { value: 1, label: 'Requiero apoyo constante' },
  ],
}

// ── FORMATOS (PCD) ─────────────────────────────────────────────────
export const LIST_FORMATOS = [
  { id: 'texto', label: 'Leyendo textos', icon: FluentEmoji.formatoTexto },
  { id: 'imagenes', label: 'Con imágenes', icon: FluentEmoji.formatoImagenes },
  { id: 'audio', label: 'Con audio', icon: FluentEmoji.formatoAudio },
  { id: 'video', label: 'Con videos', icon: FluentEmoji.formatoVideo },
  { id: 'persona', label: 'Con apoyo de otra persona', icon: FluentEmoji.apoyo },
]

// ── FORMATOS (TUTOR) ───────────────────────────────────────────────
export const LIST_FORMATOS_TUTOR = [
  { id: 'texto', label: 'Leyendo textos', icon: FluentEmoji.formatoTexto },
  { id: 'imagenes', label: 'Con imágenes y pictogramas', icon: FluentEmoji.formatoImagenes },
  { id: 'audio', label: 'Con explicaciones en audio', icon: FluentEmoji.formatoAudio },
  { id: 'video', label: 'Con videos demostrativos', icon: FluentEmoji.formatoVideo },
  { id: 'persona', label: 'Con apoyo y mediación de otra persona', icon: FluentEmoji.apoyo },
]

// ── SECCIONES DE INTERÉS (PCD) ─────────────────────────────────────
export const INTEREST_SECTIONS = [
  {
    title: 'DEPORTE / MOVIMIENTO', color: '#229B58',
    items: ['Actividad física general', 'Deporte recreativo', 'Deporte adaptado', 'Competencia', 'Rehabilitación funcional', 'Movimiento / coordinación', 'Actividades al aire libre'],
  },
  {
    title: 'BIENESTAR / ATENCIÓN ESPECIALIZADA', color: '#073B4C',
    items: ['Terapias', 'Salud mental / emocional', 'Atención médica especializada', 'Odontología especializada', 'Rehabilitación', 'Regulación sensorial', 'Estética / cuidado personal especializado'],
  },
  {
    title: 'EMPLEO', color: '#FF4D68',
    items: ['Primer empleo', 'Reintegración laboral', 'Capacitación laboral', 'Empleo adaptado', 'Empleo profesional', 'Trabajo flexible'],
  },
  {
    title: 'AUTOEMPLEO', color: '#D4944C',
    items: ['Emprendimiento', 'Negocio propio', 'Venta de productos', 'Servicios', 'Marca personal', 'Economía digital'],
  },
  {
    title: 'ARTE / CULTURA / MÚSICA', color: '#9B51E0',
    items: ['Música', 'Danza', 'Pintura / dibujo', 'Teatro', 'Literatura', 'Manualidades', 'Cultura / eventos'],
  },
  {
    title: 'INDEPENDENCIA', color: '#2F80ED',
    items: ['Vida cotidiana', 'Movilidad', 'Comunicación', 'Finanzas personales', 'Organización diaria', 'Vida independiente'],
  },
  {
    title: 'VIDA SOCIAL', color: '#E14E87',
    items: ['Amistades', 'Eventos', 'Relaciones', 'Actividades grupales', 'Socialización guiada', 'Citas / vínculos', 'Espacios recreativos'],
  },
  {
    title: 'EXPLORAR POSIBILIDADES', color: '#138A8A',
    items: ['Descubrir intereses', 'Nuevas experiencias', 'Inspiración', 'Orientación', 'Comunidad', 'Futuro'],
  },
]

// ── SECCIONES DE INTERÉS (TUTOR) ───────────────────────────────────
export const INTEREST_SECTIONS_TUTOR = [
  {
    title: 'DEPORTE / MOVIMIENTO', color: '#229B58',
    items: ['Actividad física general', 'Deporte recreativo', 'Deporte adaptado', 'Competencia', 'Rehabilitación funcional', 'Movimiento / coordinación', 'Actividades al aire libre'],
  },
  {
    title: 'BIENESTAR / ATENCIÓN ESPECIALIZADA', color: '#073B4C',
    items: ['Terapias', 'Salud mental / emocional', 'Atención médica especializada', 'Odontología especializada', 'Rehabilitación', 'Regulación sensorial', 'Estética / cuidado personal especializado'],
  },
  {
    title: 'EMPLEO / FORMACIÓN', color: '#FF4D68',
    items: ['Primer empleo', 'Reintegración laboral', 'Capacitación laboral', 'Empleo adaptado', 'Empleo profesional', 'Trabajo flexible'],
  },
  {
    title: 'AUTOEMPLEO / PROYECTOS', color: '#D4944C',
    items: ['Emprendimiento', 'Negocio propio', 'Venta de productos', 'Servicios', 'Marca personal', 'Economía digital'],
  },
  {
    title: 'ARTE / CULTURA / MÚSICA', color: '#9B51E0',
    items: ['Música', 'Danza', 'Pintura / dibujo', 'Teatro', 'Literatura', 'Manualidades', 'Cultura / eventos'],
  },
  {
    title: 'INDEPENDENCIA / VIDA DIARIA', color: '#2F80ED',
    items: ['Vida cotidiana', 'Movilidad', 'Comunicación', 'Finanzas personales', 'Organización diaria', 'Vida independiente'],
  },
  {
    title: 'VIDA SOCIAL / COMUNIDAD', color: '#E14E87',
    items: ['Amistades', 'Eventos', 'Relaciones', 'Actividades grupales', 'Socialización guiada', 'Citas / vínculos', 'Espacios recreativos'],
  },
  {
    title: 'EXPLORAR POSIBILIDADES', color: '#138A8A',
    items: ['Descubrir intereses', 'Nuevas experiencias', 'Inspiración', 'Orientación', 'Comunidad', 'Futuro'],
  },
]

// ── VIABILIDAD (idéntico en ambos) ─────────────────────────────────
export const LIST_VIABILIDAD = [
  { id: 'gratuita_becas', label: 'Gratuitas, con becas o apoyos' },
  { id: 'bajo_costo', label: 'Bajo costo' },
  { id: 'moderada', label: 'Inversión moderada' },
  { id: 'sin_restricciones', label: 'Sin restricciones definidas' },
]

// ── NECESIDADES (PCD) ──────────────────────────────────────────────
export const LIST_NECESIDADES = [
  'Transporte accesible',
  'Accesibilidad en espacios públicos',
  'Apoyo en la comunicación',
  'Acompañamiento a actividades o citas',
  'Apoyo con trámites y documentos',
  'Apoyo económico / becas',
  'Atención en salud y terapias',
  'Apoyo emocional o psicológico',
  'Ajustes razonables en escuela o trabajo',
  'Tecnología de apoyo / asistiva',
]

// ── NECESIDADES (TUTOR) ────────────────────────────────────────────
export const LIST_NECESIDADES_TUTOR = [
  'Transporte accesible',
  'Accesibilidad en espacios públicos',
  'Apoyo en la comunicación',
  'Acompañamiento a actividades o citas',
  'Apoyo con trámites y documentos',
  'Apoyo económico / becas',
  'Atención en salud y terapias',
  'Apoyo emocional o psicológico familiar',
  'Ajustes razonables en escuela o trabajo',
  'Tecnología de apoyo / asistiva',
]

// ── ÁREAS DE APOYO (PCD) ───────────────────────────────────────────
export const LIST_AREAS_APOYO = [
  'Movilidad y traslados',
  'Cuidado personal y autocuidado',
  'Comunicación',
  'Actividades de la vida diaria',
  'Ámbito educativo / escolar',
  'Ámbito laboral / empleo',
  'Trámites y gestiones',
  'Vida social y participación',
  'Tareas del hogar',
  'Tecnología y dispositivos',
  'Salud y bienestar',
]

// ── ÁREAS DE APOYO (TUTOR) ─────────────────────────────────────────
export const LIST_AREAS_APOYO_TUTOR = [
  'Movilidad y traslados',
  'Cuidado personal y autocuidado',
  'Comunicación',
  'Actividades de la vida diaria',
  'Ámbito educativo / escolar',
  'Ámbito laboral / formativo',
  'Trámites y gestiones',
  'Vida social y participación',
  'Tareas del hogar',
  'Tecnología y dispositivos',
  'Salud y bienestar integral',
]

// ── ZONAS SUGERIDAS MÉRIDA (idéntico en ambos) ─────────────────────
export const MERIDA_ZONAS_SUGERIDAS = [
  'Centro (97000)',
  'Altabrisa (97130)',
  'Francisco de Montejo (97203)',
  'Ciudad Caucel (97314)',
  'Las Américas (97302)',
  'García Ginerés (97070)',
  'Campestre (97120)',
  'Chuburná (97205)',
  'Montebello (97113)',
  'Itzimná (97100)',
  'Pensiones (97217)',
  'Los Héroes (97306)',
]

// ── EDUCACIÓN (PCD) ────────────────────────────────────────────────
export const LIST_EDUCACION = [
  'Escuela regular',
  'Escuela con apoyos (inclusiva)',
  'Escuela de educación especial (CAM)',
  'Educación en casa (homeschool)',
  'Educación para adultos (INEA)',
  'Estudios técnicos o de oficio',
  'Universidad',
  'No he asistido a la escuela',
]

// ── EDUCACIÓN (TUTOR) ──────────────────────────────────────────────
export const LIST_EDUCACION_TUTOR = [
  'Escuela regular',
  'Escuela con apoyos (inclusiva)',
  'Escuela de educación especial (CAM)',
  'Educación en casa (homeschool)',
  'Educación para adultos (INEA)',
  'Estudios técnicos o de oficio',
  'Universidad',
  'No ha asistido a la escuela',
]

// ── TERAPIAS (idéntico en ambos) ───────────────────────────────────
export const LIST_TERAPIAS = [
  'Física / rehabilitación',
  'Ocupacional',
  'De lenguaje / comunicación',
  'Psicológica o emocional',
  'Conductual (ABA)',
  'Integración sensorial',
  'Neuropsicología',
  'Ninguna hasta ahora',
]