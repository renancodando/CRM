import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useT, flutua} from '../lib/tempo';

const ruidoSvg = (seed: number) =>
	`url("data:image/svg+xml;utf8,${encodeURIComponent(
		`<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' seed='${seed}' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 1.1 -0.2'/></filter><rect width='300' height='300' filter='url(#n)'/></svg>`,
	)}")`;
const RUIDOS = [1, 2, 3, 4].map(ruidoSvg);

/** Fundo preto acetinado com luz cinematográfica sutil. luz: 0..1 intensidade */
export const Fundo: React.FC<{luz?: number; foco?: {x: number; y: number}}> = ({luz = 1, foco = {x: 50, y: 38}}) => {
	const t = useT();
	const dx = flutua(t, 1, 3);
	const dy = flutua(t, 2, 2);
	return (
		<AbsoluteFill style={{background: '#040405'}}>
			<AbsoluteFill
				style={{
					opacity: luz,
					background: [
						`radial-gradient(ellipse 70% 45% at ${foco.x + dx}% ${foco.y + dy}%, rgba(190,196,210,0.11), rgba(120,126,140,0.04) 45%, transparent 75%)`,
						`radial-gradient(ellipse 120% 60% at 50% 115%, rgba(60,62,70,0.35), transparent 60%)`,
						'linear-gradient(180deg, #0b0c0e 0%, #060607 55%, #08090a 100%)',
					].join(','),
				}}
			/>
		</AbsoluteFill>
	);
};

/** Grão de filme + vinheta, aplicados por cima de tudo */
export const Acabamento: React.FC<{vinheta?: number}> = ({vinheta = 0.55}) => {
	const t = useT();
	const f = Math.floor(t * 30);
	return (
		<>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse 85% 75% at 50% 48%, transparent 55%, rgba(0,0,0,${vinheta}) 100%)`,
					pointerEvents: 'none',
				}}
			/>
			<AbsoluteFill
				style={{
					backgroundImage: RUIDOS[f % 4],
					backgroundPosition: `${(f * 37) % 300}px ${(f * 53) % 300}px`,
					opacity: 0.07,
					mixBlendMode: 'overlay',
					pointerEvents: 'none',
				}}
			/>
		</>
	);
};
