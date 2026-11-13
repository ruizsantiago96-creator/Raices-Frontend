/**
 * CATÁLOGO INTERNACIONAL DE DIAGNÓSTICOS ESTANDARIZADOS (OMS CIE-10 / CIE-11 & DSM-5)
 * ====================================================================================
 * Diseñado en español neutro internacional (Latinoamérica y España) para evitar
 * errores de captura en texto libre y estandarizar el perfil clínico/funcional.
 */

export type CategoriaCondicionId =
  | 'neurodivergencia'
  | 'motriz'
  | 'intelectual'
  | 'visual'
  | 'auditiva'
  | 'habla'
  | 'psicosocial'

export interface DiagnosticoEstandarizado {
  id: string
  nombre: string
  codigoOms: string
  categoria: CategoriaCondicionId
  subcategoriaNeuro?: string
  sinonimos: string[]
}

export const CATALOGO_DIAGNOSTICOS_OMS: DiagnosticoEstandarizado[] = [
  // ── NEURODIVERGENCIA ───────────────────────────────────────────────────────
  {
    id: 'tea_nivel_1',
    nombre: 'Trastorno del Espectro Autista (TEA) — Nivel 1 (requiere apoyo)',
    codigoOms: 'CIE-11: 6A02.0 · CIE-10: F84.0',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'Autismo',
    sinonimos: ['autismo', 'asperger', 'tea grado 1', 'tea nivel 1', 'espectro autista'],
  },
  {
    id: 'tea_nivel_2',
    nombre: 'Trastorno del Espectro Autista (TEA) — Nivel 2 (requiere apoyo notable)',
    codigoOms: 'CIE-11: 6A02.2 · CIE-10: F84.0',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'Autismo',
    sinonimos: ['autismo', 'tea grado 2', 'tea nivel 2', 'espectro autista moderado'],
  },
  {
    id: 'tea_nivel_3',
    nombre: 'Trastorno del Espectro Autista (TEA) — Nivel 3 (requiere apoyo muy notable)',
    codigoOms: 'CIE-11: 6A02.3 · CIE-10: F84.0',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'Autismo',
    sinonimos: ['autismo', 'tea grado 3', 'tea nivel 3', 'autismo severo', 'no verbal'],
  },
  {
    id: 'tdah_combinado',
    nombre: 'TDAH — Presentación combinada (inatención e hiperactividad-impulsividad)',
    codigoOms: 'CIE-11: 6A05.2 · CIE-10: F90.2',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'TDAH',
    sinonimos: ['tdah', 'deficit de atencion', 'hiperactividad', 'adhd'],
  },
  {
    id: 'tdah_inatento',
    nombre: 'TDAH — Predominio de falta de atención (TDA)',
    codigoOms: 'CIE-11: 6A05.0 · CIE-10: F90.0',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'TDAH',
    sinonimos: ['tda', 'tdah inatento', 'deficit de atencion sin hiperactividad'],
  },
  {
    id: 'tdah_hiperactivo',
    nombre: 'TDAH — Predominio hiperactivo-impulsivo',
    codigoOms: 'CIE-11: 6A05.1 · CIE-10: F90.1',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'TDAH',
    sinonimos: ['tdah hiperactivo', 'impulsividad', 'hiperactividad'],
  },
  {
    id: 'dislexia',
    nombre: 'Trastorno específico del aprendizaje con dificultad en la lectura (Dislexia)',
    codigoOms: 'CIE-11: 6A03.0 · CIE-10: F81.0',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'Dislexia',
    sinonimos: ['dislexia', 'lectoescritura', 'disgrafia', 'aprendizaje lectura'],
  },
  {
    id: 'dispraxia',
    nombre: 'Trastorno del desarrollo de la coordinación motora (Dispraxia)',
    codigoOms: 'CIE-11: 6A04 · CIE-10: F82',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'Dispraxia',
    sinonimos: ['dispraxia', 'coordinacion motora', 'tdcm'],
  },
  {
    id: 'discalculia',
    nombre: 'Trastorno específico del aprendizaje con dificultad matemática (Discalculia)',
    codigoOms: 'CIE-11: 6A03.2 · CIE-10: F81.2',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'Otro',
    sinonimos: ['discalculia', 'matematicas', 'calculo'],
  },
  {
    id: 'tourette',
    nombre: 'Síndrome de Tourette / Trastorno de tics motores y vocales',
    codigoOms: 'CIE-11: 8A05.00 · CIE-10: F95.2',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'Síndrome de Tourette',
    sinonimos: ['tourette', 'tics', 'sindrome de tourette'],
  },
  {
    id: 'altas_capacidades',
    nombre: 'Altas capacidades intelectuales (AACC) / Doble excepcionalidad',
    codigoOms: 'OMS / DSM-5 · AACC',
    categoria: 'neurodivergencia',
    subcategoriaNeuro: 'Altas capacidades/superdotación',
    sinonimos: ['altas capacidades', 'superdotacion', 'aacc', 'talento', 'doble excepcionalidad'],
  },

  // ── MOTRIZ O DE MOVILIDAD FÍSICA ───────────────────────────────────────────
  {
    id: 'paralisis_cerebral_espastica',
    nombre: 'Parálisis cerebral espástica (diplejía, hemiplejía o tetraplejía)',
    codigoOms: 'CIE-11: 8D20 · CIE-10: G80.0',
    categoria: 'motriz',
    sinonimos: ['pci', 'paralisis cerebral', 'espastica', 'diplejia'],
  },
  {
    id: 'paralisis_cerebral_discinetica',
    nombre: 'Parálisis cerebral discinética o atáxica',
    codigoOms: 'CIE-11: 8D21 · CIE-10: G80.3',
    categoria: 'motriz',
    sinonimos: ['pci', 'ataxica', 'discinetica', 'paralisis cerebral'],
  },
  {
    id: 'lesion_medular_paraplejia',
    nombre: 'Lesión medular — Paraplejia o paraparesia',
    codigoOms: 'CIE-11: MB53 · CIE-10: G82.2',
    categoria: 'motriz',
    sinonimos: ['paraplejia', 'paraparesia', 'silla de ruedas', 'medula espinal', 'lesion medular'],
  },
  {
    id: 'lesion_medular_tetraplejia',
    nombre: 'Lesión medular — Tetraplejia / Cuadriplejia',
    codigoOms: 'CIE-11: MB54 · CIE-10: G82.5',
    categoria: 'motriz',
    sinonimos: ['tetraplejia', 'cuadriplejia', 'cuadriparesia', 'lesion cervical'],
  },
  {
    id: 'hemiplejia',
    nombre: 'Hemiplejia o hemiparesia (secuela vascular o neurológica)',
    codigoOms: 'CIE-11: MB50 · CIE-10: G81',
    categoria: 'motriz',
    sinonimos: ['hemiplejia', 'hemiparesia', 'acv', 'ictus', 'embolia'],
  },
  {
    id: 'espina_bifida',
    nombre: 'Espina bífida / Mielomeningocele',
    codigoOms: 'CIE-11: LA02 · CIE-10: Q05',
    categoria: 'motriz',
    sinonimos: ['espina bifida', 'mielomeningocele', 'tubo neural'],
  },
  {
    id: 'distrofia_muscular',
    nombre: 'Distrofia muscular / Miopatía neuromuscular (Duchenne, Becker, AME)',
    codigoOms: 'CIE-11: 8C70 · CIE-10: G71.0',
    categoria: 'motriz',
    sinonimos: ['distrofia', 'duchenne', 'becker', 'atrofia muscular espinal', 'ame'],
  },
  {
    id: 'amputacion_extremidad',
    nombre: 'Ausencia congénita o amputación adquirida de extremidad',
    codigoOms: 'CIE-11: LB90 · CIE-10: Z89',
    categoria: 'motriz',
    sinonimos: ['amputacion', 'protesis', 'agenesia', 'extremidad'],
  },
  {
    id: 'esclerosis_multiple',
    nombre: 'Esclerosis múltiple / Enfermedad desmielinizante',
    codigoOms: 'CIE-11: 8A40 · CIE-10: G35',
    categoria: 'motriz',
    sinonimos: ['esclerosis multiple', 'desmielinizante'],
  },
  {
    id: 'artropatia_cronica',
    nombre: 'Artritis reumatoide juvenil/adulta o limitación osteoarticular crónica',
    codigoOms: 'CIE-11: FA20 · CIE-10: M06',
    categoria: 'motriz',
    sinonimos: ['artritis', 'artrosis', 'osteoarticular', 'reumatoide', 'movilidad reducida'],
  },

  // ── INTELECTUAL O COGNITIVA ────────────────────────────────────────────────
  {
    id: 'sindrome_down',
    nombre: 'Síndrome de Down (Trisomía 21)',
    codigoOms: 'CIE-11: LD40.0 · CIE-10: Q90',
    categoria: 'intelectual',
    sinonimos: ['down', 'trisomia 21', 'sindrome de down'],
  },
  {
    id: 'tdi_leve',
    nombre: 'Trastorno del desarrollo intelectual — Leve',
    codigoOms: 'CIE-11: 6A00.0 · CIE-10: F70',
    categoria: 'intelectual',
    sinonimos: ['discapacidad intelectual leve', 'cognitiva leve', 'desarrollo intelectual'],
  },
  {
    id: 'tdi_moderado',
    nombre: 'Trastorno del desarrollo intelectual — Moderado a severo',
    codigoOms: 'CIE-11: 6A00.1 · CIE-10: F71',
    categoria: 'intelectual',
    sinonimos: ['discapacidad intelectual moderada', 'cognitiva moderada'],
  },
  {
    id: 'x_fragil',
    nombre: 'Síndrome de X Frágil u otra condición genética del neurodesarrollo',
    codigoOms: 'CIE-11: LD55 · CIE-10: Q99.2',
    categoria: 'intelectual',
    sinonimos: ['x fragil', 'williams', 'angelman', 'prader willi', 'rett'],
  },
  {
    id: 'deterioro_neurocognitivo',
    nombre: 'Trastorno neurocognitivo / Secuela cognitiva adquirida',
    codigoOms: 'CIE-11: 6D71 · CIE-10: F06.7',
    categoria: 'intelectual',
    sinonimos: ['memoria', 'deterioro cognitivo', 'traumatismo craneoencefalico', 'tce'],
  },

  // ── VISUAL ─────────────────────────────────────────────────────────────────
  {
    id: 'baja_vision',
    nombre: 'Baja visión moderada a severa (con resto visual funcional)',
    codigoOms: 'CIE-11: 9D90.1 · CIE-10: H54.1',
    categoria: 'visual',
    sinonimos: ['baja vision', 'debilidad visual', 'hipovision', 'discapacidad visual'],
  },
  {
    id: 'ceguera_total',
    nombre: 'Ceguera / Discapacidad visual profunda',
    codigoOms: 'CIE-11: 9D90.3 · CIE-10: H54.0',
    categoria: 'visual',
    sinonimos: ['ceguera', 'invidente', 'no vidente', 'ciego'],
  },
  {
    id: 'retinosis_pigmentaria',
    nombre: 'Retinosis pigmentaria / Distrofia retiniana o macular',
    codigoOms: 'CIE-11: 9B70 · CIE-10: H35.5',
    categoria: 'visual',
    sinonimos: ['retinosis', 'retina', 'macular', 'stargardt', 'retinopatia'],
  },
  {
    id: 'glaucoma_visual',
    nombre: 'Glaucoma o neuropatía óptica con reducción de campo visual',
    codigoOms: 'CIE-11: 9C61 · CIE-10: H40',
    categoria: 'visual',
    sinonimos: ['glaucoma', 'nervio optico', 'campo visual'],
  },

  // ── AUDITIVA ───────────────────────────────────────────────────────────────
  {
    id: 'hipoacusia_neurosensorial',
    nombre: 'Hipoacusia neurosensorial bilateral (leve, moderada o severa)',
    codigoOms: 'CIE-11: AB51.0 · CIE-10: H90.3',
    categoria: 'auditiva',
    sinonimos: ['hipoacusia', 'neurosensorial', 'perdida auditiva', 'audifono'],
  },
  {
    id: 'sordera_profunda',
    nombre: 'Sordera profunda / Anacusia (persona Sorda / señante o implantada)',
    codigoOms: 'CIE-11: AB51 · CIE-10: H91.3',
    categoria: 'auditiva',
    sinonimos: ['sordera', 'sordo', 'anacusia', 'lengua de senas', 'lsm', 'lse', 'implante coclear'],
  },
  {
    id: 'hipoacusia_conductiva',
    nombre: 'Hipoacusia conductiva, mixta o unilateral',
    codigoOms: 'CIE-11: AB50 · CIE-10: H90.0',
    categoria: 'auditiva',
    sinonimos: ['conductiva', 'mixta', 'unilateral', 'microtia', 'oido'],
  },

  // ── DEL HABLA Y LA COMUNICACIÓN ────────────────────────────────────────────
  {
    id: 'tdl_tel',
    nombre: 'Trastorno del Desarrollo del Lenguaje (TDL / TEL)',
    codigoOms: 'CIE-11: 6A01.2 · CIE-10: F80.1',
    categoria: 'habla',
    sinonimos: ['tdl', 'tel', 'trastorno especifico del lenguaje', 'retraso del lenguaje'],
  },
  {
    id: 'trastorno_sonidos_habla',
    nombre: 'Trastorno de los sonidos del habla / Disartria / Apraxia del habla',
    codigoOms: 'CIE-11: 6A01.0 · CIE-10: F80.0',
    categoria: 'habla',
    sinonimos: ['dislalia', 'disartria', 'apraxia', 'articulacion', 'habla'],
  },
  {
    id: 'tartamudez_disfemia',
    nombre: 'Trastorno de la fluidez del habla (Tartamudez / Disfemia)',
    codigoOms: 'CIE-11: 6A01.1 · CIE-10: F98.5',
    categoria: 'habla',
    sinonimos: ['tartamudez', 'disfemia', 'fluidez'],
  },
  {
    id: 'afasia',
    nombre: 'Afasia o requerimiento de Comunicación Aumentativa y Alternativa (CAA)',
    codigoOms: 'CIE-11: MA80 · CIE-10: R47.0',
    categoria: 'habla',
    sinonimos: ['afasia', 'caa', 'pictogramas', 'no verbal', 'comunicacion alternativa'],
  },

  // ── PSICOSOCIAL ────────────────────────────────────────────────────────────
  {
    id: 'ansiedad_generalizada',
    nombre: 'Trastorno de ansiedad generalizada o social con impacto funcional',
    codigoOms: 'CIE-11: 6B00 · CIE-10: F41.1',
    categoria: 'psicosocial',
    sinonimos: ['ansiedad', 'tag', 'panico', 'fobia social'],
  },
  {
    id: 'depresion_recurrente',
    nombre: 'Trastorno depresivo recurrente o persistente',
    codigoOms: 'CIE-11: 6A71 · CIE-10: F33',
    categoria: 'psicosocial',
    sinonimos: ['depresion', 'distimia', 'estado de animo'],
  },
  {
    id: 'trastorno_bipolar',
    nombre: 'Trastorno afectivo bipolar (Tipo I o II)',
    codigoOms: 'CIE-11: 6A60 · CIE-10: F31',
    categoria: 'psicosocial',
    sinonimos: ['bipolar', 'bipolaridad', 'afectivo'],
  },
  {
    id: 'tept',
    nombre: 'Trastorno de estrés postraumático (TEPT) / TEPT complejo',
    codigoOms: 'CIE-11: 6B40 · CIE-10: F43.1',
    categoria: 'psicosocial',
    sinonimos: ['tept', 'estres postraumatico', 'trauma'],
  },
  {
    id: 'toc',
    nombre: 'Trastorno obsesivo-compulsivo (TOC)',
    codigoOms: 'CIE-11: 6B20 · CIE-10: F42',
    categoria: 'psicosocial',
    sinonimos: ['toc', 'obsesivo compulsivo'],
  },
  {
    id: 'espectro_psicotico',
    nombre: 'Esquizofrenia o trastorno del espectro psicótico en seguimiento',
    codigoOms: 'CIE-11: 6A20 · CIE-10: F20',
    categoria: 'psicosocial',
    sinonimos: ['esquizofrenia', 'esquizoafectivo', 'psicosocial'],
  },
]

/**
 * Mapea las etiquetas de CONDICIONES_PCD del wizard a nuestras claves de categoría.
 */
export function mapWizardConditionsToCategories(conditions: string[] = []): CategoriaCondicionId[] {
  const result = new Set<CategoriaCondicionId>()
  for (const raw of conditions) {
    const c = raw.toLowerCase()
    if (c.includes('neurodivergencia')) result.add('neurodivergencia')
    if (c.includes('motriz') || c.includes('movilidad') || c.includes('física') || c.includes('fisica')) result.add('motriz')
    if (c.includes('intelectual') || c.includes('cognitiva')) result.add('intelectual')
    if (c.includes('visual')) result.add('visual')
    if (c.includes('auditiva')) result.add('auditiva')
    if (c.includes('habla') || c.includes('comunicación') || c.includes('comunicacion') || c.includes('lenguaje')) result.add('habla')
    if (c.includes('psicosocial') || c.includes('mental')) result.add('psicosocial')
  }
  return Array.from(result)
}

