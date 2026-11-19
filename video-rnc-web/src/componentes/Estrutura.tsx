import React from 'react';
import {p, ease} from '../lib/tempo';

type Forma = {tipo: 'r'; x: number; y: number; w: number; h: number; rx?: number} | {tipo: 'l'; x1: number; y1: number; x2: number; y2: number};

const CAMADAS: Forma[][] = [
	// grade
	[
		{tipo: 'r', x: 0, y: 0, w: 1000, h: 640, rx: 18},
		...Array.from({length: 11}, (_, i) => ({tipo: 'l' as const, x1: 83 * (i + 1), y1: 0, x2: 83 * (i + 1), y2: 640})),
		...Array.from({length: 6}, (_, i) => ({tipo: 'l' as const, x1: 0, y1: 91 * (i + 1), x2: 1000, y2: 91 * (i + 1)})),
	],
	// blocos de layout
	[
		{tipo: 'r', x: 0, y: 0, w: 1000, h: 70, rx: 0},
		{tipo: 'r', x: 50, y: 120, w: 430, h: 250, rx: 10},
		{tipo: 'r', x: 540, y: 110, w: 410, h: 270, rx: 14},
		{tipo: 'r', x: 50, y: 430, w: 280, h: 170, rx: 12},
		{tipo: 'r', x: 360, y: 430, w: 280, h: 170, rx: 12},
		{tipo: 'r', x: 670, y: 430, w: 280, h: 170, rx: 12},
	],
	// conteúdo
	[
		{tipo: 'r', x: 50, y: 24, w: 110, h: 22, rx: 11},
		{tipo: 'l', x1: 560, y1: 35, x2: 620, y2: 35},
		{tipo: 'l', x1: 650, y1: 35, x2: 710, y2: 35},
		{tipo: 'l', x1: 740, y1: 35, x2: 800, y2: 35},
		{tipo: 'r', x: 840, y: 20, w: 110, h: 30, rx: 15},
		{tipo: 'l', x1: 70, y1: 160, x2: 440, y2: 160},
		{tipo: 'l', x1: 70, y1: 200, x2: 400, y2: 200},
		{tipo: 'l', x1: 70, y1: 250, x2: 360, y2: 250},
		{tipo: 'l', x1: 70, y1: 275, x2: 330, y2: 275},
		{tipo: 'r', x: 70, y: 310, w: 150, h: 40, rx: 20},
		{tipo: 'l', x1: 540, y1: 110, x2: 950, y2: 380},
		{tipo: 'l', x1: 950, y1: 110, x2: 540, y2: 380},
		...[50, 360, 670].flatMap((x) => [
			{tipo: 'r' as const, x: x + 24, y: 456, w: 44, h: 44, rx: 10},
			{tipo: 'l' as const, x1: x + 24, y1: 535, x2: x + 220, y2: 535},
			{tipo: 'l' as const, x1: x + 24, y1: 562, x2: x + 180, y2: 562},
		]),
	],
];

const cantos = (f: Forma): [number, number][] =>
	f.tipo === 'r'
		? [
				[f.x, f.y],
				[f.x + f.w, f.y],
				[f.x, f.y + f.h],
				[f.x + f.w, f.y + f.h],
			]
		: [
				[f.x1, f.y1],
				[f.x2, f.y2],
			];

/** Estrutura de site em camadas (vista explodida 3D), desenhada por linhas de luz. */
export const EstruturaSite: React.FC<{t: number; ini: number; dur: number; separacao: number; brilho?: number}> = ({
	t,
	ini,
	dur,
	separacao,
	brilho = 1,
}) => (
	<div style={{position: 'relative', width: 1000, height: 640, transformStyle: 'preserve-3d'}}>
		{CAMADAS.map((formas, c) => {
			const cIni = ini + c * dur * 0.22;
			const cDur = dur * 0.56;
			return (
				<div
					key={c}
					style={{
						position: 'absolute',
						inset: 0,
						transform: `translateZ(${c * separacao}px)`,
						transformStyle: 'preserve-3d',
					}}
				>
					<div
						style={{
							position: 'absolute',
							inset: 0,
							borderRadius: 18,
							background: c === 0 ? 'rgba(255,255,255,0.025)' : 'transparent',
							opacity: p(t, cIni, cIni + cDur),
						}}
					/>
					<svg width={1000} height={640} viewBox="-10 -10 1020 660" style={{position: 'absolute', left: -10, top: -10, width: 1020, height: 660, overflow: 'visible'}}>
						{formas.map((f, i) => {
							const a = cIni + (i / formas.length) * cDur * 0.6;
							const k = p(t, a, a + cDur * 0.5, ease.inOut);
							const op = (c === 0 ? 0.3 : c === 1 ? 0.72 : 0.92) * brilho;
							const comum = {
								pathLength: 1,
								strokeDasharray: 1,
								strokeDashoffset: 1 - k,
								fill: 'none',
								stroke: `rgba(235,238,245,${op})`,
								strokeWidth: c === 0 ? 1 : 1.6,
							};
							return (
								<g key={i}>
									{f.tipo === 'r' ? (
										<rect x={f.x} y={f.y} width={f.w} height={f.h} rx={f.rx ?? 0} {...comum} />
									) : (
										<line x1={f.x1} y1={f.y1} x2={f.x2} y2={f.y2} {...comum} strokeLinecap="round" />
									)}
									{c > 0 &&
										cantos(f).map(([x, y], j) => {
											const n = p(t, a + cDur * 0.25, a + cDur * 0.45);
											const flash = Math.max(0, 1 - Math.abs(t - (a + cDur * 0.35)) / 0.25);
											return (
												<circle
													key={j}
													cx={x}
													cy={y}
													r={2.4 + flash * 3}
													fill={`rgba(255,255,255,${(0.35 + flash * 0.65) * n * brilho})`}
												/>
											);
										})}
								</g>
							);
						})}
					</svg>
				</div>
			);
		})}
	</div>
);
