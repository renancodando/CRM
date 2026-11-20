import React from 'react';
import {AbsoluteFill} from 'remotion';
import {config} from '../config';
import {SANS, SERIF, MONO} from '../fonts';
import {useT, useLayout, M, CENAS, p, ease, lerp} from '../lib/tempo';
import {COR} from '../lib/estilo';
import {Navegador} from '../componentes/Molduras';
import {Linha} from '../componentes/Texto';
import {VaoDesktop, BrasaDesktop, LustroDesktop} from '../sites/novos/Desktop';

export const PASSO = 34; // graus entre telas

/** Geometria compartilhada com a cena seguinte (a tela da frente é a mesma) */
export const geometriaVitrine = (W: number, H: number, V: boolean) => {
	const largura = V ? 940 : 1100;
	const barra = Math.round(largura * 0.036);
	const altura = largura * 0.625 + barra;
	const cy = V ? 860 : 500;
	return {largura, altura, cx: W / 2, cy, raio: V ? 1500 : 1750};
};

const SITES = [
	{rotulo: 'Arquitetura', marco: M.site1},
	{rotulo: 'Restaurante', marco: M.site2},
	{rotulo: 'Estética automotiva', marco: M.site3},
];

export const Vitrine: React.FC = () => {
	const t = useT();
	const {W, H, V} = useLayout();
	const [ini, fim] = CENAS.vitrine;
	if (t < ini - 0.6 || t > fim + 0.9) return null;

	const g = geometriaVitrine(W, H, V);
	const entra = p(t, ini - 0.15, ini + 0.8, ease.out);
	const teta =
		lerp(-28, 0, p(t, ini - 0.4, ini + 0.8, ease.camera)) +
		PASSO * p(t, M.site2 - 0.45, M.site2 + 0.35, ease.camera) +
		PASSO * p(t, M.site3 - 0.45, M.site3 + 0.35, ease.camera);
	const sai = p(t, fim - 0.15, fim + 0.5, ease.inOut);
	const foco = Math.round(teta / PASSO);

	return (
		<AbsoluteFill>
			{/* estúdio: luz de cima e piso */}
			<AbsoluteFill
				style={{
					opacity: entra * (1 - p(t, fim + 0.2, fim + 0.9)),
					background: [
						`radial-gradient(ellipse 60% 35% at 50% ${((g.cy - g.altura * 0.9) / H) * 100}%, rgba(200,205,215,0.12), transparent 70%)`,
						`linear-gradient(180deg, transparent ${((g.cy + g.altura / 2) / H) * 100}%, rgba(40,42,48,0.55) ${((g.cy + g.altura / 2) / H) * 100 + 0.3}%, rgba(10,10,12,0) 100%)`,
					].join(','),
				}}
			/>
			<AbsoluteFill style={{perspective: 2000, perspectiveOrigin: `50% ${(g.cy / H) * 100}%`}}>
				<div
					style={{
						position: 'absolute',
						left: g.cx,
						top: g.cy,
						transformStyle: 'preserve-3d',
						transform: `translateZ(${lerp(-900, 0, entra) - g.raio}px) rotateY(${-teta}deg)`,
						opacity: entra,
					}}
				>
					{SITES.map((s, i) => {
						const a = i * PASSO;
						const f = Math.max(0, 1 - Math.abs(a - teta) / PASSO);
						// a tela da frente final é entregue à cena "Responsivo"
						if (i === 2 && t >= CENAS.responsivo[0]) return null;
						const opSaida = i === 2 ? 1 : 1 - sai;
						const local = s.marco + 0.15;
						const rolagem = lerp(0, 330, p(t, local + 0.75, local + 1.45, ease.inOut));
						const hover = p(t, local + 0.45, local + 0.7) * (1 - p(t, local + 1.3, local + 1.5));
						const site =
							i === 0 ? (
								<VaoDesktop t={t} ini={local} rolagem={rolagem} hover={hover} />
							) : i === 1 ? (
								<BrasaDesktop t={t} ini={local} rolagem={rolagem} hover={hover} />
							) : (
								<LustroDesktop t={t} ini={local} rolagem={rolagem * 0} hover={hover} />
							);
						return (
							<div
								key={i}
								style={{
									position: 'absolute',
									left: -g.largura / 2,
									top: -g.altura / 2,
									transform: `rotateY(${a}deg) translateZ(${g.raio}px) translateY(${(1 - f) * 20}px)`,
									opacity: opSaida,
									WebkitBoxReflect: 'below 26px linear-gradient(transparent 72%, rgba(255,255,255,0.13))',
								}}
							>
								<Navegador largura={g.largura} brilho={0.32 + 0.68 * f}>
									{site}
								</Navegador>
							</div>
						);
					})}
				</div>
			</AbsoluteFill>

			{/* rótulo do projeto */}
			{SITES.map((s, i) => {
				const k = p(t, s.marco + 0.05, s.marco + 0.6) * (1 - p(t, (SITES[i + 1]?.marco ?? fim + 0.1) - 0.4, (SITES[i + 1]?.marco ?? fim + 0.1) - 0.1));
				if (k <= 0) return null;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: V ? g.cy - g.altura / 2 - 110 : 52,
							display: 'flex',
							justifyContent: 'center',
							alignItems: 'center',
							gap: 22,
							fontFamily: MONO,
							fontSize: V ? 26 : 22,
							letterSpacing: '0.28em',
							textTransform: 'uppercase',
							color: COR.prata,
							opacity: k,
							transform: `translateY(${(1 - k) * 14}px)`,
						}}
					>
						<span style={{color: COR.branco}}>0{i + 1}</span>
						<span style={{width: 60, height: 1, background: 'rgba(255,255,255,0.4)'}} />
						{s.rotulo}
					</div>
				);
			})}

			{/* frase */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: V ? 1430 : 920,
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 600,
					fontSize: V ? 86 : 58,
					letterSpacing: '-0.04em',
					lineHeight: 1.05,
					color: COR.branco,
					display: V ? 'block' : 'flex',
					justifyContent: 'center',
					gap: '0.3em',
				}}
			>
				<Linha t={t} ini={ini + 0.35} sai={fim - 0.45}>
					{config.vitrine.linha1}
				</Linha>
				<Linha t={t} ini={ini + 0.75} sai={fim - 0.4}>
					<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '1.14em', color: COR.prata}}>{config.vitrine.linha2}</span>
				</Linha>
			</div>
		</AbsoluteFill>
	);
};
