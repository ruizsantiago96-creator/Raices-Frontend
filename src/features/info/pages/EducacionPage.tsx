import InfoLandingTemplate from '../components/InfoLandingTemplate'
import { getInfoPageData } from '../data/infoPages'

/** Landing "Educación" — /educacion (footer → columna Caminos). */
export default function EducacionPage() {
  return <InfoLandingTemplate data={getInfoPageData('educacion')} />
}
