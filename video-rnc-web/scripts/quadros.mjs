// Renderiza quadros de verificação rapidamente (um único bundle).
// Uso: node scripts/quadros.mjs <composição> <pasta> <segundos...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';

const [comp, dir, ...segs] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = process.env.CHROME_PATH || null;
const composition = await selectComposition({serveUrl, id: comp, inputProps: {comAudio: false}, browserExecutable});
for (const s of segs) {
	await renderStill({
		serveUrl, composition, browserExecutable, inputProps: {comAudio: false},
		frame: Math.round(Number(s) * composition.fps),
		output: path.join(dir, `${comp}-${s}.jpg`), imageFormat: 'jpeg', scale: 0.5,
	});
}
console.log('ok');
