import InfoLandingTemplate from '../components/InfoLandingTemplate'
import { getInfoPageData } from '../data/infoPages'

/** Landing "Comunidad" — /comunidad (footer → columna Caminos). */
export default function ComunidadPage() {
  return <InfoLandingTemplate data={getInfoPageData('comunidad')} />
}
