import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Environment, Lightformer} from '@react-three/drei';
import {F, p, ease, lerp, useLocal, usePalco} from '../lib/base';
import {Camara} from '../modelos/comum';
import {Edificio} from '../modelos/Edificio';
import {Linha, MolduraTela, Conceito, Cursor} from '../comp/ui';

const OSSO = '#E9E4DA';
const TINTA = '#2B2A27';

export type TextoAbertura = 'narrativa' | 'espera' | 'nenhum';

/** Navegação do site Vão (DOM) */
export const NavVao: React.FC<{k: number; claro: boolean}> = ({k, claro}) => {
	const cor = claro ? TINTA : '#efebe4';
	return (
		<div style={{position: 'absolute', top: 290, left: 70, right: 130, display: 'flex', alignItems: 'center', opacity: k, transform: `translateY(${(1 - k) * -16}px)`, color: cor, zIndex: 50}}>
			<div style={{fontFamily: F.archivo, fontStretch: '125%', fontWeight: 800, fontSize: 40, letterSpacing: '0.24em'}}>VÃO</div>
			<div style={{marginLeft: 'auto', display: 'flex', gap: 34, fontFamily: F.archivo, fontStretch: '100%', fontSize: 23, letterSpacing: '0.06em', opacity: 0.85}}>
				<span>Projetos</span>
				<span>Estúdio</span>
				<span>Contato</span>
			</div>
		</div>
	);
};

