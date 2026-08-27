import PcdDoodle from '../components/doodles/PcdDoodle'
import TutorDoodle from '../components/doodles/TutorDoodle'
import InstitutionDoodle from '../components/doodles/InstitutionDoodle'
import EnterpriseDoodle from '../components/doodles/EnterpriseDoodle'

export const ROLES = [
  {
    id: 'pcd',
    title: 'Persona con discapacidad',
    desc: 'Accede a servicios, empleo y recursos personalizados',
    icon: PcdDoodle,
  },
  {
    id: 'tutor',
    title: 'Tutor o cuidador',
    desc: 'Gestiona el camino de una persona bajo tu cuidado',
    icon: TutorDoodle,
  },
  {
    id: 'institution',
    title: 'Institución',
    desc: 'Ofrece servicios, empleo y apoyo a la comunidad',
    icon: InstitutionDoodle,
  },
  {
    id: 'empresa',
    title: 'Empresa inclusiva',
    desc: 'Publica vacantes y promueve la inclusión laboral',
    icon: EnterpriseDoodle,
  },
]
