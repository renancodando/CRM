import React from 'react';
import {AbsoluteFill} from 'remotion';
import {config} from '../config';
import {SANS, MONO} from '../fonts';
import {useT, useLayout, M, CENAS, p, ease, lerp, flutua} from '../lib/tempo';
import {COR} from '../lib/estilo';
import {Linha} from '../componentes/Texto';
import {IconeCadeado} from '../componentes/Icones';
import {SitePrecisionDesktop, SitePrecisionMobile, Mapa, VERDE_WHATS} from '../sites/PrecisionCell';
import {geometriaVitrine} from './Vitrine';

const BalaoMensagem: React.FC<{k: number}> = ({k}) => (
	<div
		style={{
			background: '#0f2a22',
			border: '1px solid rgba(80,200,140,0.25)',
			borderRadius: '26px 26px 8px 26px',
			padding: '22px 26px 16px',
			width: 370,
			color: '#e9f5ee',
			fontFamily: SANS,
			boxShadow: '0 30px 60px -10px rgba(0,0,0,0.8)',
			opacity: k,
			transform: `scale(${0.85 + 0.15 * k})`,
			transformOrigin: '100% 100%',
		}}
	>
		<div style={{fontSize: 18, color: '#6fd39d', fontWeight: 600, marginBottom: 8}}>Nova mensagem pelo site</div>
		<div style={{fontSize: 25, lineHeight: 1.35}}>Olá! Vi o site de vocês e gostaria de um orçamento.</div>
		<div style={{textAlign: 'right', fontSize: 17, color: '#8fb8a3', marginTop: 8}}>
			10:24 <span style={{color: '#53bdeb', letterSpacing: '-0.3em'}}>✓✓</span>
		</div>
	</div>
);

