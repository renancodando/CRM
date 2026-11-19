import React from 'react';
import {AbsoluteFill} from 'remotion';
import {config} from '../config';
import {SANS, SERIF, MONO} from '../fonts';
import {useT, useLayout, M, p, ease, lerp, flutua} from '../lib/tempo';
import {COR, metal} from '../lib/estilo';
import {Linha} from '../componentes/Texto';
import {IconeBusca, Cursor} from '../componentes/Icones';
import {EstruturaSite} from '../componentes/Estrutura';

const G = config.gancho;

/** Buscas reais flutuando em profundidade — o espectador reconhece o próprio nicho */
const BuscasAoFundo: React.FC<{t: number; W: number; H: number}> = ({t, W, H}) => {
	const geral = p(t, 0.3, 1.2) * (1 - p(t, 5.2, 5.9, ease.inOut));
	if (geral <= 0) return null;
	return (
		<AbsoluteFill style={{perspective: 1100, perspectiveOrigin: '50% 50%'}}>
			{G.buscasAoFundo.map((q, i) => {
				const r1 = (Math.sin(i * 91.7) + 1) / 2;
				const r2 = (Math.sin(i * 47.3 + 2) + 1) / 2;
				const lado = i % 2 === 0 ? -1 : 1;
				const x = lado * (0.27 + r1 * 0.3) * W;
				const y = (r2 - 0.5) * H * 0.95;
				const z = -2400 + ((i * 173) % 1700) + (t - 0.3) * 330;
				const opZ = Math.min(1, Math.max(0, (z + 2400) / 900)) * Math.min(1, Math.max(0, (380 - z) / 500));
				const desf = Math.min(7, Math.abs(z + 500) / 260);
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: '50%',
							top: '50%',
							transform: `translate(-50%,-50%) translate3d(${x}px, ${y + flutua(t, i, 8)}px, ${z}px)`,
							fontFamily: MONO,
							fontSize: 34,
							color: '#e9ebf0',
							whiteSpace: 'nowrap',
							opacity: opZ * geral * (z > -300 ? 0.26 : 0.4),
							filter: `blur(${desf}px)`,
							display: 'flex',
							alignItems: 'center',
							gap: 14,
						}}
					>
						<IconeBusca size={30} color="#c9ccd2" />
						{q}
					</div>
				);
			})}
		</AbsoluteFill>
	);
};

const LinhaResultado: React.FC<{t: number; i: number; largura: number; destaque: number}> = ({t, i, largura, destaque}) => {
	const k = p(t, M.enter + 0.15 + i * 0.09, M.enter + 0.75 + i * 0.09);
	const brilho = ((t * 0.9 + i * 0.18) % 1.4) / 1.4;
	const esqueleto = (w: number, h: number, c = '#24252a'): React.CSSProperties => ({
		width: w,
		height: h,
		borderRadius: h / 2,
		backgroundColor: c,
		backgroundImage: `linear-gradient(100deg, transparent ${brilho * 140 - 30}%, rgba(255,255,255,0.07) ${brilho * 140 - 15}%, transparent ${brilho * 140}%)`,
	});
	const larg = [0.62, 0.48, 0.55][i];
	return (
		<div
			style={{
				opacity: k,
				transform: `translateY(${(1 - k) * 24}px)`,
				display: 'flex',
				gap: 26,
				padding: '30px 34px',
				borderRadius: 26,
				background: destaque > 0 ? `rgba(255,255,255,${0.05 * destaque})` : 'transparent',
				boxShadow: destaque > 0 ? `0 0 0 1px rgba(255,255,255,${0.14 * destaque})` : 'none',
			}}
		>
			<div style={{flex: 'none', ...esqueleto(52, 52, '#1d1e22'), borderRadius: 14}} />
			<div style={{display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 2}}>
				<div style={esqueleto(largura * 0.32, 14, '#1f2024')} />
				<div style={esqueleto(largura * larg, 24, destaque > 0 ? '#3a3b41' : '#2a2b30')} />
				<div style={esqueleto(largura * 0.7, 14, '#1f2024')} />
			</div>
		</div>
	);
};

