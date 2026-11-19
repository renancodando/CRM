import React from 'react';
import {AbsoluteFill} from 'remotion';
import {config} from '../config';
import {SANS, SERIF} from '../fonts';
import {useT, useLayout, M, CENAS, p, ease, lerp} from '../lib/tempo';
import {COR} from '../lib/estilo';
import {Logo} from '../componentes/Logo';
import {Linha} from '../componentes/Texto';

/** Riscos de luz radiais — a câmera atravessando a estrutura */
const Travessia: React.FC<{t: number; W: number; H: number}> = ({t, W, H}) => {
	const k = p(t, M.travessia - 0.1, M.travessia + 0.6, (x) => x);
	if (k <= 0 || k >= 1) return null;
	return (
		<AbsoluteFill style={{overflow: 'hidden'}}>
			{Array.from({length: 46}, (_, i) => {
				const ang = (i / 46) * Math.PI * 2 + Math.sin(i * 7.1) * 0.2;
				const r0 = 80 + ((i * 97) % 300);
				const vel = 0.7 + ((i * 31) % 10) / 10;
				const d = r0 + k * vel * Math.max(W, H) * 0.9;
				const comp = 60 + k * 420 * vel;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: W / 2 + Math.cos(ang) * d,
							top: H / 2 + Math.sin(ang) * d,
							width: comp,
							height: 1.5,
							transformOrigin: '0 50%',
							transform: `rotate(${ang}rad)`,
							background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.75))',
							opacity: Math.sin(k * Math.PI) * 0.8,
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

export const Marca: React.FC = () => {
	const t = useT();
	const {W, H, V} = useLayout();
	const [ini, fim] = CENAS.logo;
	if (t < M.travessia - 0.2 || t > fim + 0.6) return null;

	const sai = p(t, fim - 0.35, fim + 0.45, ease.in);
	const rotY = lerp(-16, 7, p(t, M.logo - 0.2, fim + 0.4, ease.suave));
	const dolly = lerp(0.9, 1.04, p(t, M.logo - 0.2, fim, ease.suave));
	const brilho = p(t, M.brilhoLogo, M.brilhoLogo + 1.1, ease.inOut);
	const spot = p(t, M.logo - 0.3, M.logo + 0.9);

	return (
		<AbsoluteFill>
			<Travessia t={t} W={W} H={H} />
			{/* cone de luz */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse ${V ? '70% 30%' : '45% 55%'} at 50% ${V ? 42 : 40}%, rgba(210,214,224,0.13), transparent 70%)`,
					opacity: spot * (1 - sai),
				}}
			/>
			<AbsoluteFill style={{perspective: 1600}}>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: V ? 760 : 380,
						display: 'flex',
						flexDirection: 'column',
						alignItems: 'center',
						transform: `translateZ(${-sai * 900}px) translateY(${-sai * 160}px) rotateX(${4 + sai * 10}deg) rotateY(${rotY}deg) scale(${dolly})`,
						opacity: 1 - sai,
						transformStyle: 'preserve-3d',
					}}
				>
					<Logo t={t} ini={M.logo} tamanho={V ? 196 : 210} brilho={brilho} />
				</div>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: V ? 1130 : 720,
						textAlign: 'center',
						fontFamily: SANS,
						fontSize: V ? 50 : 46,
						fontWeight: 400,
						letterSpacing: '-0.015em',
						color: COR.prata,
						display: V ? 'block' : 'flex',
						justifyContent: 'center',
						gap: '0.3em',
						opacity: 1 - sai,
						transform: `translateY(${-sai * 60}px)`,
					}}
				>
					{(() => {
						const [a, b] = config.marca.assinatura.split('. ');
						return (
							<>
								<Linha t={t} ini={M.logo + 1.05}>
									{a}.
								</Linha>
								<Linha t={t} ini={M.logo + 1.25}>
									<span style={{fontFamily: SERIF, fontStyle: 'italic', color: COR.branco, fontSize: '1.14em'}}>{b}</span>
								</Linha>
							</>
						);
					})()}
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
