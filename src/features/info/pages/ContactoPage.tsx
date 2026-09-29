import InfoLandingTemplate, { ExtraContentSlot } from '../components/InfoLandingTemplate'
import ContactFormSection from '../components/ContactFormSection'
import { getInfoPageData } from '../data/infoPages'

/** Landing "Contacto" — /contacto (footer → columna Florece). Con formulario funcional. */
export default function ContactoPage() {
  return (
    <InfoLandingTemplate data={getInfoPageData('contacto')}>
      <ExtraContentSlot>
        <ContactFormSection />
      </ExtraContentSlot>
    </InfoLandingTemplate>
  )
}
