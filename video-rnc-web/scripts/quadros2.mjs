// Quadros de verificação do filme 2: node scripts/quadros2.mjs <composição> <pasta> <segundos...>
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [comp, dir, ...segs] = process.argv.slice(2);
const serveUrl = await bundle({entryPoint: path.resolve('src/v2/index.ts')});
const browserExecutable = process.env.CHROME_PATH || null;
const chromiumOptions = {};
const composition = await selectComposition({serveUrl, id: comp, browserExecutable, chromiumOptions});
for (const s of segs) {
	await renderStill({serveUrl, composition, browserExecutable, chromiumOptions, frame: Math.min(composition.durationInFrames - 1, Math.round(Number(s) * composition.fps)), output: path.join(dir, `${comp}-${s}.jpg`), imageFormat: 'jpeg', scale: 0.5});
}
console.log('ok');
