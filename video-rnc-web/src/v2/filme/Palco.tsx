import React from 'react';
import {AbsoluteFill, OffthreadVideo, Img, staticFile, useVideoConfig} from 'remotion';
import {usePalco} from '../lib/base';

/** Tela flutuante (o recurso visual da RNC: a Moldura). Conteúdo desenhado em 1080×1920. */
export const Tela: React.FC<{w: number; raio?: number; reflexo?: number; brilho?: number; children: React.ReactNode; style?: React.CSSProperties; borda?: number}> = ({
	w,
	raio = 54,
	reflexo = 0.12,
	brilho = 1,
	children,
	style,
	borda = 1,
}) => {
	const h = (w * 16) / 9;
	const palco = usePalco();
	const claro = palco === 'marfim';
	return (
		<div
			style={{
				position: 'relative',
				width: w,
				height: h,
				borderRadius: raio,
				overflow: 'hidden',
				background: '#000',
				boxShadow: claro
					? `0 0 0 ${borda}px rgba(0,0,0,0.08), 0 50px 90px -30px rgba(60,45,25,0.45), 0 20px 40px -20px rgba(60,45,25,0.3)`
					: `0 0 0 ${borda}px rgba(255,255,255,0.14), 0 1px 0 0 rgba(255,255,255,0.25) inset, 0 60px 120px -30px rgba(0,0,0,0.95)`,
				WebkitBoxReflect: reflexo > 0 ? `below 28px linear-gradient(transparent 78%, rgba(255,255,255,${reflexo}))` : undefined,
				filter: brilho < 1 ? `brightness(${brilho})` : undefined,
				...style,
			}}
		>
			<div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${w / 1080})`, transformOrigin: '0 0'}}>{children}</div>
			{/* reflexo de vidro */}
			<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(120deg, rgba(255,255,255,0.07) 0%, transparent 28%, transparent 72%, rgba(255,255,255,0.04) 100%)', pointerEvents: 'none'}} />
		</div>
	);
};

/** Captura real do site (vídeo gravado do navegador) */
export const Captura: React.FC<{arquivo: string; inicio?: number; velocidade?: number; largura?: number; altura?: number}> = ({arquivo, inicio = 0, velocidade = 1, largura = 1080, altura = 1920}) => {
	const {fps} = useVideoConfig();
	return (
		<OffthreadVideo
			src={staticFile(arquivo)}
			startFrom={Math.round(inicio * fps)}
			playbackRate={velocidade}
			muted
			style={{position: 'absolute', left: 0, top: 0, width: largura, height: altura}}
		/>
	);
};

export const Quadro: React.FC<{arquivo: string}> = ({arquivo}) => <Img src={staticFile(arquivo)} style={{position: 'absolute', inset: 0, width: 1080, height: 1920}} />;

/** Fundo acetinado do palco conforme a versão */
export const FundoPalco: React.FC<{luz?: number; foco?: [number, number]}> = ({luz = 1, foco = [50, 40]}) => {
	const palco = usePalco();
	if (palco === 'marfim') {
		return (
			<AbsoluteFill style={{background: `radial-gradient(ellipse 80% 55% at ${foco[0]}% ${foco[1]}%, #f7f3ec, #e9e3d8 60%, #ddd5c8 100%)`}} />
		);
	}
	return (
		<AbsoluteFill style={{background: '#040405'}}>
			<AbsoluteFill
				style={{
					opacity: luz,
					background: [
						`radial-gradient(ellipse 75% 45% at ${foco[0]}% ${foco[1]}%, rgba(190,196,210,0.12), rgba(120,126,140,0.04) 45%, transparent 75%)`,
						'radial-gradient(ellipse 120% 50% at 50% 112%, rgba(70,72,80,0.35), transparent 60%)',
						'linear-gradient(180deg, #0b0c0e 0%, #060607 55%, #08090a 100%)',
					].join(','),
				}}
			/>
		</AbsoluteFill>
	);
};
