import React from 'react';
import {F, p, ease, lerp, clamp} from '../lib/base';
import {Pagina} from '../comp/Pagina';

/**
 * LUSTRO — estética automotiva (projeto conceitual).
 * Identidade: noite, rubi e cromo · Unbounded · a luz desenha o carro.
 */
export const NOITE = '#060607';
export const RUBI = '#B3121B';
const CROMO = '#E9ECEF';
const CINZA = '#8A8F96';

const CARRO =
	'M18 94 L68 94 A22 22 0 0 1 112 94 L263 94 A22 22 0 0 1 307 94 L345 94 C352 92 354 84 350 76 C346 70 336 66 322 64 L292 59 C268 40 240 30 205 30 C170 30 140 42 112 62 L66 68 C40 71 22 76 16 84 C14 88 15 92 18 94 Z';
const JANELA = 'M122 62 C146 46 172 39 204 39 C232 39 254 46 274 58 L198 60 Z';

/** Carro em linha única de luz: desenhado pelo feixe, com reflexo que percorre a carroceria */
export const CarroLinha: React.FC<{desenho: number; reflexo: number; cor?: string; w?: number}> = ({desenho, reflexo, cor = CROMO, w = 360}) => {
	const x = -60 + reflexo * 480;
	return (
		<svg width={w} height={(w * 120) / 360} viewBox="0 0 360 120" style={{overflow: 'visible'}}>
			<defs>
				<linearGradient id="reflexo" gradientUnits="userSpaceOnUse" x1={x - 50} y1={0} x2={x + 50} y2={0}>
					<stop offset="0" stopColor={cor} stopOpacity={0.55} />
					<stop offset="0.5" stopColor="#fff" stopOpacity={1} />
					<stop offset="1" stopColor={cor} stopOpacity={0.55} />
				</linearGradient>
				<filter id="brilhoLinha">
					<feGaussianBlur stdDeviation="1.6" />
				</filter>
			</defs>
			<path d={CARRO} fill="none" stroke={RUBI} strokeWidth={4} opacity={0.35 * desenho} filter="url(#brilhoLinha)" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - desenho} />
			<path d={CARRO} fill="none" stroke="url(#reflexo)" strokeWidth={1.3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - desenho} />
			<path d={JANELA} fill="none" stroke={cor} strokeOpacity={0.6} strokeWidth={0.9} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(desenho * 1.4 - 0.4)} />
			<path d="M70 70 L330 66" stroke={cor} strokeOpacity={0.25} strokeWidth={0.7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(desenho * 1.4 - 0.4)} />
			{[90, 285].map((cx) => (
				<g key={cx} opacity={clamp(desenho * 2 - 1)}>
					<circle cx={cx} cy={94} r={17} fill="none" stroke={cor} strokeWidth={1.2} />
					<circle cx={cx} cy={94} r={10} fill="none" stroke={cor} strokeOpacity={0.5} strokeWidth={0.8} />
					{[0, 72, 144, 216, 288].map((a) => (
						<line key={a} x1={cx} y1={94} x2={cx + Math.cos((a * Math.PI) / 180) * 10} y2={94 + Math.sin((a * Math.PI) / 180) * 10} stroke={cor} strokeOpacity={0.5} strokeWidth={0.8} />
					))}
				</g>
			))}
			{/* farol e lanterna */}
			<path d="M338 72 L350 74" stroke="#fff" strokeWidth={2} strokeLinecap="round" opacity={clamp(desenho * 3 - 2)} />
			<path d="M18 80 L24 79" stroke={RUBI} strokeWidth={2.4} strokeLinecap="round" opacity={clamp(desenho * 3 - 2)} />
			{/* reflexo no piso */}
			<ellipse cx={185} cy={112} rx={170} ry={4} fill={RUBI} opacity={0.18 * desenho} />
		</svg>
	);
};

