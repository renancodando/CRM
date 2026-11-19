import React from 'react';
import {SANS} from '../fonts';
import {IconeCadeado} from './Icones';

/** Janela de navegador desktop. O conteúdo é desenhado em 1440×900 e escalado. */
export const Navegador: React.FC<{
	largura: number;
	url?: string;
	children: React.ReactNode;
	brilho?: number;
	style?: React.CSSProperties;
}> = ({largura, url = 'www.suaempresa.com.br', children, brilho = 1, style}) => {
	const barra = Math.round(largura * 0.036);
	const escala = largura / 1440;
	const alturaConteudo = 900 * escala;
	return (
		<div
			style={{
				width: largura,
				height: alturaConteudo + barra,
				borderRadius: largura * 0.014,
				overflow: 'hidden',
				background: '#1b1c1f',
				boxShadow:
					'0 0 0 1px rgba(255,255,255,0.10), 0 1px 0 0 rgba(255,255,255,0.18) inset, 0 40px 80px -20px rgba(0,0,0,0.85), 0 80px 160px -40px rgba(0,0,0,0.9)',
				position: 'relative',
				filter: brilho < 1 ? `brightness(${brilho})` : undefined,
				...style,
			}}
		>
			<div
				style={{
					height: barra,
					display: 'flex',
					alignItems: 'center',
					padding: `0 ${barra * 0.45}px`,
					gap: barra * 0.2,
					background: 'linear-gradient(180deg,#26272b,#1d1e21)',
					borderBottom: '1px solid rgba(0,0,0,0.6)',
				}}
			>
				{[0, 1, 2].map((i) => (
					<div key={i} style={{width: barra * 0.26, height: barra * 0.26, borderRadius: '50%', background: '#4a4c52'}} />
				))}
				<div
					style={{
						margin: '0 auto',
						height: barra * 0.6,
						width: '42%',
						borderRadius: barra * 0.3,
						background: '#121315',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: barra * 0.14,
						fontFamily: SANS,
						fontSize: barra * 0.3,
						color: '#a7aab1',
						letterSpacing: '0.01em',
					}}
				>
					<IconeCadeado size={barra * 0.28} color="#7d8088" />
					{url}
				</div>
				<div style={{width: barra * 1.2}} />
			</div>
			<div style={{width: largura, height: alturaConteudo, overflow: 'hidden', position: 'relative'}}>
				<div style={{width: 1440, height: 900, transform: `scale(${escala})`, transformOrigin: '0 0', position: 'absolute'}}>
					{children}
				</div>
			</div>
		</div>
	);
};
