import React from 'react';
import {AbsoluteFill} from 'remotion';
import {config} from '../config';
import {SANS, MONO, SERIF} from '../fonts';
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
					top: linhaY - tamValor * 0.86 - (V ? 300 : 245),
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
			<div style={{position: 'absolute', left: 0, right: 0, top: linhaY - tamValor * 0.86 - (V ? 236 : 190), textAlign: 'center', fontFamily: SANS, fontSize: V ? 50 : 42, fontWeight: 500, letterSpacing: '-0.03em', color: '#f5f5f7', opacity: p(t, M.precoRotulo + 0.3, M.precoRotulo + 0.9), transform: `translateY(${(1 - p(t, M.precoRotulo + 0.3, M.precoRotulo + 0.9)) * 16}px)`}}>
				{O.produto}
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: linhaY - tamValor * 0.86 - (V ? 150 : 120), display: 'flex', justifyContent: 'center', opacity: p(t, M.de, M.de + 0.4)}}>
				<div style={{position: 'relative', fontFamily: SANS, fontSize: V ? 62 : 50, fontWeight: 400, color: '#9a9da4', letterSpacing: '-0.02em'}}>
					de {O.de}
					<div style={{position: 'absolute', left: -10, top: '54%', height: 4, borderRadius: 2, background: '#f5f5f7', width: `calc(${p(t, M.risco, M.risco + 0.45, ease.inOut) * 100}% + 20px)`, transform: 'rotate(-4deg)', boxShadow: '0 0 10px rgba(255,255,255,0.5)'}} />
				</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, textAlign: 'center', top: linhaY - tamValor * 0.86 - (V ? 72 : 58), fontFamily: SERIF, fontStyle: 'italic', fontSize: V ? 46 : 38, color: '#f5f5f7', opacity: p(t, M.preco - 0.3, M.preco + 0.2)}}>por</div>
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
			{/* validade */}
			<div style={{position: 'absolute', left: 0, right: 0, top: linhaY + (V ? 64 : 44), display: 'flex', justifyContent: 'center', opacity: p(t, M.validade, M.validade + 0.45), transform: `translateY(${(1 - p(t, M.validade, M.validade + 0.45)) * 14}px)`}}>
				<div style={{padding: V ? '18px 38px' : '14px 30px', borderRadius: 999, background: 'rgba(10,10,12,0.85)', boxShadow: '0 0 0 1.5px rgba(255,255,255,0.55)', fontFamily: SANS, fontWeight: 600, fontSize: V ? 40 : 32, color: '#f5f5f7'}}>{O.validade}</div>
			</div>
			{/* o que inclui + escopo */}
			<div style={{position: 'absolute', left: V ? 90 : 260, right: V ? 90 : 260, top: linhaY + (V ? 200 : 140), textAlign: 'center', fontFamily: MONO, fontSize: V ? 24 : 21, lineHeight: 1.6, letterSpacing: '0.02em', color: '#c9ccd2', opacity: det}}>
				{O.detalhe}
			</div>
			<div style={{position: 'absolute', left: V ? 110 : 330, right: V ? 110 : 330, top: linhaY + (V ? 310 : 215), textAlign: 'center', fontFamily: SANS, fontSize: V ? 23 : 19, lineHeight: 1.4, color: '#7d8088', opacity: p(t, M.validade + 0.3, M.validade + 0.8)}}>
				{O.nota}
			</div>
		</AbsoluteFill>
	);
};
