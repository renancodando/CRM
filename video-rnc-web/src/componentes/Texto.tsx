import React from 'react';
import {p, ease} from '../lib/tempo';

/** Revela uma linha de texto subindo por trás de uma máscara */
export const Linha: React.FC<{
	t: number;
	ini: number;
	dur?: number;
	sai?: number;
	saiDur?: number;
	children: React.ReactNode;
	style?: React.CSSProperties;
	desfoque?: boolean;
}> = ({t, ini, dur = 0.75, sai, saiDur = 0.4, children, style, desfoque = true}) => {
	const k = p(t, ini, ini + dur, ease.out);
	const s = sai !== undefined ? p(t, sai, sai + saiDur, ease.in) : 0;
	return (
		<div style={{overflow: 'hidden', paddingBottom: '0.12em', marginBottom: '-0.12em', ...style}}>
			<div
				style={{
					transform: `translateY(${(1 - k) * 105 - s * 105}%)`,
					opacity: Math.min(1, k * 1.4) * (1 - s),
					filter: desfoque ? `blur(${(1 - k) * 8 + s * 6}px)` : undefined,
				}}
			>
				{children}
			</div>
		</div>
	);
};

/** Letras surgindo uma a uma com desfoque (para palavras curtas) */
export const Letras: React.FC<{
	t: number;
	ini: number;
	texto: string;
	passo?: number;
	dur?: number;
	style?: React.CSSProperties;
	letraStyle?: (i: number) => React.CSSProperties;
}> = ({t, ini, texto, passo = 0.035, dur = 0.7, style, letraStyle}) => (
	<span style={{display: 'inline-block', whiteSpace: 'pre', ...style}}>
		{texto.split('').map((c, i) => {
			const k = p(t, ini + i * passo, ini + i * passo + dur, ease.out);
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						opacity: k,
						filter: `blur(${(1 - k) * 12}px)`,
						transform: `translateY(${(1 - k) * 0.25}em)`,
						...(letraStyle ? letraStyle(i) : {}),
					}}
				>
					{c}
				</span>
			);
		})}
	</span>
);
