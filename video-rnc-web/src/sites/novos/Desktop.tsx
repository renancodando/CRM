import React from 'react';
import {F, p, ease, lerp, clamp} from '../../v2/lib/base';
import {Planta, Corte, OSSO, NANQUIM} from '../../v2/sites/Vao';
import {Grao} from '../../v2/comp/Pagina';

/* Sites desktop (1440 × 900) para a vitrine do filme 1 — projetos conceituais, sem fotos. */
type P = {t: number; ini: number; rolagem?: number; hover?: number};
const sobe = (t: number, a: number, d = 30): React.CSSProperties => {
	const k = p(t, a, a + 0.75, ease.out);
	return {opacity: k, transform: `translateY(${(1 - k) * d}px)`};
};

// ————————————————————————————————————————————————————————— VÃO ARQUITETURA
export const VaoDesktop: React.FC<P> = ({t, ini, rolagem = 0, hover = 0}) => {
	const larg = p(t, ini, ini + 1.3, ease.out);
	const planta = p(t, ini + 0.3, ini + 1.9, ease.inOut);
	const hora = lerp(0.15, 0.85, p(t, ini + 1.2, ini + 3.2, ease.inOut));
	return (
		<div style={{width: 1440, height: 1700, background: OSSO, position: 'relative', color: NANQUIM, transform: `translateY(${-rolagem}px)`}}>
			<Grao opacidade={0.09} />
			<div style={{position: 'absolute', top: 36, left: 64, right: 64, display: 'flex', alignItems: 'center', fontFamily: F.mono, fontSize: 13, letterSpacing: 2}}>
				<span style={{fontFamily: F.archivo, fontStretch: '125%', fontWeight: 800, fontSize: 22, letterSpacing: 6}}>VÃO</span>
				<span style={{marginLeft: 48, opacity: 0.6}}>ARQUITETURA RESIDENCIAL</span>
				<span style={{marginLeft: 'auto', display: 'flex', gap: 40}}>
					<span>PROJETOS</span>
					<span>ESTÚDIO</span>
					<span>PROCESSO</span>
				</span>
				<span style={{marginLeft: 40, padding: '12px 20px', border: `1.5px solid ${NANQUIM}`, background: hover > 0.5 ? NANQUIM : 'transparent', color: hover > 0.5 ? OSSO : NANQUIM}}>AGENDAR CONVERSA</span>
			</div>
			<div style={{position: 'absolute', left: 60, top: 150, fontFamily: F.archivo, fontStretch: `${lerp(62, 125, larg)}%`, fontWeight: lerp(200, 800, larg), fontSize: 300, lineHeight: 0.8, letterSpacing: -6}}>VÃO</div>
			<div style={{position: 'absolute', left: 64, top: 430, width: 520, ...sobe(t, ini + 0.6)}}>
				<div style={{fontFamily: F.archivo, fontStretch: '110%', fontSize: 40, fontWeight: 300, lineHeight: 1.08, letterSpacing: -1}}>
					Casas desenhadas a partir da <b style={{fontWeight: 700}}>luz</b>, do terreno e de quem vai morar.
				</div>
				<div style={{fontFamily: F.mono, fontSize: 13, letterSpacing: 1.5, marginTop: 34, display: 'flex', gap: 36, opacity: 0.7}}>
					<span>RESIDENCIAL</span>
					<span>INTERIORES</span>
					<span>REFORMAS</span>
				</div>
				<div style={{height: 1, background: NANQUIM, opacity: 0.25, marginTop: 34}} />
				<div style={{fontFamily: F.mono, fontSize: 12, letterSpacing: 1.5, marginTop: 18}}>TOQUE EM UM AMBIENTE DA PLANTA PARA ENTRAR →</div>
			</div>
			{/* planta como menu */}
			<div style={{position: 'absolute', left: 690, top: 120, transform: 'scale(1.95)', transformOrigin: '0 0'}}>
				<Planta k={planta} rotulos={p(t, ini + 1.1, ini + 1.8)} destaque={hover} />
			</div>
			{/* abaixo da dobra: corte + estudo de luz */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 900, height: 800, background: NANQUIM, color: OSSO}}>
				<div style={{position: 'absolute', left: 64, top: 70, fontFamily: F.mono, fontSize: 13, letterSpacing: 2, opacity: 0.6}}>01 — CASA PÁTIO · 320 m² · 2025</div>
				<div style={{position: 'absolute', left: 64, top: 110, fontFamily: F.archivo, fontStretch: '120%', fontSize: 84, fontWeight: 300, letterSpacing: -2}}>
					Casa <b style={{fontWeight: 800}}>Pátio</b>
				</div>
				<div style={{position: 'absolute', left: 64, top: 260, transform: 'scale(2.2)', transformOrigin: '0 0'}}>
					<Corte k={p(t, ini + 0.8, ini + 2.2)} hora={hora} />
				</div>
				<div style={{position: 'absolute', left: 900, top: 290, width: 460, fontFamily: F.archivo, fontSize: 22, lineHeight: 1.5, opacity: 0.85}}>
					Um pátio central leva luz natural a todos os ambientes. Arraste o controle para ver o sol atravessar a casa ao longo do dia.
					<div style={{fontFamily: F.mono, fontSize: 13, letterSpacing: 1.5, marginTop: 36, display: 'flex'}}>
						<span>ESTUDO DE LUZ</span>
						<span style={{marginLeft: 'auto'}}>{String(Math.round(lerp(6, 19, hora))).padStart(2, '0')}h</span>
					</div>
					<div style={{position: 'relative', height: 1, background: 'rgba(236,230,218,0.3)', marginTop: 14}}>
						<div style={{position: 'absolute', top: -8, left: `calc(${hora * 100}% - 8px)`, width: 16, height: 16, borderRadius: 8, background: OSSO}} />
					</div>
				</div>
			</div>
		</div>
	);
};

