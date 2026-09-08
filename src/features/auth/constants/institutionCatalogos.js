/**
 * CATÁLOGOS DE REGISTRO INSTITUCIONAL (Fase 1 · Extracción pasiva)
 * Única fuente de verdad de los catálogos de InstitutionRegistrationWizard.jsx.
 */

// ── SUBTIPOS INSTITUCIONALES ──────────────────────────────────────
export const INSTITUTION_SUBTYPES = [
  { id: 'gobierno', label: 'Gobierno', desc: 'Dependencias o programas públicos de atención', icon: '🏛️' },
  { id: 'ong', label: 'ONG', desc: 'Organizaciones sin fines de lucro dedicadas a la inclusión', icon: '💚' },
  { id: 'fundacion', label: 'Fundación', desc: 'Fundaciones que apoyan a personas con discapacidad', icon: '🌟' },
  { id: 'donante', label: 'Donante', desc: 'Personas o entidades que apoyan económicamente', icon: '💝' },
]

// ── CATEGORÍAS DE SERVICIO ────────────────────────────────────────
export const SERVICE_CATEGORIES = [
  {
    title: 'DEPORTE / MOVIMIENTO',
    color: '#229B58',
    items: ['Actividad física general', 'Deporte recreativo', 'Deporte adaptado', 'Competencia', 'Rehabilitación funcional', 'Movimiento / coordinación', 'Actividades al aire libre'],
  },
  {
    title: 'BIENESTAR / ATENCIÓN ESPECIALIZADA',
    color: '#073B4C',
    items: ['Terapias', 'Salud mental / emocional', 'Atención médica especializada', 'Odontología especializada', 'Rehabilitación', 'Regulación sensorial', 'Estética / cuidado personal especializado'],
  },
  {
    title: 'EMPLEO',
    color: '#FF4D68',
    items: ['Primer empleo', 'Reintegración laboral', 'Capacitación laboral', 'Empleo adaptado', 'Empleo profesional', 'Trabajo flexible'],
  },
  {
    title: 'ARTE / CULTURA / MÚSICA',
    color: '#9B51E0',
    items: ['Música', 'Danza', 'Pintura / dibujo', 'Teatro', 'Literatura', 'Manualidades', 'Cultura / eventos'],
  },
  {
    title: 'INDEPENDENCIA',
    color: '#2F80ED',
    items: ['Vida cotidiana', 'Movilidad', 'Comunicación', 'Finanzas personales', 'Organización diaria', 'Vida independiente'],
  },
  {
    title: 'VIDA SOCIAL',
    color: '#E14E87',
    items: ['Amistades', 'Eventos', 'Relaciones', 'Actividades grupales', 'Socialización guiada', 'Citas / vínculos', 'Espacios recreativos'],
  },
]

// ── CATEGORÍAS PRINCIPALES (backend: funcional|educativo|laboral|social) ─
export const INSTITUTION_CATEGORIES = [
  { id: 'funcional', label: 'Funcional', desc: 'Rehabilitación, terapias e independencia', icon: '💪' },
  { id: 'educativo', label: 'Educativo', desc: 'Educación, formación y capacitación', icon: '📚' },
  { id: 'laboral', label: 'Laboral', desc: 'Empleo y reinserción laboral', icon: '💼' },
  { id: 'social', label: 'Social', desc: 'Arte, cultura, deporte y vida social', icon: '🤝' },
]

// ── COMUNIDADES A CONECTAR ────────────────────────────────────────
export const COMMUNITIES = [
  { id: 'pcd', label: 'Personas con discapacidad', desc: 'Conectar directamente con personas que buscan apoyo', icon: '♿' },
  { id: 'familias', label: 'Familias y cuidadores', desc: 'Apoyar a las familias que acompañan a una persona PCD', icon: '👨‍👩‍👧‍👦' },
  { id: 'profesionales', label: 'Profesionales y especialistas', desc: 'Conectar con terapeutas, doctores y expertos', icon: '👩‍⚕️' },
  { id: 'todos', label: 'Toda la comunidad', desc: 'Estar disponible para todos los que necesiten apoyo', icon: '🌍' },
]