import InfoLandingTemplate from '../components/InfoLandingTemplate'
import { getInfoPageData } from '../data/infoPages'

/** Landing "Nuestro propósito" — /nuestro-proposito (footer → columna Florece). */
export default function NuestroPropositoPage() {
  return <InfoLandingTemplate data={getInfoPageData('proposito')} />
}
