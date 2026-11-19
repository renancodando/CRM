import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import * as THREE from 'three';
import {F, p, ease, lerp, useLocal, usePalco, clamp} from '../lib/base';
import {Camara} from '../modelos/comum';
import {Celular, LIMA, Peca} from '../modelos/Celular';
import {Estudio} from '../modelos/Estudio';
import {Linha, Toque, Conceito} from '../comp/ui';

export type ModoNucleo = 'completo' | 'curto' | 'simples' | 'isto';

const GRAF = '#0F1113';
const GELO = '#E8ECEF';

// grade de serviços (px na tela 1080×1920)
const CARTOES: {peca: Peca; nome: string; x: number; y: number; s: number; off?: [number, number]}[] = [
	{peca: 'tela', nome: 'Troca de tela', x: 300, y: 690, s: 0.27},
	{peca: 'bateria', nome: 'Bateria', x: 780, y: 690, s: 0.42},
	{peca: 'camera', nome: 'Câmeras', x: 300, y: 955, s: 0.95},
	{peca: 'placa', nome: 'Placa lógica', x: 780, y: 955, s: 0.5, off: [-0.17, -0.32]},
	{peca: 'traseira', nome: 'Tampa traseira', x: 300, y: 1220, s: 0.27},
	{peca: 'moldura', nome: 'Carcaça', x: 780, y: 1220, s: 0.27},
];

const ROTULOS: {peca: Peca; nome: string; pos: [number, number, number]}[] = [
	{peca: 'tela', nome: 'Tela OLED', pos: [0.38, 0.6, 1.19]},
	{peca: 'moldura', nome: 'Carcaça', pos: [0.4, -0.7, 0.55]},
	{peca: 'placa', nome: 'Placa lógica', pos: [0.32, 0.6, 0.0]},
	{peca: 'bateria', nome: 'Bateria', pos: [-0.3, -0.5, -0.5]},
	{peca: 'camera', nome: 'Câmeras', pos: [-0.32, 0.92, -1.0]},
	{peca: 'traseira', nome: 'Tampa traseira', pos: [-0.4, -0.75, -1.49]},
];

const DIST = 6;
const FOV = 36;
const altVis = 2 * DIST * Math.tan(((FOV / 2) * Math.PI) / 180);
const px2w = (x: number, y: number): [number, number] => [((x - 540) * altVis) / 1920, ((960 - y) * altVis) / 1920];

