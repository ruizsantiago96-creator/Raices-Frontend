/**
 * Contenido centralizado para las landing pages informativas del Footer.
 *
 * Para añadir una nueva página:
 *  1. Agrega una entrada a INFO_PAGES con su contenido (copywriting, pilares y CTA).
 *  2. Crea `src/features/info/pages/<PascalCase>Page.tsx` con 3 líneas:
 *       const data = getEducacionData() // o el getter correspondiente
 *       return <InfoLandingTemplate data={data} />
 *  3. Registra la ruta en `src/App.tsx`.
 */

/* ── Tipos ──────────────────────────────────────────────── */

/** Íconos disponibles para los pilares. */
export type InfoIconName =
  | 'graduationCap'
  | 'heartPulse'
  | 'briefcase'
  | 'users'
  | 'shield'
  | 'target'
  | 'heart'
  | 'compass'
  | 'check'
  | 'sparkles'
  | 'mail'
  | 'message'
  | 'info'

export interface InfoPillar {
  /** Clave del ícono en el mapa `Icons` de @shared/components/shared */
  icon: InfoIconName
  title: string
  desc: string
}

export interface InfoPageData {
  /** Etiqueta corta sobre el título (badge del hero). */
  badge: string
  /** Título principal del hero. */
  title: string
  /** Subtítulo del hero (1–2 frases empáticas). */
  subtitle: string
  /** Texto introductorio bajo el hero. */
  intro: string
  /** Título de la sección de pilares. */
  pillarsTitle: string
  /** Los 3 pilares o beneficios de la página. */
  pillars: InfoPillar[]
  /** Título del CTA final. */
  ctaTitle: string
  /** Descripción del CTA final. */
  ctaDesc: string
}

/* ── Páginas "Caminos" ──────────────────────────────────── */

const educacion: InfoPageData = {
  badge: 'Caminos · Educación',
  title: 'Aprender sin barreras, a tu ritmo',
  subtitle: 'En Raíces creemos que la educación es un derecho, no un privilegio. Por eso conectamos a personas con discapacidad con escuelas inclusivas, talleres adaptados y herramientas de aprendizaje pensadas para cada forma de aprender.',
  intro: 'Desde la escuela inicial hasta la formación para el empleo, trabajamos para que cada etapa educativa tenga el apoyo, los ajustes razonables y la tecnología que cada persona necesita para florecer.',
  pillarsTitle: 'Cómo te acompañamos en tu camino educativo',
  pillars: [
    {
      icon: 'graduationCap',
      title: 'Escuelas y aulas inclusivas',
      desc: 'Te conectamos con instituciones educativas verificadas que aplican diseños universales de aprendizaje, ajustes razonables y equipos docentes sensibilizados.',
    },
    {
      icon: 'sparkles',
      title: 'Talleres adaptados y de interés',
      desc: 'Arte, música, tecnología, deportes o oficios: descubrí talleres con metodologías y materiales adaptados, donde participar es tan importante como aprender.',
    },
    {
      icon: 'heart',
      title: 'Herramientas y apoyo continuo',
      desc: 'Orientación para familias, tecnologías de asistencia y acompañamiento personalizado para que ningún desafío académico se enfrente solo.',
    },
  ],
  ctaTitle: 'Tu camino educativo empieza hoy',
  ctaDesc: 'Creá tu perfil en Raíces y descubrí oportunidades educativas cerca de ti, adaptadas a tus intereses y necesidades.',
}

const salud: InfoPageData = {
  badge: 'Caminos · Salud y bienestar',
  title: 'Bienestar integral, siempre acompañado',
  subtitle: 'La salud no es solo tratar: es acompañar. En Raíces acercamos a personas con discapacidad y sus familias profesionales de la salud verificados, terapias adecuadas y comunidades de apoyo que entienden tu camino.',
  intro: 'Desde el diagnóstico hasta la vida adulta, el bienestar necesita continuidad. Organizamos información, servicios y redes de contención para que cuidar la salud sea más simple y menos solitario.',
  pillarsTitle: 'Qué encontrás en este camino',
  pillars: [
    {
      icon: 'heartPulse',
      title: 'Profesionales de la salud verificados',
      desc: 'Terapeutas, médicos y especialistas con credenciales verificadas, experiencia en discapacidad y enfoque centrado en la persona.',
    },
    {
      icon: 'users',
      title: 'Grupos de apoyo y contención',
      desc: 'Espacios donde familias y personas con discapacidad comparten experiencias, estrategias y ánimo con quienes realmente entienden.',
    },
    {
      icon: 'heart',
      title: 'Información clara y confiable',
      desc: 'Guías sobre tratamientos, derechos, coberturas y prestaciones, redactadas en lenguaje sencillo y revisadas por profesionales.',
    },
  ],
  ctaTitle: 'Dale a tu bienestar el lugar que merece',
  ctaDesc: 'Registrate gratis y accedé a profesionales, grupos de apoyo y recursos de salud pensados para vos y tu familia.',
}

