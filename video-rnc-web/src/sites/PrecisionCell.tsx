import React from 'react';
import {SANS, MONO} from '../fonts';
import {p, ease} from '../lib/tempo';
import {IconeWhats, IconePino, IconeRelogio} from '../componentes/Icones';

export const AZUL = '#143df5';
export const MARINHO = '#091943';
const GELO = '#f3f5fb';
export const VERDE_WHATS = '#1fa855';

const Marca: React.FC<{tam?: number}> = ({tam = 1}) => (
	<div style={{display: 'flex', alignItems: 'center', gap: 12 * tam}}>
		<div style={{width: 36 * tam, height: 36 * tam, borderRadius: 9 * tam, background: AZUL, position: 'relative', overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: 11 * tam, top: 7 * tam, width: 14 * tam, height: 22 * tam, borderRadius: 3 * tam, border: `${2.4 * tam}px solid #fff`}} />
			<div style={{position: 'absolute', right: -8 * tam, top: -6 * tam, width: 22 * tam, height: 50 * tam, background: 'rgba(255,255,255,0.22)', transform: 'rotate(28deg)'}} />
		</div>
		<div style={{fontWeight: 800, fontSize: 21 * tam, letterSpacing: '-0.02em', color: MARINHO}}>
			Precision<span style={{color: AZUL}}>Cell</span>
		</div>
	</div>
);

/** Ilustração geométrica de smartphone */
const Aparelho: React.FC<{escala?: number}> = ({escala = 1}) => (
	<svg width={430 * escala} height={560 * escala} viewBox="0 0 430 560">
		<defs>
			<linearGradient id="pc-tela" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stopColor="#2c56ff" />
				<stop offset="1" stopColor="#0a1f8a" />
			</linearGradient>
		</defs>
		<path d="M40 560 L250 0 H430 V560 Z" fill="#e4e9fb" />
		<path d="M0 560 L120 240 H200 L80 560 Z" fill="#d6defa" />
		<g transform="translate(130 60) rotate(8)">
			<rect width="230" height="440" rx="34" fill={MARINHO} />
			<rect x="10" y="10" width="210" height="420" rx="26" fill="url(#pc-tela)" />
			<path d="M10 300 L220 140 V250 L10 410 Z" fill="rgba(255,255,255,0.10)" />
			<circle cx="115" cy="30" r="6" fill="#0c1640" />
			<rect x="34" y="80" width="110" height="12" rx="6" fill="rgba(255,255,255,0.85)" />
			<rect x="34" y="102" width="150" height="12" rx="6" fill="rgba(255,255,255,0.5)" />
			<rect x="34" y="350" width="162" height="44" rx="22" fill="#fff" />
		</g>
	</svg>
);

