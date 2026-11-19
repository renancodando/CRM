// Captura quadro a quadro um site real enquanto ele é rolado (execução real no navegador).
// Uso: node scripts/capturar_site.mjs <url> <saida_dir> <largura> <altura> <escala> <segundos> [fps]
// A rolagem segue uma curva suave do topo até o fim da página.
import {createRequire} from 'node:module';
const {chromium} = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';

const [url, dir, w, h, escala, segundos, fpsArg] = process.argv.slice(2);
const fps = Number(fpsArg || 30);
fs.mkdirSync(dir, {recursive: true});
const browser = await chromium.launch({args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']});
const page = await browser.newPage({viewport: {width: Number(w), height: Number(h)}, deviceScaleFactor: Number(escala)});
await page.goto(url, {waitUntil: 'networkidle'});
await page.waitForTimeout(2500);
const altura = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const n = Math.round(Number(segundos) * fps);
const suave = (x) => x * x * x * (x * (x * 6 - 15) + 10);
console.log('rolagem total', altura, 'quadros', n);
for (let i = 0; i < n; i++) {
	const y = Math.round(suave(i / (n - 1)) * altura);
	await page.evaluate((yy) => window.scrollTo(0, yy), y);
	await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
	await page.screenshot({path: path.join(dir, `q${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 92});
	if (i % 30 === 0) console.log('quadro', i);
}
await browser.close();
