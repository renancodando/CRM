import React from 'react';
import {F, p, ease, lerp, clamp} from '../lib/base';
import {Pagina, Grao} from '../comp/Pagina';

/**
 * ÂMBAR — alta perfumaria autoral (projeto conceitual).
 * Identidade: âmbar, conhaque e creme · Bodoni Moda · a cor da página muda com cada nota.
 */
const CREME = '#F6EBDA';
const NOTAS = [
	{rotulo: 'NOTA DE SAÍDA', nome: 'Bergamota', fundo: ['#D9A441', '#B8781F']},
	{rotulo: 'NOTA DE CORAÇÃO', nome: 'Íris', fundo: ['#A77A86', '#6E4A5B']},
	{rotulo: 'NOTA DE FUNDO', nome: 'Baunilha', fundo: ['#7A3A16', '#3E1A0A']},
];
const BASE = ['#C8742A', '#8E4318'];

const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, k: number) => {
	const A = hx(a);
	const B = hx(b);
	return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * clamp(k))).join(',')})`;
};

/** Frasco ilustrado em vidro espesso (2D) */
export const FrascoIlustrado: React.FC<{w: number; liquido: string; brilho: number}> = ({w, liquido, brilho}) => {
	const h = w * 1.45;
	return (
		<div style={{position: 'relative', width: w, height: h + w * 0.42}}>
			{/* tampa */}
			<div style={{position: 'absolute', left: w * 0.29, width: w * 0.42, top: 0, height: w * 0.36, borderRadius: w * 0.03, background: 'linear-gradient(90deg,#6b4a1f 0%,#e9c98d 22%,#b48a4a 45%,#f7e2b4 62%,#8a6428 100%)', boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.25)'}} />
			<div style={{position: 'absolute', left: w * 0.4, width: w * 0.2, top: w * 0.36, height: w * 0.08, background: 'linear-gradient(90deg,#7a5a24,#d9b77a,#7a5a24)'}} />
			{/* vidro */}
			<div style={{position: 'absolute', left: 0, top: w * 0.42, width: w, height: h, borderRadius: w * 0.1, background: 'linear-gradient(90deg,rgba(255,255,255,0.32),rgba(255,255,255,0.08) 18%,rgba(255,255,255,0.04) 60%,rgba(255,255,255,0.22))', boxShadow: 'inset 0 0 0 1.5px rgba(255,255,255,0.45), inset 0 0 18px rgba(255,255,255,0.18), 0 30px 50px -12px rgba(40,15,4,0.55)', overflow: 'hidden', backdropFilter: 'blur(1.5px)'}}>
				{/* líquido */}
				<div style={{position: 'absolute', left: w * 0.09, right: w * 0.09, top: h * 0.14, bottom: w * 0.09, borderRadius: w * 0.05, background: `linear-gradient(180deg, ${liquido}, rgba(60,20,4,0.9))`, boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.35)'}} />
				{/* refração */}
				<div style={{position: 'absolute', left: w * 0.12, width: w * 0.08, top: h * 0.08, bottom: h * 0.08, borderRadius: 4, background: 'linear-gradient(180deg,rgba(255,255,255,0.75),rgba(255,255,255,0.15))', opacity: 0.6 + brilho * 0.4}} />
				<div style={{position: 'absolute', right: w * 0.1, width: w * 0.03, top: h * 0.1, bottom: h * 0.1, background: 'rgba(255,255,255,0.5)'}} />
				<div style={{position: 'absolute', left: '-60%', width: '50%', top: 0, bottom: 0, background: 'linear-gradient(100deg,transparent,rgba(255,255,255,0.35),transparent)', transform: `translateX(${brilho * 320}%) skewX(-12deg)`}} />
				{/* rótulo */}
				<div style={{position: 'absolute', left: 0, right: 0, top: h * 0.5, textAlign: 'center', color: CREME, fontFamily: F.bodoni}}>
					<div style={{fontSize: w * 0.15, letterSpacing: w * 0.012}}>ÂMBAR</div>
					<div style={{fontSize: w * 0.045, letterSpacing: w * 0.012, marginTop: w * 0.02, opacity: 0.85}}>EAU DE PARFUM · N° 7</div>
				</div>
			</div>
			{/* reflexo no plano */}
			<div style={{position: 'absolute', left: -w * 0.2, right: -w * 0.2, top: h + w * 0.4, height: w * 0.14, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,214,150,0.45), transparent 70%)'}} />
		</div>
	);
};

export const SiteAmbar: React.FC<{t: number; modo?: 'completo' | 'curto'}> = ({t, modo = 'completo'}) => {
	const c = modo === 'curto';
	const T = c ? {notas: 0.9, passo: 0.6, compra: 2.9} : {notas: 1.55, passo: 0.85, compra: 4.35};
	const intro = p(t, 0, 1.2, ease.out);
	const nota = (i: number) => p(t, T.notas + i * T.passo, T.notas + i * T.passo + 0.5, ease.inOut);
	const n0 = nota(0);
	const n1 = nota(1);
	const n2 = nota(2);
	// cor de fundo: base → saída → coração → fundo
	const corA = n2 > 0 ? mix(NOTAS[1].fundo[0], NOTAS[2].fundo[0], n2) : n1 > 0 ? mix(NOTAS[0].fundo[0], NOTAS[1].fundo[0], n1) : mix(BASE[0], NOTAS[0].fundo[0], n0);
	const corB = n2 > 0 ? mix(NOTAS[1].fundo[1], NOTAS[2].fundo[1], n2) : n1 > 0 ? mix(NOTAS[0].fundo[1], NOTAS[1].fundo[1], n1) : mix(BASE[1], NOTAS[0].fundo[1], n0);
	const liquido = n2 > 0 ? mix('#c99a6a', '#c56a22', n2) : '#e0953f';
	const ativa = n2 > 0.5 ? 2 : n1 > 0.5 ? 1 : n0 > 0.5 ? 0 : -1;
	const compra = clamp((t - T.compra) / 0.35);
	const adicionado = p(t, T.compra + 0.25, T.compra + 0.55);
	const voo = p(t, T.compra + 0.3, T.compra + 0.9, ease.inOut);
	const sacola = t > T.compra + 0.9 ? 1 : 0;
	const pulo = Math.sin(clamp((t - T.compra - 0.9) / 0.3) * Math.PI);

	return (
		<Pagina fundo={`linear-gradient(170deg, ${corA}, ${corB})`}>
			<Grao opacidade={0.14} seed={9} />
			<div style={{position: 'absolute', top: 92, left: 22, right: 22, display: 'flex', alignItems: 'center', fontFamily: F.bodoni, color: CREME, opacity: intro}}>
				<span style={{fontSize: 9, letterSpacing: 3}}>ALTA PERFUMARIA</span>
				<span style={{marginLeft: 'auto', fontSize: 11, letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 6}}>
					Sacola
					<span style={{display: 'inline-flex', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', background: sacola ? CREME : 'transparent', boxShadow: `0 0 0 1px ${CREME}`, color: '#5a2a12', fontSize: 9, transform: `scale(${1 + pulo * 0.35})`}}>{sacola ? 1 : 0}</span>
				</span>
			</div>
			{/* título monumental atrás do frasco */}
			<div style={{position: 'absolute', top: 120, left: 0, right: 0, textAlign: 'center', fontFamily: F.bodoni, fontSize: 112, lineHeight: 0.9, color: CREME, letterSpacing: -3, overflow: 'hidden', height: 115}}>
				<div style={{transform: `translateY(${(1 - intro) * 100}%)`}}>Âmbar</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 168, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - intro) * 40}px) rotate(${lerp(-3, 2, p(t, 0, 6))}deg)`, opacity: intro}}>
				<FrascoIlustrado w={150} liquido={liquido} brilho={p(t, 0.6, 2.2, ease.inOut)} />
			</div>
			{/* notas */}
			<div style={{position: 'absolute', left: 22, right: 22, top: 448, height: 70, fontFamily: F.bodoni, color: CREME}}>
				{NOTAS.map((nt, i) => {
					const k = nota(i);
					const sai = i < 2 ? nota(i + 1) : 0;
					return (
						<div key={nt.nome} style={{position: 'absolute', left: 0, right: 0, top: 0, overflow: 'hidden', height: 66}}>
							<div style={{transform: `translateY(${(1 - k) * 115 - sai * 115}%)`, display: 'flex', alignItems: 'baseline', height: 66}}>
								<div>
									<div style={{fontSize: 8.5, letterSpacing: 2.6, opacity: 0.85}}>{nt.rotulo}</div>
									<div style={{fontSize: 44, letterSpacing: -1, lineHeight: 1.05}}>{nt.nome}</div>
								</div>
								<div style={{marginLeft: 'auto', fontSize: 11, opacity: 0.8}}>0{i + 1} / 03</div>
							</div>
						</div>
					);
				})}
				{ativa < 0 && (
					<div style={{fontSize: 14, fontStyle: 'normal', lineHeight: 1.4, opacity: p(t, 0.9, 1.4)}}>
						Eau de parfum N° 7 — quente, luminoso,
						<br />
						feito para ficar na memória.
					</div>
				)}
			</div>
			{/* compra */}
			<div style={{position: 'absolute', left: 22, right: 22, top: 530, display: 'flex', gap: 8, alignItems: 'center', opacity: p(t, T.compra - 0.9, T.compra - 0.4)}}>
				{['50 ml', '100 ml'].map((m, i) => (
					<div key={m} style={{padding: '9px 14px', borderRadius: 999, boxShadow: `0 0 0 1px ${CREME}`, background: i === 0 ? CREME : 'transparent', color: i === 0 ? '#5a2a12' : CREME, fontFamily: F.bodoni, fontSize: 12}}>
						{m}
					</div>
				))}
				<div style={{flex: 1, height: 40, borderRadius: 999, background: adicionado > 0.5 ? '#2b1407' : CREME, color: adicionado > 0.5 ? CREME : '#3e1a0a', fontFamily: F.bodoni, fontSize: 13, letterSpacing: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${1 - Math.sin(compra * Math.PI) * 0.05})`}}>
					{adicionado > 0.5 ? 'Na sacola  ✓' : 'Adicionar à sacola'}
				</div>
			</div>
			{voo > 0 && voo < 1 && (
				<div style={{position: 'absolute', left: lerp(270, 352, voo), top: lerp(550, 100, voo) - Math.sin(voo * Math.PI) * 60, width: 8, height: 8, borderRadius: 4, background: CREME, boxShadow: `0 0 10px ${CREME}`}} />
			)}
			{t > T.compra - 0.3 && t < T.compra + 0.6 && (
				<div style={{position: 'absolute', left: 270 - 14, top: 550 - 14, width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', border: '1.2px solid #fff', opacity: p(t, T.compra - 0.3, T.compra - 0.1) * (1 - p(t, T.compra + 0.3, T.compra + 0.6))}} />
			)}
		</Pagina>
	);
};