/** Superfície de pintura: antes (riscada, fosca) × depois (espelhada) */
const Pintura: React.FC<{depois: boolean; w: number; h: number; t: number}> = ({depois, w, h, t}) => (
	<div style={{position: 'absolute', inset: 0, width: w, height: h, overflow: 'hidden', background: depois ? 'linear-gradient(160deg,#5a050b 0%,#9b0f19 38%,#3a0307 72%,#140102 100%)' : 'linear-gradient(160deg,#4a1418 0%,#6d2328 45%,#3b1a1c 100%)'}}>
		{depois ? (
			<>
				{[0.18, 0.34, 0.5].map((y, i) => (
					<div key={y} style={{position: 'absolute', left: '-20%', right: '-20%', top: `${y * 100 + Math.sin(t + i) * 1.5}%`, height: i === 1 ? 7 : 4, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.95) 30%,rgba(255,255,255,0.95) 70%,transparent)', transform: 'skewY(-9deg)', filter: 'blur(0.3px)'}} />
				))}
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg,rgba(255,255,255,0.18),transparent 40%)'}} />
			</>
		) : (
			<>
				<svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
					<filter id="nevoa">
						<feTurbulence baseFrequency="0.02" numOctaves={3} seed={5} />
						<feColorMatrix values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.25 0" />
					</filter>
					<rect width={w} height={h} filter="url(#nevoa)" />
					{Array.from({length: 26}, (_, i) => (
						<circle key={i} cx={w * 0.55} cy={h * 0.35} r={8 + i * 9} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth={0.6} strokeDasharray={`${10 + (i % 4) * 6} ${6 + (i % 3) * 5}`} />
					))}
				</svg>
				{[0.25, 0.42].map((y) => (
					<div key={y} style={{position: 'absolute', left: '-20%', right: '-20%', top: `${y * 100}%`, height: 16, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.22) 50%,transparent)', transform: 'skewY(-9deg)', filter: 'blur(6px)'}} />
				))}
			</>
		)}
	</div>
);

const PACOTES = [
	{nome: 'Lavagem detalhada', tempo: 'até 3 h'},
	{nome: 'Polimento técnico', tempo: '1 dia'},
	{nome: 'Vitrificação', tempo: '1 a 2 dias'},
];

