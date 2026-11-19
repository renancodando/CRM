import React from 'react';

export const IconeBusca: React.FC<{size?: number; color?: string}> = ({size = 40, color = '#9a9da4'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="1.8" />
		<path d="M15.5 15.5L20 20" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
	</svg>
);

/** Glifo genérico de conversa/telefone para o botão de WhatsApp */
export const IconeWhats: React.FC<{size?: number; color?: string}> = ({size = 24, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path
			d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.3 20.7l4.4-1.1A8.8 8.8 0 1 0 12 3.2Z"
			stroke={color}
			strokeWidth="1.7"
			strokeLinejoin="round"
		/>
		<path
			d="M9.1 8.1c.2-.4.5-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.2-.1.4 0 .5.6 1 1.4 1.8 2.4 2.4.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.5-.4.7-.5.4-1.2.6-1.9.5-2.6-.5-4.7-2.6-5.3-5.2-.2-.7 0-1.3.6-1.7Z"
			fill={color}
		/>
	</svg>
);

export const IconePino: React.FC<{size?: number; color?: string}> = ({size = 24, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M12 21.5s7-6.2 7-11.8A7 7 0 0 0 5 9.7c0 5.6 7 11.8 7 11.8Z" fill={color} />
		<circle cx="12" cy="9.6" r="2.6" fill="rgba(0,0,0,0.35)" />
	</svg>
);

export const IconeRelogio: React.FC<{size?: number; color?: string}> = ({size = 24, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.8" />
		<path d="M12 7.5V12l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
	</svg>
);

export const IconeSeta: React.FC<{size?: number; color?: string}> = ({size = 24, color = '#fff'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<path d="M5 12h13M13 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
	</svg>
);

export const IconeCadeado: React.FC<{size?: number; color?: string}> = ({size = 14, color = '#888'}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" fill="none">
		<rect x="5" y="10.5" width="14" height="10" rx="2.2" fill={color} />
		<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke={color} strokeWidth="2.2" />
	</svg>
);

/** Ponteiro do mouse */
export const Cursor: React.FC<{x: number; y: number; clique?: number; opacidade?: number; escala?: number}> = ({
	x,
	y,
	clique = 0,
	opacidade = 1,
	escala = 1,
}) => (
	<div
		style={{
			position: 'absolute',
			left: x,
			top: y,
			opacity: opacidade,
			transform: `scale(${escala * (1 - Math.sin(Math.min(1, clique) * Math.PI) * 0.12)})`,
			transformOrigin: '4px 4px',
			filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))',
			zIndex: 50,
		}}
	>
		{clique > 0 && clique < 1 && (
			<div
				style={{
					position: 'absolute',
					left: 4 - 40 * clique,
					top: 4 - 40 * clique,
					width: 80 * clique,
					height: 80 * clique,
					borderRadius: '50%',
					border: `2px solid rgba(255,255,255,${0.7 * (1 - clique)})`,
				}}
			/>
		)}
		<svg width={34} height={42} viewBox="0 0 17 21">
			<path d="M1 1v15.2l3.9-3.6 2.5 6 2.6-1.1-2.5-5.8h5.4L1 1Z" fill="#fff" stroke="#111" strokeWidth="1.1" strokeLinejoin="round" />
		</svg>
	</div>
);