export const Arquitetura: React.FC<{texto?: TextoAbertura}> = ({texto = 'narrativa'}) => {
	const {t, d} = useLocal();
	const palco = usePalco();
	const noite = palco === 'preto';
	const fundo = noite ? '#060607' : palco === 'marfim' ? '#ECE7DE' : OSSO;
	const claro = !noite;
	const tinta = claro ? TINTA : '#efebe4';

	// ——— progresso da construção
	const plano = 0.18 + 0.82 * p(t, 0.0, 1.5, ease.inOut);
	const ergue = p(t, 0.95, 3.3, (x) => x);
	const luz = p(t, 3.2, 4.0);
	const ui = p(t, 3.3, 4.3, ease.out);

	// ——— câmera: de cima (planta) para órbita baixa
	const desce = p(t, 0.2, 3.4, ease.camera);
	const ang = lerp(0.95, 0.42, p(t, 0, d, ease.suave));
	const raio = lerp(9.5, 16.5, desce) - p(t, 3.4, d, ease.suave) * 1.2;
	const alt = lerp(15, 3.6, desce);
	const pos: [number, number, number] = [Math.sin(ang) * raio, alt, Math.cos(ang) * raio];
	const alvo: [number, number, number] = [0.15, lerp(0, 1.35, desce), lerp(0.4, 0, desce)];
	const rolagem = lerp(-0.25, 0, desce);

	const k1 = texto === 'espera';

	return (
		<AbsoluteFill style={{background: fundo}}>
			<ThreeCanvas width={1080} height={1920} shadows gl={{antialias: true, toneMappingExposure: noite ? 1.15 : 1.35}} dpr={1}>
				<Camara pos={pos} alvo={alvo} fov={34} rolagem={rolagem} />
				<color attach="background" args={[fundo]} />
				<fog attach="fog" args={[fundo, 18, 34]} />
				<hemisphereLight args={[noite ? '#c9d2e0' : '#fffaf0', noite ? '#0a0a0c' : '#cfc6b6', noite ? 0.25 : 0.95]} />
				<directionalLight
					position={noite ? [4, 9, 3] : [-7, 7, 5]}
					intensity={noite ? 3.2 : 2.6}
					castShadow
					shadow-mapSize={[2048, 2048]}
					shadow-camera-left={-7}
					shadow-camera-right={7}
					shadow-camera-top={7}
					shadow-camera-bottom={-7}
					shadow-bias={-0.0004}
					color={noite ? '#e8eefc' : '#fff4e2'}
				/>
				{noite && <spotLight position={[-3, 7, 6]} angle={0.5} penumbra={0.8} intensity={60} color="#ffe2b8" />}
				<Environment resolution={128}>
					<Lightformer form="rect" intensity={noite ? 0.6 : 2} position={[0, 5, 4]} scale={[10, 3, 1]} rotation-x={-0.6} />
					<Lightformer form="rect" intensity={1} position={[-6, 2, 0]} scale={[3, 4, 1]} rotation-y={Math.PI / 2} />
				</Environment>
				<Edificio plano={plano} ergue={ergue} luzInterna={luz * (noite ? 1.4 : 0.18)} noite={noite} />
			</ThreeCanvas>

			{/* ——— tipografia da abertura ——— */}
			<div style={{position: 'absolute', top: 330, left: 70, right: 130, fontFamily: F.inter, color: tinta, letterSpacing: '-0.045em', lineHeight: 1.0, zIndex: 40}}>
				{texto === 'narrativa' && (
					<>
						<div style={{fontSize: 74, fontWeight: 600}}>
							<Linha t={t} ini={0.35} sai={2.85}>
								Antes de entrar
							</Linha>
							<Linha t={t} ini={0.5} sai={2.9}>
								pela sua porta,
							</Linha>
						</div>
						<div style={{position: 'absolute', top: 0, left: 0, fontSize: 74, fontWeight: 600}}>
							<Linha t={t} ini={3.0} sai={d - 0.75}>
								o cliente entra
							</Linha>
							<Linha t={t} ini={3.15} sai={d - 0.7}>
								<span>
									no seu <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.16em'}}>site.</span>
								</span>
							</Linha>
						</div>
					</>
				)}
				{k1 && (
					<>
						<div style={{fontSize: 150, fontWeight: 700, letterSpacing: '-0.06em'}}>
							<Linha t={t} ini={0.25} sai={2.75}>
								Espera.
							</Linha>
						</div>
						<div style={{position: 'absolute', top: 0, left: 0, fontSize: 84, fontWeight: 600}}>
							<Linha t={t} ini={2.95} sai={d - 0.6}>
								…isso é
							</Linha>
							<Linha t={t} ini={3.1} sai={d - 0.55}>
								<span>
									um <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.16em'}}>site?</span>
								</span>
							</Linha>
						</div>
					</>
				)}
			</div>

			{/* ——— revelação: é a página inicial de um site ——— */}
			<MolduraTela k={p(t, 3.2, 4.2)} cor={claro ? 'rgba(43,42,39,0.55)' : 'rgba(239,235,228,0.6)'} />
			<NavVao k={p(t, d - 0.7, d - 0.1)} claro={claro} />
			<div style={{position: 'absolute', left: 70, top: 1170, color: tinta, fontFamily: F.archivo, zIndex: 45, opacity: ui}}>
				<div style={{fontSize: 22, letterSpacing: '0.3em', fontStretch: '125%', opacity: 0.7}}>ARQUITETURA RESIDENCIAL AUTORAL</div>
				<div style={{fontSize: 92, fontWeight: 300, fontStretch: '112%', letterSpacing: '-0.03em', lineHeight: 0.98, marginTop: 18}}>
					<Linha t={t} ini={3.45}>
						Casas que
					</Linha>
					<Linha t={t} ini={3.6}>
						<span style={{fontWeight: 700}}>respiram.</span>
					</Linha>
				</div>
			</div>
			{ui > 0 && (
				<div style={{position: 'absolute', left: 70, top: 1400, display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.archivo, fontSize: 22, letterSpacing: '0.14em', color: tinta, opacity: ui * 0.8, zIndex: 45}}>
					<div style={{width: 2, height: 44, background: tinta, opacity: 0.3, position: 'relative', overflow: 'hidden'}}>
						<div style={{position: 'absolute', left: 0, top: `${((t * 60) % 100) - 30}%`, width: 2, height: '30%', background: tinta}} />
					</div>
					ROLE PARA EXPLORAR
				</div>
			)}
			{ui > 0 && <Cursor x={lerp(860, 640, p(t, 3.8, d, ease.inOut))} y={lerp(1300, 980, p(t, 3.8, d, ease.inOut))} opacidade={p(t, 3.8, 4.1)} escala={1.3} />}
			<Conceito t={t} ini={3.8} fim={d + 5} nome="Vão Arquitetura" claro={claro} y={1452} />
		</AbsoluteFill>
	);
};
