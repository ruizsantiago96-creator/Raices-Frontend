import InfoLandingTemplate from '../components/InfoLandingTemplate'
import { getInfoPageData } from '../data/infoPages'

/** Landing "Salud y bienestar" — /salud-y-bienestar (footer → columna Caminos). */
export default function SaludBienestarPage() {
  return <InfoLandingTemplate data={getInfoPageData('salud')} />
}
