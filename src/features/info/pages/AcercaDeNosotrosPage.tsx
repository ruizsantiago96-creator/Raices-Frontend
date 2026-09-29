import InfoLandingTemplate from '../components/InfoLandingTemplate'
import { getInfoPageData } from '../data/infoPages'

/** Landing "Acerca de nosotros" — /acerca-de-nosotros (footer → columna Florece). */
export default function AcercaDeNosotrosPage() {
  return <InfoLandingTemplate data={getInfoPageData('acercaDeNosotros')} />
}
