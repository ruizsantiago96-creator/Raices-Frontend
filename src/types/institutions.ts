export type InstitutionCategory = 'funcional' | 'educativo' | 'laboral' | 'social' | string

export type InstitutionPlanType = 'gratuito' | 'basico' | 'premium' | string

export interface InstitucionCoordenadas {
  lat: number
  lng: number
}

export interface InstitucionServicio {
  id?: string | number
  nombre?: string
  descripcion?: string
  costo?: string | number
  [key: string]: unknown
}

export interface Institution {
  id: string | number
  name: string
  description?: string
  category?: InstitutionCategory
  subcategory?: string
  city?: string
  state?: string
  address?: string

  lat?: number
  lng?: number

  phone?: string
  whatsapp?: string
  email?: string
  website?: string

  logo_url?: string
  cover_url?: string
  photos?: string[]

  disability_types?: string[]
  min_age?: number
  max_age?: number
  business_hours?: string
  plan_type?: InstitutionPlanType
  services?: InstitucionServicio[] | string[]

  rating_avg?: number
  rating_count?: number

  is_active?: boolean
  is_verified?: boolean

  score_intereses?: number | null
  score_comportamiento?: number | null
  final_score?: number | null

  owner_id?: string | number
  created_at?: string
  updated_at?: string
  deleted_at?: string | null

  // Aliases en español y compatibilidad
  nombre?: string
  descripcion?: string
  categoria?: string
  subcategoria?: string
  ciudad?: string
  estado?: string
  direccion?: string
  telefono?: string
  sitioWeb?: string
  urlLogo?: string
  urlPortada?: string
  fotos?: string[]
  tiposDiscapacidad?: string[]
  edadMinima?: number
  edadMaxima?: number
  horarioAtencion?: string
  tipoPlan?: string
  servicios?: InstitucionServicio[] | string[]
  calificacionPromedio?: number
  cantidadCalificaciones?: number
  activa?: boolean
  verificada?: boolean
  creadoPor?: string | number
  fechaCreacion?: string
  fechaActualizacion?: string
  fechaEliminacion?: string | null
  [key: string]: unknown
}

export interface RawBackendInstitucion {
  id?: string | number
  _id?: string | number
  documentId?: string | number
  institutionId?: string | number
  name?: string
  nombre?: string
  description?: string
  descripcion?: string
  category?: string
  categoria?: string
  subcategory?: string
  subcategoria?: string
  city?: string
  ciudad?: string
  state?: string
  estado?: string
  address?: string
  direccion?: string
  lat?: number
  lng?: number
  phone?: string
  telefono?: string
  whatsapp?: string
  email?: string
  emailContacto?: string
  correo?: string
  correoElectronico?: string
  website?: string
  sitioWeb?: string
  logo_url?: string
  urlLogo?: string
  cover_url?: string
  urlPortada?: string
  photos?: string[]
  fotos?: string[]
  disability_types?: string[]
  tiposDiscapacidad?: string[]
  min_age?: number
  edadMinima?: number
  max_age?: number
  edadMaxima?: number
  business_hours?: string
  horarioAtencion?: string
  plan_type?: string
  tipoPlan?: string
  services?: InstitucionServicio[] | string[]
  servicios?: InstitucionServicio[] | string[]
  rating_avg?: number
  calificacionPromedio?: number
  rating_count?: number
  cantidadCalificaciones?: number
  is_active?: boolean
  activa?: boolean
  active?: boolean
  is_verified?: boolean
  verificada?: boolean
  verified?: boolean
  score_intereses?: number | null
  score_comportamiento?: number | null
  final_score?: number | null
  owner_id?: string | number
  creadoPor?: string | number
  created_at?: string
  fechaCreacion?: string
  updated_at?: string
  fechaActualizacion?: string
  deleted_at?: string | null
  fechaEliminacion?: string | null
  [key: string]: unknown
}

export interface FiltrosInstituciones {
  busqueda?: string
  ciudad?: string
  categoria?: string
  tipoDiscapacidad?: string
  edad?: number | string
  pagina?: number
  limite?: number
  [key: string]: unknown
}

export interface CrearInstitucionPayload {
  nombre: string
  descripcion?: string
  categoria?: string
  subcategoria?: string
  ciudad?: string
  estado?: string
  direccion?: string
  telefono?: string
  email?: string
  sitioWeb?: string
  whatsapp?: string
  tiposDiscapacidad?: string[]
  edadMinima?: number
  edadMaxima?: number
  horarioAtencion?: string
  coordenadas?: InstitucionCoordenadas
  servicios?: InstitucionServicio[] | string[]
  [key: string]: unknown
}

export interface UpdateInstitucionPayload extends Partial<CrearInstitucionPayload> {
  id?: string | number
  [key: string]: unknown
}

export interface ValidarCsfQrResponse {
  valido?: boolean
  rfc?: string
  razonSocial?: string
  mensaje?: string
  [key: string]: unknown
}

export interface InstitutionJobApplicant {
  id: string | number
  user_id?: string | number
  user_name?: string
  user_email?: string
  job_id?: string | number
  job_title?: string
  cover_letter?: string
  created_at?: string
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected' | string
  usuario?: {
    id?: string | number
    nombreCompleto?: string
    email?: string
  }
  [key: string]: unknown
}

export interface RawBackendJobApplicant {
  id?: string | number
  _id?: string | number
  postulacionId?: string | number
  user_id?: string | number
  usuarioId?: string | number
  user_name?: string
  nombreUsuario?: string
  user_email?: string
  emailUsuario?: string
  job_id?: string | number
  vacanteId?: string | number
  job_title?: string
  tituloVacante?: string
  titulo?: string
  cover_letter?: string
  cartaPresentacion?: string
  carta_presentacion?: string
  created_at?: string
  fechaCreacion?: string
  createdAt?: string
  status?: string
  estadoPostulacion?: string
  estado?: string
  usuario?: {
    id?: string | number
    nombreCompleto?: string
    email?: string
  }
  vacante?: {
    id?: string | number
    titulo?: string
  }
  [key: string]: unknown
}

export interface Review {
  id: string | number
  rating: number
  comment: string
  full_name: string
  user_name: string
  reviewer_name: string
  user_id?: string | number
  institution_name?: string
  created_at?: string
  calificacion?: number
  comentario?: string
  nombreUsuario?: string
  usuarioNombre?: string
  usuarioId?: string | number
  institucionNombre?: string
  fechaCreacion?: string
  [key: string]: unknown
}

export interface RawBackendReview {
  id?: string | number
  calificacion?: number
  rating?: number
  comentario?: string
  comment?: string
  nombreUsuario?: string
  usuarioNombre?: string
  full_name?: string
  user_name?: string
  reviewer_name?: string
  user_id?: string | number
  usuarioId?: string | number
  usuario_id?: string | number
  nombreInstitucion?: string
  institucionNombre?: string
  institution_name?: string
  fechaCreacion?: string
  created_at?: string
  fecha_creacion?: string
  usuario?: {
    id?: string | number
    nombreCompleto?: string
  }
  institucion?: {
    id?: string | number
    nombre?: string
  }
  [key: string]: unknown
}
