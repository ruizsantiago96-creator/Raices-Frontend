import InfoLandingTemplate from '../components/InfoLandingTemplate'
import { getInfoPageData } from '../data/infoPages'

/** Landing "Privacidad" — /privacidad (footer → columna Florece). */
export default function PrivacidadPage() {
  return <InfoLandingTemplate data={getInfoPageData('privacidad')} />
}
