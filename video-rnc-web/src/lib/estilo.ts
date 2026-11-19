import type {CSSProperties} from 'react';

export const COR = {
	preto: '#040405',
	grafite: '#0d0e10',
	grafite2: '#16171a',
	grafite3: '#202126',
	linha: 'rgba(255,255,255,0.12)',
	branco: '#f5f5f7',
	cinza: '#9a9da4',
	cinzaEscuro: '#5f626a',
	prata: '#c9ccd2',
};

/** Texto metálico prateado com brilho deslizante. brilho: 0..1 posição do reflexo */
export const metal = (brilho = -1, intensidade = 1, escuro = false): CSSProperties => {
	const pos = -40 + brilho * 180; // % do reflexo
	return {
		backgroundImage: [
			`linear-gradient(105deg, transparent ${pos - 14}%, rgba(255,255,255,${0.95 * intensidade}) ${pos}%, transparent ${pos + 14}%)`,
			escuro
				? 'linear-gradient(180deg, #3d4046 0%, #1a1b1f 42%, #050506 52%, #4a4e55 60%, #16171a 82%, #2c2e33 100%)'
				: 'linear-gradient(180deg, #ffffff 0%, #eceef1 30%, #a9adb5 52%, #7d828b 58%, #d6d9de 78%, #f4f5f7 100%)',
		].join(','),
		WebkitBackgroundClip: 'text',
		backgroundClip: 'text',
		color: 'transparent',
		WebkitTextFillColor: 'transparent',
	};
};

export const centro: CSSProperties = {
	position: 'absolute',
	left: 0,
	top: 0,
	width: '100%',
	height: '100%',
};
