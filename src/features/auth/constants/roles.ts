import type { FluentEmojiComponent } from './fluentEmojis'
import { FluentEmoji } from './fluentEmojis'

export interface RoleOption {
  id: string
  title: string
  desc: string
  icon: FluentEmojiComponent
}

export const ROLES: RoleOption[] = [
  {
    id: 'pcd',
    title: 'Persona con discapacidad',
    desc: 'Accede a servicios, empleo y recursos personalizados',
    icon: FluentEmoji.pcdRole,
  },
  {
    id: 'tutor',
    title: 'Tutor o cuidador',
    desc: 'Gestiona el camino de una persona bajo tu cuidado',
    icon: FluentEmoji.tutorRole,
  },
  {
    id: 'institution',
    title: 'Institución',
    desc: 'Ofrece servicios, empleo y apoyo a la comunidad',
    icon: FluentEmoji.gobierno,
  },
  {
    id: 'empresa',
    title: 'Empresa inclusiva',
    desc: 'Publica vacantes y promueve la inclusión laboral',
    icon: FluentEmoji.laboral,
  },
]
