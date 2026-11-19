import React from 'react';
import {AbsoluteFill} from 'remotion';
import {config} from '../config';
import {SANS, MONO} from '../fonts';
import {useT, useLayout, M, CENAS, p, ease, lerp} from '../lib/tempo';
import {COR, metal} from '../lib/estilo';

export const Oferta: React.FC = () => {
	const t = useT();
	const {W, V} = useLayout();
	const [ini, fim] = CENAS.preco;
	if (t < ini || t > fim + 0.8) return null;
	const O = config.oferta;

	const linhaY = V ? 1090 : 640;
	const tamValor = V ? 400 : 330;

	// linha de luz atravessa o centro
	const corre = p(t, M.linhaLuz, M.linhaLuz + 0.55, ease.inOut);
	const linhaLarg = V ? 940 : 1300;
	const sai = p(t, fim - 0.5, fim + 0.1, ease.in);
	const contrai = p(t, fim - 0.5, fim, ease.inOut);

	const rot = p(t, M.precoRotulo, M.precoRotulo + 0.9, ease.out);
	const sobe = p(t, M.preco - 0.08, M.preco + 0.75, ease.out);
	const brilho = p(t, M.brilhoPreco, M.brilhoPreco + 1.0, ease.inOut);
	const det = p(t, M.brilhoPreco + 0.2, M.brilhoPreco + 0.9);
	const push = lerp(1, 1.045, p(t, M.preco, fim, ease.suave));
	const halo = p(t, M.preco, M.preco + 0.6) * (1 - sai);

	const valor = (
		<div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', fontFamily: SANS, lineHeight: 0.8}}>
			<span style={{fontSize: tamValor * 0.3, fontWeight: 300, letterSpacing: '-0.02em', marginTop: tamValor * 0.05, marginRight: tamValor * 0.06, ...metal(brilho - 0.1)}}>{O.moeda}</span>
			<span style={{fontSize: tamValor, fontWeight: 700, letterSpacing: '-0.06em', ...metal(brilho)}}>{O.valor}</span>
		</div>
	);

	return (
		<AbsoluteFill style={{transform: `scale(${push})`, opacity: 1 - sai}}>
			{/* halo */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse ${V ? '60% 18%' : '35% 30%'} at 50% ${(linhaY / (V ? 1920 : 1080)) * 100}%, rgba(220,225,235,0.16), transparent 70%)`,
					opacity: halo,
				}}
			/>
			{/* rótulo */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: linhaY - tamValor * 0.86 - (V ? 120 : 100),
					textAlign: 'center',
					fontFamily: SANS,
					fontWeight: 500,
					fontSize: V ? 40 : 34,
					textTransform: 'uppercase',
					letterSpacing: `${lerp(0.7, 0.42, rot)}em`,
					color: COR.prata,
					opacity: rot,
					filter: `blur(${(1 - rot) * 6}px)`,
				}}
			>
				{O.rotulo}
			</div>
			{/* valor nascendo da linha */}
			<div style={{position: 'absolute', left: 0, right: 0, top: linhaY - tamValor * 0.86, height: tamValor * 0.86, overflow: 'hidden'}}>
				<div style={{transform: `translateY(${(1 - sobe) * 100}%)`, filter: `blur(${(1 - sobe) * 10}px)`}}>{valor}</div>
			</div>
			{/* reflexo */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: linhaY + 6,
					height: tamValor * 0.5,
					overflow: 'hidden',
					opacity: 0.16,
					maskImage: 'linear-gradient(180deg, #000, transparent 80%)',
					WebkitMaskImage: 'linear-gradient(180deg, #000, transparent 80%)',
				}}
			>
				<div style={{transform: `scaleY(-1) translateY(${(1 - sobe) * 100}%)`, transformOrigin: '50% 0', marginTop: tamValor * 0.86 * 0, filter: 'blur(3px)'}}>
					<div style={{transform: `translateY(${-tamValor * 0.86}px)`}}>{valor}</div>
				</div>
			</div>
			{/* linha de luz */}
			<div
				style={{
					position: 'absolute',
					top: linhaY,
					left: W / 2 - (linhaLarg / 2) * (1 - contrai),
					width: linhaLarg * corre * (1 - contrai),
					height: 2,
					background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.85) 18%, #fff 50%, rgba(255,255,255,0.85) 82%, transparent)',
					boxShadow: '0 0 16px rgba(255,255,255,0.5)',
				}}
			/>
			{corre < 1 && (
				<div
					style={{
						position: 'absolute',
						top: linhaY - 30,
						left: W / 2 - linhaLarg / 2 + linhaLarg * corre - 30,
						width: 60,
						height: 62,
						borderRadius: '50%',
						background: 'radial-gradient(circle, rgba(255,255,255,0.9), rgba(255,255,255,0) 65%)',
						opacity: Math.sin(corre * Math.PI),
					}}
				/>
			)}
			{/* detalhe */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: linhaY + (V ? 150 : 110),
					textAlign: 'center',
					fontFamily: MONO,
					fontSize: V ? 22 : 22,
					letterSpacing: V ? '0.02em' : '0.08em',
					color: COR.cinza,
					opacity: det,
					transform: `translateY(${(1 - det) * 12}px)`,
					whiteSpace: 'pre',
				}}
			>
				{O.detalhe}
			</div>
		</AbsoluteFill>
	);
};
