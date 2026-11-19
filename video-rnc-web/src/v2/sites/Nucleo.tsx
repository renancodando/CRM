import React from 'react';
import {F, p, ease, lerp, clamp} from '../lib/base';
import {Pagina} from '../comp/Pagina';

/**
 * NÚCLEO — assistência técnica de celulares (projeto conceitual).
 * Identidade: grafite, lima elétrica e gelo · Space Grotesk + JetBrains Mono · desenho técnico vivo.
 */
export const GRAF = '#0E0F11';
export const LIMA = '#C8F031';
const GELO = '#E8ECEF';
const CINZA = '#7C858B';

const Grade: React.FC<{k: number}> = ({k}) => (
	<svg width={390} height={693} style={{position: 'absolute', inset: 0, opacity: k}}>
		<defs>
			<pattern id="pontos" width={13} height={13} patternUnits="userSpaceOnUse">
				<circle cx={1} cy={1} r={0.6} fill="rgba(232,236,239,0.16)" />
			</pattern>
		</defs>
		<rect width={390} height={693} fill="url(#pontos)" />
	</svg>
);

/** Desenho técnico do aparelho; a peça escolhida acende */
const Desenho: React.FC<{k: number; bateria: number; t: number}> = ({k, bateria, t}) => {
	const d = (i: number) => ({pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp(k * 1.6 - i * 0.12)});
	const pulso = 0.5 + 0.5 * Math.sin(t * 7);
	return (
		<svg width={170} height={300} viewBox="0 0 170 300" style={{overflow: 'visible'}}>
			<rect x={10} y={10} width={150} height={280} rx={24} fill="none" stroke={GELO} strokeWidth={1.6} {...d(0)} />
			<rect x={18} y={18} width={134} height={264} rx={18} fill="none" stroke="rgba(232,236,239,0.35)" strokeWidth={0.8} {...d(1)} />
			{/* câmeras */}
			<circle cx={42} cy={44} r={11} fill="none" stroke={GELO} strokeWidth={1} {...d(2)} />
			<circle cx={42} cy={72} r={11} fill="none" stroke={GELO} strokeWidth={1} {...d(2)} />
			<circle cx={66} cy={58} r={5} fill="none" stroke={GELO} strokeWidth={1} {...d(3)} />
			{/* placa */}
			<path d="M96 28 H146 V120 H118 V90 H96 Z" fill="none" stroke="rgba(232,236,239,0.6)" strokeWidth={0.9} strokeDasharray="3 2" opacity={clamp(k * 1.6 - 0.4)} />
			<rect x={112} y={44} width={20} height={20} fill="none" stroke={GELO} strokeWidth={0.9} opacity={clamp(k * 1.6 - 0.45)} />
			{/* bateria */}
			<rect x={34} y={112} width={102} height={140} rx={6} fill={LIMA} fillOpacity={bateria * (0.35 + pulso * 0.25)} stroke={bateria > 0 ? LIMA : GELO} strokeWidth={bateria > 0 ? 1.8 : 1} {...d(4)} />
			<path d="M78 170 l-8 16 h12 l-8 16" fill="none" stroke={bateria > 0 ? GRAF : 'rgba(232,236,239,0.5)'} strokeWidth={1.4} opacity={clamp(k * 1.6 - 0.6)} />
			{/* conector */}
			<rect x={70} y={278} width={30} height={6} rx={3} fill="none" stroke={GELO} strokeWidth={1} {...d(5)} />
		</svg>
	);
};

const Rotulo: React.FC<{x: number; y: number; w: number; txt: string; k: number; lado?: 1 | -1; ativo?: boolean}> = ({x, y, w, txt, k, lado = 1, ativo = false}) => (
	<div style={{position: 'absolute', left: x, top: y, opacity: k}}>
		<div style={{position: 'absolute', top: 0, left: lado === 1 ? 0 : -w * k, width: w * k, height: 0.8, background: ativo ? LIMA : 'rgba(232,236,239,0.5)'}} />
		<div style={{position: 'absolute', top: -2, left: lado === 1 ? -2 : -2, width: 4, height: 4, borderRadius: 2, background: ativo ? LIMA : GELO}} />
		<div style={{position: 'absolute', top: -6, [lado === 1 ? 'left' : 'right']: lado === 1 ? w + 6 : 6 - (lado === -1 ? -w : 0), whiteSpace: 'nowrap', fontFamily: F.mono, fontSize: 8, letterSpacing: 0.8, color: ativo ? LIMA : GELO}}>{txt}</div>
	</div>
);

const SINTOMAS = ['Tela quebrada', 'Bateria fraca', 'Não carrega', 'Molhou'];
const ETAPAS = ['Recebido', 'Em análise', 'Em reparo', 'Pronto para retirada'];

