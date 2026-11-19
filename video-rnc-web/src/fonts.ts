import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const SANS = '"Inter RNC", "Inter", system-ui, sans-serif';
export const SERIF = '"Instrument Serif RNC", Georgia, serif';
export const MONO = '"JetBrains Mono RNC", ui-monospace, monospace';

let carregado: Promise<unknown> | null = null;
export const carregarFontes = () => {
	if (!carregado) {
		carregado = Promise.all([
			loadFont({family: 'Inter RNC', url: staticFile('fonts/inter-var.woff2'), weight: '100 900'}),
			loadFont({family: 'Instrument Serif RNC', url: staticFile('fonts/instrument-serif-italic.woff2'), style: 'italic'}),
			loadFont({family: 'Instrument Serif RNC', url: staticFile('fonts/instrument-serif.woff2'), style: 'normal'}),
			loadFont({family: 'JetBrains Mono RNC', url: staticFile('fonts/jetbrains-mono.woff2'), weight: '400'}),
			loadFont({family: 'JetBrains Mono RNC', url: staticFile('fonts/jetbrains-mono-500.woff2'), weight: '500'}),
		]);
	}
	return carregado;
};
