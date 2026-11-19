import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from '../timeline.json';

export const TL = timeline;
export const M = timeline.marcos;
export const CENAS = timeline.cenas;

/** Tempo global em segundos */
export const useT = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	return frame / fps;
};

export const useLayout = () => {
	const {width, height} = useVideoConfig();
	return {W: width, H: height, V: height > width};
};

export const ease = {
	out: Easing.bezier(0.16, 1, 0.3, 1),
	inOut: Easing.bezier(0.65, 0, 0.35, 1),
	in: Easing.bezier(0.55, 0, 1, 0.45),
	suave: Easing.bezier(0.33, 0, 0.2, 1),
	camera: Easing.bezier(0.45, 0, 0.15, 1),
};

/** Progresso 0..1 entre a e b (segundos) com easing */
export const p = (t: number, a: number, b: number, e: (x: number) => number = ease.out) =>
	b <= a ? (t >= a ? 1 : 0) : interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});

export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** Janela de visibilidade com fade de entrada e saída */
export const janela = (t: number, ini: number, fim: number, fadeIn = 0.35, fadeOut = 0.35) =>
	Math.min(p(t, ini, ini + fadeIn, ease.suave), 1 - p(t, fim - fadeOut, fim, ease.suave));

/** Ruído suave determinístico (para flutuação sutil) */
export const flutua = (t: number, semente: number, amp = 1) =>
	(Math.sin(t * 0.9 + semente * 12.9898) * 0.6 + Math.sin(t * 0.37 + semente * 78.233) * 0.4) * amp;