export const Nucleo: React.FC<{modo?: ModoNucleo}> = ({modo = 'completo'}) => {
	const {t, d} = useLocal();
	const palco = usePalco();
	const marfim = palco === 'marfim';
	const fundo = palco === 'preto' ? '#050506' : marfim ? '#ECE7DE' : GRAF;
	const tinta = marfim ? '#141416' : GELO;

	// cronograma por modo
	const S = {
		completo: {pagina: -1, explode: 0.55, grade: 2.35, ui: 2.9, toque: 4.05, push: 5.4},
		curto: {pagina: -1, explode: -0.9, grade: 0.75, ui: 1.25, toque: 2.25, push: 3.3},
		simples: {pagina: 0, explode: 2.25, grade: 99, ui: 99, toque: 99, push: 99},
		isto: {pagina: -1, explode: 0.35, grade: 99, ui: 99, toque: 99, push: 99},
	}[modo];

	const explode = p(t, S.explode, S.explode + 1.5, ease.inOut);
	const dispersao = p(t, S.explode + 0.2, S.explode + 1.9, ease.out);
	const grade = p(t, S.grade, S.grade + 1.1, ease.inOut);
	const ui = p(t, S.ui, S.ui + 0.8, ease.out);
	const toqueK = clamp((t - S.toque) / 0.55, 0, 1.4);
	const sel = p(t, S.toque + 0.15, S.toque + 0.7, ease.out);
	const push = p(t, S.push, d, ease.camera);
	const saida = p(t, d - 0.45, d, ease.in);

	// página simples (abertura 2)
	const pagina = modo === 'simples' ? 1 - p(t, 1.75, 2.35, ease.inOut) : 0;
	const cortina = modo === 'simples' ? p(t, 1.75, 2.4, ease.inOut) : 1;

	// rotação do aparelho e câmera
	const rotY = lerp(-0.3, -0.72, p(t, Math.max(0, S.explode - 0.5), S.explode + 1.8, ease.inOut)) * (1 - grade);
	const rotX = lerp(0.1, 0.42, explode) * (1 - grade);
	const orb = (1 - grade) * lerp(0, 0.22, explode);
	const longe = DIST + (1 - grade) * explode * 2.4;
	const camPos: [number, number, number] = [Math.sin(orb) * longe, lerp(0.25, 0.9, explode) * (1 - grade), Math.cos(orb) * longe - (1 - grade) * (1 - explode) * 1.6];
	const alvo: [number, number, number] = [lerp(0, 0.12, explode) * (1 - grade), 0, lerp(0, -0.2, explode) * (1 - grade)];

	const posGrade = useMemo(() => {
		const r: Partial<Record<Peca, [number, number, number, number]>> = {};
		CARTOES.forEach((c) => {
			const [x, y] = px2w(c.x, c.y - 28);
			r[c.peca] = [x + (c.off ? c.off[0] * c.s : 0), y + (c.off ? c.off[1] * c.s : 0), 0.15, c.s];
		});
		return r;
	}, []);

	// rótulos projetados (fase explodida)
	const rotulos = useMemo(() => {
		const cam = new THREE.PerspectiveCamera(FOV, 1080 / 1920, 0.1, 100);
		cam.position.set(...camPos);
		cam.lookAt(...alvo);
		cam.updateMatrixWorld();
		const rot = new THREE.Euler(rotX, rotY, 0);
		return ROTULOS.map((r) => {
			const v = new THREE.Vector3(r.pos[0], r.pos[1], r.pos[2] * explode).applyEuler(rot).project(cam);
			return {...r, x: (v.x * 0.5 + 0.5) * 1080, y: (-v.y * 0.5 + 0.5) * 1920};
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [t]);
	const rotK = p(t, S.explode + 0.9, S.explode + 1.5) * (1 - p(t, S.grade - 0.1, S.grade + 0.3));

	const telaLuz = modo === 'simples' ? p(t, 2.0, 2.6) : 1;
	const escalaInicial = modo === 'simples' ? lerp(0.16, 1, p(t, 1.8, 2.6, ease.out)) : 1;
	const yInicial = modo === 'simples' ? lerp(-1.25, 0, p(t, 1.8, 2.6, ease.out)) : 0;

	const destaqueK = sel;

	return (
		<AbsoluteFill style={{background: fundo, opacity: 1 - saida * 0.0}}>
			{/* luz de fundo */}
			<AbsoluteFill style={{background: marfim ? 'radial-gradient(ellipse 70% 45% at 50% 45%, #f8f5ef, transparent 70%)' : `radial-gradient(ellipse 70% 40% at 50% 46%, rgba(200,240,49,${0.07 + grade * 0.04}), transparent 70%)`}} />

			<AbsoluteFill style={{transform: `scale(${1 + push * 0.42})`, transformOrigin: '780px 760px', opacity: 1 - saida}}>
				{/* cartões da interface (atrás das peças) */}
				{CARTOES.map((c, i) => {
					const k = p(t, S.ui + i * 0.06, S.ui + 0.6 + i * 0.06, ease.out);
					const ativo = c.peca === 'bateria';
					const dim = 1 - sel * (ativo ? 0 : 0.55);
					return (
						<div
							key={c.peca}
							style={{
								position: 'absolute',
								left: c.x - 225,
								top: c.y - 125,
								width: 450,
								height: 250,
								borderRadius: 30,
								background: marfim ? `rgba(255,255,255,${0.75 * k})` : `rgba(255,255,255,${0.045 * k})`,
								boxShadow: `0 0 0 ${ativo ? 1 + sel * 1.5 : 1}px ${ativo && sel > 0 ? LIMA : marfim ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.12)'}`,
								opacity: k * dim,
								transform: `translateY(${(1 - k) * 30}px)`,
							}}
						>
							<div style={{position: 'absolute', left: 28, bottom: 24, fontFamily: F.grotesk, fontWeight: 600, fontSize: 32, color: tinta, letterSpacing: '-0.02em'}}>{c.nome}</div>
							<div style={{position: 'absolute', right: 26, bottom: 30, fontFamily: F.mono, fontSize: 19, color: ativo && sel > 0 ? LIMA : marfim ? '#777' : '#7e878d'}}>0{i + 1}</div>
						</div>
					);
				})}

				<ThreeCanvas width={1080} height={1920} gl={{antialias: true, toneMappingExposure: marfim ? 1.15 : 1.05}} dpr={1} style={{position: 'absolute', inset: 0}}>
					<Camara pos={camPos} alvo={alvo} fov={FOV} />
					<Estudio intensidade={marfim ? 1.3 : 1.1} tom={marfim ? '#d9d4ca' : '#202326'} />
					<directionalLight position={[3, 4, 5]} intensity={marfim ? 1.4 : 1.6} />
					<directionalLight position={[-4, 1, -3]} intensity={2.2} color={marfim ? '#ffffff' : '#d9f58a'} />
					<pointLight position={[-2, -2, 3]} intensity={6} color="#9fb8ff" />
					<group position={[0, yInicial, 0]} scale={escalaInicial}>
						<Celular
							explode={explode}
							dispersao={dispersao}
							grade={grade}
							posGrade={posGrade}
							destaque="bateria"
							destaqueK={destaqueK}
							rot={[rotX, rotY, 0]}
							telaLuz={telaLuz}
						/>
					</group>
				</ThreeCanvas>

				{/* rótulos da vista explodida */}
				{rotK > 0 &&
					rotulos.map((r, i) => {
						const k = p(t, S.explode + 0.9 + i * 0.06, S.explode + 1.4 + i * 0.06) * (1 - p(t, S.grade - 0.1, S.grade + 0.3));
						const esq = r.x > 540;
						return (
							<div key={r.peca} style={{position: 'absolute', left: r.x, top: r.y, opacity: k, zIndex: 20}}>
								<div style={{position: 'absolute', left: -5, top: -5, width: 10, height: 10, borderRadius: '50%', background: LIMA, boxShadow: `0 0 14px ${LIMA}`}} />
								<div style={{position: 'absolute', top: -1, [esq ? 'left' : 'right']: 10, width: 70 * k, height: 2, background: LIMA}} />
								<div
									style={{
										position: 'absolute',
										top: -19,
										[esq ? 'left' : 'right']: 90,
										whiteSpace: 'nowrap',
										fontFamily: F.mono,
										fontSize: 25,
										fontWeight: 500,
										letterSpacing: '0.04em',
										color: marfim ? '#141416' : GELO,
										background: marfim ? 'rgba(255,255,255,0.8)' : 'rgba(15,17,19,0.72)',
										padding: '6px 12px',
										borderRadius: 8,
									}}
								>
									{r.nome}
								</div>
							</div>
						);
					})}

				{/* cabeçalho do site Núcleo */}
				{ui > 0 && (
					<div style={{position: 'absolute', left: 75, right: 130, top: 300, color: tinta, opacity: ui}}>
						<div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: F.grotesk, fontWeight: 700, fontSize: 36, letterSpacing: '-0.03em'}}>
							<div style={{width: 30, height: 30, borderRadius: 9, border: `3px solid ${LIMA}`, position: 'relative'}}>
								<div style={{position: 'absolute', inset: 7, borderRadius: 3, background: LIMA}} />
							</div>
							Núcleo
							<span style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 18, fontWeight: 400, color: marfim ? '#666' : '#8b949a', letterSpacing: '0.12em'}}>ASSISTÊNCIA TÉCNICA</span>
						</div>
						<div style={{fontFamily: F.grotesk, fontWeight: 500, fontSize: 64, letterSpacing: '-0.04em', lineHeight: 1.0, marginTop: 34}}>
							<Linha t={t} ini={S.ui + 0.1}>
								Qual peça precisa
							</Linha>
							<Linha t={t} ini={S.ui + 0.22}>
								<span>
									de <span style={{color: marfim ? '#5e7d00' : LIMA}}>cuidado?</span>
								</span>
							</Linha>
						</div>
					</div>
				)}

				{/* detalhe do serviço selecionado */}
				{sel > 0 && (
					<div
						style={{
							position: 'absolute',
							left: 75,
							right: 130,
							top: 1362,
							opacity: sel,
							transform: `translateY(${(1 - sel) * 30}px)`,
							display: 'flex',
							alignItems: 'center',
							gap: 22,
							padding: '22px 26px',
							borderRadius: 26,
							background: marfim ? '#141416' : 'rgba(200,240,49,0.1)',
							boxShadow: `0 0 0 1.5px ${LIMA}`,
							fontFamily: F.grotesk,
							color: marfim ? '#fff' : GELO,
							zIndex: 30,
						}}
					>
						<div style={{flex: 1}}>
							<div style={{fontSize: 30, fontWeight: 600}}>Troca de bateria</div>
							<div style={{fontSize: 22, opacity: 0.75, marginTop: 4}}>Avaliação e orçamento antes do serviço</div>
						</div>
						<div style={{background: LIMA, color: GRAF, fontWeight: 700, fontSize: 24, padding: '16px 22px', borderRadius: 16, transform: `scale(${1 + Math.sin(clamp((t - S.toque - 0.9) / 0.4) * Math.PI) * 0.05})`}}>Agendar</div>
					</div>
				)}
				{t > S.toque - 0.3 && t < S.toque + 1.2 && <Toque x={780} y={665} k={toqueK} />}
			</AbsoluteFill>

			{/* ——— abertura 2: página simples que se transforma ——— */}
			{modo === 'simples' && pagina > 0 && (
				<AbsoluteFill style={{background: '#f6f7f8', opacity: pagina, clipPath: `circle(${(1 - cortina) * 160 + 2}% at 50% 56%)`}}>
					<div style={{position: 'absolute', top: 300, left: 75, right: 130, display: 'flex', fontFamily: F.grotesk, fontSize: 28, color: '#3b4146'}}>
						<b>Núcleo</b>
						<span style={{marginLeft: 'auto', opacity: 0.6}}>Menu</span>
					</div>
					<div style={{position: 'absolute', top: 860, left: 0, right: 0, textAlign: 'center', fontFamily: F.grotesk, color: '#16191c'}}>
						<svg width="88" height="140" viewBox="0 0 44 70" fill="none" style={{display: 'block', margin: '0 auto 40px'}}>
							<rect x="2" y="2" width="40" height="66" rx="8" stroke="#16191c" strokeWidth="3" />
							<path d="M17 61h10" stroke="#16191c" strokeWidth="3" strokeLinecap="round" />
						</svg>
						<div style={{fontSize: 64, fontWeight: 600, letterSpacing: '-0.03em'}}>Assistência técnica</div>
						<div style={{fontSize: 32, color: '#6b7277', marginTop: 12}}>Conserto de celulares</div>
						<div style={{display: 'inline-block', marginTop: 40, border: '2px solid #16191c', borderRadius: 999, padding: '18px 40px', fontSize: 28, fontWeight: 600, transform: `scale(${1 - Math.sin(clamp((t - 1.55) / 0.3) * Math.PI) * 0.06})`}}>Ver aparelho</div>
					</div>
					<Toque x={540} y={1290} k={clamp((t - 1.35) / 0.55, 0, 1.4)} />
				</AbsoluteFill>
			)}

			{/* ——— tipografia de direção de arte ——— */}
			{modo === 'simples' && (
				<div style={{position: 'absolute', top: 470, left: 75, right: 130, fontFamily: F.inter, fontWeight: 600, fontSize: 80, letterSpacing: '-0.045em', lineHeight: 1.0, zIndex: 60}}>
					<div style={{color: '#16191c'}}>
						<Linha t={t} ini={0.2} sai={1.7}>
							Parece um
						</Linha>
						<Linha t={t} ini={0.33} sai={1.75}>
							site simples.
						</Linha>
					</div>
					<div style={{position: 'absolute', top: -170, left: 0, color: GELO, fontSize: 96}}>
						<Linha t={t} ini={2.75} sai={d - 0.35}>
							<span>
								Até você <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, color: LIMA}}>tocar.</span>
							</span>
						</Linha>
					</div>
				</div>
			)}
			{modo === 'isto' && (
				<div style={{position: 'absolute', top: 300, left: 75, right: 130, fontFamily: F.inter, fontWeight: 650, fontSize: 104, letterSpacing: '-0.05em', lineHeight: 0.98, color: tinta, zIndex: 60}}>
					<Linha t={t} ini={0.25} sai={d - 0.35}>
						Isto é
					</Linha>
					<Linha t={t} ini={0.4} sai={d - 0.3}>
						<span>
							um <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400}}>site.</span>
						</span>
					</Linha>
				</div>
			)}
			{modo !== 'simples' && <Conceito t={t} ini={modo === 'isto' ? 1.2 : S.ui} fim={d} nome="Núcleo Assistência Técnica" claro={marfim} y={1500} />}
			{modo === 'simples' && <Conceito t={t} ini={2.8} fim={d + 1} nome="Núcleo Assistência Técnica" claro={false} y={1452} />}

			{/* transição: linha de luz para a próxima cena */}
			{saida > 0 && (
				<div style={{position: 'absolute', left: 540 - 520 * saida, width: 1040 * saida, top: 958, height: 3, background: '#fff', boxShadow: '0 0 24px rgba(255,255,255,0.9)', opacity: saida}} />
			)}
		</AbsoluteFill>
	);
};
