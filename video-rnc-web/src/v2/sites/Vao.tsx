import React from 'react';
import {F, p, ease, lerp, clamp} from '../lib/base';
import {Pagina, Grao} from '../comp/Pagina';

/**
 * VÃO ARQUITETURA — estúdio de arquitetura residencial (projeto conceitual).
 * Identidade: osso, nanquim e argila · Archivo variável (largura animada) · a planta baixa é o menu.
 */
export const OSSO = '#ECE6DA';
export const NANQUIM = '#1E1D1A';
const ARGILA = '#B4532A';
const LINHA = 'rgba(30,29,26,0.85)';
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
/** interpola 3 cores ao longo de 0..1 */
const mix = (cs: string[], k: number) => {
	const seg = k < 0.5 ? 0 : 1;
	const kk = k < 0.5 ? k * 2 : (k - 0.5) * 2;
	const a = hx(cs[seg]);
	const b = hx(cs[seg + 1]);
	return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * kk)).join(',')})`;
};

/** "Fotografias" de arquitetura compostas em vetor (luz, volumes e sombra) */
export const ImagemArq: React.FC<{v: number; w: number; h: number; zoom?: number; hora?: number}> = ({v, w, h, zoom = 1, hora = -1}) => {
	const ceuHora = hora >= 0 ? `linear-gradient(180deg, ${mix(['#b9cbd6', '#e9d3b4', '#3c3346'], hora)} 0%, ${mix(['#e9ecea', '#f2e7d6', '#d98b5f'], hora)} 70%)` : null;
	const ceu = ceuHora ?? ['linear-gradient(180deg,#e9d3b4 0%,#f2e7d6 60%,#efe5d6 100%)', 'linear-gradient(180deg,#cdd5d6 0%,#e9e6df 70%)', 'linear-gradient(180deg,#d9c3a8 0%,#efe1cf 75%)'][v % 3];
	return (
		<div style={{position: 'relative', width: w, height: h, overflow: 'hidden', background: ceu}}>
			<div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '60% 70%'}}>
				{v % 3 === 0 && (
					<>
						<div style={{position: 'absolute', left: '-5%', right: '-5%', top: '72%', bottom: 0, background: '#d8ccb9'}} />
						<div style={{position: 'absolute', left: '8%', width: '84%', top: '38%', height: '9%', background: '#f7f3ec', boxShadow: '0 1px 0 rgba(0,0,0,0.05)'}} />
						<div style={{position: 'absolute', left: '12%', width: '76%', top: '47%', height: '25%', background: 'linear-gradient(90deg,#3e3a33,#26231f 60%,#4a453d)'}} />
						<div style={{position: 'absolute', left: '30%', width: '22%', top: '49%', height: '23%', background: 'linear-gradient(180deg,#f5d9a8,#e8b978)', opacity: hora >= 0 ? 0.35 + Math.max(0, hora - 0.5) * 1.3 : 0.9, boxShadow: hora > 0.6 ? `0 0 ${30 * (hora - 0.6)}px rgba(245,200,130,0.8)` : 'none'}} />
						{hora >= 0 && <div style={{position: 'absolute', left: `${8 + (1 - hora) * 10}%`, width: '84%', top: '72%', height: '10%', background: 'rgba(40,34,28,0.28)', transform: `skewX(${(hora - 0.5) * 70}deg)`, filter: 'blur(2px)'}} />}
						{hora >= 0 && <div style={{position: 'absolute', left: `${10 + hora * 70}%`, top: `${30 - Math.sin(hora * Math.PI) * 22}%`, width: 18, height: 18, borderRadius: '50%', background: hora > 0.8 ? '#ffb27a' : '#fff6e0', boxShadow: '0 0 30px rgba(255,230,190,0.9)'}} />}
						{[18, 60, 82].map((x) => (
							<div key={x} style={{position: 'absolute', left: `${x}%`, width: '1.3%', top: '47%', height: '25%', background: '#ede6da'}} />
						))}
						<div style={{position: 'absolute', left: '-5%', right: '40%', top: '80%', height: '7%', background: 'linear-gradient(90deg,#7f9497,#a9b8b8)'}} />
						<div style={{position: 'absolute', left: '64%', width: '24%', top: '18%', height: '24%', borderRadius: '50%', background: 'radial-gradient(circle at 40% 40%,#6f7558,#454a36)'}} />
						<div style={{position: 'absolute', left: '75.5%', width: '1%', top: '38%', height: '10%', background: '#4a4436'}} />
					</>
				)}
				{v % 3 === 1 && (
					<>
						<div style={{position: 'absolute', left: '-10%', right: '-10%', top: '62%', bottom: 0, background: '#b9b2a4', clipPath: 'polygon(0 30%,100% 0,100% 100%,0 100%)'}} />
						<div style={{position: 'absolute', left: '22%', width: '70%', top: '30%', height: '18%', background: '#f4f1eb'}} />
						<div style={{position: 'absolute', left: '26%', width: '62%', top: '35%', height: '9%', background: '#2b2e30'}} />
						<div style={{position: 'absolute', left: '22%', width: '70%', top: '48%', height: '3%', background: 'rgba(0,0,0,0.25)', filter: 'blur(3px)'}} />
						<div style={{position: 'absolute', left: '30%', width: '1.5%', top: '48%', height: '22%', background: '#e9e4da'}} />
						<div style={{position: 'absolute', left: '10%', width: '30%', top: '52%', height: '20%', background: '#ded8cc'}} />
					</>
				)}
				{v % 3 === 2 && (
					<>
						<div style={{position: 'absolute', left: 0, right: 0, top: '58%', height: '12%', background: 'linear-gradient(180deg,#8ea1a3,#b7c2bf)'}} />
						<div style={{position: 'absolute', left: 0, right: 0, top: '70%', bottom: 0, background: '#e2d6c2'}} />
						<div style={{position: 'absolute', left: '6%', width: '88%', top: '24%', height: '5%', background: '#f6f2ea'}} />
						{[10, 26, 42, 58, 74, 89].map((x) => (
							<div key={x} style={{position: 'absolute', left: `${x}%`, width: '1.6%', top: '29%', height: '45%', background: '#f1ece3', boxShadow: '4px 0 6px rgba(0,0,0,0.12)'}} />
						))}
						<div style={{position: 'absolute', left: '6%', width: '88%', top: '29%', height: '45%', background: 'linear-gradient(180deg,rgba(40,36,30,0.55),rgba(40,36,30,0.1))'}} />
					</>
				)}
			</div>
			<Grao opacidade={0.12} seed={v + 4} />
		</div>
	);
};

/** Planta baixa: cômodos são o menu */
const CMD = [
	{id: 'projetos', n: '01', nome: 'Projetos', x: 30, y: 40, w: 190, h: 170, cota: '6,40'},
	{id: 'estudio', n: '02', nome: 'Estúdio', x: 220, y: 40, w: 110, h: 110, cota: '3,60'},
	{id: 'processo', n: '03', nome: 'Processo', x: 220, y: 150, w: 110, h: 130, cota: '4,20'},
	{id: 'contato', n: '04', nome: 'Contato', x: 30, y: 210, w: 190, h: 70, cota: '2,40'},
];

export const Planta: React.FC<{k: number; rotulos: number; destaque?: number}> = ({k, rotulos, destaque = 0}) => {
	const L = (i: number) => clamp(k * 1.8 - i * 0.1);
	return (
		<svg width={360} height={330} viewBox="0 0 360 330" style={{overflow: 'visible'}}>
			{/* paredes */}
			<rect x={30} y={40} width={300} height={240} fill="none" stroke={NANQUIM} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - L(0)} />
			{[
				'M220 40 V282',
				'M30 210 H220',
				'M220 150 H330',
			].map((d, i) => (
				<path key={d} d={d} stroke={NANQUIM} strokeWidth={2} fill="none" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - L(i + 1)} />
			))}
			{/* portas (arcos) */}
			{[
				'M150 210 a28 28 0 0 0 28 -28',
				'M220 105 a26 26 0 0 1 26 26',
				'M262 150 a24 24 0 0 0 -24 -24',
			].map((d, i) => (
				<path key={d} d={d} stroke={LINHA} strokeWidth={0.8} fill="none" strokeDasharray="2 2" opacity={L(i + 4)} />
			))}
			{/* cotas */}
			<g opacity={L(6)} stroke={NANQUIM} strokeWidth={0.6} fontFamily={F.mono} fontSize={8} fill={NANQUIM}>
				<path d="M30 18 H330 M30 13 V23 M330 13 V23 M220 13 V23" />
				<text x={120} y={13} textAnchor="middle" stroke="none">6,40</text>
				<text x={275} y={13} textAnchor="middle" stroke="none">3,60</text>
				<path d="M348 40 V280 M343 40 H353 M343 280 H353 M343 150 H353" />
				<text x={356} y={98} stroke="none" transform="rotate(90 356 98)">3,40</text>
				<text x={356} y={212} stroke="none" transform="rotate(90 356 212)">4,20</text>
			</g>
			{/* norte */}
			<g opacity={L(7)} transform="translate(20 305)">
				<circle r={9} fill="none" stroke={NANQUIM} strokeWidth={0.8} />
				<path d="M0 -7 L4 5 L0 2 L-4 5 Z" fill={NANQUIM} />
			</g>
			{/* rótulos = menu */}
			{CMD.map((c, i) => {
				const r = clamp(rotulos * 2 - i * 0.3);
				const ativo = i === 0 ? destaque : 0;
				return (
					<g key={c.id} opacity={r} transform={`translate(${c.x + 12} ${c.y + 22 + (1 - r) * 6})`}>
						<rect x={-12} y={-22} width={c.w} height={c.h} fill={ARGILA} opacity={ativo * 0.16} />
						<text fontFamily={F.mono} fontSize={8} fill={i === 0 && ativo > 0 ? ARGILA : NANQUIM} letterSpacing={1}>
							{c.n}
						</text>
						<text y={18} fontFamily={F.archivo} fontStretch="112%" fontWeight={600} fontSize={c.w > 150 ? 22 : 15} fill={NANQUIM} letterSpacing={-0.3}>
							{c.nome}
						</text>
						<text y={c.h - 32} fontFamily={F.mono} fontSize={7} fill={NANQUIM} opacity={0.55}>
							{c.cota} m
						</text>
					</g>
				);
			})}
		</svg>
	);
};

const PROJETOS = [
	{n: '01', nome: 'Casa Pátio', ano: '2025', v: 0},
	{n: '02', nome: 'Casa Encosta', ano: '2024', v: 1},
	{n: '03', nome: 'Residência Litoral', ano: '2024', v: 2},
	{n: '04', nome: 'Casa Jardim', ano: '2023', v: 0},
];

/**
 * Tomada do site. t = tempo local (s).
 * modo 'completo': marca → vão → planta/menu → toque em Projetos → índice de projetos → Casa Pátio
 * modo 'curto': marca → planta/menu → Projetos
 */
export const SiteVao: React.FC<{t: number; modo?: 'completo' | 'curto'}> = ({t, modo = 'completo'}) => {
	const c = modo === 'curto';
	const T = c
		? {largura: 0, vao: 0.9, planta: 1.4, toque: 2.6, lista: 3.0, foco: 99}
		: {largura: 0, vao: 1.35, planta: 2.0, toque: 3.55, lista: 3.95, foco: 5.1};

	// ——— marca VÃO com largura variável
	const larg = p(t, T.largura, T.largura + 1.2, ease.out);
	const stretch = lerp(62, 125, larg);
	const peso = lerp(250, 800, larg);
	const abre = p(t, T.vao, T.vao + 0.9, ease.inOut);
	const sobeMarca = p(t, T.planta, T.planta + 0.8, ease.inOut);
	const planta = p(t, T.vao + 0.15, T.planta + 1.1, ease.inOut);
	const rotulos = p(t, T.planta + 0.5, T.planta + 1.2);
	const toque = p(t, T.toque - 0.25, T.toque + 0.1);
	const expande = p(t, T.toque + 0.05, T.lista + 0.35, ease.camera);
	const lista = p(t, T.lista, T.lista + 0.8, ease.out);
	const foco = p(t, T.foco, T.foco + 1.0, ease.camera);
	const hora = lerp(0.12, 0.92, p(t, T.foco + 0.9, T.foco + 2.6, ease.inOut));

	// a sala "Projetos" (em px da página) → tela cheia
	const plantaX = 15;
	const plantaY = lerp(250, 175, sobeMarca);
	const sala = {x: plantaX + 30, y: plantaY + 40, w: 190, h: 170};
	const cx = lerp(sala.x, 0, expande);
	const cy = lerp(sala.y, 0, expande);
	const cw = lerp(sala.w, 390, expande);
	const ch = lerp(sala.h, 693, expande);

	return (
		<Pagina fundo={OSSO}>
			<Grao opacidade={0.1} />
			{/* topo */}
			<div style={{position: 'absolute', top: 92, left: 22, right: 22, display: 'flex', fontFamily: F.mono, fontSize: 8.5, letterSpacing: 1.2, color: NANQUIM, opacity: p(t, 0.3, 0.9)}}>
				<span>ARQUITETURA RESIDENCIAL</span>
				<span style={{marginLeft: 'auto'}}>MENU ●</span>
			</div>

			{/* marca: as letras se afastam e abrem o "vão" */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: lerp(285, 112, sobeMarca),
					display: 'flex',
					justifyContent: 'center',
					fontFamily: F.archivo,
					fontStretch: `${stretch}%`,
					fontWeight: peso,
					fontSize: lerp(112, 46, sobeMarca),
					lineHeight: 0.8,
					letterSpacing: '-0.02em',
					color: NANQUIM,
				}}
			>
				<span style={{transform: `translateX(${-abre * lerp(26, 20, sobeMarca)}px)`}}>V</span>
				<span style={{width: abre * lerp(30, 12, sobeMarca)}} />
				<span>Ã</span>
				<span style={{width: abre * lerp(30, 12, sobeMarca)}} />
				<span style={{transform: `translateX(${abre * lerp(26, 20, sobeMarca)}px)`}}>O</span>
			</div>
			{/* linha do vão */}
			<div style={{position: 'absolute', left: 195 - abre * 140 * (1 - sobeMarca), width: abre * 280 * (1 - sobeMarca), top: 392, height: 1.2, background: ARGILA}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 404, textAlign: 'center', fontFamily: F.archivo, fontStretch: '100%', fontSize: 12.5, color: NANQUIM, opacity: p(t, 0.7, 1.2) * (1 - sobeMarca)}}>
				Casas desenhadas a partir da luz, do terreno e de quem vai morar.
			</div>

			{/* planta baixa = navegação */}
			<div style={{position: 'absolute', left: plantaX, top: plantaY, opacity: planta > 0 ? 1 : 0, transform: `scale(${lerp(0.9, 1, planta)})`, transformOrigin: '50% 0'}}>
				<Planta k={planta} rotulos={rotulos} destaque={toque} />
			</div>
			<div style={{position: 'absolute', left: 22, right: 22, top: 520, display: 'flex', fontFamily: F.archivo, fontSize: 11, color: NANQUIM, opacity: rotulos * (1 - expande)}}>
				<span>Toque em um ambiente para entrar</span>
				<span style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 9}}>ESC 1:100</span>
			</div>

			{/* o ambiente tocado se expande e vira a página */}
			{expande > 0 && (
				<div style={{position: 'absolute', left: cx, top: cy, width: cw, height: ch, background: NANQUIM, overflow: 'hidden'}}>
					<div style={{position: 'absolute', left: 0, top: 0, width: 390, height: 693, transform: `translate(${-cx}px, ${-cy}px)`}}>
						<div style={{position: 'absolute', top: 92, left: 22, right: 22, display: 'flex', fontFamily: F.mono, fontSize: 8.5, letterSpacing: 1.2, color: OSSO, opacity: lista}}>
							<span>VÃO — 01 PROJETOS</span>
							<span style={{marginLeft: 'auto'}}>FECHAR ✕</span>
						</div>
						<div style={{position: 'absolute', top: 128, left: 22, fontFamily: F.archivo, fontStretch: `${lerp(80, 120, lista)}%`, fontWeight: 300, fontSize: 52, lineHeight: 0.92, color: OSSO, letterSpacing: '-0.03em', opacity: lista}}>
							Projetos
						</div>
						{/* índice */}
						<div style={{position: 'absolute', top: 200, left: 22, right: 22}}>
							{PROJETOS.map((pr, i) => {
								const k = p(t, T.lista + 0.1 + i * 0.07, T.lista + 0.7 + i * 0.07, ease.out);
								const ativo = i === 0 ? foco : 0;
								return (
									<div key={pr.n} style={{display: 'flex', alignItems: 'baseline', padding: '13px 0', borderTop: `1px solid rgba(236,230,218,${0.2 * k})`, color: OSSO, opacity: k * (1 - foco * (i === 0 ? 0 : 0.85)), transform: `translateY(${(1 - k) * 18}px)`}}>
										<span style={{fontFamily: F.mono, fontSize: 9, width: 34, opacity: 0.6}}>{pr.n}</span>
										<span style={{fontFamily: F.archivo, fontStretch: `${lerp(100, 125, ativo)}%`, fontWeight: lerp(400, 700, ativo), fontSize: 24, letterSpacing: '-0.02em'}}>{pr.nome}</span>
										<span style={{marginLeft: 'auto', fontFamily: F.mono, fontSize: 9, opacity: 0.6}}>{pr.ano}</span>
									</div>
								);
							})}
						</div>
						{/* imagem do projeto em foco abre a partir da linha */}
						{foco > 0 && (
							<div style={{position: 'absolute', left: 22, right: 22, top: lerp(250, 262, foco), height: lerp(0, 238, foco), overflow: 'hidden', borderRadius: 2}}>
								<ImagemArq v={0} w={346} h={238} zoom={lerp(1.18, 1.0, foco)} hora={hora} />
								<div style={{position: 'absolute', left: 12, bottom: 10, display: 'flex', gap: 14, fontFamily: F.mono, fontSize: 8.5, color: '#fff', letterSpacing: 1, opacity: p(t, T.foco + 0.6, T.foco + 1.0)}}>
									<span>320 m²</span>
									<span>PÁTIO CENTRAL</span>
									<span>VER PROJETO →</span>
								</div>
							</div>
						)}
						{foco > 0 && (
							<div style={{position: 'absolute', left: 22, right: 22, top: 512, opacity: p(t, T.foco + 0.6, T.foco + 1.0), color: OSSO, fontFamily: F.mono, fontSize: 8.5, letterSpacing: 1}}>
								<div style={{display: 'flex'}}>
									<span>LUZ AO LONGO DO DIA</span>
									<span style={{marginLeft: 'auto'}}>{String(Math.round(lerp(6, 19, hora))).padStart(2, '0')}h</span>
								</div>
								<div style={{position: 'relative', height: 1, background: 'rgba(236,230,218,0.3)', marginTop: 10}}>
									<div style={{position: 'absolute', top: -6, left: `calc(${hora * 100}% - 6px)`, width: 12, height: 12, borderRadius: '50%', background: OSSO}} />
								</div>
							</div>
						)}
					</div>
				</div>
			)}
			{/* toque */}
			{toque > 0 && expande < 0.6 && (
				<div style={{position: 'absolute', left: sala.x + 110 - 12, top: sala.y + 92 - 12, width: 24, height: 24, borderRadius: '50%', background: 'rgba(180,83,42,0.35)', border: `1.2px solid ${ARGILA}`, transform: `scale(${1 + toque * 0.4})`, opacity: 1 - expande * 1.6}} />
			)}
		</Pagina>
	);
};