const empleo: InfoPageData = {
  badge: 'Caminos · Empleo',
  title: 'Trabajo digno, talento sin límites',
  subtitle: 'El empleo transforma vidas. Raíces conecta a personas con discapacidad con empresas comprometidas con la inclusión, ofreciendo vacantes accesibles, adaptación de puestos y acompañamiento durante toda la inserción laboral.',
  intro: 'Creemos que el trabajo es mucho más que un ingreso: es autonomía, identidad y pertenencia. Por eso preparamos, conectamos y acompañamos cada etapa del camino laboral.',
  pillarsTitle: 'Cómo impulsamos tu desarrollo laboral',
  pillars: [
    {
      icon: 'briefcase',
      title: 'Vacantes inclusivas y verificadas',
      desc: 'Ofertas de empresas que apuestan por la diversidad, con procesos de selección accesibles y descripciones claras de los ajustes disponibles.',
    },
    {
      icon: 'graduationCap',
      title: 'Formación y fortalecimiento de habilidades',
      desc: 'Cursos, certificaciones y talleres de empleabilidad adaptados a distintos ritmos y estilos de aprendizaje, para crecer con confianza.',
    },
    {
      icon: 'target',
      title: 'Acompañamiento en la inserción',
      desc: 'Mentorías y orientación continua antes, durante y después de la contratación, para que la incorporación sea exitosa para todos.',
    },
  ],
  ctaTitle: 'Tu talento tiene un lugar en Raíces',
  ctaDesc: 'Creá tu perfil profesional y postulate a oportunidades laborales inclusivas cerca de ti.',
}

const comunidad: InfoPageData = {
  badge: 'Caminos · Comunidad',
  title: 'Nadie florece solo',
  subtitle: 'La comunidad es raíz y abrigo. En Raíces, personas con discapacidad, familias, tutores e instituciones se encuentran para compartir experiencias, crear lazos y construir juntos una sociedad más accesible y humana.',
  intro: 'Participar de una comunidad reduce el aislamiento y multiplica las oportunidades. Acá tu historia importa, tu voz cuenta y cada logro se celebra en conjunto.',
  pillarsTitle: 'Lo que la comunidad de Raíces te ofrece',
  pillars: [
    {
      icon: 'users',
      title: 'Foros y espacios de encuentro',
      desc: 'Conversaciones seguras y moderadas por temas: educación, salud, vida diaria, derechos. Preguntá, respondé y conocé personas que viven experiencias similares.',
    },
    {
      icon: 'heart',
      title: 'Eventos y actividades accesibles',
      desc: 'Talleres recreativos, charlas y encuentros con accesibilidad garantizada, para disfrutar y participar sin barreras.',
    },
    {
      icon: 'shield',
      title: 'Un entorno seguro y respetuoso',
      desc: 'Moderación activa, reglas claras y tolerancia cero al daño. La comunidad de Raíces se construye sobre la dignidad y el respeto.',
    },
  ],
  ctaTitle: 'Sumá tu voz a la comunidad',
  ctaDesc: 'Unite a Raíces y conectá con miles de personas que, como vos, creen en el poder de la comunidad.',
}

/* ── Páginas "Florece" ──────────────────────────────────── */

const acercaDeNosotros: InfoPageData = {
  badge: 'Florece · Nosotros',
  title: 'Conectamos caminos dignos hacia la autonomía',
  subtitle: 'Raíces para florecer nació de una necesidad real: familias que no sabían a dónde acudir. Hoy somos un ecosistema digital que une a personas con discapacidad, tutores, instituciones y empresas en un solo lugar, de confianza y sin costo.',
  intro: 'Nuestra misión es simple y profunda: que ninguna persona con discapacidad ni su familia recorra el camino hacia la autonomía en soledad. Conectamos, acompañamos y celebramos cada logro.',
  pillarsTitle: 'Nuestros pilares',
  pillars: [
    {
      icon: 'compass',
      title: 'Misión: caminos claros',
      desc: 'Ordenar la información dispersa y conectar cada necesidad con el recurso, servicio o persona que puede atenderla, con transparencia total.',
    },
    {
      icon: 'target',
      title: 'Visión: un mundo sin barreras',
      desc: 'Aspiramos a una sociedad donde la accesibilidad sea la norma, donde cada persona con discapacidad pueda desarrollarse plenamente.',
    },
    {
      icon: 'heart',
      title: 'Valores: dignidad y cuidado',
      desc: 'Empatía antes que eficiencia, personas antes que procesos. Cada funcionalidad de Raíces se diseña escuchando a la propia comunidad.',
    },
  ],
  ctaTitle: 'Sé parte de esta historia',
  ctaDesc: 'Cada perfil que se crea, cada conexión que se logra, es un camino más hacia el florecimiento. El próximo puede ser el tuyo.',
}

