import InfoLandingTemplate from '../components/InfoLandingTemplate'
import { getInfoPageData } from '../data/infoPages'

/** Landing "Empleo" — /empleo (footer → columna Caminos). */
export default function EmpleoPage() {
  return <InfoLandingTemplate data={getInfoPageData('empleo')} />
}
