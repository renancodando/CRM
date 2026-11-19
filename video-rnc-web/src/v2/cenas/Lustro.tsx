import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {Environment, Lightformer} from '@react-three/drei';
import {F, p, ease, lerp, useLocal, usePalco, clamp} from '../lib/base';
import {Camara} from '../modelos/comum';
import {Carro} from '../modelos/Carro';
import {Linha, Cursor, Conceito} from '../comp/ui';

export type ModoLustro = 'completo' | 'curto' | 'desejo' | 'claro';
const RUBI = '#b3121b';
const CORES = [
	{nome: 'Grafite', cor: '#2a2e33'},
	{nome: 'Rubi', cor: '#8c0c14'},
	{nome: 'Abissal', cor: '#0e2240'},
	{nome: 'Pérola', cor: '#d9d6cf'},
];

const mistura = (a: string, b: string, k: number) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp(k)).getHexString();

/** Estúdio cujas luzes respondem à interface */
const EstudioLustro: React.FC<{luz: number; claro: boolean}> = ({luz, claro}) => {
	const faixa = (i: number) => clamp((luz - i * 0.22) / 0.3);
	return (
		<Environment resolution={256} frames={Infinity}>
			<color attach="background" args={[claro ? '#d8d4cc' : '#050506']} />
			{[-1.4, 0, 1.4].map((z, i) => (
				<Lightformer key={z} form="rect" intensity={6 * faixa(i)} position={[0, 6, z]} scale={[14, 0.45, 1]} rotation-x={Math.PI / 2} />
			))}
			<Lightformer form="rect" intensity={claro ? 2.5 : 0.6 + 1.6 * luz} position={[-8, 2, 2]} scale={[5, 3, 1]} rotation-y={Math.PI / 2} />
			<Lightformer form="rect" intensity={claro ? 2 : 0.3 + 1.2 * luz} position={[8, 2, -1]} scale={[5, 3, 1]} rotation-y={-Math.PI / 2} />
			<Lightformer form="ring" intensity={claro ? 1.5 : 0.8 * luz} position={[3, 3, 8]} scale={3} />
		</Environment>
	);
};

