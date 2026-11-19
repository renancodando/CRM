import React from 'react';
import {F, p, ease, lerp, clamp} from '../lib/base';
import {Pagina} from '../comp/Pagina';

/**
 * LUSTRO — estética automotiva (projeto conceitual).
 * Identidade: noite, rubi e cromo · Unbounded · faixas de luz de estúdio e brilho medido.
 */
export const NOITE = '#060607';
export const RUBI = '#B3121B';
const CROMO = '#E9ECEF';
const CINZA = '#8A8F96';

/** Faixas de luz de estúdio refletidas (abstratas) */
const Faixas: React.FC<{k: number; t: number}> = ({k, t}) => (
	<div style={{position: 'absolute', left: 0, right: 0, top: 250, height: 170, overflow: 'hidden'}}>
		{[0, 1, 2, 3].map((i) => {
			const kk = clamp(k * 1.6 - i * 0.18);
			return (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: -60,
						right: -60,
						top: 20 + i * 36 + Math.sin(t * 0.8 + i) * 2,
						height: i === 1 ? 5 : 2.5,
						background: `linear-gradient(90deg, transparent, rgba(255,255,255,${0.95 - i * 0.18}) ${30 + i * 6}%, rgba(255,255,255,${0.95 - i * 0.18}) ${62 - i * 4}%, transparent)`,
						transform: `translateX(${(1 - kk) * 420}px) skewY(-6deg)`,
						filter: `blur(${i === 3 ? 1.2 : 0.3}px)`,
						boxShadow: i === 1 ? '0 0 22px rgba(255,255,255,0.5)' : 'none',
					}}
				/>
			);
		})}
		<div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse 60% 70% at 50% 60%, rgba(179,18,27,${0.28 * k}), transparent 70%)`}} />
	</div>
);

/** Medidor de brilho (GU) antes × depois */
const Medidor: React.FC<{k: number}> = ({k}) => {
	const antes = 38;
	const depois = 92;
	const valor = Math.round(lerp(antes, depois, k));
	const arco = (v: number) => {
		const a0 = Math.PI * 0.8;
		const a = a0 + (v / 100) * Math.PI * 1.4;
		return `M ${80 + Math.cos(a0) * 64} ${80 + Math.sin(a0) * 64} A 64 64 0 ${v > 64 ? 1 : 0} 1 ${80 + Math.cos(a) * 64} ${80 + Math.sin(a) * 64}`;
	};
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
			<svg width={160} height={150} viewBox="0 0 160 150">
				<path d={arco(100)} fill="none" stroke="rgba(233,236,239,0.12)" strokeWidth={9} strokeLinecap="round" />
				<path d={arco(valor)} fill="none" stroke={RUBI} strokeWidth={9} strokeLinecap="round" />
				<text x={80} y={88} textAnchor="middle" fontFamily={F.unbounded} fontWeight={700} fontSize={38} fill={CROMO}>{valor}</text>
				<text x={80} y={108} textAnchor="middle" fontFamily={F.unbounded} fontSize={8} letterSpacing={2} fill={CINZA}>GU · BRILHO</text>
			</svg>
			<div style={{flex: 1, fontFamily: F.unbounded}}>
				{[
					['ANTES', antes, 'rgba(233,236,239,0.35)'],
					['DEPOIS', depois, RUBI],
				].map(([r, v, c], i) => (
					<div key={r as string} style={{marginBottom: 14}}>
						<div style={{display: 'flex', fontSize: 8, letterSpacing: 2, color: CINZA}}>
							<span>{r as string}</span>
							<span style={{marginLeft: 'auto', color: CROMO}}>{i === 0 ? antes : Math.round(lerp(antes, depois, k))} GU</span>
						</div>
						<div style={{height: 6, borderRadius: 3, background: 'rgba(233,236,239,0.08)', marginTop: 6}}>
							<div style={{height: 6, borderRadius: 3, width: `${i === 0 ? v : lerp(antes, depois, k)}%`, background: c as string}} />
						</div>
					</div>
				))}
				<div style={{fontSize: 7.5, color: CINZA, letterSpacing: 1}}>MEDIÇÃO ILUSTRATIVA</div>
			</div>
		</div>
	);
};

const PACOTES = [
	{nome: 'Lavagem detalhada', tempo: 'até 3 h'},
	{nome: 'Polimento técnico', tempo: '1 dia'},
	{nome: 'Vitrificação', tempo: '1 a 2 dias'},
];

export const SiteLustro: React.FC<{t: number; modo?: 'completo' | 'curto'}> = ({t, modo = 'completo'}) => {
	const c = modo === 'curto';
	const T = c ? {feixe: 0, rolar: 1.45, arrasto: 1.85, pacotes: 3.2, escolha: 3.75} : {feixe: 0, rolar: 2.3, arrasto: 2.85, pacotes: 4.55, escolha: 5.45};

		const desenho = p(t, T.feixe + 0.1, T.feixe + 1.4, ease.inOut);
	const reflexo = p(t, T.feixe + 1.2, T.feixe + 2.2, ease.inOut);
	const marca = p(t, 0.5, 1.3, ease.out);
	const rolar = p(t, T.rolar, T.rolar + 0.7, ease.camera);
	const arr = p(t, T.arrasto + 0.2, T.arrasto + 1.35, ease.inOut);
		const pacotes = p(t, T.pacotes, T.pacotes + 0.6, ease.camera);
	const escolha = p(t, T.escolha, T.escolha + 0.5, ease.out);
	const deslize = p(t, T.pacotes + 0.3, T.escolha, ease.inOut);
	const y = -rolar * 330 - pacotes * 330;

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
				<Faixas k={desenho} t={t} />
				<div style={{position: 'absolute', top: 430, left: 22, right: 22, display: 'flex', gap: 8, opacity: p(t, 1.5, 2.0)}}>
					<div style={{flex: 1, height: 42, borderRadius: 999, background: RUBI, color: '#fff', fontFamily: F.unbounded, fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: 0.5}}>Agendar avaliação</div>
					<div style={{width: 120, height: 42, borderRadius: 999, boxShadow: '0 0 0 1px rgba(233,236,239,0.3)', color: CROMO, fontFamily: F.unbounded, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Serviços</div>
				</div>

				{/* medição de brilho */}
				<div style={{position: 'absolute', top: 560, left: 22, right: 22, fontFamily: F.unbounded, color: CROMO}}>
					<div style={{fontSize: 8, letterSpacing: 2.4, color: CINZA}}>RESULTADO MEDIDO</div>
					<div style={{fontSize: 26, fontWeight: 300, letterSpacing: -0.6, lineHeight: 1.05, marginTop: 8}}>
						A gente mede
						<br />
						<b style={{fontWeight: 700}}>o brilho.</b>
					</div>
					<div style={{fontSize: 11, lineHeight: 1.5, color: CINZA, marginTop: 10}}>Antes e depois de cada serviço, com o laudo enviado no seu WhatsApp.</div>
				</div>
				<div style={{position: 'absolute', top: 720, left: 22, right: 22, padding: 16, borderRadius: 20, background: '#101013', boxShadow: '0 0 0 1px rgba(233,236,239,0.1)'}}>
					<Medidor k={arr} />
				</div>
				{/* pacotes */}
				<div style={{position: 'absolute', top: 960, left: 22, fontFamily: F.unbounded, color: CROMO}}>
					<div style={{fontSize: 8, letterSpacing: 2.4, color: CINZA}}>SERVIÇOS</div>
					<div style={{fontSize: 26, fontWeight: 300, letterSpacing: -0.6, marginTop: 8}}>
						Escolha o <b style={{fontWeight: 700}}>cuidado.</b>
					</div>
				</div>
				<div style={{position: 'absolute', top: 1040, left: 22, display: 'flex', gap: 12, transform: `translateX(${-deslize * 536}px)`}}>
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
				<div style={{position: 'absolute', top: 1276, left: 22, right: 22, height: 46, borderRadius: 999, background: CROMO, color: NOITE, fontFamily: F.unbounded, fontSize: 11.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: escolha}}>
					Agendar vitrificação →
				</div>
			</div>
			{t > T.escolha - 0.35 && t < T.escolha + 0.6 && (
				<div style={{position: 'absolute', left: 22 + 536 - deslize * 536 + 128 - 14, top: 1040 + 110 + y - 14, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', border: '1.2px solid #fff', opacity: p(t, T.escolha - 0.35, T.escolha - 0.1) * (1 - p(t, T.escolha + 0.3, T.escolha + 0.6)), transform: `scale(${1 - Math.sin(clamp((t - T.escolha) / 0.3) * Math.PI) * 0.2})`}} />
			)}
		</Pagina>
	);
};
