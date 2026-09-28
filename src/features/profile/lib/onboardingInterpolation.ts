/**
 * Helper para interpolación de nombres y persona gramatical en preguntas de Onboarding.
 * 
 * Reglas según Backend Contract:
 * - destinatarioPerfil === "PARA_MI": Redacción en 1ª persona ("¿De qué manera te comunicas mejor?")
 * - destinatarioPerfil === "PARA_MI_HIJO": Redacción con ${nombrePcd} ("¿De qué manera se comunica mejor Diego?")
 */

export function formatOnboardingQuestion(
  template: string,
  destinatarioPerfil: string = 'PARA_MI',
  nombrePcd: string = 'Diego'
): string {
  const isParaMi = destinatarioPerfil === 'PARA_MI'
  const pcdName = nombrePcd.trim() || (isParaMi ? 'ti' : 'Diego')

  if (isParaMi) {
    return template
      .replace(/\$\{nombrePcd\}|\{nombrePcd\}|\{nombre\}/g, 'ti')
      .replace(/se comunica mejor \$\{nombrePcd\}/gi, 'te comunicas mejor')
      .replace(/se comunica mejor [A-ZÁÉÍÓÚa-záéíóú]+/gi, 'te comunicas mejor')
      .replace(/se comunica mejor/gi, 'te comunicas mejor')
      .replace(/su desarrollo/gi, 'tu desarrollo')
  }

  // destinatarioPerfil === "PARA_MI_HIJO" u otros
  return template
    .replace(/\$\{nombrePcd\}|\{nombrePcd\}|\{nombre\}/g, pcdName)
    .replace(/te comunicas mejor/gi, `se comunica mejor ${pcdName}`)
    .replace(/¿De qué manera te comunicas/gi, `¿De qué manera se comunica ${pcdName}`)
}
