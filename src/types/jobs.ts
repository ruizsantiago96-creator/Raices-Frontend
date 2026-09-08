export type JobModality = 'presencial' | 'remoto' | 'híbrido' | string

export type JobApplicationStatus = 'pending' | 'reviewed' | 'accepted' | 'rejected'

export interface Job {
  id: string | number
  title: string
  description?: string
  requirements?: string
  modality?: JobModality
  schedule?: string
  salary_range?: string
  city?: string
  state?: string
  disability_inclusive?: boolean
  disability_types?: string[]
  is_active?: boolean
  applicants_count?: number
  applicantsCount?: number
  created_at?: string
  updated_at?: string

  // Institución asociada/embebida
  institution_id?: string | number
  institution_name?: string
  institution_city?: string
  institution_description?: string
  institution_phone?: string
  institution_email?: string
  institution_website?: string
  institution_verified?: boolean
  institution_owner_id?: string | number

  // Campos de compatibilidad en español / alias
  titulo?: string
  descripcion?: string
  requisitos?: string
  modalidad?: string
  horario?: string
  rangoSalario?: string
  ciudad?: string
  estado?: string
  empresa?: string
  categoria?: string
  inclusivaDiscapacidad?: boolean
  tiposDiscapacidad?: string[]
  activa?: boolean
  fechaCreacion?: string
  institucionId?: string | number
  nombreInstitucion?: string
  institucionNombre?: string
  nombre_institucion?: string
  ciudadInstitucion?: string
  descripcionInstitucion?: string
  telefonoInstitucion?: string
  emailInstitucion?: string
  sitioWebInstitucion?: string
  verificada?: boolean
  institucionVerificada?: boolean
  institucionOwnerId?: string | number
  institucion?: {
    id?: string | number
    nombre?: string
    verificada?: boolean
    owner_id?: string | number
    propietarioId?: string | number
  }

  // Si viene con datos de postulación (ej. en detalles o listas combinadas)
  application_id?: string | number
  cover_letter?: string
  cartaPresentacion?: string
  carta_presentacion?: string
  mensaje?: string
  status?: JobApplicationStatus | string
  estadoPostulacion?: string
}

export interface RawBackendJob {
  id?: string | number
  title?: string
  titulo?: string
  description?: string
  descripcion?: string
  requirements?: string
  requisitos?: string
  modality?: string
  modalidad?: string
  schedule?: string
  horario?: string
  salary_range?: string
  rangoSalario?: string
  city?: string
  ciudad?: string
  state?: string
  estado?: string
  empresa?: string
  categoria?: string
  disability_inclusive?: boolean
  inclusivaDiscapacidad?: boolean
  disability_types?: string[]
  tiposDiscapacidad?: string[]
  is_active?: boolean
  activa?: boolean
  applicants_count?: number
  applicantsCount?: number
  numPostulantes?: number
  postulantesCount?: number
  cantidadPostulantes?: number
  created_at?: string
  fechaCreacion?: string
  updated_at?: string
  fechaActualizacion?: string
  institution_id?: string | number
  institucionId?: string | number
  institution_name?: string
  nombreInstitucion?: string
  institucionNombre?: string
  nombre_institucion?: string
  ciudadInstitucion?: string
  institution_city?: string
  descripcionInstitucion?: string
  institution_description?: string
  telefonoInstitucion?: string
  institution_phone?: string
  emailInstitucion?: string
  institution_email?: string
  sitioWebInstitucion?: string
  institution_website?: string
  verificada?: boolean
  institucionVerificada?: boolean
  institution_verified?: boolean
  institucionOwnerId?: string | number
  institution_owner_id?: string | number
  institucion?: {
    id?: string | number
    nombre?: string
    verificada?: boolean
    owner_id?: string | number
    propietarioId?: string | number
  }
  cover_letter?: string
  cartaPresentacion?: string
  carta_presentacion?: string
  mensaje?: string
  application_id?: string | number
  status?: string
  estadoPostulacion?: string
  [key: string]: unknown
}

export interface JobApplication {
  id: string | number
  job_id?: string | number
  title?: string
  titulo?: string
  modality?: string
  modalidad?: string
  institution_name?: string
  nombreInstitucion?: string
  status: JobApplicationStatus | string
  cover_letter?: string
  cartaPresentacion?: string
  carta_presentacion?: string
  created_at?: string
  fechaCreacion?: string
  description?: string
  requirements?: string
  institution_owner_id?: string | number
  job?: Job
  [key: string]: unknown
}

export interface RawBackendPostulacion {
  id?: string | number
  job_id?: string | number
  title?: string
  titulo?: string
  modality?: string
  modalidad?: string
  institution_name?: string
  nombreInstitucion?: string
  status?: string
  estado?: string
  cover_letter?: string
  cartaPresentacion?: string
  carta_presentacion?: string
  created_at?: string
  fechaCreacion?: string
  description?: string
  requirements?: string
  institution_owner_id?: string | number
  job?: RawBackendJob
  [key: string]: unknown
}

export interface JobFilters {
  buscar?: string
  ciudad?: string
  modalidad?: string
  pagina?: number
  limite?: number
  ordenarPor?: string
  direccion?: 'asc' | 'desc' | string
}

export interface PaginatedResponse<T> {
  datos: T[]
  total: number
  pagina: number
  limite: number
  totalPaginas: number
}

export interface CreateJobPayload {
  titulo: string
  descripcion: string
  requisitos: string
  modalidad: string
  horario: string
  rangoSalario: string
  ciudad: string
  estado: string
  inclusivaDiscapacidad: boolean
}

export interface UpdateJobPayload extends Partial<CreateJobPayload> {
  id: string | number
  [key: string]: unknown
}

export interface ApplyJobPayload {
  jobId: string | number
  cover_letter?: string
  candidateId?: string | number | null
}

export interface CvFileData {
  name: string
  size: string
  uploadDate: string
}
