import React from 'react';

/** Largura de projeto de um celular (CSS px). O vídeo de 1080 px mostra o site em tamanho real × 2,77. */
export const MOBILE_W = 390;
export const MOBILE_H = 693; // 1920 / 2.769
export const ESCALA = 1080 / MOBILE_W;

/** Página móvel em tela cheia. Coordenadas internas em CSS px (390 × 693).
 * Zona segura (Reels): y 90–535. */
export const Pagina: React.FC<{fundo: string; children: React.ReactNode; style?: React.CSSProperties}> = ({fundo, children, style}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: MOBILE_W, height: MOBILE_H, transform: `scale(${ESCALA})`, transformOrigin: '0 0', background: fundo, overflow: 'hidden', ...style}}>
		{children}
	</div>
);

/** Ruído fino para textura de papel/película */
export const Grao: React.FC<{opacidade?: number; seed?: number}> = ({opacidade = 0.08, seed = 3}) => (
	<svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: opacidade, mixBlendMode: 'multiply', pointerEvents: 'none'}}>
		<filter id={`g${seed}`}>
			<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
			<feColorMatrix values="0 0 0 0 0.5 0 0 0 0 0.45 0 0 0 0 0.4 0 0 0 1 0" />
		</filter>
		<rect width="100%" height="100%" filter={`url(#g${seed})`} />
	</svg>
);