const proposito: InfoPageData = {
  badge: 'Florece · Propósito',
  title: '¿Por qué existe Raíces?',
  subtitle: 'Detrás de cada funcionalidad hay un propósito: derribar las barreras que separan a las personas con discapacidad de sus oportunidades. No construimos una app más; construimos un puente.',
  intro: 'Cada día, miles de familias buscan información fragmentada, servicios inaccesibles y respuestas que llegan tarde. Raíces existe para cambiar esa realidad con tecnología con propósito humano.',
  pillarsTitle: 'Lo que nos mueve cada día',
  pillars: [
    {
      icon: 'heart',
      title: 'Autonomía real',
      desc: 'Queremos que cada persona tome decisiones informadas sobre su propia vida. La tecnología está para empoderar, nunca para reemplazar la voz de nadie.',
    },
    {
      icon: 'users',
      title: 'Ningún camino en soledad',
      desc: 'Del aislamiento a la red: conectamos a quienes necesitan con quienes pueden ayudar, en un ecosistema donde todos tienen algo que aportar.',
    },
    {
      icon: 'shield',
      title: 'Confianza verificada',
      desc: 'Instituciones y profesionales verificados, datos protegidos y transparencia radical. La confianza es la raíz de todo lo que construimos.',
    },
  ],
  ctaTitle: 'Ayudanos a llegar más lejos',
  ctaDesc: 'Registrate, invitá a otras familias o escribinos con ideas. Raíces crece con cada persona que decide sumar.',
}

const privacidad: InfoPageData = {
  badge: 'Florece · Privacidad',
  title: 'Tus datos, tu dignidad, tu control',
  subtitle: 'En Raíces la privacidad no es un trámite legal: es una promesa. Te explicamos con claridad qué información recopilamos, para qué la usamos y cómo mantenemos el control en tus manos.',
  intro: 'Sabemos que los datos de salud, educación y vida diaria son especialmente sensibles. Por eso aplicamos los más altos estándares de protección, cifrado y transparencia en cada funcionalidad.',
  pillarsTitle: 'Nuestros compromisos contigo',
  pillars: [
    {
      icon: 'shield',
      title: 'Protección desde el diseño',
      desc: 'Cifrado en tránsito y en reposo, acceso mínimo necesario y auditorías periódicas. La seguridad no es una capa: es la base.',
    },
    {
      icon: 'check',
      title: 'Tú decides qué compartir',
      desc: 'Perfiles configurables, consentimientos revocables y descarga de tus datos cuando quieras. Tu información es tuya y así se queda.',
    },
    {
      icon: 'info',
      title: 'Transparencia sin letra chica',
      desc: 'Sin términos confusos ni uso comercial de tus datos. Si algo cambia, te lo contamos antes, en lenguaje claro.',
    },
  ],
  ctaTitle: '¿Preguntas sobre tus datos?',
  ctaDesc: 'Nuestro equipo de privacidad responde cada consulta con la seriedad que tu información merece.',
}

const contacto: InfoPageData = {
  badge: 'Florece · Contacto',
  title: 'Hablemos, estamos para acompañarte',
  subtitle: '¿Tenés una consulta, una idea o necesitás ayuda con la plataforma? Escríbinos. Cada mensaje es leído por personas reales que se preocupan por darte una respuesta clara y útil.',
  intro: 'Ya sea que vivas con una discapacidad, acompañes a alguien, representes una institución o una empresa inclusiva: hay un equipo listo para escucharte.',
  pillarsTitle: 'Canales de atención',
  pillars: [
    {
      icon: 'message',
      title: 'Formulario de contacto',
      desc: 'Completá el formulario de esta página: tu mensaje llega directo al equipo y te respondemos en máximo 48 horas hábiles.',
    },
    {
      icon: 'mail',
      title: 'Correo electrónico',
      desc: 'Preferís escribirnos directamente? Escríbinos a contacto@raices.app y responderemos con soluciones concretas.',
    },
    {
      icon: 'users',
      title: 'Alianzas e instituciones',
      desc: '¿Querés que tu institución o empresa forme parte del ecosistema? Elegí el motivo “Soy una institución” o “Soy una empresa” en el formulario.',
    },
  ],
  ctaTitle: 'Tu mensaje abre caminos',
  ctaDesc: 'Escribinos hoy y descubrí cómo Raíces puede acompañarte a vos y a tu comunidad.',
}

/* ── Registro de páginas ────────────────────────────────── */

export const INFO_PAGES: Record<string, InfoPageData> = {
  educacion,
  salud,
  empleo,
  comunidad,
  acercaDeNosotros,
  proposito,
  privacidad,
  contacto,
}

/** Getter con fallback seguro: si la clave no existe, devuelve la página "acerca". */
export function getInfoPageData(key: keyof typeof INFO_PAGES | string): InfoPageData {
  return INFO_PAGES[key] ?? INFO_PAGES.acercaDeNosotros
}