// ————————————————————————————————————————————————————————— BRASA RESTAURANTE
const CARVAO = '#120F0E';
const BRASA = '#E2582B';
const CREME = '#EFE6D8';
const OURO = '#C9A46A';
const TEMPOS = [
	['I', 'Pão de fermentação natural', 'manteiga tostada, flor de sal'],
	['II', 'Vieira na brasa', 'milho verde, limão-cravo'],
	['III', 'Abóbora assada no carvão', 'castanha, sálvia'],
	['IV', 'Peixe do dia', 'tucupi, ervas do quintal'],
	['V', 'Costela de 18 horas', 'purê defumado'],
	['VI', 'Queijo da Canastra', 'mel de engenho'],
	['VII', 'Doce de leite queimado', 'sorvete de rapadura'],
];
export const BrasaDesktop: React.FC<P> = ({t, ini, rolagem = 0, hover = 0}) => {
	const respiro = 0.75 + 0.25 * Math.sin(t * 2.2) + 0.08 * Math.sin(t * 7.3);
	const ativo = Math.min(6, Math.floor(clamp((t - ini - 0.8) / 0.28, 0, 9)));
	return (
		<div style={{width: 1440, height: 1700, background: CARVAO, position: 'relative', color: CREME, transform: `translateY(${-rolagem}px)`, overflow: 'hidden'}}>
			<div style={{position: 'absolute', left: -200, right: 500, top: 450, height: 700, background: `radial-gradient(ellipse 50% 40% at 50% 60%, rgba(226,88,43,${0.5 * respiro}), rgba(140,40,12,${0.22 * respiro}) 45%, transparent 72%)`}} />
			<Grao opacidade={0.12} seed={12} />
			<div style={{position: 'absolute', top: 38, left: 64, right: 64, display: 'flex', alignItems: 'center', fontFamily: F.grotesk, fontSize: 14, letterSpacing: 3, color: '#a39a90'}}>
				<span>COZINHA DE FOGO</span>
				<span style={{marginLeft: 'auto', display: 'flex', gap: 40}}>
					<span>MENU</span>
					<span>A CASA</span>
					<span>VISITE</span>
				</span>
				<span style={{marginLeft: 40, padding: '12px 26px', borderRadius: 999, boxShadow: `0 0 0 1px ${OURO}`, color: hover > 0.5 ? CARVAO : OURO, background: hover > 0.5 ? OURO : 'transparent', letterSpacing: 1}}>Reservar mesa</span>
			</div>
			<div style={{position: 'absolute', left: 60, top: 110, fontFamily: F.bodoni, fontSize: 290, letterSpacing: -10, lineHeight: 0.9}}>
				{'Brasa'.split('').map((l, i) => {
					const k = p(t, ini + i * 0.07, ini + 0.7 + i * 0.07, ease.out);
					return (
						<span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - k) * 60}px)`, opacity: k, color: i === 0 ? BRASA : CREME}}>
							{l}
						</span>
					);
				})}
			</div>
			<div style={{position: 'absolute', left: 68, top: 420, width: 520, ...sobe(t, ini + 0.5)}}>
				<div style={{fontFamily: F.bodoni, fontSize: 40, lineHeight: 1.18}}>
					Tudo o que sai da nossa cozinha passa pelo <span style={{color: BRASA}}>fogo.</span>
				</div>
				<div style={{fontFamily: F.grotesk, fontSize: 15, letterSpacing: 3, color: '#a39a90', marginTop: 30}}>MENU DEGUSTAÇÃO · 7 TEMPOS · SÓ COM RESERVA</div>
				<div style={{display: 'flex', gap: 14, marginTop: 40}}>
					<div style={{padding: '20px 34px', borderRadius: 999, background: BRASA, color: '#fff', fontFamily: F.grotesk, fontWeight: 600, fontSize: 18}}>Reservar mesa</div>
					<div style={{padding: '20px 34px', borderRadius: 999, boxShadow: '0 0 0 1px rgba(239,230,216,0.3)', fontFamily: F.grotesk, fontSize: 18}}>Ver o menu</div>
				</div>
			</div>
			{/* menu */}
			<div style={{position: 'absolute', left: 820, top: 150, width: 560}}>
				<div style={{display: 'flex', fontFamily: F.grotesk, fontSize: 13, letterSpacing: 3, color: '#a39a90', ...sobe(t, ini + 0.4)}}>
					<span>MENU DE VERÃO</span>
					<span style={{marginLeft: 'auto'}}>QUI A DOM · 19H–23H</span>
				</div>
				{TEMPOS.map(([n, nome, desc], i) => {
					const at = i === ativo && t > ini + 0.8;
					return (
						<div key={n} style={{display: 'flex', gap: 22, alignItems: 'baseline', padding: '17px 0', borderBottom: '1px solid rgba(239,230,216,0.1)', ...sobe(t, ini + 0.5 + i * 0.07, 16)}}>
							<span style={{width: 40, fontFamily: F.bodoni, fontSize: 20, color: at ? BRASA : OURO}}>{n}</span>
							<span>
								<div style={{fontFamily: F.bodoni, fontSize: 28, color: at ? '#fff' : CREME}}>{nome}</div>
								<div style={{fontFamily: F.grotesk, fontSize: 15, color: '#8e857c', marginTop: 4}}>{desc}</div>
							</span>
							{at && <span style={{marginLeft: 'auto', width: 8, height: 8, borderRadius: 4, background: BRASA, boxShadow: `0 0 12px ${BRASA}`}} />}
						</div>
					);
				})}
			</div>
			{/* abaixo da dobra: reserva */}
			<div style={{position: 'absolute', left: 64, right: 64, top: 960, height: 600, borderRadius: 28, background: '#1B1715', padding: 50, display: 'flex', gap: 60, fontFamily: F.grotesk}}>
				<div style={{width: 420}}>
					<div style={{fontFamily: F.bodoni, fontSize: 52}}>Reserve sua mesa</div>
					<div style={{fontSize: 18, color: '#8e857c', marginTop: 16, lineHeight: 1.5}}>Escolha o dia e o horário. A confirmação chega no seu WhatsApp.</div>
				</div>
				<div style={{flex: 1, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, fontSize: 18, textAlign: 'center', alignContent: 'start'}}>
					{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
						<div key={i} style={{color: '#8e857c', fontSize: 14}}>
							{d}
						</div>
					))}
					{[null, null, ...Array.from({length: 31}, (_, i) => i + 1)].map((d, i) => (
						<div key={i} style={{height: 50, borderRadius: 25, display: 'flex', alignItems: 'center', justifyContent: 'center', background: d === 12 ? BRASA : 'transparent', color: d === null ? 'transparent' : d < 4 ? 'rgba(239,230,216,0.25)' : CREME}}>
							{d ?? ''}
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

// ————————————————————————————————————————————————————————— LUSTRO ESTÉTICA AUTOMOTIVA
export const NOITE = '#060607';
export const RUBI = '#B3121B';
const CROMO = '#E9ECEF';
export const VERDE_WHATS = '#1fa855';

export const Faixas: React.FC<{k: number; t: number; w: number; h: number; esp?: number}> = ({k, t, w, h, esp = 1}) => (
	<div style={{position: 'absolute', left: 0, top: 0, width: w, height: h, overflow: 'hidden'}}>
		{[0, 1, 2, 3].map((i) => {
			const kk = clamp(k * 1.6 - i * 0.18);
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: -w * 0.15,
						width: w * 1.3,
						top: h * (0.14 + i * 0.2) + Math.sin(t * 0.8 + i) * 2 * esp,
						height: (i === 1 ? 5 : 2.5) * esp,
						background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.95 - i * 0.18}) ${30 + i * 6}%, rgba(255,255,255,${0.95 - i * 0.18}) ${62 - i * 4}%, transparent)`,
						transform: `translateX(${(1 - kk) * w}px) skewY(-6deg)`,
						boxShadow: i === 1 ? `0 0 ${22 * esp}px rgba(255,255,255,0.5)` : 'none',
					}}
				/>
			);
		})}
		<div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 70% at 50% 60%, rgba(179,18,27,${0.28 * k}), transparent 70%)`}} />
	</div>
);

const cromo: React.CSSProperties = {
	color: 'transparent',
	backgroundImage: 'linear-gradient(180deg,#ffffff 0%,#d8dce1 45%,#6c7179 55%,#e1e4e8 100%)',
	WebkitBackgroundClip: 'text',
	backgroundClip: 'text',
};

export const LustroDesktop: React.FC<P> = ({t, ini, rolagem = 0, hover = 0}) => {
	const faixas = p(t, ini, ini + 1.6, ease.inOut);
	const marca = p(t, ini + 0.2, ini + 1.1, ease.out);
	const medida = p(t, ini + 1.2, ini + 2.6, ease.inOut);
	const gu = Math.round(lerp(38, 92, medida));
	return (
		<div style={{width: 1440, height: 1700, background: NOITE, position: 'relative', color: CROMO, transform: `translateY(${-rolagem}px)`, overflow: 'hidden', fontFamily: F.unbounded}}>
			<div style={{position: 'absolute', top: 40, left: 64, right: 64, display: 'flex', alignItems: 'center', fontSize: 13, letterSpacing: 3, color: '#8a8f96'}}>
				<span style={{fontWeight: 800, fontSize: 20, letterSpacing: 6, color: CROMO}}>LUSTRO</span>
				<span style={{marginLeft: 48}}>DETALHAMENTO AUTOMOTIVO</span>
				<span style={{marginLeft: 'auto', display: 'flex', gap: 40}}>
					<span>SERVIÇOS</span>
					<span>RESULTADOS</span>
					<span>AGENDA</span>
				</span>
				<span style={{marginLeft: 40, padding: '14px 26px', borderRadius: 999, background: RUBI, color: '#fff', letterSpacing: 1, transform: `scale(${1 + hover * 0.05})`, boxShadow: `0 10px ${20 + hover * 24}px rgba(179,18,27,${0.3 + hover * 0.3})`}}>Agendar avaliação</span>
			</div>
			<div style={{position: 'absolute', left: 0, top: 120, width: 1440, height: 520}}>
				<Faixas k={faixas} t={t} w={1440} h={520} esp={2.2} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 220, textAlign: 'center', fontWeight: 800, fontSize: 230, letterSpacing: lerp(60, 14, marca), opacity: marca, filter: `blur(${(1 - marca) * 10}px)`, ...cromo}}>LUSTRO</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontSize: 26, fontWeight: 300, ...sobe(t, ini + 0.8)}}>
				Brilho que se vê de longe<span style={{color: RUBI}}>.</span>
			</div>
			{/* faixa de serviços + medição */}
			<div style={{position: 'absolute', left: 64, right: 64, top: 600, display: 'flex', gap: 20, ...sobe(t, ini + 1.0)}}>
				{[
					['01', 'Lavagem detalhada', 'até 3 h'],
					['02', 'Polimento técnico', '1 dia'],
					['03', 'Vitrificação', '1 a 2 dias'],
				].map(([n, nome, tempo], i) => (
					<div key={n} style={{flex: 1, height: 220, borderRadius: 24, padding: 28, background: i === 2 ? 'rgba(179,18,27,0.85)' : '#111114', boxShadow: '0 0 0 1px rgba(233,236,239,0.1)', position: 'relative'}}>
						<div style={{fontSize: 13, letterSpacing: 3, opacity: 0.7}}>{n}</div>
						<div style={{position: 'absolute', left: 28, bottom: 58, fontSize: 30, fontWeight: 600, letterSpacing: -0.5}}>{nome}</div>
						<div style={{position: 'absolute', left: 28, bottom: 28, fontSize: 15, opacity: 0.7}}>Duração: {tempo}</div>
					</div>
				))}
				<div style={{width: 360, height: 220, borderRadius: 24, padding: 28, background: '#111114', boxShadow: '0 0 0 1px rgba(233,236,239,0.1)', position: 'relative'}}>
					<div style={{fontSize: 13, letterSpacing: 3, color: '#8a8f96'}}>BRILHO MEDIDO</div>
					<div style={{fontSize: 92, fontWeight: 700, marginTop: 14, letterSpacing: -3}}>
						{gu}
						<span style={{fontSize: 22, fontWeight: 400, color: '#8a8f96', marginLeft: 10}}>GU</span>
					</div>
					<div style={{height: 6, borderRadius: 3, background: 'rgba(233,236,239,0.1)', marginTop: 8}}>
						<div style={{height: 6, borderRadius: 3, width: `${gu}%`, background: RUBI}} />
					</div>
					<div style={{fontSize: 11, color: '#8a8f96', marginTop: 10, letterSpacing: 1.5}}>ANTES 38 · DEPOIS 92 · ILUSTRATIVO</div>
				</div>
			</div>
		</div>
	);
};

/** Mapa estilizado escuro (componente de interface) */
export const MapaEscuro: React.FC<{w: number; h: number; pulso?: number}> = ({w, h, pulso = 0}) => (
	<div style={{width: w, height: h, borderRadius: 16, overflow: 'hidden', position: 'relative', background: '#15161a'}}>
		<svg width={w} height={h} viewBox="0 0 360 220" preserveAspectRatio="xMidYMid slice" style={{position: 'absolute', inset: 0}}>
			<rect width="360" height="220" fill="#15161a" />
			<path d="M0 150 C80 140 120 170 200 150 S320 120 360 130 V220 H0 Z" fill="#1b2a22" />
			{[30, 75, 120, 165, 205].map((y) => (
				<path key={y} d={`M0 ${y} L360 ${y - 25}`} stroke="#2a2c33" strokeWidth={y === 120 ? 9 : 5} />
			))}
			{[40, 110, 180, 250, 320].map((x) => (
				<path key={x} d={`M${x} 0 L${x + 30} 220`} stroke="#2a2c33" strokeWidth={x === 180 ? 9 : 5} />
			))}
			<path d="M0 120 L360 95" stroke={RUBI} strokeWidth="2.5" opacity="0.7" />
		</svg>
		<div style={{position: 'absolute', left: '50%', top: '46%', transform: 'translate(-50%,-50%)'}}>
			<div style={{position: 'absolute', left: '50%', top: '50%', width: 60 * (0.4 + pulso), height: 60 * (0.4 + pulso), transform: 'translate(-50%,-50%)', borderRadius: '50%', background: `rgba(179,18,27,${0.4 * (1 - pulso)})`}} />
			<div style={{width: 18, height: 18, borderRadius: 9, background: RUBI, boxShadow: '0 0 0 4px rgba(255,255,255,0.9)'}} />
		</div>
	</div>
);

/** Lustro no celular (390 px) — WhatsApp, horário e mapa a um toque */
export const LustroMobile: React.FC<{rolagem?: number; toque?: number; dedo?: number; t?: number}> = ({rolagem = 0, toque = 0, dedo = 0, t = 0}) => (
	<div style={{width: 390, background: NOITE, color: CROMO, fontFamily: F.unbounded, transform: `translateY(${-rolagem}px)`, position: 'relative', minHeight: 900}}>
		<div style={{height: 64, display: 'flex', alignItems: 'center', padding: '0 20px', borderBottom: '1px solid rgba(233,236,239,0.08)'}}>
			<span style={{fontWeight: 800, fontSize: 16, letterSpacing: 4}}>LUSTRO</span>
			<span style={{marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 4}}>
				<i style={{width: 18, height: 1.6, background: CROMO}} />
				<i style={{width: 12, height: 1.6, background: CROMO, alignSelf: 'flex-end'}} />
			</span>
		</div>
		<div style={{position: 'relative', height: 200}}>
			<Faixas k={1} t={t} w={390} h={200} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 70, textAlign: 'center', fontWeight: 800, fontSize: 56, letterSpacing: 5, ...cromo}}>LUSTRO</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 146, textAlign: 'center', fontSize: 12, fontWeight: 300}}>
				Brilho que se vê de longe<span style={{color: RUBI}}>.</span>
			</div>
		</div>
		<div style={{padding: '6px 20px 0'}}>
			<div
				style={{
					height: 54,
					borderRadius: 14,
					background: VERDE_WHATS,
					color: '#fff',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 10,
					fontFamily: F.inter,
					fontSize: 16,
					fontWeight: 700,
					position: 'relative',
					overflow: 'hidden',
					transform: `scale(${1 - Math.sin(Math.min(1, toque) * Math.PI) * 0.04})`,
					boxShadow: '0 10px 24px rgba(31,168,85,0.3)',
				}}
			>
				{toque > 0 && toque < 1 && <div style={{position: 'absolute', left: '50%', top: '50%', width: 420 * toque, height: 420 * toque, marginLeft: -210 * toque, marginTop: -210 * toque, borderRadius: '50%', background: `rgba(255,255,255,${0.35 * (1 - toque)})`}} />}
				<svg width={22} height={22} viewBox="0 0 24 24" fill="none">
					<path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.3 20.7l4.4-1.1A8.8 8.8 0 1 0 12 3.2Z" stroke="#fff" strokeWidth="1.7" />
				</svg>
				Agendar pelo WhatsApp
				{dedo > 0 && <div style={{position: 'absolute', left: '60%', top: '50%', width: 48, height: 48, margin: '-24px 0 0 -24px', borderRadius: '50%', background: 'rgba(255,255,255,0.45)', border: '2px solid #fff', opacity: dedo, transform: `scale(${1 - toque * 0.25})`}} />}
			</div>
			<div style={{marginTop: 10, height: 48, borderRadius: 14, boxShadow: '0 0 0 1px rgba(233,236,239,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12}}>Ver serviços e preços</div>
		</div>
		<div style={{margin: '22px 20px 0', padding: 14, borderRadius: 20, background: '#111114', boxShadow: '0 0 0 1px rgba(233,236,239,0.08)'}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 8, fontFamily: F.inter, fontSize: 14, fontWeight: 600}}>
				<span style={{width: 9, height: 9, borderRadius: 5, background: VERDE_WHATS}} /> Aberto agora <span style={{color: '#8a8f96', fontWeight: 400}}>· até 19h</span>
			</div>
			<div style={{marginTop: 12}}>
				<MapaEscuro w={322} h={140} pulso={(t * 0.9) % 1} />
			</div>
			<div style={{fontFamily: F.inter, fontSize: 13, color: '#8a8f96', marginTop: 10}}>Av. Central, 1200 — Centro</div>
		</div>
		<div style={{padding: '22px 20px'}}>
			{['Lavagem detalhada', 'Polimento técnico', 'Vitrificação'].map((s, i) => (
				<div key={s} style={{display: 'flex', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid rgba(233,236,239,0.08)', fontSize: 13}}>
					<span style={{color: RUBI, fontSize: 10, marginRight: 12}}>0{i + 1}</span>
					{s}
					<span style={{marginLeft: 'auto', color: '#8a8f96'}}>→</span>
				</div>
			))}
		</div>
	</div>
);