export const Gancho: React.FC = () => {
	const t = useT();
	const {W, H, V} = useLayout();
	if (t > M.travessia + 0.7) return null;

	// ——— layout
	const barraW = V ? 920 : 1000;
	const barraH = V ? 128 : 112;
	const barraY = V ? 1010 : 340;
	const tituloY = V ? 620 : 175;
	const tamTitulo = V ? 112 : 92;

	// ——— feixe de luz inicial desenha a barra
	const feixe = p(t, 0, 0.75, ease.inOut);
	const barraOp = 1 - p(t, M.construcao - 0.1, M.construcao + 0.4, ease.in);
	const ui = 1 - p(t, M.construcao - 0.1, M.construcao + 0.5, ease.inOut);
	const uiZ = p(t, M.construcao - 0.1, M.construcao + 0.8, ease.in);

	// ——— digitação
	const n = Math.round(lerp(0, G.busca.length, p(t, M.digitacaoInicio, M.digitacaoFim, (x) => x)));
	const digitado = G.busca.slice(0, n);
	const cursorTxt = t < M.enter + 0.1 ? (n < G.busca.length || Math.floor(t * 2.6) % 2 === 0 ? 1 : 0) : 0;
	const enter = Math.max(0, 1 - Math.abs(t - M.enter) / 0.12);

	// ——— câmera
	const push = lerp(1.0, 1.06, p(t, 0, M.construcao, ease.suave));

	// ——— cursor que clica no concorrente
	const cx0 = V ? W * 0.82 : W * 0.75;
	const cy0 = V ? 1700 : 1000;
	const resultY = barraY + barraH + (V ? 70 : 34);
	const alvoX = W / 2 - barraW / 2 + 360;
	const alvoY = resultY + 70;
	const mov = p(t, 4.35, 4.95, ease.inOut);
	const clique = p(t, 5.05, 5.4, (x) => x);
	const cursorOp = p(t, 4.3, 4.5) * (1 - p(t, 5.5, 5.75));
	const destaque = p(t, 5.05, 5.2);

	// ——— construção 3D
	const cons = p(t, M.construcao, M.construcao + 0.6, ease.out);
	const trav = p(t, M.travessia - 0.2, M.travessia + 0.55, ease.in);
	const giro = lerp(-34, -22, p(t, M.construcao, M.travessia, ease.suave));
	const impacto = Math.max(0, 1 - Math.abs(t - M.impacto - 0.04) / 0.35);

	const estruturaY = V ? 700 : 540;
	const estruturaX = V ? W / 2 : W * 0.66;
	const escalaEstr = V ? 0.74 : 0.8;

	return (
		<AbsoluteFill>
			<BuscasAoFundo t={t} W={W} H={H} />

			{/* —— palco da busca —— */}
			<AbsoluteFill style={{transform: `scale(${push}) translateZ(0)`, opacity: ui, filter: uiZ > 0 ? `blur(${uiZ * 14}px)` : undefined}}>
				{/* rótulo ao vivo */}
				<div
					style={{
						position: 'absolute',
						top: tituloY - (V ? 70 : 54),
						left: 0,
						right: 0,
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						gap: 14,
						opacity: p(t, 0.15, 0.6) * (1 - p(t, M.pergunta - 0.25, M.pergunta)),
						fontFamily: MONO,
						fontSize: V ? 26 : 22,
						letterSpacing: '0.32em',
						color: COR.prata,
						textTransform: 'uppercase',
					}}
				>
					<div
						style={{
							width: 12,
							height: 12,
							borderRadius: '50%',
							background: '#fff',
							boxShadow: `0 0 ${10 + 10 * Math.abs(Math.sin(t * 4))}px rgba(255,255,255,0.9)`,
							opacity: 0.5 + 0.5 * Math.abs(Math.sin(t * 4)),
						}}
					/>
					{G.rotulo}
				</div>

				{/* título 1 */}
				<div style={{position: 'absolute', top: tituloY, left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontSize: tamTitulo, fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.02, color: COR.branco}}>
					<div style={{display: V ? 'block' : 'flex', justifyContent: 'center', gap: '0.25em'}}>
						<Linha t={t} ini={0.3} sai={M.pergunta - 0.35}>
							{G.linha1}
						</Linha>
						<Linha t={t} ini={0.42} sai={M.pergunta - 0.3}>
							<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, letterSpacing: '-0.02em', fontSize: '1.08em'}}>{G.linha1Destaque}</span>
						</Linha>
					</div>
				</div>

				{/* pergunta */}
				<div style={{position: 'absolute', top: tituloY - (V ? 40 : 10), left: 0, right: 0, textAlign: 'center', fontFamily: SANS, fontSize: tamTitulo * 1.12, fontWeight: 600, letterSpacing: '-0.045em', lineHeight: 1, color: COR.branco}}>
					<div style={{display: V ? 'block' : 'flex', justifyContent: 'center', gap: '0.25em'}}>
						<Linha t={t} ini={M.pergunta} sai={M.construcao - 0.25}>
							{G.pergunta}
						</Linha>
						<Linha t={t} ini={M.pergunta + 0.22} sai={M.construcao - 0.2}>
							<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '1.22em', letterSpacing: '-0.02em', ...metal(p(t, M.pergunta + 0.4, M.pergunta + 1.6, ease.inOut))}}>
								{G.perguntaDestaque}
							</span>
						</Linha>
					</div>
				</div>

				{/* barra de busca */}
				<div
					style={{
						position: 'absolute',
						left: W / 2 - barraW / 2,
						top: barraY,
						width: barraW,
						height: barraH,
						borderRadius: barraH / 2,
						clipPath: `inset(0 ${(1 - feixe) * 100}% 0 0 round ${barraH / 2}px)`,
						background: 'linear-gradient(180deg, rgba(34,35,40,0.92), rgba(18,19,22,0.92))',
						boxShadow: `0 0 0 1.5px rgba(255,255,255,${0.16 + enter * 0.3}), 0 1px 0 rgba(255,255,255,0.22) inset, 0 30px 80px -10px rgba(0,0,0,0.9), 0 0 ${60 * enter}px rgba(255,255,255,${0.25 * enter})`,
						display: 'flex',
						alignItems: 'center',
						padding: `0 ${barraH * 0.42}px`,
						gap: barraH * 0.24,
						opacity: barraOp,
						transform: `scale(${1 - enter * 0.015})`,
					}}
				>
					<IconeBusca size={barraH * 0.36} color="#c9ccd2" />
					<div style={{fontFamily: SANS, fontSize: barraH * 0.33, color: n > 0 ? COR.branco : COR.cinzaEscuro, letterSpacing: '-0.01em', whiteSpace: 'nowrap'}}>
						{n > 0 ? digitado : 'Pesquisar'}
						<span style={{display: 'inline-block', width: 3, height: barraH * 0.36, background: '#fff', marginLeft: 4, verticalAlign: 'middle', opacity: cursorTxt}} />
					</div>
				</div>

				{/* resultados — esqueletos */}
				<div style={{position: 'absolute', left: W / 2 - barraW / 2, top: resultY, width: barraW, display: 'flex', flexDirection: 'column', gap: V ? 14 : 4}}>
					{[0, 1, 2].map((i) => (
						<LinhaResultado key={i} t={t} i={i} largura={barraW - 140} destaque={i === 0 ? destaque : 0} />
					))}
				</div>

				{cursorOp > 0 && <Cursor x={lerp(cx0, alvoX, mov)} y={lerp(cy0, alvoY, mov)} clique={clique} opacidade={cursorOp} />}
			</AbsoluteFill>

			{/* feixe de luz */}
			{feixe < 1 && (
				<div
					style={{
						position: 'absolute',
						top: barraY + barraH / 2 - 1,
						left: W / 2 - barraW / 2 + feixe * barraW - 520,
						width: 560,
						height: 2,
						background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15) 60%, #fff)',
						boxShadow: '0 0 18px 2px rgba(255,255,255,0.55)',
						opacity: Math.sin(feixe * Math.PI) * 1.2,
					}}
				/>
			)}

			{/* —— estrutura 3D sendo construída —— */}
			{t > M.construcao - 0.1 && (
				<AbsoluteFill style={{perspective: 1500, perspectiveOrigin: `${(estruturaX / W) * 100}% ${(estruturaY / H) * 100}%`}}>
					<div
						style={{
							position: 'absolute',
							left: estruturaX - 500,
							top: estruturaY - 320,
							width: 1000,
							height: 640,
							transformStyle: 'preserve-3d',
							opacity: cons * (1 - p(t, M.travessia + 0.1, M.travessia + 0.5)),
							transform: [
								`translateZ(${lerp(-500, 0, cons) + trav * 1500}px)`,
								`scale(${escalaEstr * lerp(0.92, 1.05, p(t, M.construcao, M.travessia, ease.suave))})`,
								`rotateX(${lerp(56, 0, trav)}deg)`,
								`rotateZ(${lerp(giro, 0, trav)}deg)`,
							].join(' '),
						}}
					>
						<EstruturaSite t={t} ini={M.construcao} dur={1.5} separacao={lerp(110, 30, trav)} brilho={1 + impacto * 0.4} />
					</div>
				</AbsoluteFill>
			)}

			{/* —— frase principal —— */}
			{t > M.impacto - 0.2 && (
				<div
					style={{
						position: 'absolute',
						left: V ? 0 : 130,
						right: V ? 0 : undefined,
						top: V ? 1180 : 330,
						textAlign: V ? 'center' : 'left',
						fontFamily: SANS,
						fontSize: V ? 124 : 118,
						fontWeight: 600,
						letterSpacing: '-0.045em',
						lineHeight: 0.98,
						color: COR.branco,
						transform: `scale(${1 + impacto * 0.012})`,
						transformOrigin: V ? '50% 50%' : '0% 50%',
					}}
				>
					{G.frase.map((l, i) => (
						<Linha key={l} t={t} ini={M.impacto + i * 0.12} sai={M.travessia - 0.3 + i * 0.04}>
							{l}
						</Linha>
					))}
					<Linha t={t} ini={M.impacto + 0.38} sai={M.travessia - 0.18}>
						<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '1.2em', letterSpacing: '-0.02em', ...metal(p(t, M.impacto + 0.5, M.impacto + 1.6, ease.inOut))}}>
							{G.fraseDestaque}
						</span>
					</Linha>
				</div>
			)}

			{/* clarão do impacto */}
			<AbsoluteFill style={{background: 'radial-gradient(ellipse 60% 40% at 50% 55%, rgba(255,255,255,0.22), transparent 70%)', opacity: impacto * impacto * 0.8, pointerEvents: 'none'}} />
		</AbsoluteFill>
	);
};
