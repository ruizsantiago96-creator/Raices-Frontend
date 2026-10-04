import React from 'react'
import { Icons } from '@shared/components/shared'

export interface OnboardingStageCoverProps {
  onStart: () => void
  stageNumber?: number
  stageTitle?: string
  subtitle?: string
}

export const OnboardingStageCover: React.FC<OnboardingStageCoverProps> = ({
  onStart,
  stageNumber = 1,
  stageTitle = '1. Conocer quién eres.',
  subtitle = 'Tres pasos para conocerte mejor',
}) => {
  return (
    <div className="onboarding-stage-cover" style={{ animation: 'fadeInUp 0.35s ease both' }}>
      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            borderRadius: 8,
            background: 'rgba(34, 155, 88, 0.12)',
            color: '#229B58',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          <span>Etapa {stageNumber}</span>
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 26,
            fontWeight: 800,
            color: 'var(--fg1)',
            margin: '0 0 6px',
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
          }}
        >
          {stageTitle}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--fg2)', margin: 0 }}>
          {subtitle}
        </p>
      </div>

      {/* 3 Steps Visual Roadmap Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #9CB2BC 0%, #8DA6B2 100%)',
          borderRadius: 16,
          padding: '24px 20px',
          color: '#0C3B4B',
          marginBottom: 28,
          boxShadow: '0 8px 24px -4px rgba(12, 59, 75, 0.15)',
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgba(12, 59, 75, 0.85)',
            marginBottom: 20,
            letterSpacing: '-0.01em',
          }}
        >
          Tres pasos para conocerte mejor
        </div>

        {/* Steps Grid / Process Flow */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, position: 'relative' }}>
          
          {/* Step 1 Card (Active) */}
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: 16,
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
              border: '2px solid #0C3B4B',
              transform: 'scale(1.02)',
              position: 'relative',
              zIndex: 2,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#0C3B4B',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                1
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#FDE674',
                  border: '1.5px solid #0C3B4B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0C3B4B',
                }}
              >
                {Icons.user ? Icons.user({ s: 18 }) : Icons.shieldCheck({ s: 18 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0C3B4B', marginBottom: 4 }}>
                Conocer quién eres
              </div>
              <div style={{ fontSize: 11.5, color: '#334155', lineHeight: 1.45 }}>
                Tu identidad, tu historia y lo que es importante para ti.
              </div>
            </div>
          </div>

          {/* Step 2 Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 16,
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#0C3B4B',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                2
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#F8FAF2',
                  border: '1.5px solid #0C3B4B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0C3B4B',
                }}
              >
                {Icons.home ? Icons.home({ s: 18 }) : Icons.heart({ s: 18 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0C3B4B', marginBottom: 4 }}>
                Conocer tu día a día
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(12, 59, 75, 0.85)', lineHeight: 1.45 }}>
                Cómo realizas tus actividades, te comunicas, te desplazas, tomas decisiones y qué apoyos necesitas.
              </div>
            </div>
          </div>

          {/* Step 3 Card */}
          <div
            style={{
              background: 'var(--bg-surface)',
              borderRadius: 16,
              padding: '16px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              border: '1px solid rgba(12, 59, 75, 0.15)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: '#0C3B4B',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                3
              </div>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: '#F8FAF2',
                  border: '1.5px solid #0C3B4B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FF4D68',
                }}
              >
                {Icons.star ? Icons.star({ s: 18 }) : Icons.compass({ s: 18 })}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#0C3B4B', marginBottom: 4 }}>
                Reconocer tus logros e intereses
              </div>
              <div style={{ fontSize: 11.5, color: 'rgba(12, 59, 75, 0.85)', lineHeight: 1.45 }}>
                Lo que has conseguido, lo que sabes hacer, lo que disfrutas y lo que quieres lograr.
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* CTA Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button
          type="button"
          className="auth-btn-primary"
          onClick={onStart}
          style={{
            width: '100%',
            maxWidth: 360,
            padding: '15px 24px',
            fontSize: 15,
            fontWeight: 700,
            borderRadius: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            boxShadow: '0 4px 14px rgba(34, 155, 88, 0.25)',
          }}
        >
          <span>Comenzar preguntas</span>
          {Icons.arrowRight({ s: 18 })}
        </button>
      </div>
    </div>
  )
}

export default OnboardingStageCover
