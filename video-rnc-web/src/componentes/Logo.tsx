import React from 'react';
import {Img, staticFile} from 'remotion';
import {config} from '../config';
import {SANS} from '../fonts';
import {p, ease} from '../lib/tempo';
import {metal} from '../lib/estilo';

/**
 * Logotipo RNC WEB. Anima letra a letra a partir de `ini` (segundos).
 * brilho: 0..1 posição do reflexo metálico.
 */
export const Logo: React.FC<{t: number; ini: number; tamanho: number; brilho?: number; reflexo?: boolean; linha?: number}> = ({
	t,
	ini,
	tamanho,
	brilho = -1,
	reflexo = true,
	linha,
}) => {
	const {nome, complemento, imagem} = config.marca;
	const linhaK = linha ?? p(t, ini + 0.55, ini + 1.2, ease.inOut);

	if (imagem) {
		const k = p(t, ini, ini + 0.9, ease.out);
		return (
			<div style={{opacity: k, filter: `blur(${(1 - k) * 14}px)`, transform: `scale(${0.94 + 0.06 * k})`}}>
				<Img src={staticFile(imagem)} style={{height: tamanho * 1.1, objectFit: 'contain'}} />
			</div>
		);
	}

	const letras = (txt: string, base: number, peso: number, esp: string) =>
		txt.split('').map((c, i) => {
			const a = ini + base + i * 0.07;
			const k = p(t, a, a + 0.9, ease.out);
			return (
				<span
					key={i}
					style={{
						display: 'inline-block',
						fontWeight: peso,
						letterSpacing: esp,
						opacity: Math.min(1, k * 1.3),
						filter: `blur(${(1 - k) * 16}px)`,
						transform: `perspective(800px) translateZ(${(1 - k) * -420}px) rotateY(${(1 - k) * 50}deg)`,
						...metal(brilho - i * 0.03),
					}}
				>
					{c}
				</span>
			);
		});

	const marca = (
		<div style={{display: 'flex', alignItems: 'baseline', fontFamily: SANS, fontSize: tamanho, lineHeight: 1, whiteSpace: 'nowrap'}}>
			<span style={{display: 'inline-flex'}}>{letras(nome, 0, 800, '-0.05em')}</span>
			<span style={{width: tamanho * 0.22, display: 'inline-block'}} />
			<span style={{display: 'inline-flex'}}>{letras(complemento, 0.22, 250, '0.06em')}</span>
		</div>
	);

	return (
		<div style={{position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
			{marca}
			{/* linha prateada */}
			<div
				style={{
					marginTop: tamanho * 0.16,
					height: Math.max(2, tamanho * 0.012),
					width: `${linhaK * 100}%`,
					background: 'linear-gradient(90deg, transparent, rgba(220,224,230,0.9) 30%, #fff 50%, rgba(220,224,230,0.9) 70%, transparent)',
					boxShadow: '0 0 12px rgba(255,255,255,0.45)',
				}}
			/>
			{reflexo && (
				<div
					style={{
						position: 'absolute',
						top: '100%',
						marginTop: tamanho * 0.08,
						transform: 'scaleY(-1)',
						opacity: 0.12,
						maskImage: 'linear-gradient(0deg, rgba(0,0,0,0.9), transparent 55%)',
						WebkitMaskImage: 'linear-gradient(0deg, rgba(0,0,0,0.9), transparent 55%)',
						filter: 'blur(2px)',
					}}
				>
					{marca}
				</div>
			)}
		</div>
	);
};