export const Responsivo: React.FC = () => {
	const t = useT();
	const {W, H, V} = useLayout();
	const [ini, fim] = CENAS.responsivo;
	if (t < ini || t > fim + 0.7) return null;

	const g = geometriaVitrine(W, H, V);
	const m = p(t, M.morph, M.morph + 1.0, ease.inOut);
	const mov = p(t, M.morph - 0.1, M.morph + 1.1, ease.inOut);

	// destino: celular
	const fw = V ? 450 : 390;
	const fh = fw * 2.06;
	const fcx = V ? W / 2 : 560;
	const fcy = V ? 800 : 540;

	const w = lerp(g.largura, fw, m);
	const h = lerp(g.altura, fh, m);
	const cx = lerp(g.cx, fcx, mov);
	const cy = lerp(g.cy, fcy, mov);
	const borda = lerp(0, 14, p(m, 0.3, 1));
	const raio = lerp(g.largura * 0.014, 64, m);
	const barraNav = Math.round(g.largura * 0.036) * (1 - p(m, 0, 0.5));
	const statusH = 34 * p(m, 0.5, 1);

	const desk = 1 - p(m, 0.3, 0.65, ease.inOut);
	const mob = p(m, 0.25, 0.6, ease.inOut);

	const giroY = lerp(0, V ? -14 : -18, p(t, M.morph + 0.7, M.morph + 1.7, ease.inOut)) + flutua(t, 3, 1.5);
	const giroX = lerp(0, 5, p(t, M.morph + 0.7, M.morph + 1.7, ease.inOut));
	const sai = p(t, fim - 0.55, fim + 0.35, ease.in);

	const telaW = w - borda * 2;
	const telaH = h - borda * 2;
	const escMob = (fw - 28) / 390; // escala final do celular: o layout móvel é revelado pelo estreitamento
	const rolagem = lerp(0, 70, p(t, M.morph + 0.9, M.toqueWhats - 0.05, ease.inOut));
	const toque = p(t, M.toqueWhats, M.toqueWhats + 0.55, (x) => x);
	const dedo = p(t, M.toqueWhats - 0.25, M.toqueWhats) * (1 - p(t, M.toqueWhats + 0.3, M.toqueWhats + 0.5));

	const balao = p(t, M.mensagem, M.mensagem + 0.6, ease.out);
	const mapa = p(t, M.mapa, M.mapa + 0.7, ease.out);

	return (
		<AbsoluteFill>
			{/* luz que acompanha o aparelho */}
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse ${V ? '55% 32%' : '30% 50%'} at ${(fcx / W) * 100}% ${(fcy / H) * 100}%, rgba(200,206,220,0.10), transparent 70%)`,
					opacity: m * (1 - sai),
				}}
			/>
			<AbsoluteFill style={{perspective: 2000, perspectiveOrigin: `${(cx / W) * 100}% ${(cy / H) * 100}%`}}>
				<div
					style={{
						position: 'absolute',
						left: cx - w / 2,
						top: cy - h / 2,
						width: w,
						height: h,
						transformStyle: 'preserve-3d',
						transform: `translateZ(${-sai * 1100}px) rotateX(${giroX + sai * 8}deg) rotateY(${giroY}deg)`,
						opacity: 1 - p(t, fim - 0.2, fim + 0.35),
					}}
				>
					{/* corpo do aparelho */}
					<div
						style={{
							position: 'absolute',
							inset: 0,
							borderRadius: raio,
							background: '#0b0b0d',
							padding: borda,
							boxShadow: [
								`0 0 0 ${1.5 * m}px rgba(160,165,175,${0.9 * m})`,
								`0 0 0 ${3 * m}px rgba(40,42,46,${m})`,
								'0 0 0 1px rgba(255,255,255,0.10)',
								'0 60px 120px -30px rgba(0,0,0,0.95)',
								`inset 0 0 0 ${2 * m}px rgba(255,255,255,${0.06 * m})`,
							].join(','),
							WebkitBoxReflect: `below 30px linear-gradient(transparent 80%, rgba(255,255,255,${0.1 * (1 - m * 0.4)}))`,
						}}
					>
						<div style={{width: telaW, height: telaH, borderRadius: Math.max(0, raio - borda), overflow: 'hidden', position: 'relative', background: '#f3f5fb'}}>
							{/* barra do navegador desktop */}
							{barraNav > 0.5 && (
								<div
									style={{
										height: barraNav,
										background: 'linear-gradient(180deg,#26272b,#1d1e21)',
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										gap: 6,
										fontFamily: SANS,
										fontSize: barraNav * 0.3,
										color: '#a7aab1',
										overflow: 'hidden',
									}}
								>
									<IconeCadeado size={barraNav * 0.28} color="#7d8088" /> www.suaempresa.com.br
								</div>
							)}
							{/* desktop */}
							{desk > 0 && (
								<div style={{position: 'absolute', left: 0, top: barraNav, opacity: desk, width: 1440, height: 900, transform: `scale(${telaW / 1440})`, transformOrigin: '0 0'}}>
									<SitePrecisionDesktop t={99} ini={0} />
								</div>
							)}
							{/* mobile */}
							{mob > 0 && (
								<div style={{position: 'absolute', inset: 0, opacity: mob}}>
									<div
										style={{
											height: statusH,
											background: '#fff',
											display: 'flex',
											alignItems: 'flex-end',
											justifyContent: 'space-between',
											padding: `0 ${30 * escMob}px 4px`,
											fontFamily: SANS,
											fontWeight: 600,
											fontSize: 15 * escMob,
											color: '#091943',
											position: 'relative',
											zIndex: 2,
										}}
									>
										<span>10:24</span>
										<div style={{position: 'absolute', left: '50%', top: 8, width: 12, height: 12, marginLeft: -6, borderRadius: '50%', background: '#0b0b0d'}} />
										<span style={{display: 'flex', gap: 4, alignItems: 'center'}}>
											<span style={{width: 18, height: 10, borderRadius: 3, border: '1.5px solid #091943', display: 'inline-block'}} />
										</span>
									</div>
									<div style={{width: 390, transform: `scale(${escMob})`, transformOrigin: '0 0', position: 'relative'}}>
										<SitePrecisionMobile rolagem={rolagem} toque={toque} dedo={dedo} />
										
									</div>
								</div>
							)}
							{/* reflexo de vidro */}
							<div
								style={{
									position: 'absolute',
									inset: 0,
									background: 'linear-gradient(115deg, rgba(255,255,255,0.0) 40%, rgba(255,255,255,0.10) 48%, rgba(255,255,255,0) 58%)',
									opacity: m,
									transform: `translateX(${lerp(-30, 30, p(t, M.morph, fim))}%)`,
								}}
							/>
						</div>
					</div>

					{/* elementos que saltam da tela */}
					{balao > 0 && (
						<div style={{position: 'absolute', right: V ? w - 140 : w - 60, top: V ? 70 : 60, transform: `translateZ(${140 * balao}px)`}}>
							<BalaoMensagem k={balao} />
						</div>
					)}
					{mapa > 0 && (
						<div
							style={{
								position: 'absolute',
								left: w - 90,
								top: V ? h * 0.56 : h * 0.5,
								transform: `translateZ(${180 * mapa}px) translateY(${(1 - mapa) * 40}px)`,
								opacity: mapa,
								background: '#fff',
								borderRadius: 24,
								padding: 14,
								boxShadow: '0 40px 80px -10px rgba(0,0,0,0.85)',
								fontFamily: SANS,
							}}
						>
							<Mapa w={V ? 330 : 360} h={V ? 200 : 210} pulso={(t * 0.9) % 1} />
							<div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '14px 6px 4px', fontSize: 21, fontWeight: 600, color: '#091943'}}>
								<div style={{width: 11, height: 11, borderRadius: '50%', background: VERDE_WHATS}} />
								Aberto agora <span style={{fontWeight: 400, color: '#7a84a0'}}>· até 18h</span>
							</div>
						</div>
					)}
				</div>
			</AbsoluteFill>

			{/* benefícios */}
			<div
				style={{
					position: 'absolute',
					left: V ? 100 : 1200,
					top: V ? 1440 : 330,
					width: V ? 770 : 640,
					fontFamily: SANS,
					fontSize: V ? 62 : 60,
					fontWeight: 600,
					letterSpacing: '-0.035em',
					lineHeight: 1.08,
					color: COR.branco,
					display: 'flex',
					flexDirection: 'column',
					gap: V ? 22 : 30,
					opacity: 1 - sai,
				}}
			>
				{config.beneficios.map((b, i) => {
					const a = M.morph + 0.75 + i * 0.75;
					const linhaK = p(t, a - 0.05, a + 0.5, ease.out);
					return (
						<div key={b} style={{display: 'flex', gap: 26, alignItems: 'flex-start'}}>
							<div style={{fontFamily: MONO, fontSize: V ? 22 : 20, color: COR.cinza, paddingTop: V ? 22 : 22, width: 44, opacity: linhaK, letterSpacing: '0.1em'}}>0{i + 1}</div>
							<div style={{flex: 1}}>
								<Linha t={t} ini={a}>
									<span>
										<span style={{fontWeight: 300, color: COR.prata}}>{b.split(' ')[0]} </span>
										{b.split(' ').slice(1).join(' ')}
									</span>
								</Linha>
							</div>
						</div>
					);
				})}
			</div>
		</AbsoluteFill>
	);
};