export const SiteNucleo: React.FC<{t: number; modo?: 'completo' | 'curto'}> = ({t, modo = 'completo'}) => {
	const c = modo === 'curto';
	const T = c ? {boot: 0, chips: 0.6, toque: 1.25, cartao: 1.4, botao: 2.35, pedido: 2.75} : {boot: 0, chips: 1.25, toque: 2.0, cartao: 2.2, botao: 3.35, pedido: 3.8};

	const grade = p(t, T.boot, T.boot + 0.6);
	const scan = p(t, T.boot, T.boot + 1.1, (x) => x);
	const desenho = p(t, T.boot + 0.15, T.boot + 1.4, ease.inOut);
	const titulo = T.boot + 0.25;
	const chips = p(t, T.chips, T.chips + 0.6, ease.out);
	const toque = clamp((t - T.toque) / 0.4, 0, 1.3);
	const escolhido = t > T.toque + 0.08 ? 1 : 0;
	const bateria = p(t, T.toque + 0.1, T.toque + 0.4);
	const cartao = p(t, T.cartao, T.cartao + 0.6, ease.out);
	const botao = clamp((t - T.botao) / 0.3);
	const onda = p(t, T.botao + 0.15, T.pedido + 0.25, ease.camera);
	const pedido = p(t, T.pedido, T.pedido + 0.6, ease.out);
	const etapa = (i: number) => p(t, T.pedido + 0.35 + i * 0.42, T.pedido + 0.65 + i * 0.42);

	return (
		<Pagina fundo={GRAF}>
			<Grade k={grade} />
			{scan < 1 && <div style={{position: 'absolute', left: 0, right: 0, top: scan * 693, height: 1, background: LIMA, boxShadow: `0 0 18px ${LIMA}`, opacity: Math.sin(scan * Math.PI)}} />}

			{/* topo */}
			<div style={{position: 'absolute', top: 92, left: 22, right: 22, display: 'flex', alignItems: 'center', fontFamily: F.grotesk, color: GELO, opacity: grade}}>
				<div style={{width: 11, height: 11, borderRadius: 3, border: `1.6px solid ${LIMA}`, marginRight: 7, position: 'relative'}}>
					<div style={{position: 'absolute', inset: 2.2, borderRadius: 1, background: LIMA}} />
				</div>
				<b style={{fontSize: 14, letterSpacing: -0.3}}>Núcleo</b>
				<span style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 7.5, letterSpacing: 1, color: CINZA}}>ASSISTÊNCIA TÉCNICA</span>
			</div>

			{/* título */}
			<div style={{position: 'absolute', top: 120, left: 22, fontFamily: F.grotesk, fontWeight: 500, fontSize: 40, lineHeight: 0.98, letterSpacing: -1.6, color: GELO}}>
				{['Seu celular,', 'explicado.'].map((l, i) => {
					const k = p(t, titulo + i * 0.12, titulo + 0.7 + i * 0.12, ease.out);
					return (
						<div key={l} style={{overflow: 'hidden'}}>
							<div style={{transform: `translateY(${(1 - k) * 100}%)`, color: i === 1 ? LIMA : GELO}}>{l}</div>
						</div>
					);
				})}
			</div>

			{/* desenho técnico + rótulos */}
			<div style={{position: 'absolute', left: 196, top: 212, transform: `scale(${lerp(1, 0.86, cartao)})`, transformOrigin: '50% 0'}}>
				<Desenho k={desenho} bateria={bateria} t={t} />
			</div>
			{/* sintomas */}
			<div style={{position: 'absolute', left: 22, top: 222, width: 170, opacity: chips}}>
				<div style={{fontFamily: F.mono, fontSize: 8, letterSpacing: 1, color: CINZA, marginBottom: 10}}>O QUE ACONTECEU?</div>
				{SINTOMAS.map((s, i) => {
					const k = p(t, T.chips + i * 0.06, T.chips + 0.5 + i * 0.06, ease.out);
					const ativo = i === 1 && escolhido;
					return (
						<div
							key={s}
							style={{
								display: 'inline-block',
								marginRight: 6,
								marginBottom: 7,
								padding: '8px 12px',
								borderRadius: 999,
								fontFamily: F.grotesk,
								fontSize: 12.5,
								fontWeight: 500,
								color: ativo ? GRAF : GELO,
								background: ativo ? LIMA : 'transparent',
								boxShadow: `0 0 0 1px ${ativo ? LIMA : 'rgba(232,236,239,0.28)'}`,
								opacity: k * (escolhido && !ativo ? 0.45 : 1),
								transform: `translateY(${(1 - k) * 10}px) scale(${i === 1 ? 1 - Math.sin(clamp(toque) * Math.PI) * 0.06 : 1})`,
							}}
						>
							{s}
						</div>
					);
				})}
			</div>
			{toque > 0 && toque < 1.3 && (
				<div style={{position: 'absolute', left: 64 - 14, top: 280 - 14, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', border: '1.2px solid #fff', opacity: 1 - clamp((toque - 0.8) * 3), transform: `scale(${1 - Math.sin(clamp(toque) * Math.PI) * 0.2})`}} />
			)}

			{/* resultado */}
			<div style={{position: 'absolute', left: 16, right: 16, top: lerp(560, 432, cartao), opacity: cartao, borderRadius: 20, background: '#16181b', boxShadow: '0 0 0 1px rgba(232,236,239,0.1)', padding: 16, fontFamily: F.grotesk, color: GELO}}>
				<div style={{display: 'flex', alignItems: 'baseline'}}>
					<span style={{fontSize: 18, fontWeight: 600, letterSpacing: -0.4}}>Troca de bateria</span>
					<span style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 8, color: LIMA}}>RECOMENDADO</span>
				</div>
				<div style={{fontSize: 11.5, color: CINZA, marginTop: 6, lineHeight: 1.45}}>Orçamento antes do serviço. Prazo informado na avaliação.</div>
				<div style={{marginTop: 12, height: 40, borderRadius: 12, background: LIMA, color: GRAF, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13.5, transform: `scale(${1 - Math.sin(botao * Math.PI) * 0.04})`}}>Agendar avaliação →</div>
			</div>

			{/* transição: o botão se expande e vira a página de acompanhamento */}
			{onda > 0 && (
				<div style={{position: 'absolute', inset: 0, background: LIMA, clipPath: `circle(${onda * 120}% at 50% 88%)`}}>
					<div style={{position: 'absolute', inset: 0, background: GRAF, clipPath: `circle(${clamp((onda - 0.35) / 0.65) * 125}% at 50% 88%)`}}>
						<Grade k={1} />
						<div style={{position: 'absolute', top: 92, left: 22, right: 22, display: 'flex', fontFamily: F.mono, fontSize: 7.5, letterSpacing: 1, color: CINZA}}>
							<span>NÚCLEO · ACOMPANHAMENTO</span>
							<span style={{marginLeft: 'auto', color: LIMA}}>● AO VIVO</span>
						</div>
						<div style={{position: 'absolute', top: 122, left: 22, fontFamily: F.grotesk, fontWeight: 500, fontSize: 36, letterSpacing: -1.4, lineHeight: 1, color: GELO, opacity: pedido}}>
							Acompanhe
							<br />
							seu <span style={{color: LIMA}}>reparo.</span>
						</div>
						<div style={{position: 'absolute', top: 222, left: 22, right: 22, padding: '12px 14px', borderRadius: 14, boxShadow: '0 0 0 1px rgba(232,236,239,0.18)', display: 'flex', fontFamily: F.mono, fontSize: 11, color: GELO, opacity: pedido}}>
							<span style={{color: CINZA}}>PEDIDO</span>
							<span style={{marginLeft: 'auto'}}>#2481 · Troca de bateria</span>
						</div>
						<div style={{position: 'absolute', top: 284, left: 22, right: 22}}>
							{ETAPAS.map((e, i) => {
								const k = etapa(i);
								const atual = i === 2;
								const feito = i < 2 && k >= 1;
								return (
									<div key={e} style={{display: 'flex', alignItems: 'center', gap: 14, height: 52, opacity: lerp(0.35, 1, k)}}>
										<div style={{width: 22, height: 22, borderRadius: '50%', boxShadow: `0 0 0 1.4px ${k > 0.5 && i < 3 ? LIMA : 'rgba(232,236,239,0.3)'}`, background: feito ? LIMA : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: GRAF, fontSize: 12, fontWeight: 700, position: 'relative'}}>
											{feito ? '✓' : ''}
											{atual && k > 0.5 && <div style={{position: 'absolute', inset: 5, borderRadius: '50%', background: LIMA, opacity: 0.5 + 0.5 * Math.sin(t * 6)}} />}
										</div>
										<div style={{fontFamily: F.grotesk, fontSize: 16, fontWeight: atual ? 600 : 400, color: GELO}}>{e}</div>
										<div style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 8.5, color: atual ? LIMA : CINZA}}>{i < 2 ? 'CONCLUÍDO' : atual ? 'EM ANDAMENTO' : '—'}</div>
									</div>
								);
							})}
							<div style={{position: 'absolute', left: 11, top: 30, width: 1, height: 52 * 3 - 18, background: 'rgba(232,236,239,0.15)'}}>
								<div style={{width: 1, height: `${clamp((t - T.pedido - 0.35) / 1.1) * 72}%`, background: LIMA}} />
							</div>
						</div>
						<div style={{position: 'absolute', top: 500, left: 22, right: 22, fontFamily: F.grotesk, fontSize: 12, color: CINZA, opacity: etapa(3)}}>
							Você recebe uma mensagem quando o aparelho estiver pronto.
						</div>
					</div>
				</div>
			)}
		</Pagina>
	);
};