export const Lustro: React.FC<{modo?: ModoLustro}> = ({modo = 'completo'}) => {
	const {t, d} = useLocal();
	const palco = usePalco();
	const claro = modo === 'claro' || palco === 'marfim';
	const fundo = claro ? '#ECE7DE' : '#050506';
	const tinta = claro ? '#121316' : '#f2f3f5';

	const S = {
		completo: {farol: 0.15, ui: 0.7, luzIni: 1.35, luzFim: 2.6, cor: 2.95, vitr: 4.15, cta: 5.4, base: 0},
		curto: {farol: 0.05, ui: 0.35, luzIni: 0.55, luzFim: 1.45, cor: 1.85, vitr: 2.95, cta: 4.1, base: 0},
		desejo: {farol: 2.75, ui: 5.1, luzIni: 5.3, luzFim: 6.2, cor: 6.6, vitr: 7.7, cta: 8.9, base: 2.6},
		claro: {farol: -1, ui: 0.15, luzIni: -2, luzFim: -1, cor: 0.75, vitr: 99, cta: 99, base: 0},
	}[modo];

	const farol = p(t, S.farol, S.farol + 0.35);
	const luz = claro ? 1 : lerp(0.06, 1, p(t, S.luzIni, S.luzFim, ease.inOut));
	const ui = p(t, S.ui, S.ui + 0.7, ease.out);
	const corK = p(t, S.cor + 0.15, S.cor + 0.85, ease.inOut);
	const corIni = claro ? CORES[3].cor : CORES[0].cor;
	const cor = mistura(corIni, CORES[1].cor, corK);
	const vitrK = p(t, S.vitr + 0.15, S.vitr + 1.1, ease.inOut);
	const rug = lerp(claro ? 0.12 : 0.46, 0.04, vitrK);
	const revela = modo === 'desejo' ? p(t, S.base, S.base + 1.2, ease.out) : 1;

	// câmera: travelling lateral e aproximação lenta
	const k = p(t, 0, d, ease.suave);
	const ang = lerp(0.5, 0.3, k);
	const dist = lerp(12.6, 11.2, k) - p(t, S.cta, d, ease.inOut) * 0.6;
	const camPos: [number, number, number] = [Math.cos(ang) * dist * 0.92, lerp(2.5, 2.1, k), Math.sin(ang) * dist];
	const alvo: [number, number, number] = [0.25, 0.55, 0];

	// cursor: posições na tela
	const slider = {x0: 330, x1: 860, y: 1255};
	const swY = 1345;
	const swX = (i: number) => 330 + i * 92;
	const segY = 1428;
	const segX = [370, 560, 770];
	type Pt = [number, number];
	const rota: [number, Pt][] = [
		[S.ui + 0.2, [900, 1500]],
		[S.luzIni - 0.05, [slider.x0, slider.y]],
		[S.luzFim, [slider.x1, slider.y]],
		[S.cor, [swX(1), swY]],
		[S.vitr, [segX[2], segY]],
		[S.cta, [820, 545]],
	];
	let cx = rota[0][1][0];
	let cy = rota[0][1][1];
	for (let i = 1; i < rota.length; i++) {
		const [ti, pt] = rota[i];
		const [tp, pp] = rota[i - 1];
		const kk = i === 2 ? p(t, tp, ti, ease.inOut) : p(t, Math.max(tp, ti - 0.55), ti, ease.inOut);
		if (t > tp) {
			cx = lerp(pp[0], pt[0], kk);
			cy = lerp(pp[1], pt[1], kk);
		}
	}
	const clique = (tc: number) => clamp((t - tc) / 0.35, 0, 1);
	const cliqueAtual = t > S.vitr ? clique(S.vitr) : t > S.cor ? clique(S.cor) : 0;
	const cursorOp = modo === 'claro' ? 0 : p(t, S.ui + 0.1, S.ui + 0.4) * (1 - p(t, d - 0.5, d - 0.2));
	const sel = t > S.vitr + 0.1 ? 2 : 0;
	const saida = modo === 'claro' ? 0 : p(t, d - 0.55, d, ease.in);

	return (
		<AbsoluteFill style={{background: fundo}}>
			<AbsoluteFill style={{opacity: revela}}>
				<ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true, toneMappingExposure: claro ? 1.0 : 1.1}} dpr={1}>
					<Camara pos={camPos} alvo={alvo} fov={30} />
					<color attach="background" args={[fundo]} />
					<EstudioLustro luz={luz} claro={claro} />
					<ambientLight intensity={claro ? 0.6 : 0.04 + luz * 0.12} />
					<spotLight position={[0, 7, 0]} angle={0.6} penumbra={1} intensity={claro ? 40 : 60 * luz} castShadow />
					{/* faixas de luz visíveis no teto */}
					{[-1.4, 0, 1.4].map((z, i) => {
						const f = clamp((luz - i * 0.22) / 0.3);
						return (
							<mesh key={z} position={[0.3, 4.6, z]} rotation-x={Math.PI / 2}>
								<planeGeometry args={[6.5, 0.12]} />
								<meshBasicMaterial color={new THREE.Color(f * 2, f * 2, f * 2)} toneMapped={false} side={THREE.DoubleSide} />
							</mesh>
						);
					})}
					{/* piso */}
					<mesh rotation-x={-Math.PI / 2} receiveShadow>
						<planeGeometry args={[60, 60]} />
						<meshPhysicalMaterial color={claro ? '#d9d5cd' : '#09090b'} roughness={claro ? 0.6 : 0.22} metalness={claro ? 0 : 0.5} />
					</mesh>
					<group rotation-y={-0.12}>
						<Carro cor={cor} rugosidade={rug} farol={claro ? 1 : farol} lanterna={1} />
					</group>
				</ThreeCanvas>
			</AbsoluteFill>

			{/* clarão do farol */}
			{!claro && farol > 0 && farol < 1 && (
				<AbsoluteFill style={{background: 'radial-gradient(ellipse 40% 6% at 62% 60%, rgba(255,255,255,0.55), transparent 70%)', opacity: Math.sin(farol * Math.PI)}} />
			)}

			{/* ——— site Lustro ——— */}
			<div style={{position: 'absolute', top: 290, left: 70, right: 130, display: 'flex', alignItems: 'center', color: tinta, opacity: ui, fontFamily: F.unbounded}}>
				<div style={{fontWeight: 800, fontSize: 38, letterSpacing: '0.14em'}}>LUSTRO</div>
				<div style={{marginLeft: 'auto', fontSize: 17, fontWeight: 400, letterSpacing: '0.18em', opacity: 0.7}}>DETALHAMENTO AUTOMOTIVO</div>
			</div>
			{ui > 0 && (
				<div style={{position: 'absolute', top: 380, left: 70, right: 130, fontFamily: F.unbounded, color: tinta, fontSize: 60, lineHeight: 1.04, letterSpacing: '-0.03em'}}>
					<Linha t={t} ini={S.ui + 0.15}>
						<span style={{fontWeight: 300}}>Brilho que se vê</span>
					</Linha>
					<Linha t={t} ini={S.ui + 0.3}>
						<span style={{fontWeight: 700}}>
							de longe<span style={{color: RUBI}}>.</span>
						</span>
					</Linha>
				</div>
			)}
			{ui > 0 && modo !== 'claro' && (
				<div
					style={{
						position: 'absolute',
						left: 70,
						right: 130,
						top: 1190,
						padding: '26px 30px',
						borderRadius: 34,
						background: claro ? 'rgba(255,255,255,0.7)' : 'rgba(18,19,22,0.62)',
						backdropFilter: 'blur(18px)',
						boxShadow: '0 0 0 1px rgba(255,255,255,0.1)',
						fontFamily: F.unbounded,
						color: tinta,
						opacity: ui,
						transform: `translateY(${(1 - ui) * 40}px)`,
					}}
				>
					{/* iluminação */}
					<div style={{display: 'flex', alignItems: 'center', gap: 20, height: 50}}>
						<div style={{width: 210, fontSize: 18, letterSpacing: '0.12em', opacity: 0.7}}>LUZ</div>
						<div style={{flex: 1, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', position: 'relative'}}>
							<div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(luz - 0.06) / 0.94 * 100}%`, background: '#fff', borderRadius: 2}} />
							<div style={{position: 'absolute', top: -13, left: `calc(${((luz - 0.06) / 0.94) * 100}% - 15px)`, width: 30, height: 30, borderRadius: '50%', background: '#fff', boxShadow: `0 0 ${20 * luz}px rgba(255,255,255,0.8)`}} />
						</div>
					</div>
					{/* cor */}
					<div style={{display: 'flex', alignItems: 'center', gap: 20, height: 90}}>
						<div style={{width: 210, fontSize: 18, letterSpacing: '0.12em', opacity: 0.7}}>COR</div>
						{CORES.map((c, i) => {
							const ativo = (i === 1 && corK > 0.2) || (i === 0 && corK <= 0.2);
							return <div key={c.nome} style={{width: 58, height: 58, borderRadius: '50%', background: c.cor, boxShadow: `0 0 0 ${ativo ? 3 : 1}px ${ativo ? '#fff' : 'rgba(255,255,255,0.25)'}, inset 0 6px 10px rgba(255,255,255,0.18)`, marginRight: 14}} />;
						})}
						<div style={{marginLeft: 'auto', fontSize: 18, opacity: 0.85}}>{corK > 0.2 ? 'Rubi' : 'Grafite'}</div>
					</div>
					{/* acabamento */}
					<div style={{display: 'flex', alignItems: 'center', gap: 20, height: 64}}>
						<div style={{width: 210, fontSize: 18, letterSpacing: '0.12em', opacity: 0.7}}>ACABAMENTO</div>
						<div style={{flex: 1, display: 'flex', borderRadius: 999, background: 'rgba(255,255,255,0.08)', padding: 5, position: 'relative', fontSize: 17}}>
							<div style={{position: 'absolute', top: 5, bottom: 5, left: `calc(${sel === 2 ? 66.6 : 0}% + 5px)`, width: 'calc(33.3% - 10px)', borderRadius: 999, background: sel === 2 ? RUBI : 'rgba(255,255,255,0.18)'}} />
							{['Original', 'Polimento', 'Vitrificação'].map((s) => (
								<div key={s} style={{flex: 1, textAlign: 'center', padding: '13px 0', position: 'relative'}}>
									{s}
								</div>
							))}
						</div>
					</div>
				</div>
			)}
			{/* selo de resultado da vitrificação */}
			{vitrK > 0 && modo !== 'claro' && (
				<div style={{position: 'absolute', left: 70, top: 1080, fontFamily: F.unbounded, fontSize: 20, letterSpacing: '0.14em', color: tinta, opacity: vitrK * (1 - saida), display: 'flex', alignItems: 'center', gap: 14}}>
					<span style={{opacity: 0.55}}>FOSCO</span>
					<span style={{width: 120 * vitrK, height: 2, background: RUBI}} />
					<span>ESPELHADO</span>
				</div>
			)}
			{t > S.cta - 0.3 && modo !== 'claro' && (
				<div style={{position: 'absolute', right: 130, top: 520, fontFamily: F.unbounded, fontWeight: 600, fontSize: 22, letterSpacing: '0.06em', color: '#fff', background: RUBI, padding: '20px 28px', borderRadius: 999, opacity: p(t, S.cta - 0.3, S.cta), transform: `scale(${1 + Math.sin(clamp((t - S.cta - 0.1) / 0.4) * Math.PI) * 0.06})`, boxShadow: '0 12px 40px rgba(179,18,27,0.5)'}}>
					Agendar avaliação
				</div>
			)}
			{cursorOp > 0 && <Cursor x={cx} y={cy} clique={cliqueAtual} opacidade={cursorOp} escala={1.35} />}

			{/* ——— abertura 3: desejo ——— */}
			{modo === 'desejo' && (
				<>
					<div style={{position: 'absolute', top: 330, left: 70, right: 130, fontFamily: F.inter, fontWeight: 600, fontSize: 76, letterSpacing: '-0.045em', lineHeight: 1.02, color: '#f5f5f7'}}>
						<Linha t={t} ini={0.2} sai={3.0}>
							Você sabe o quanto
						</Linha>
						<Linha t={t} ini={0.35} sai={3.05}>
							<span>
								o seu negócio é <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400}}>bom.</span>
							</span>
						</Linha>
					</div>
					<div style={{position: 'absolute', top: 330, left: 70, right: 130, fontFamily: F.inter, fontWeight: 600, fontSize: 90, letterSpacing: '-0.045em', lineHeight: 1.02, color: '#f5f5f7'}}>
						<Linha t={t} ini={3.25} sai={4.95}>
							Seu site
						</Linha>
						<Linha t={t} ini={3.4} sai={5.0}>
							<span>
								mostra <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400}}>isso?</span>
							</span>
						</Linha>
					</div>
					{/* o nome em fonte padrão, que ganha identidade */}
					{(() => {
						const m = p(t, 1.9, 2.7, ease.inOut);
						const o = p(t, 0.9, 1.3) * (1 - p(t, 3.4, 3.9));
						return o > 0 ? (
							<div style={{position: 'absolute', left: 0, right: 0, top: 1050, textAlign: 'center', opacity: o}}>
								<div style={{position: 'absolute', left: 0, right: 0, fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 46, color: '#9b9b9b', opacity: 1 - m}}>Lustro Estética Automotiva</div>
								<div style={{position: 'absolute', left: 0, right: 0, fontFamily: F.unbounded, fontWeight: 800, fontSize: 78, letterSpacing: `${lerp(0.5, 0.16, m)}em`, color: '#fff', opacity: m, filter: `blur(${(1 - m) * 10}px)`}}>
									LUSTRO
								</div>
							</div>
						) : null;
					})()}
				</>
			)}
			{modo !== 'claro' && <Conceito t={t} ini={S.ui + 0.4} fim={d - 0.3} nome="Lustro Estética Automotiva" y={1500} />}
			{modo === 'claro' && <Conceito t={t} ini={0.4} fim={d} nome="Lustro Estética Automotiva" claro y={1500} />}

			{/* transição: reflexo âmbar */}
			{saida > 0 && <AbsoluteFill style={{background: `radial-gradient(circle at 75% 40%, rgba(255,190,110,${saida}), rgba(200,116,42,${saida}) ${30 + saida * 50}%, rgba(90,42,18,${saida * 0.9}) 100%)`}} />}
		</AbsoluteFill>
	);
};
