import React from 'react';
import {F, p, ease, clamp} from '../v2/lib/base';

/**
 * Logotipo RNC Web (recriação vetorial do logo enviado pelo cliente).
 * variante 'escuro' = para fundo preto (letras prateadas); 'original' = cores do logo sobre fundo claro.
 * Substitua por um arquivo oficial em config.marca.imagem quando disponível.
 */
const R = 'M155,400 L395,400 C455,400 489,442 489,502 C489,560 456,598 404,604 L528,750 L432,750 L310,606 L250,606 L250,728 L168,728 L168,543 L376,543 C397,543 409,526 409,506 C409,486 397,472 376,472 L200,472 Z';
const N = 'M545,728 L545,400 L614,400 L792,622 L752,676 L622,515 L622,728 Z';
const C = 'M1100,437 C1056,410 1012,400 966,400 C874,400 806,470 806,564 C806,658 874,728 966,728 C1012,728 1056,716 1100,690 L1046,636 C1022,650 996,656 966,656 C918,656 884,616 884,564 C884,512 918,472 966,472 C996,472 1022,480 1046,494 Z';
const FAIXA = 'M574,731 C664,716 722,660 768,586 C812,516 852,466 914,444 L926,478 C880,496 846,538 814,594 C766,678 702,726 610,734 Z';

export const LogoRNC: React.FC<{t: number; ini: number; largura: number; variante?: 'escuro' | 'original'; brilho?: number}> = ({t, ini, largura, variante = 'escuro', brilho = -1}) => {
	const esc = variante === 'escuro';
	const id = `lg${esc ? 'e' : 'o'}`;
	const letra = (i: number) => p(t, ini + i * 0.09, ini + 0.75 + i * 0.09, ease.out);
	const faixa = p(t, ini + 0.35, ini + 1.15, ease.inOut);
	const linha2 = p(t, ini + 0.9, ini + 1.5, ease.out);
	const codigo = clamp((t - ini - 1.0) / 0.45);
	const b = -0.3 + brilho * 1.6;
	const fundo = esc ? '#060607' : '#f8f7f7';
	return (
		<svg width={largura} height={(largura * 560) / 980} viewBox="140 380 980 560" style={{overflow: 'visible'}}>
			<defs>
				<linearGradient id={`${id}m`} x1="0" y1="400" x2="0" y2="740" gradientUnits="userSpaceOnUse">
					{esc ? (
						<>
							<stop offset="0" stopColor="#ffffff" />
							<stop offset="0.45" stopColor="#dfe2e6" />
							<stop offset="0.55" stopColor="#8d929a" />
							<stop offset="1" stopColor="#e8eaed" />
						</>
					) : (
						<stop offset="0" stopColor="#1d2226" />
					)}
				</linearGradient>
				<linearGradient id={`${id}b`} x1={140 + b * 980} y1="0" x2={140 + b * 980 + 160} y2="0" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor="#fff" stopOpacity="0" />
					<stop offset="0.5" stopColor="#fff" stopOpacity={esc ? 0.85 : 0} />
					<stop offset="1" stopColor="#fff" stopOpacity="0" />
				</linearGradient>
				<linearGradient id={`${id}t`} x1="600" y1="730" x2="900" y2="450" gradientUnits="userSpaceOnUse">
					<stop offset="0" stopColor={esc ? '#14918c' : '#0d6a6a'} />
					<stop offset="0.75" stopColor={esc ? '#0f6f70' : '#0b4e52'} />
					<stop offset="1" stopColor={esc ? '#0b3f44' : '#122a2e'} />
				</linearGradient>
				<clipPath id={`${id}c`}>
					<rect x={560} y={400 + (1 - faixa) * 340} width={360} height={360} transform={`rotate(0)`} />
				</clipPath>
			</defs>
			{[R, N, C].map((d, i) => (
				<g key={i} opacity={letra(i)} transform={`translate(0 ${(1 - letra(i)) * 30})`}>
					<path d={d} fill={`url(#${id}m)`} />
					<path d={d} fill={`url(#${id}b)`} />
				</g>
			))}
			{/* faixa verde-azulada (com respiro na cor do fundo) */}
			<g clipPath={`url(#${id}c)`}>
				<path d={FAIXA} fill="none" stroke={fundo} strokeWidth={14} strokeLinejoin="round" />
				<path d={FAIXA} fill={`url(#${id}t)`} />
			</g>
			{/* </> | web */}
			<g opacity={linha2} transform={`translate(0 ${(1 - linha2) * 20})`}>
				<g fill="#d0703a" opacity={codigo > 0 ? 1 : 0}>
					<path d="M330,795 L242,842 L242,860 L330,907 L330,881 L268,851 L330,821 Z" opacity={clamp(codigo * 3)} />
					<path d="M372,792 L398,792 L344,915 L318,915 Z" opacity={clamp(codigo * 3 - 1)} />
					<path d="M398,821 L460,851 L398,881 L398,907 L472,860 L472,842 L398,795 Z" opacity={clamp(codigo * 3 - 2)} />
				</g>
				<rect x={522} y={790 + (1 - linha2) * 60} width={6} height={124 * linha2} fill={esc ? '#8d929a' : '#1d2226'} />
				<text x={588} y={905} fontFamily={F.inter} fontWeight={800} fontSize={164} letterSpacing={-4} fill={`url(#${id}m)`}>
					web
				</text>
			</g>
		</svg>
	);
};