/** Versão desktop (1440px) */
export const SitePrecisionDesktop: React.FC<{t: number; ini: number; rolagem?: number; hover?: number}> = ({t, ini, rolagem = 0, hover = 0}) => {
	const e = (d: number) => p(t, ini + d, ini + d + 0.7, ease.out);
	const sobe = (d: number): React.CSSProperties => ({opacity: e(d), transform: `translateY(${(1 - e(d)) * 30}px)`});
	return (
		<div style={{width: 1440, minHeight: 1700, background: GELO, fontFamily: SANS, color: MARINHO, transform: `translateY(${-rolagem}px)`}}>
			<div style={{height: 92, display: 'flex', alignItems: 'center', padding: '0 80px', background: '#fff', borderBottom: '1px solid #e3e7f3'}}>
				<Marca />
				<div style={{display: 'flex', gap: 42, marginLeft: 'auto', fontSize: 16, color: '#4a5679'}}>
					<span>Serviços</span>
					<span>Como funciona</span>
					<span>Dúvidas</span>
					<span>Contato</span>
				</div>
				<div
					style={{
						marginLeft: 46,
						background: AZUL,
						color: '#fff',
						fontWeight: 600,
						fontSize: 15,
						padding: '14px 24px',
						borderRadius: 10,
						transform: `scale(${1 + hover * 0.05})`,
						boxShadow: `0 ${8 + hover * 10}px ${20 + hover * 16}px rgba(20,61,245,${0.25 + hover * 0.25})`,
					}}
				>
					Solicitar diagnóstico
				</div>
			</div>
			<div style={{display: 'flex', padding: '0 0 0 80px', height: 640, position: 'relative', overflow: 'hidden'}}>
				<div style={{width: 680, paddingTop: 100}}>
					<div style={{...sobe(0), fontFamily: MONO, fontSize: 14, letterSpacing: '0.22em', color: AZUL, fontWeight: 500}}>
						ASSISTÊNCIA TÉCNICA DE CELULARES
					</div>
					<div style={{...sobe(0.08), fontSize: 70, fontWeight: 800, lineHeight: 1.02, letterSpacing: '-0.04em', marginTop: 24}}>
						Conserto de celulares com confiança e <span style={{color: AZUL}}>precisão.</span>
					</div>
					<div style={{...sobe(0.16), fontSize: 19, lineHeight: 1.6, color: '#56607d', marginTop: 26, width: 560}}>
						Entenda o que seu aparelho precisa e converse com quem vai cuidar dele. Um atendimento claro, do diagnóstico à entrega.
					</div>
					<div style={{...sobe(0.24), display: 'flex', gap: 14, marginTop: 38}}>
						<div style={{background: VERDE_WHATS, color: '#fff', padding: '18px 28px', borderRadius: 12, fontSize: 17, fontWeight: 600, display: 'flex', gap: 10, alignItems: 'center'}}>
							<IconeWhats size={22} /> Falar no WhatsApp
						</div>
						<div style={{border: '1.5px solid #c9d1ea', padding: '18px 28px', borderRadius: 12, fontSize: 17, fontWeight: 600}}>Ver serviços</div>
					</div>
					<div style={{...sobe(0.3), display: 'flex', gap: 28, marginTop: 40, fontSize: 15, color: '#56607d'}}>
						<span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
							<IconeRelogio size={18} color={AZUL} /> Seg. a sáb. · 9h às 18h
						</span>
						<span style={{display: 'flex', gap: 8, alignItems: 'center'}}>
							<IconePino size={18} color={AZUL} /> Centro da cidade
						</span>
					</div>
				</div>
				<div style={{position: 'absolute', right: 0, top: 50, ...sobe(0.14)}}>
					<Aparelho escala={1.2} />
				</div>
			</div>
			<div style={{padding: '60px 80px', background: '#fff'}}>
				<div style={{fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em'}}>Serviços</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginTop: 30}}>
					{['Troca de tela', 'Troca de bateria', 'Reparo em placa', 'Conectores e limpeza'].map((s, i) => (
						<div key={s} style={{border: '1px solid #e3e7f3', borderRadius: 14, padding: 28, background: i === 0 ? MARINHO : GELO, color: i === 0 ? '#fff' : MARINHO}}>
							<div style={{fontFamily: MONO, fontSize: 13, color: i === 0 ? '#8fa6ff' : AZUL}}>0{i + 1}</div>
							<div style={{fontSize: 22, fontWeight: 700, marginTop: 40}}>{s}</div>
							<div style={{fontSize: 15, marginTop: 10, lineHeight: 1.5, opacity: 0.7}}>Avaliação técnica e orçamento antes do serviço.</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

/** Mapa estilizado */
export const Mapa: React.FC<{w: number; h: number; pulso?: number}> = ({w, h, pulso = 0}) => (
	<div style={{width: w, height: h, borderRadius: 18, overflow: 'hidden', position: 'relative', background: '#e8ecf4'}}>
		<svg width={w} height={h} viewBox="0 0 360 220" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
			<rect width="360" height="220" fill="#e9edf5" />
			<path d="M0 150 C80 140 120 170 200 150 S320 120 360 130 V220 H0 Z" fill="#d7e6dc" />
			<path d="M250 0 C240 50 270 70 300 80 S360 90 360 90 V0 Z" fill="#cfe0f3" />
			{[30, 75, 120, 165, 205].map((y) => (
				<path key={y} d={`M0 ${y} L360 ${y - 25}`} stroke="#fff" strokeWidth={y === 120 ? 9 : 5} />
			))}
			{[40, 110, 180, 250, 320].map((x) => (
				<path key={x} d={`M${x} 0 L${x + 30} 220`} stroke="#fff" strokeWidth={x === 180 ? 9 : 5} />
			))}
			<path d="M0 120 L360 95" stroke="#f6d27a" strokeWidth="4" opacity="0.8" />
		</svg>
		<div style={{position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-100%)'}}>
			<div
				style={{
					position: 'absolute',
					left: '50%',
					bottom: -10,
					width: 60 * (0.5 + pulso),
					height: 22 * (0.5 + pulso),
					transform: 'translateX(-50%)',
					borderRadius: '50%',
					background: `rgba(20,61,245,${0.25 * (1 - pulso)})`,
				}}
			/>
			<IconePino size={Math.round(w * 0.13)} color={AZUL} />
		</div>
	</div>
);

/** Versão mobile (390px de largura de projeto) */
export const SitePrecisionMobile: React.FC<{rolagem?: number; toque?: number; dedo?: number}> = ({rolagem = 0, toque = 0, dedo = 0}) => (
	<div style={{width: 390, background: GELO, fontFamily: SANS, color: MARINHO, transform: `translateY(${-rolagem}px)`}}>
		<div style={{height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#fff', borderBottom: '1px solid #e3e7f3'}}>
			<Marca tam={0.82} />
			<div style={{display: 'flex', flexDirection: 'column', gap: 5}}>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: 22, height: 2.4, borderRadius: 2, background: MARINHO}} />
				))}
			</div>
		</div>
		<div style={{padding: '30px 22px 0', position: 'relative'}}>
			<div style={{fontFamily: MONO, fontSize: 10.5, letterSpacing: '0.2em', color: AZUL, fontWeight: 500}}>ASSISTÊNCIA TÉCNICA</div>
			<div style={{fontSize: 36, fontWeight: 800, lineHeight: 1.04, letterSpacing: '-0.04em', marginTop: 12}}>
				Conserto de celulares com confiança e <span style={{color: AZUL}}>precisão.</span>
			</div>
			<div style={{fontSize: 15, lineHeight: 1.55, color: '#56607d', marginTop: 14}}>
				Converse com quem vai cuidar do seu aparelho. Atendimento claro, do diagnóstico à entrega.
			</div>
			<div
				style={{
					marginTop: 22,
					height: 56,
					borderRadius: 14,
					background: VERDE_WHATS,
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 10,
					fontSize: 17,
					fontWeight: 700,
					position: 'relative',
					overflow: 'hidden',
					transform: `scale(${1 - Math.sin(Math.min(1, toque) * Math.PI) * 0.04})`,
					boxShadow: '0 10px 24px rgba(31,168,85,0.35)',
				}}
			>
				{toque > 0 && toque < 1 && (
					<div
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							width: 420 * toque,
							height: 420 * toque,
							marginLeft: -210 * toque,
							marginTop: -210 * toque,
							borderRadius: '50%',
							background: `rgba(255,255,255,${0.35 * (1 - toque)})`,
						}}
					/>
				)}
				<IconeWhats size={24} /> Chamar no WhatsApp
				{dedo > 0 && (
					<div
						style={{
							position: 'absolute',
							left: '58%',
							top: '50%',
							width: 50,
							height: 50,
							margin: '-25px 0 0 -25px',
							borderRadius: '50%',
							background: 'rgba(255,255,255,0.45)',
							border: '2px solid rgba(255,255,255,0.95)',
							boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
							opacity: dedo,
							transform: `scale(${1 - toque * 0.25})`,
						}}
					/>
				)}
			</div>
			<div style={{marginTop: 12, height: 52, borderRadius: 14, border: '1.5px solid #c9d1ea', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600}}>
				Ver serviços
			</div>
		</div>
		<div style={{margin: '26px 22px 0', background: '#fff', borderRadius: 20, padding: 16, border: '1px solid #e3e7f3'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600}}>
				<div style={{width: 9, height: 9, borderRadius: '50%', background: VERDE_WHATS}} /> Aberto agora
				<span style={{color: '#7a84a0', fontWeight: 400}}>· até 18h</span>
			</div>
			<div style={{marginTop: 12}}>
				<Mapa w={326} h={150} />
			</div>
			<div style={{display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, fontSize: 14, color: '#56607d'}}>
				<IconePino size={16} color={AZUL} /> Av. Central, 1200 — Centro
			</div>
		</div>
		<div style={{padding: '26px 22px'}}>
			<div style={{fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em'}}>Serviços</div>
			{['Troca de tela', 'Troca de bateria', 'Reparo em placa'].map((s, i) => (
				<div key={s} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #e3e7f3', fontSize: 16, fontWeight: 600}}>
					<span>
						<span style={{fontFamily: MONO, color: AZUL, fontSize: 12, marginRight: 12}}>0{i + 1}</span>
						{s}
					</span>
					<span style={{color: AZUL}}>→</span>
				</div>
			))}
		</div>
	</div>
);
