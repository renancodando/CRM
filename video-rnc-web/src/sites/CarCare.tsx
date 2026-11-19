import React from 'react';
import {SANS, MONO} from '../fonts';
import {p, ease} from '../lib/tempo';

const LARANJA = '#f59a0b';
const GRAF = '#121417';
const PRATA = '#bfc6cf';

/** Site demonstrativo — estética automotiva (empresa de serviços). Desenhado em 1440px. */
export const SiteCarCare: React.FC<{t: number; ini: number; rolagem?: number; hover?: number}> = ({t, ini, rolagem = 0, hover = 0}) => {
	const e = (d: number) => p(t, ini + d, ini + d + 0.7, ease.out);
	const sobe = (d: number): React.CSSProperties => ({opacity: e(d), transform: `translateY(${(1 - e(d)) * 30}px)`});
	return (
		<div style={{width: 1440, minHeight: 1700, background: GRAF, fontFamily: SANS, color: '#f2f3f5', transform: `translateY(${-rolagem}px)`}}>
			{/* navegação */}
			<div style={{height: 92, display: 'flex', alignItems: 'center', padding: '0 80px', borderBottom: '1px solid rgba(255,255,255,0.08)'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
					<svg width="40" height="40" viewBox="0 0 40 40">
						<path d="M6 30 L18 8 H34 L22 30 Z" fill={LARANJA} />
						<path d="M24 30 L30 19 H36 L30 30 Z" fill={PRATA} />
					</svg>
					<div style={{lineHeight: 1}}>
						<div style={{fontWeight: 800, fontSize: 22, letterSpacing: '0.08em'}}>IMPACTO</div>
						<div style={{fontSize: 11, letterSpacing: '0.42em', color: PRATA, marginTop: 4}}>CAR CARE</div>
					</div>
				</div>
				<div style={{display: 'flex', gap: 44, marginLeft: 'auto', fontSize: 16, color: '#c3c7cd'}}>
					<span>Serviços</span>
					<span>Pacotes</span>
					<span>Como funciona</span>
					<span>Contato</span>
				</div>
				<div
					style={{
						marginLeft: 48,
						background: LARANJA,
						color: '#16191d',
						fontWeight: 700,
						fontSize: 15,
						padding: '14px 24px',
						borderRadius: 6,
						transform: `scale(${1 + hover * 0.04})`,
						boxShadow: hover ? `0 10px 30px rgba(245,154,11,${0.45 * hover})` : 'none',
					}}
				>
					Solicitar orçamento
				</div>
			</div>
			{/* hero */}
			<div style={{position: 'relative', height: 640, overflow: 'hidden'}}>
				<div
					style={{
						position: 'absolute',
						right: -120,
						top: -40,
						width: 900,
						height: 760,
						background: 'linear-gradient(115deg, transparent 22%, #1b1f24 22%, #1b1f24 58%, transparent 58%)',
					}}
				/>
				<div
					style={{
						position: 'absolute',
						right: 260,
						top: -40,
						width: 120,
						height: 760,
						background: `linear-gradient(115deg, transparent 40%, ${LARANJA} 40%, ${LARANJA} 52%, transparent 52%)`,
						opacity: 0.9,
					}}
				/>
				<div style={{position: 'absolute', left: 80, top: 96, width: 640}}>
					<div style={{...sobe(0), fontFamily: MONO, fontSize: 14, letterSpacing: '0.24em', color: LARANJA}}>
						CUIDADO AUTOMOTIVO EM CADA DETALHE
					</div>
					<div style={{...sobe(0.08), fontSize: 68, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.035em', marginTop: 26}}>
						Estética automotiva com <span style={{color: LARANJA}}>padrão profissional.</span>
					</div>
					<div style={{...sobe(0.16), fontSize: 19, lineHeight: 1.55, color: '#aeb3ba', marginTop: 28, width: 540}}>
						Escolha o cuidado que faz sentido para o seu veículo. Converse com a equipe sobre serviços, acabamento e
						disponibilidade.
					</div>
					<div style={{...sobe(0.24), display: 'flex', gap: 16, marginTop: 40}}>
						<div style={{background: LARANJA, color: '#16191d', fontWeight: 700, fontSize: 17, padding: '18px 30px', borderRadius: 6}}>
							Agendar pelo WhatsApp
						</div>
						<div style={{border: '1px solid rgba(255,255,255,0.25)', fontSize: 17, padding: '18px 30px', borderRadius: 6}}>
							Ver pacotes
						</div>
					</div>
				</div>
				{/* silhueta automotiva */}
				<svg
					width="760"
					height="330"
					viewBox="0 0 760 330"
					style={{position: 'absolute', right: 40, top: 200, ...sobe(0.2)}}
				>
					<defs>
						<linearGradient id="cc-carro" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0" stopColor="#e9edf2" />
							<stop offset="0.45" stopColor="#9aa2ac" />
							<stop offset="0.5" stopColor="#4a5058" />
							<stop offset="1" stopColor="#23272c" />
						</linearGradient>
						<linearGradient id="cc-vidro" x1="0" y1="0" x2="1" y2="1">
							<stop offset="0" stopColor="#3a434d" />
							<stop offset="1" stopColor="#0d1013" />
						</linearGradient>
					</defs>
					<ellipse cx="380" cy="300" rx="350" ry="16" fill="rgba(0,0,0,0.55)" />
					<path
						d="M40 236 C40 206 64 192 104 186 L214 170 C262 124 320 96 404 92 C486 88 548 108 604 160 L676 176 C712 184 728 204 728 236 L728 258 C728 268 720 274 708 274 L60 274 C48 274 40 266 40 254 Z"
						fill="url(#cc-carro)"
					/>
					<path d="M244 168 C290 128 336 112 400 110 L412 166 Z" fill="url(#cc-vidro)" />
					<path d="M430 110 C488 112 534 128 574 164 L440 166 Z" fill="url(#cc-vidro)" />
					<path d="M60 222 L716 214" stroke="rgba(255,255,255,0.35)" strokeWidth="2" />
					<path d="M640 196 L700 200" stroke={LARANJA} strokeWidth="6" strokeLinecap="round" />
					{[180, 590].map((x) => (
						<g key={x}>
							<circle cx={x} cy="268" r="50" fill="#0b0c0e" />
							<circle cx={x} cy="268" r="34" fill="#2b3036" stroke="#8d949c" strokeWidth="3" />
							<circle cx={x} cy="268" r="9" fill="#b9c0c8" />
						</g>
					))}
				</svg>
			</div>
			{/* serviços */}
			<div style={{padding: '70px 80px'}}>
				<div style={{fontFamily: MONO, fontSize: 14, letterSpacing: '0.24em', color: LARANJA}}>SERVIÇOS</div>
				<div style={{fontSize: 44, fontWeight: 700, letterSpacing: '-0.02em', marginTop: 14}}>Cuidado completo, do detalhe ao brilho.</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginTop: 40}}>
					{['Lavagem completa', 'Higienização interna', 'Polimento técnico', 'Proteção de pintura'].map((s, i) => (
						<div key={s} style={{background: '#1a1d21', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: 30, height: 230}}>
							<div style={{width: 46, height: 46, borderRadius: 8, background: i === 0 ? LARANJA : '#2a2f35'}} />
							<div style={{fontSize: 22, fontWeight: 700, marginTop: 26}}>{s}</div>
							<div style={{fontSize: 15, color: '#9aa0a8', marginTop: 12, lineHeight: 1.5}}>
								Orientação para cada veículo e serviços combinados com clareza.
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
