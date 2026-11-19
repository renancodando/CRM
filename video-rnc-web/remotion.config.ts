import {Config} from '@remotion/cli/config';

Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(95);
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(16);
Config.setConcurrency(4);
// Navegador do sistema (opcional). Defina CHROME_PATH para usar outro executável.
if (process.env.CHROME_PATH) {
	Config.setBrowserExecutable(process.env.CHROME_PATH);
}
