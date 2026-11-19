import React, {useLayoutEffect, useMemo} from 'react';
import {useThree} from '@react-three/fiber';
import * as THREE from 'three';

/** Posiciona a câmera virtual a cada quadro (determinístico). */
export const Camara: React.FC<{pos: [number, number, number]; alvo: [number, number, number]; fov?: number; rolagem?: number}> = ({pos, alvo, fov = 35, rolagem = 0}) => {
	const {camera} = useThree();
	useLayoutEffect(() => {
		const c = camera as THREE.PerspectiveCamera;
		c.position.set(...pos);
		c.up.set(Math.sin(rolagem), Math.cos(rolagem), 0);
		c.lookAt(...alvo);
		if (c.fov !== fov) {
			c.fov = fov;
		}
		c.updateProjectionMatrix();
	});
	return null;
};

/** Forma de retângulo arredondado (para molduras, frascos, telas). */
export const retArredondado = (w: number, h: number, r: number, buraco?: {w: number; h: number; r: number}) => {
	const s = new THREE.Shape();
	const caminho = (p: THREE.Path | THREE.Shape, w2: number, h2: number, r2: number) => {
		const x = -w2 / 2;
		const y = -h2 / 2;
		p.moveTo(x + r2, y);
		p.lineTo(x + w2 - r2, y);
		p.quadraticCurveTo(x + w2, y, x + w2, y + r2);
		p.lineTo(x + w2, y + h2 - r2);
		p.quadraticCurveTo(x + w2, y + h2, x + w2 - r2, y + h2);
		p.lineTo(x + r2, y + h2);
		p.quadraticCurveTo(x, y + h2, x, y + h2 - r2);
		p.lineTo(x, y + r2);
		p.quadraticCurveTo(x, y, x + r2, y);
	};
	caminho(s, w, h, r);
	if (buraco) {
		const hp = new THREE.Path();
		caminho(hp, buraco.w, buraco.h, buraco.r);
		s.holes.push(hp);
	}
	return s;
};

/** Textura desenhada em canvas 2D (rótulos, telas). */
export const useTexturaCanvas = (w: number, h: number, desenhar: (ctx: CanvasRenderingContext2D) => void, deps: unknown[] = []) =>
	useMemo(() => {
		const c = document.createElement('canvas');
		c.width = w;
		c.height = h;
		const ctx = c.getContext('2d')!;
		desenhar(ctx);
		const tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		tex.anisotropy = 8;
		return tex;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, deps);

/** Textura de metal escovado (ruído em faixas) */
export const useEscovado = () =>
	useMemo(() => {
		const c = document.createElement('canvas');
		c.width = 512;
		c.height = 512;
		const ctx = c.getContext('2d')!;
		ctx.fillStyle = '#808080';
		ctx.fillRect(0, 0, 512, 512);
		let s = 7;
		const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
		for (let i = 0; i < 2400; i++) {
			const y = rnd() * 512;
			const g = 100 + rnd() * 70;
			ctx.fillStyle = `rgba(${g},${g},${g},0.35)`;
			ctx.fillRect(0, y, 512, 0.6 + rnd());
		}
		const t = new THREE.CanvasTexture(c);
		t.wrapS = t.wrapT = THREE.RepeatWrapping;
		return t;
	}, []);
