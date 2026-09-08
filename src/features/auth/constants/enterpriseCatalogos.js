/**
 * CATÁLOGOS DE REGISTRO EMPRESARIAL / ECOSISTEMA (Fase 1 · Extracción pasiva)
 * Única fuente de verdad de los catálogos de EnterpriseRegistrationWizard.jsx.
 */

// ── SUBTIPOS EMPRESA / ECOSISTEMA ─────────────────────────────────
export const ENTERPRISE_SUBTYPES = [
  { id: 'institucion_apoyo', label: 'Institución de apoyo', desc: 'Organizaciones que brindan servicios de acompañamiento', icon: '🤝' },
  { id: 'escuela_publica', label: 'Escuela pública', desc: 'Instituciones educativas públicas inclusivas', icon: '🏫' },
  { id: 'escuela_privada', label: 'Escuela privada', desc: 'Instituciones educativas privadas con programas inclusivos', icon: '🎓' },
  { id: 'centro_terapeutico', label: 'Centro terapéutico', desc: 'Centros especializados en terapia y rehabilitación', icon: '🏥' },
  { id: 'especialista', label: 'Especialista', desc: 'Profesionales independientes (terapeutas, psicólogos, etc.)', icon: '👩‍⚕️' },
]

// ── SERVICIOS ESPECÍFICOS DEL ECOSISTEMA ──────────────────────────
export const ECOSYSTEM_SERVICES = [
  {
    title: 'TERAPIA / REHABILITACIÓN',
    color: '#073B4C',
    items: ['Fisioterapia', 'Terapia ocupacional', 'Terapia de lenguaje', 'Psicología', 'Neuropsicología', 'Musicoterapia', 'Equinoterapia'],
  },
  {
    title: 'EDUCACIÓN INCLUSIVA',
    color: '#229B58',
    items: ['Educación básica', 'Educación media superior', 'Educación superior', 'Programas de inclusión', 'Adaptaciones curriculares', 'Apoyo escolar'],
  },
  {
    title: 'DESARROLLO PROFESIONAL',
    color: '#FF4D68',
    items: ['Capacitación laboral', 'Habilidades blandas', 'Preparación para empleo', 'Emprendimiento', 'Certificaciones', 'Mentoría'],
  },
  {
    title: 'BIENESTAR INTEGRAL',
    color: '#9B51E0',
    items: ['Salud mental', 'Regulación sensorial', 'Nutrición especializada', 'Deporte adaptado', 'Arte y expresión', 'Vida independiente'],
  },
]

// ── COMUNIDADES ────────────────────────────────────────────────────
export const COMMUNITIES = [
  { id: 'pcd', label: 'Personas con discapacidad', desc: 'Conectar directamente con quienes buscan apoyo', icon: '♿' },
  { id: 'familias', label: 'Familias y cuidadores', desc: 'Apoyar a las familias que acompañan a una persona PCD', icon: '👨‍👩‍👧‍👦' },
  { id: 'profesionales', label: 'Profesionales y especialistas', desc: 'Conectar con otros expertos del campo', icon: '👩‍⚕️' },
  { id: 'instituciones', label: 'Otras instituciones', desc: 'Colaborar con gobiernos, ONGs y fundaciones', icon: '🏛️' },
  { id: 'todos', label: 'Toda la comunidad', desc: 'Estar disponible para todos los que necesiten apoyo', icon: '🌍' },
]