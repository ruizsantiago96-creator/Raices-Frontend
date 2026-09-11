/**
 * FLUENT EMOJI (estilo Modern / 3D) — componentes usados en los wizards de registro.
 * ================================================================================
 * Reemplaza los emojis del sistema por SVG de @microsoft/fluentui-emoji vía
 * `react-fluentui-emoji`. Importes profundos (por icono) para que el bundler
 * solo incluya los SVG usados.
 *
 * Tamaños: los catálogos guardan la REFERENCIA del componente; cada render
 * pasa `size` explícito con el mismo pixel que tenía el `font-size` del glyph
 * (28 en tarjetas horizontales/comunidad, 24 en verticales/grid, 48 en thanks).
 *
 * NOTA: el emoji 👨‍👩‍👧‍👦 (familias) NO se reemplaza — no existe equivalente
 * en la librería y se decidió conservarlo (renderiza como texto, no SVG).
 */

import type { ComponentType } from 'react'
import IconMClassicalBuilding from 'react-fluentui-emoji/lib/modern/icons/IconMClassicalBuilding'
import IconMGreenHeart from 'react-fluentui-emoji/lib/modern/icons/IconMGreenHeart'
import IconMGlowingStar from 'react-fluentui-emoji/lib/modern/icons/IconMGlowingStar'
import IconMStarStruck from 'react-fluentui-emoji/lib/modern/icons/IconMStarStruck'
import IconMHeartWithArrow from 'react-fluentui-emoji/lib/modern/icons/IconMHeartWithArrow'
import IconMHandshake from 'react-fluentui-emoji/lib/modern/icons/IconMHandshake'
import IconMSchool from 'react-fluentui-emoji/lib/modern/icons/IconMSchool'
import IconMFire from 'react-fluentui-emoji/lib/modern/icons/IconMFire'
import IconMOneOclock from 'react-fluentui-emoji/lib/modern/icons/IconMOneOclock'
import IconMStar from 'react-fluentui-emoji/lib/modern/icons/IconMStar'
import IconMGraduationCap from 'react-fluentui-emoji/lib/modern/icons/IconMGraduationCap'
import IconMHospital from 'react-fluentui-emoji/lib/modern/icons/IconMHospital'
import IconMWomanHealthWorkerDefault from 'react-fluentui-emoji/lib/modern/icons/IconMWomanHealthWorkerDefault'
import IconMFlexedBicepsDefault from 'react-fluentui-emoji/lib/modern/icons/IconMFlexedBicepsDefault'
import IconMBooks from 'react-fluentui-emoji/lib/modern/icons/IconMBooks'
import IconMBriefcase from 'react-fluentui-emoji/lib/modern/icons/IconMBriefcase'
import IconMWheelchairSymbol from 'react-fluentui-emoji/lib/modern/icons/IconMWheelchairSymbol'
import IconMGlobeShowingAmericas from 'react-fluentui-emoji/lib/modern/icons/IconMGlobeShowingAmericas'
import IconMOpenBook from 'react-fluentui-emoji/lib/modern/icons/IconMOpenBook'
import IconMFramedPicture from 'react-fluentui-emoji/lib/modern/icons/IconMFramedPicture'
import IconMHeadphone from 'react-fluentui-emoji/lib/modern/icons/IconMHeadphone'
import IconMClapperBoard from 'react-fluentui-emoji/lib/modern/icons/IconMClapperBoard'
import IconMPartyPopper from 'react-fluentui-emoji/lib/modern/icons/IconMPartyPopper'
import IconMRocket from 'react-fluentui-emoji/lib/modern/icons/IconMRocket'
import IconMWarning from 'react-fluentui-emoji/lib/modern/icons/IconMWarning'
import IconMRoundPushpin from 'react-fluentui-emoji/lib/modern/icons/IconMRoundPushpin'
import IconMLockedWithKey from 'react-fluentui-emoji/lib/modern/icons/IconMLockedWithKey'
import IconMSparkles from 'react-fluentui-emoji/lib/modern/icons/IconMSparkles'
import IconMGrinningFaceWithSmilingEyes from 'react-fluentui-emoji/lib/modern/icons/IconMGrinningFaceWithSmilingEyes'

