import React, {useMemo, useLayoutEffect, useRef} from 'react';
import * as THREE from 'three';
import {RoundedBox} from '@react-three/drei';
import {useTexturaCanvas, useEscovado} from './comum';
import {clamp, suaviza} from '../lib/base';

export const LIMA = '#c8f031';

/** Peças com posição na pilha (z) e posição no "grid de serviços" */
export const PECAS = ['tela', 'moldura', 'placa', 'bateria', 'camera', 'traseira'] as const;
export type Peca = (typeof PECAS)[number];

type Props = {
	/** 0 = montado · 1 = vista explodida */
	explode: number;
	/** 0..1 — as peças migram para posições de grade (interface) */
	grade?: number;
	/** posições de grade (mundo) por peça */
	posGrade?: Partial<Record<Peca, [number, number, number, number]>>;
	/** peça destacada (brilho lima) */
	destaque?: Peca | null;
	destaqueK?: number;
	/** rotação do conjunto */
	rot?: [number, number, number];
	/** tela acesa */
	telaLuz?: number;
	/** 0..1 componentes SMD dispersos (centenas de peças) */
	dispersao?: number;
};

const SMD = 260;

export const Celular: React.FC<Props> = ({explode, grade = 0, posGrade = {}, destaque = null, destaqueK = 0, rot = [0, 0, 0], telaLuz = 1, dispersao = 0}) => {
	const escovado = useEscovado();
	const e = suaviza(clamp(explode));
	const gk = suaviza(clamp(grade));

	const telaTex = useTexturaCanvas(600, 1240, (c) => {
		const g = c.createLinearGradient(0, 0, 0, 1240);
		g.addColorStop(0, '#15181b');
		g.addColorStop(1, '#0b0c0e');
		c.fillStyle = g;
		c.fillRect(0, 0, 600, 1240);
		c.fillStyle = LIMA;
		c.beginPath();
		c.arc(300, 520, 150, 0, Math.PI * 2);
		c.globalAlpha = 0.12;
		c.fill();
		c.globalAlpha = 1;
		c.strokeStyle = LIMA;
		c.lineWidth = 6;
		c.beginPath();
		c.arc(300, 520, 150, -Math.PI / 2, Math.PI * 1.15);
		c.stroke();
		c.fillStyle = '#e8ecef';
		c.font = '600 64px "Space Grotesk V"';
		c.textAlign = 'center';
		c.fillText('Núcleo', 300, 160);
		c.font = '500 30px "JetBrains Mono RNC"';
		c.fillStyle = '#9aa3a8';
		c.fillText('DIAGNÓSTICO', 300, 790);
		c.font = '700 120px "Space Grotesk V"';
		c.fillStyle = '#e8ecef';
		c.fillText('98%', 300, 562);
		c.fillStyle = LIMA;
		c.beginPath();
		c.roundRect(80, 1040, 440, 96, 48);
		c.fill();
		c.fillStyle = '#0f1113';
		c.font = '600 38px "Space Grotesk V"';
		c.fillText('Agendar avaliação', 300, 1101);
	});

	const bateriaTex = useTexturaCanvas(512, 760, (c) => {
		c.fillStyle = '#c9ced3';
		c.fillRect(0, 0, 512, 760);
		c.fillStyle = '#20252a';
		c.fillRect(0, 250, 512, 260);
		c.fillStyle = '#e8ecef';
		c.font = '600 54px "Space Grotesk V"';
		c.fillText('BATERIA', 46, 360);
		c.font = '400 26px "JetBrains Mono RNC"';
		c.fillStyle = '#9aa3a8';
		c.fillText('Li-ion · 3,85 V', 48, 420);
		c.fillStyle = LIMA;
		c.fillRect(46, 450, 120, 10);
	});

	const placaTex = useTexturaCanvas(512, 1024, (c) => {
		c.fillStyle = '#0d1f17';
		c.fillRect(0, 0, 512, 1024);
		c.strokeStyle = 'rgba(214,178,94,0.55)';
		c.lineWidth = 2;
		let s = 3;
		const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
		for (let i = 0; i < 140; i++) {
			c.beginPath();
			let x = r() * 512;
			let y = r() * 1024;
			c.moveTo(x, y);
			for (let j = 0; j < 4; j++) {
				if (j % 2) x += (r() - 0.5) * 180;
				else y += (r() - 0.5) * 180;
				c.lineTo(x, y);
			}
			c.stroke();
		}
	});

	const destacar = (p: Peca) => (destaque === p ? destaqueK : 0);
	const mat = (p: Peca, base: THREE.MeshStandardMaterialParameters) => ({...base, emissive: new THREE.Color(LIMA), emissiveIntensity: destacar(p) * 0.12});

	// posição explodida (pilha) → posição de grade
	const BASE: Record<Peca, number> = {tela: 0.036, moldura: 0, placa: 0.004, bateria: -0.008, camera: -0.05, traseira: -0.037};
	const pos = (p: Peca, zPilha: number, ex: [number, number] = [0, 0]): [number, number, number] => {
		const pilha: [number, number, number] = [ex[0] * e, ex[1] * e, BASE[p] + zPilha * e];
		const g = posGrade[p];
		const alvo: [number, number, number] = g ? [g[0], g[1], g[2]] : pilha;
		return [pilha[0] + (alvo[0] - pilha[0]) * gk, pilha[1] + (alvo[1] - pilha[1]) * gk, pilha[2] + (alvo[2] - pilha[2]) * gk];
	};
	const giroGrade = (p: Peca): [number, number, number] => [0, 0, 0].map((v, i) => (i === 1 ? gk * -0.35 : i === 0 ? gk * 0.25 : 0) + (destaque === p ? destaqueK * 0.4 : 0)) as [number, number, number];
	const escP = (p: Peca) => 1 + ((posGrade[p]?.[3] ?? 0.62) - 1) * gk + (destaque === p ? destaqueK * 0.08 : 0);

	// componentes SMD (instanciados)
	const smd = useRef<THREE.InstancedMesh>(null);
	const dados = useMemo(() => {
		let s = 11;
		const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
		return Array.from({length: SMD}, () => ({
			x: (r() - 0.5) * 0.55,
			y: (r() - 0.2) * 1.0,
			sx: 0.012 + r() * 0.03,
			sy: 0.008 + r() * 0.02,
			dir: new THREE.Vector3(r() - 0.5, r() - 0.5, r() * 0.9 + 0.1).normalize(),
			dist: 0.8 + r() * 2.4,
			giro: r() * 6,
		}));
	}, []);
	useLayoutEffect(() => {
		const m = new THREE.Matrix4();
		const q = new THREE.Quaternion();
		const d = suaviza(clamp(dispersao));
		const ocultar = gk;
		dados.forEach((c, i) => {
			const p = new THREE.Vector3(c.x, c.y, 0.012).addScaledVector(c.dir, d * c.dist);
			q.setFromEuler(new THREE.Euler(c.giro * d, c.giro * d * 0.7, 0));
			const esc = 1 - ocultar;
			m.compose(p, q, new THREE.Vector3(c.sx * esc + 1e-4, c.sy * esc + 1e-4, 0.01 * esc + 1e-4));
			smd.current?.setMatrixAt(i, m);
		});
		if (smd.current) smd.current.instanceMatrix.needsUpdate = true;
	});

	return (
		<group rotation={rot}>
			{/* tela (vidro + painel) */}
			<group position={pos('tela', 1.15, [0, 0.05])} rotation={giroGrade('tela')} scale={escP('tela')}>
				<RoundedBox args={[0.76, 1.58, 0.03]} radius={0.012} smoothness={4}>
					<meshPhysicalMaterial {...mat('tela', {color: '#0b0c0d', roughness: 0.04, metalness: 0.1})} clearcoat={1} clearcoatRoughness={0.02} />
				</RoundedBox>
				<mesh position={[0, 0, 0.016]}>
					<planeGeometry args={[0.7, 1.52]} />
					<meshBasicMaterial map={telaTex} toneMapped={false} color={new THREE.Color(telaLuz, telaLuz, telaLuz)} />
				</mesh>
			</group>
			{/* moldura de alumínio */}
			<group position={pos('moldura', 0.55)} rotation={giroGrade('moldura')} scale={escP('moldura')}>
				<RoundedBox args={[0.8, 1.62, 0.07]} radius={0.06} smoothness={6}>
					<meshPhysicalMaterial {...mat('moldura', {color: '#a6adb3', metalness: 1, roughness: 0.32, roughnessMap: escovado})} />
				</RoundedBox>
			</group>
			{/* placa lógica + chips */}
			<group position={pos('placa', 0.0, [0.0, 0.08])} rotation={giroGrade('placa')} scale={escP('placa')}>
				<mesh position={[0.17, 0.32, 0]}>
					<boxGeometry args={[0.3, 0.86, 0.012]} />
					<meshStandardMaterial {...mat('placa', {map: placaTex, roughness: 0.5, metalness: 0.2})} />
				</mesh>
				<mesh position={[0.17, 0.22, 0.014]}>
					<boxGeometry args={[0.16, 0.16, 0.014]} />
					<meshPhysicalMaterial color="#c4c9cd" metalness={1} roughness={0.22} />
				</mesh>
				<mesh position={[0.17, 0.45, 0.012]}>
					<boxGeometry args={[0.12, 0.08, 0.01]} />
					<meshStandardMaterial color="#1c1e20" roughness={0.4} />
				</mesh>
				<mesh position={[0.17, 0.0, 0.012]}>
					<boxGeometry args={[0.1, 0.12, 0.01]} />
					<meshStandardMaterial color="#1c1e20" roughness={0.4} />
				</mesh>
				<instancedMesh ref={smd} args={[undefined, undefined, SMD]}>
					<boxGeometry args={[1, 1, 1]} />
					<meshStandardMaterial color="#d7b25e" metalness={0.8} roughness={0.35} />
				</instancedMesh>
			</group>
			{/* bateria */}
			<group position={pos('bateria', -0.5, [-0.08, -0.12])} rotation={giroGrade('bateria')} scale={escP('bateria')}>
				<RoundedBox args={[0.42, 0.92, 0.045]} radius={0.015} smoothness={3}>
					<meshPhysicalMaterial {...mat('bateria', {map: bateriaTex, metalness: 0.5, roughness: 0.35})} />
				</RoundedBox>
			</group>
			{/* módulo de câmera */}
			<group position={pos('camera', -0.95, [-0.14, 0.42]).map((v, i) => v + (i === 0 ? -0.17 * (1 - e) : i === 1 ? 0.5 * (1 - e) : 0)) as [number, number, number]} rotation={giroGrade('camera')} scale={escP('camera')}>
				<RoundedBox args={[0.34, 0.34, 0.05]} radius={0.06} smoothness={4}>
					<meshPhysicalMaterial {...mat('camera', {color: '#1a1c1f', metalness: 0.6, roughness: 0.25})} />
				</RoundedBox>
				{[
					[-0.075, 0.075],
					[0.075, 0.075],
					[-0.075, -0.075],
				].map(([x, y], i) => (
					<group key={i} position={[x, y, -0.03]} rotation={[Math.PI / 2, 0, 0]}>
						<mesh>
							<cylinderGeometry args={[0.058, 0.058, 0.04, 40]} />
							<meshPhysicalMaterial color="#9aa1a7" metalness={1} roughness={0.2} />
						</mesh>
						<mesh position={[0, -0.021, 0]}>
							<cylinderGeometry args={[0.042, 0.042, 0.004, 40]} />
							<meshPhysicalMaterial color="#05070a" roughness={0.02} metalness={0.3} clearcoat={1} />
						</mesh>
					</group>
				))}
			</group>
			{/* tampa traseira */}
			<group position={pos('traseira', -1.45)} rotation={giroGrade('traseira')} scale={escP('traseira')}>
				<RoundedBox args={[0.8, 1.62, 0.025]} radius={0.012} smoothness={4}>
					<meshPhysicalMaterial {...mat('traseira', {color: '#2b3034', roughness: 0.38, metalness: 0.3})} clearcoat={0.6} />
				</RoundedBox>
			</group>
		</group>
	);
};
