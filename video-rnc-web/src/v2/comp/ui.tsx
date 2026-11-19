import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {F, p, ease, clamp} from '../lib/base';
export {Linha, Letras} from '../../componentes/Texto';
export {Cursor, IconeWhats} from '../../componentes/Icones';

/** Área segura Reels/TikTok (1080×1920) */
export const SEGURO = {topo: 250, base: 1480, esq: 64, dir: 960};

/** Legendas profissionais (pastilha translúcida, faixa segura). Tempo global. */
export type Fala = {ini: number; fim: number; texto: string};
export const Legendas: React.FC<{falas: Fala[]; y?: number; claro?: boolean}> = ({falas, y = 1330, claro = false}) => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	const t = f / fps;
	const fala = falas.find((x) => t >= x.ini - 0.05 && t <= x.fim + 0.25);
	if (!fala) return null;
	const k = p(t, fala.ini - 0.05, fala.ini + 0.15) * (1 - p(t, fala.fim + 0.05, fala.fim + 0.25));
	const palavras = fala.texto.split(' ');
	const prog = clamp((t - fala.ini) / Math.max(0.3, fala.fim - fala.ini));
	return (
		<div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', pointerEvents: 'none', zIndex: 80}}>
			<div
				style={{
					maxWidth: 820,
					padding: '16px 28px 18px',
					borderRadius: 22,
					background: claro ? 'rgba(255,255,255,0.72)' : 'rgba(8,9,11,0.58)',
					backdropFilter: 'blur(14px)',
					WebkitBackdropFilter: 'blur(14px)',
					boxShadow: claro ? '0 0 0 1px rgba(0,0,0,0.06)' : '0 0 0 1px rgba(255,255,255,0.08)',
					fontFamily: F.inter,
					fontWeight: 600,
					fontSize: 44,
					lineHeight: 1.22,
					letterSpacing: '-0.015em',
					textAlign: 'center',
					color: claro ? '#141416' : '#f5f5f7',
					opacity: k,
					transform: `translateY(${(1 - k) * 10}px)`,
				}}
			>
				{palavras.map((w, i) => {
					const on = prog >= i / palavras.length - 0.02;
					return (
						<span key={i} style={{opacity: on ? 1 : 0.38, transition: 'none'}}>
							{w}
							{i < palavras.length - 1 ? ' ' : ''}
						</span>
					);
				})}
			</div>
		</div>
	);
};

/** Selo discreto da marca + serviço (aparece cedo para o espectador entender o que é) */
export const Selo: React.FC<{t: number; ini: number; fim: number; claro?: boolean}> = ({t, ini, fim, claro = false}) => {
	const k = p(t, ini, ini + 0.6) * (1 - p(t, fim - 0.4, fim));
	if (k <= 0) return null;
	const cor = claro ? '#141416' : '#f5f5f7';
	return (
		<div
			style={{
				position: 'absolute',
				top: 262,
				left: 0,
				right: 0,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 16,
				opacity: k * 0.92,
				fontFamily: F.inter,
				fontSize: 26,
				letterSpacing: '0.02em',
				color: cor,
				zIndex: 70,
				textShadow: claro ? 'none' : '0 1px 12px rgba(0,0,0,0.6)',
			}}
		>
			<MarcaMini cor={cor} />
			<span style={{fontWeight: 800, letterSpacing: '-0.03em'}}>
				RNC <span style={{fontWeight: 300, letterSpacing: '0.04em'}}>WEB</span>
			</span>
			<span style={{width: 1, height: 22, background: cor, opacity: 0.35}} />
			<span style={{opacity: 0.8}}>criação de sites</span>
		</div>
	);
};

/** Símbolo da marca em 2D (a Moldura) */
export const MarcaMini: React.FC<{cor?: string; tam?: number}> = ({cor = '#f5f5f7', tam = 34}) => (
	<svg width={tam} height={tam * 0.74} viewBox="0 0 44 32" fill="none">
		<rect x="1.5" y="1.5" width="41" height="29" rx="6" stroke={cor} strokeWidth="3" />
		<path d="M1.5 9.5h41" stroke={cor} strokeWidth="3" />
		<circle cx="7" cy="5.6" r="1.4" fill={cor} />
		<circle cx="11.2" cy="5.6" r="1.4" fill={cor} />
	</svg>
);

/** Etiqueta de honestidade: projeto conceitual */
export const Conceito: React.FC<{t: number; ini: number; fim: number; nome: string; claro?: boolean; y?: number}> = ({t, ini, fim, nome, claro = false, y = 1440}) => {
	const k = p(t, ini, ini + 0.5) * (1 - p(t, fim - 0.3, fim));
	if (k <= 0) return null;
	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				top: y,
				textAlign: 'center',
				fontFamily: F.mono,
				fontSize: 21,
				letterSpacing: '0.16em',
				textTransform: 'uppercase',
				color: claro ? 'rgba(20,20,22,0.62)' : 'rgba(245,245,247,0.62)',
				opacity: k,
				zIndex: 60,
			}}
		>
			{nome} · projeto conceitual
		</div>
	);
};

/** Dedo (toque em tela de celular) */
export const Toque: React.FC<{x: number; y: number; k: number; tam?: number}> = ({x, y, k, tam = 64}) => {
	if (k <= 0 || k >= 1.4) return null;
	const press = Math.sin(clamp(k) * Math.PI);
	const onda = clamp(k - 0.35, 0, 1);
	return (
		<div style={{position: 'absolute', left: x - tam / 2, top: y - tam / 2, width: tam, height: tam, pointerEvents: 'none', zIndex: 90}}>
			<div style={{position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.5)', border: '2px solid rgba(255,255,255,0.95)', boxShadow: '0 6px 18px rgba(0,0,0,0.35)', transform: `scale(${1 - press * 0.22})`, opacity: Math.min(1, k * 4) * (1 - clamp((k - 1) * 3))}} />
			{onda > 0 && (
				<div style={{position: 'absolute', inset: -tam * onda, borderRadius: '50%', border: `2px solid rgba(255,255,255,${0.8 * (1 - onda)})`}} />
			)}
		</div>
	);
};

/** Moldura de viewport desenhada (cantos arredondados) — revela "isto é um site" */
export const MolduraTela: React.FC<{k: number; cor?: string; inset?: number; raio?: number}> = ({k, cor = 'rgba(255,255,255,0.85)', inset = 36, raio = 56}) => {
	if (k <= 0) return null;
	return (
		<svg style={{position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 55, pointerEvents: 'none'}} viewBox="0 0 1080 1920">
			<rect x={inset} y={inset} width={1080 - inset * 2} height={1920 - inset * 2} rx={raio} fill="none" stroke={cor} strokeWidth={2.5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ease.inOut(clamp(k))} />
		</svg>
	);
};
