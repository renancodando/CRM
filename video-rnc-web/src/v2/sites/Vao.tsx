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


/** Corte técnico (seção) desenhado em linha, com sol e sombra que mudam com a hora */
export const Corte: React.FC<{k: number; hora: number}> = ({k, hora}) => {
	const d = (i: number) => ({pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp(k * 1.7 - i * 0.12)});
	const ang = lerp(18, 162, hora) * (Math.PI / 180);
	const sx = 173 - Math.cos(ang) * 150;
	const sy = 150 - Math.sin(ang) * 120;
	const sombra = Math.max(0, Math.cos(ang)) * 60;
	return (
		<svg width={346} height={238} viewBox="0 0 346 238" style={{display: 'block'}}>
			{/* terreno */}
			<path d="M0 196 H346" stroke={OSSO} strokeWidth={1.4} {...d(0)} />
			{Array.from({length: 22}, (_, i) => (
				<path key={i} d={`M${i * 16} 204 l8 -8`} stroke={OSSO} strokeOpacity={0.3} strokeWidth={0.6} opacity={clamp(k * 2 - 0.6)} />
			))}
			{/* volumes em corte (paredes cortadas em preenchimento) */}
			<path d="M40 196 V120 H306 V196" fill="none" stroke={OSSO} strokeWidth={1.2} {...d(1)} />
			<path d="M28 120 H318 V112 H28 Z" fill={OSSO} fillOpacity={0.9 * clamp(k * 2 - 0.5)} stroke="none" />
			<path d="M70 112 V62 H250 V112" fill="none" stroke={OSSO} strokeWidth={1.2} {...d(2)} />
			<path d="M60 62 H262 V56 H60 Z" fill={OSSO} fillOpacity={0.9 * clamp(k * 2 - 0.7)} />
			{/* pátio (vazio central) */}
			<path d="M140 196 V120 M196 196 V120" stroke={OSSO} strokeOpacity={0.5} strokeWidth={0.8} strokeDasharray="3 3" opacity={clamp(k * 2 - 0.8)} />
			<text x={168} y={168} textAnchor="middle" fontFamily={F.mono} fontSize={7} fill={OSSO} opacity={clamp(k * 2 - 1)} letterSpacing={1}>PÁTIO</text>
			{/* cotas */}
			<g opacity={clamp(k * 2 - 1)} stroke={OSSO} strokeWidth={0.5} fill={OSSO} fontFamily={F.mono} fontSize={6.5}>
				<path d="M330 196 V56 M326 196 H334 M326 120 H334 M326 56 H334" />
				<text x={336} y={160} stroke="none" transform="rotate(90 336 160)">3,10</text>
				<text x={336} y={86} stroke="none" transform="rotate(90 336 86)">2,80</text>
			</g>
			{/* luz do sol */}
			<g opacity={clamp(k * 2 - 1)}>
				<line x1={sx} y1={sy} x2={168} y2={150} stroke="#E7B36A" strokeWidth={0.8} strokeDasharray="2 3" />
				<circle cx={sx} cy={sy} r={6} fill="#E7B36A" />
				<path d={`M140 196 L${140 + sombra} 196 L${140 + sombra * 0.6} 120 L140 120 Z`} fill="#E7B36A" opacity={0.18} />
			</g>
			<g fontFamily={F.mono} fontSize={7} fill={OSSO} opacity={clamp(k * 2 - 1.1)} letterSpacing={1}>
				<text x={8} y={226}>CORTE AA · ESC 1:200</text>
				<text x={338} y={226} textAnchor="end">320 m² · 3 SUÍTES</text>
			</g>
		</svg>
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
						{/* corte técnico do projeto em foco, com estudo de luz */}
						{foco > 0 && (
							<div style={{position: 'absolute', left: 22, right: 22, top: 262, height: lerp(0, 238, foco), overflow: 'hidden', borderTop: `1px solid rgba(236,230,218,0.25)`, background: NANQUIM}}>
								<Corte k={p(t, T.foco + 0.2, T.foco + 1.2, ease.inOut)} hora={hora} />
							</div>
						)}
						{foco > 0 && (
							<div style={{position: 'absolute', left: 22, right: 22, top: 512, opacity: p(t, T.foco + 0.6, T.foco + 1.0), color: OSSO, fontFamily: F.mono, fontSize: 8.5, letterSpacing: 1}}>
								<div style={{display: 'flex'}}>
									<span>ESTUDO DE LUZ</span>
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
