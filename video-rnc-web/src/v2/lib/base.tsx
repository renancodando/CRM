import React, {createContext, useContext} from 'react';
import {loadFont} from '@remotion/fonts';
import {Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
export {p, lerp, ease, flutua} from '../../lib/tempo';

// ——— Tipografia (todas OFL, embutidas em /public/fonts)
export const F = {
	inter: '"Inter RNC", system-ui, sans-serif',
	serif: '"Instrument Serif RNC", Georgia, serif',
	mono: '"JetBrains Mono RNC", ui-monospace, monospace',
	archivo: '"Archivo V", "Inter RNC", sans-serif',
	grotesk: '"Space Grotesk V", "Inter RNC", sans-serif',
	unbounded: '"Unbounded V", "Inter RNC", sans-serif',
	bodoni: '"Bodoni Moda V", Georgia, serif',
};

let fontes: Promise<unknown> | null = null;
export const carregarFontes = () => {
	if (!fontes) {
		const u = (f: string) => staticFile(`fonts/${f}`);
		fontes = Promise.all([
			loadFont({family: 'Inter RNC', url: u('inter-var.woff2'), weight: '100 900'}),
			loadFont({family: 'Instrument Serif RNC', url: u('instrument-serif-italic.woff2'), style: 'italic'}),
			loadFont({family: 'Instrument Serif RNC', url: u('instrument-serif.woff2'), style: 'normal'}),
			loadFont({family: 'JetBrains Mono RNC', url: u('jetbrains-mono.woff2'), weight: '400'}),
			loadFont({family: 'JetBrains Mono RNC', url: u('jetbrains-mono-500.woff2'), weight: '500'}),
			loadFont({family: 'Archivo V', url: u('archivo-wdth.woff2'), weight: '100 900', stretch: '62% 125%'} as never),
			loadFont({family: 'Space Grotesk V', url: u('space-grotesk.woff2'), weight: '300 700'}),
			loadFont({family: 'Unbounded V', url: u('unbounded.woff2'), weight: '200 900'}),
			loadFont({family: 'Bodoni Moda V', url: u('bodoni-moda.woff2'), weight: '400 900'}),
		]).then(() => document.fonts.ready);
	}
	return fontes;
};

// ——— Palco: variação de fundo por versão
export type Fundo = 'livre' | 'preto' | 'marfim';
const PalcoCtx = createContext<Fundo>('livre');
export const PalcoProvider = PalcoCtx.Provider;
export const usePalco = () => useContext(PalcoCtx);
export const corPalco = (f: Fundo, livre: string) => (f === 'preto' ? '#050506' : f === 'marfim' ? '#ECE7DE' : livre);

// ——— Plano: sequência com tempo local em segundos
const DurCtx = createContext(1);
export const Plano: React.FC<{de: number; dur: number; children: React.ReactNode; nome?: string}> = ({de, dur, children, nome}) => {
	const {fps} = useVideoConfig();
	return (
		<Sequence from={Math.round(de * fps)} durationInFrames={Math.round(dur * fps)} name={nome} layout="none">
			<DurCtx.Provider value={dur}>{children}</DurCtx.Provider>
		</Sequence>
	);
};
/** tempo local (s) e duração do plano */
export const useLocal = () => {
	const f = useCurrentFrame();
	const {fps} = useVideoConfig();
	return {t: f / fps, d: useContext(DurCtx)};
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const suaviza = (x: number) => x * x * (3 - 2 * x);