export const SiteLustro: React.FC<{t: number; modo?: 'completo' | 'curto'}> = ({t, modo = 'completo'}) => {
	const c = modo === 'curto';
	const T = c ? {feixe: 0, rolar: 1.45, arrasto: 1.85, pacotes: 3.2, escolha: 3.75} : {feixe: 0, rolar: 2.3, arrasto: 2.85, pacotes: 4.55, escolha: 5.45};

	const feixe = p(t, T.feixe, T.feixe + 1.2, ease.inOut);
	const desenho = p(t, T.feixe + 0.1, T.feixe + 1.4, ease.inOut);
	const reflexo = p(t, T.feixe + 1.2, T.feixe + 2.2, ease.inOut);
	const marca = p(t, 0.5, 1.3, ease.out);
	const rolar = p(t, T.rolar, T.rolar + 0.7, ease.camera);
	const arr = p(t, T.arrasto + 0.2, T.arrasto + 1.35, ease.inOut);
	const divisor = lerp(300, 46, arr);
	const pacotes = p(t, T.pacotes, T.pacotes + 0.6, ease.camera);
	const escolha = p(t, T.escolha, T.escolha + 0.5, ease.out);
	const deslize = p(t, T.pacotes + 0.3, T.escolha, ease.inOut);
	const y = -rolar * 330 - pacotes * 300;

	return (
		<Pagina fundo={NOITE}>
			<div style={{position: 'absolute', left: 0, top: 0, width: 390, transform: `translateY(${y}px)`}}>
				{/* topo */}
				<div style={{position: 'absolute', top: 92, left: 22, right: 22, display: 'flex', alignItems: 'center', fontFamily: F.unbounded, color: CROMO, opacity: marca}}>
					<span style={{fontSize: 8, letterSpacing: 2.4, color: CINZA}}>DETALHAMENTO AUTOMOTIVO</span>
					<span style={{marginLeft: 'auto', display: 'flex', flexDirection: 'column', gap: 3}}>
						<i style={{width: 18, height: 1.4, background: CROMO}} />
						<i style={{width: 12, height: 1.4, background: CROMO, alignSelf: 'flex-end'}} />
					</span>
				</div>
				{/* marca */}
				<div style={{position: 'absolute', top: 118, left: 0, right: 0, textAlign: 'center', fontFamily: F.unbounded, fontWeight: 800, fontSize: 64, letterSpacing: lerp(26, 6, marca), color: 'transparent', backgroundImage: `linear-gradient(105deg, transparent ${reflexo * 120 - 30}%, #fff ${reflexo * 120 - 15}%, transparent ${reflexo * 120}%), linear-gradient(180deg,#ffffff 0%,#d8dce1 45%,#6c7179 55%,#e1e4e8 100%)`, WebkitBackgroundClip: 'text', backgroundClip: 'text', opacity: marca, filter: `blur(${(1 - marca) * 6}px)`}}>
					LUSTRO
				</div>
				<div style={{position: 'absolute', top: 200, left: 0, right: 0, textAlign: 'center', fontFamily: F.unbounded, fontWeight: 300, fontSize: 13, color: CROMO, opacity: p(t, 1.1, 1.6)}}>
					Brilho que se vê de longe<span style={{color: RUBI}}>.</span>
				</div>
				{/* feixe que desenha o carro */}
				<div style={{position: 'absolute', left: -40, right: -40, top: 250, height: 200, background: 'radial-gradient(ellipse 50% 45% at 50% 60%, rgba(179,18,27,0.22), transparent 70%)', opacity: desenho}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 236, height: 2, background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.5),transparent)', opacity: reflexo * 0.6}} />
				<div style={{position: 'absolute', left: -6, top: 262}}>
					<CarroLinha desenho={desenho} reflexo={reflexo} w={402} />
				</div>
				{feixe < 1 && <div style={{position: 'absolute', top: 262, left: feixe * 420 - 40, width: 2, height: 130, background: 'linear-gradient(180deg,transparent,#fff,transparent)', boxShadow: '0 0 20px 4px rgba(255,255,255,0.5)', opacity: Math.sin(feixe * Math.PI)}} />}
				<div style={{position: 'absolute', top: 430, left: 22, right: 22, display: 'flex', gap: 8, opacity: p(t, 1.5, 2.0)}}>
					<div style={{flex: 1, height: 42, borderRadius: 999, background: RUBI, color: '#fff', fontFamily: F.unbounded, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 0.5}}>Agendar avaliação</div>
					<div style={{width: 120, height: 42, borderRadius: 999, boxShadow: '0 0 0 1px rgba(233,236,239,0.3)', color: CROMO, fontFamily: F.unbounded, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Serviços</div>
				</div>

				{/* antes × depois */}
				<div style={{position: 'absolute', top: 560, left: 22, right: 22, fontFamily: F.unbounded, color: CROMO}}>
					<div style={{fontSize: 8, letterSpacing: 2.4, color: CINZA}}>RESULTADO</div>
					<div style={{fontSize: 26, fontWeight: 300, letterSpacing: -0.6, lineHeight: 1.05, marginTop: 8}}>
						Arraste e veja
						<br />
						<b style={{fontWeight: 700}}>a diferença.</b>
					</div>
				</div>
				<div style={{position: 'absolute', top: 650, left: 22, width: 346, height: 300, borderRadius: 18, overflow: 'hidden'}}>
					<Pintura depois={false} w={346} h={300} t={t} />
					<div style={{position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${divisor}px)`}}>
						<Pintura depois w={346} h={300} t={t} />
					</div>
					<div style={{position: 'absolute', top: 12, left: 12, fontFamily: F.unbounded, fontSize: 8, letterSpacing: 2, color: '#fff', opacity: 0.85}}>ANTES</div>
					<div style={{position: 'absolute', top: 12, right: 12, fontFamily: F.unbounded, fontSize: 8, letterSpacing: 2, color: '#fff'}}>DEPOIS</div>
					<div style={{position: 'absolute', top: 0, bottom: 0, left: divisor - 1, width: 2, background: '#fff', boxShadow: '0 0 12px rgba(255,255,255,0.7)'}}>
						<div style={{position: 'absolute', top: 128, left: -19, width: 40, height: 40, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: NOITE, fontSize: 13, fontWeight: 700, boxShadow: '0 6px 20px rgba(0,0,0,0.5)', transform: `scale(${t > T.arrasto && t < T.arrasto + 1.5 ? 0.92 : 1})`}}>‹ ›</div>
					</div>
				</div>
				<div style={{position: 'absolute', top: 962, left: 22, right: 22, display: 'flex', fontFamily: F.unbounded, fontSize: 9, color: CINZA, letterSpacing: 1}}>
					<span>POLIMENTO + VITRIFICAÇÃO</span>
					<span style={{marginLeft: 'auto', color: CROMO}}>{Math.round(arr * 100)}%</span>
				</div>

				{/* pacotes */}
				<div style={{position: 'absolute', top: 1000, left: 22, fontFamily: F.unbounded, color: CROMO}}>
					<div style={{fontSize: 8, letterSpacing: 2.4, color: CINZA}}>SERVIÇOS</div>
					<div style={{fontSize: 26, fontWeight: 300, letterSpacing: -0.6, marginTop: 8}}>
						Escolha o <b style={{fontWeight: 700}}>cuidado.</b>
					</div>
				</div>
				<div style={{position: 'absolute', top: 1080, left: 22, display: 'flex', gap: 12, transform: `translateX(${-deslize * 536}px)`}}>
					{PACOTES.map((pc, i) => {
						const ativo = i === 2 ? escolha : 0;
						return (
							<div key={pc.nome} style={{width: 256, height: 220, borderRadius: 22, padding: 20, background: ativo > 0 ? `rgba(179,18,27,${0.18 + ativo * 0.7})` : '#121215', boxShadow: `0 0 0 1px ${ativo > 0 ? RUBI : 'rgba(233,236,239,0.12)'}`, fontFamily: F.unbounded, color: CROMO, position: 'relative', flex: 'none'}}>
								<div style={{fontSize: 9, letterSpacing: 2, color: ativo > 0.5 ? '#fff' : CINZA}}>0{i + 1}</div>
								<div style={{fontSize: 19, fontWeight: 600, letterSpacing: -0.4, marginTop: 70, lineHeight: 1.1}}>{pc.nome}</div>
								<div style={{fontSize: 10, color: ativo > 0.5 ? '#fff' : CINZA, marginTop: 8}}>Duração: {pc.tempo}</div>
								<div style={{position: 'absolute', right: 18, top: 18, width: 26, height: 26, borderRadius: '50%', boxShadow: `0 0 0 1px ${ativo > 0.5 ? '#fff' : 'rgba(233,236,239,0.3)'}`, background: ativo > 0.5 ? '#fff' : 'transparent', color: RUBI, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700}}>{ativo > 0.5 ? '✓' : ''}</div>
							</div>
						);
					})}
				</div>
				<div style={{position: 'absolute', top: 1316, left: 22, right: 22, height: 46, borderRadius: 999, background: CROMO, color: NOITE, fontFamily: F.unbounded, fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: escolha}}>
					Agendar vitrificação →
				</div>
			</div>
			{/* dedo */}
			{t > T.arrasto - 0.2 && t < T.arrasto + 1.6 && (
				<div style={{position: 'absolute', left: 22 + divisor - 14, top: 650 + 148 - 14 + y, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', border: '1.2px solid #fff', opacity: p(t, T.arrasto - 0.2, T.arrasto) * (1 - p(t, T.arrasto + 1.35, T.arrasto + 1.6))}} />
			)}
			{t > T.escolha - 0.35 && t < T.escolha + 0.6 && (
				<div style={{position: 'absolute', left: 22 + 536 - deslize * 536 + 128 - 14, top: 1080 + 110 + y - 14, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', border: '1.2px solid #fff', opacity: p(t, T.escolha - 0.35, T.escolha - 0.1) * (1 - p(t, T.escolha + 0.3, T.escolha + 0.6)), transform: `scale(${1 - Math.sin(clamp((t - T.escolha) / 0.3) * Math.PI) * 0.2})`}} />
			)}
		</Pagina>
	);
};