import IconMCrescentMoon from 'react-fluentui-emoji/lib/modern/icons/IconMCrescentMoon'
import IconMSpeechBalloon from 'react-fluentui-emoji/lib/modern/icons/IconMSpeechBalloon'
import IconMBell from 'react-fluentui-emoji/lib/modern/icons/IconMBell'

import IconMPeopleHugging from 'react-fluentui-emoji/lib/modern/icons/IconMPeopleHugging'
import IconMVideoGame from 'react-fluentui-emoji/lib/modern/icons/IconMVideoGame'
import IconMRobot from 'react-fluentui-emoji/lib/modern/icons/IconMRobot'
import IconMArtistPalette from 'react-fluentui-emoji/lib/modern/icons/IconMArtistPalette'
import IconMSportsMedal from 'react-fluentui-emoji/lib/modern/icons/IconMSportsMedal'
import IconMYellowHeart from 'react-fluentui-emoji/lib/modern/icons/IconMYellowHeart'
import IconMWrench from 'react-fluentui-emoji/lib/modern/icons/IconMWrench'

/** Componente de emoji Fluent: acepta `size` (número|string) y props SVG estándar. */
export type FluentEmojiComponent = ComponentType<{ size?: number | string }>

export const FluentEmoji = {
  // ── Subtipos institucionales / empresariales ──────────────────────
  gobierno: IconMClassicalBuilding,        // 🏛️
  ong: IconMGreenHeart,                    // 💚
  fundacion: IconMGlowingStar,             // 🌟
  donante: IconMHeartWithArrow,            // 💝
  apoyo: IconMHandshake,                   // 🤝 (institución de apoyo / social / con apoyo de otra persona)
  escuelaPublica: IconMSchool,             // 🏫
  escuelaPrivada: IconMGraduationCap,      // 🎓
  centroTerapeutico: IconMHospital,        // 🏥
  especialista: IconMWomanHealthWorkerDefault, // 👩‍⚕️ (tono de piel por defecto)

  // ── Categorías principales ────────────────────────────────────────
  funcional: IconMFlexedBicepsDefault,     // 💪 (tono de piel por defecto)
  educativo: IconMBooks,                   // 📚
  laboral: IconMBriefcase,                 // 💼

  // ── Comunidades ───────────────────────────────────────────────────
  pcd: IconMWheelchairSymbol,              // ♿ (símbolo de accesibilidad)
  pcdRole: IconMGrinningFaceWithSmilingEyes,                //  (Para la selección de rol)
  tutorRole: IconMHandshake, // 🧑‍🤝‍🧑 (Para la selección de rol tutor)
  comunidadGlobal: IconMGlobeShowingAmericas, // 🌍

  // ── Formatos de contenido ─────────────────────────────────────────
  formatoTexto: IconMOpenBook,             // 📖
  formatoImagenes: IconMFramedPicture,     // 🖼️
  formatoAudio: IconMHeadphone,            // 🎧
  formatoVideo: IconMClapperBoard,         // 🎬

  // ── Pantallas de éxito ────────────────────────────────────────────
  exito: IconMPartyPopper,                 // 🎉
  lanzamiento: IconMRocket,                // 🚀

  // ── Avisos / chips inline ─────────────────────────────────────────
  teFalta: IconMWarning,                   // ⚠️
  ubicacion: IconMRoundPushpin,            // 📍
  privacidad: IconMLockedWithKey,          // 🔒
  destello: IconMSparkles,                 // ✨
  fuego: IconMFire,                        // 🔥
  reloj: IconMOneOclock,                   // 🕐
  estrella: IconMStar,                     // ⭐
  luna: IconMCrescentMoon,                 // 🌙
  chat: IconMSpeechBalloon,                // 💬
  campana: IconMBell,                      // 🔔

  // ── Eventos ───────────────────────────────────────────────────────
  familia: IconMPeopleHugging,
  libros: IconMBooks,
  juegos: IconMVideoGame,
  tecnologia: IconMRobot,
  arte: IconMArtistPalette,
  deporte: IconMSportsMedal,
  bienestar: IconMYellowHeart,
  talleres: IconMWrench,
} as const satisfies Record<string, FluentEmojiComponent>
