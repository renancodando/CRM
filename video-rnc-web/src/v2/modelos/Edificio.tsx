import React from 'react';
import {RoundedBox} from '@react-three/drei';
import {clamp, suaviza} from '../lib/base';

const PAPEL = '#f1ede6';
const NANQUIM = '#2b2a27';

/** Progresso local de um elemento dentro de uma fase (0..1) */
const fase = (k: number, ini: number, dur: number) => suaviza(clamp((k - ini) / dur));

const Linha: React.FC<{de: [number, number]; ate: [number, number]; k: number; y?: number; cor?: string}> = ({de, ate, k, y = 0.035, cor = NANQUIM}) => {
	const dx = ate[0] - de[0];
	const dz = ate[1] - de[1];
	const len = Math.hypot(dx, dz);
	const l = len * k;
	if (l < 0.001) return null;
	const ang = Math.atan2(dz, dx);
	return (
		<mesh position={[de[0] + Math.cos(ang) * (l / 2), y, de[1] + Math.sin(ang) * (l / 2)]} rotation={[0, -ang, 0]}>
			<boxGeometry args={[l, 0.006, 0.018]} />
			<meshBasicMaterial color={cor} />
		</mesh>
	);
};

const Caixa: React.FC<{
	p: [number, number, number];
	s: [number, number, number];
	cor?: string;
	vidro?: boolean;
	brilhoVidro?: number;
}> = ({p, s, cor = PAPEL, vidro = false, brilhoVidro = 0}) => (
	<mesh position={p} castShadow receiveShadow>
		<boxGeometry args={s} />
		{vidro ? (
			<meshPhysicalMaterial color="#3b4a52" roughness={0.06} metalness={0.2} clearcoat={1} emissive="#ffd9a0" emissiveIntensity={brilhoVidro} />
		) : (
			<meshStandardMaterial color={cor} roughness={0.92} />
		)}
	</mesh>
);

/**
 * Maquete de residência modernista que se constrói.
 * plano: desenho da planta · ergue: paredes e lajes · secao: afastamento dos andares (corte)
 */
export const Edificio: React.FC<{plano: number; ergue: number; secao?: number; luzInterna?: number; arvores?: number; noite?: boolean}> = ({
	noite = false,
	plano,
	ergue,
	secao = 0,
	luzInterna = 0,
	arvores = 1,
}) => {
	// ——— planta baixa (linhas de nanquim)
	const linhas: [[number, number], [number, number]][] = [
		[[-1.8, -1.1], [1.2, -1.1]],
		[[1.2, -1.1], [1.2, 1.1]],
		[[1.2, 1.1], [-1.8, 1.1]],
		[[-1.8, 1.1], [-1.8, -1.1]],
		[[1.2, -1.1], [2.4, -1.1]],
		[[2.4, -1.1], [2.4, 1.1]],
		[[2.4, 1.1], [1.2, 1.1]],
		[[-0.4, -1.1], [-0.4, 0.2]],
		[[-1.8, 0.2], [0.5, 0.2]],
		[[0.5, 0.2], [0.5, 1.1]],
		[[-2.6, 1.6], [-0.6, 1.6]],
		[[-2.6, 1.6], [-2.6, 2.4]],
		[[-2.6, 2.4], [-0.6, 2.4]],
		[[-0.6, 2.4], [-0.6, 1.6]],
	];
	const g = (i: number) => fase(ergue, i * 0.13, 0.32);
	const andar = (i: number) => secao * i * 0.55;
	const queda = (k: number) => (1 - k) * (1 - k) * 2.4;

	const k0 = g(0);
	const k1 = g(1);
	const k2 = g(2);
	const k3 = g(3);
	const k4 = g(4);
	const k5 = g(5);

	return (
		<group>
			{/* base */}
			<mesh position={[0, -0.03, 0]} receiveShadow>
				<boxGeometry args={[7.5, 0.06, 6]} />
				<meshStandardMaterial color={noite ? '#121214' : '#e9e4da'} roughness={1} />
			</mesh>
			{linhas.map((l, i) => (
				<Linha key={i} de={l[0]} ate={l[1]} k={fase(plano, i * 0.05, 0.35)} cor={noite ? '#e8e4dc' : NANQUIM} />
			))}
			{/* espelho d'água */}
			<mesh position={[-1.6, 0.012, 2.0]} receiveShadow visible={k0 > 0.02}>
				<boxGeometry args={[2.0, 0.02, 0.8]} />
				<meshPhysicalMaterial color="#1d2427" roughness={0.04} metalness={0.3} clearcoat={1} />
			</mesh>

			{/* térreo: vidro + núcleo + pilotis */}
			<group position={[0, andar(0), 0]} scale={[1, Math.max(0.001, k0), 1]} visible={k0 > 0.01}>
				<Caixa p={[-0.3, 0.375, 0]} s={[2.95, 0.75, 2.15]} vidro brilhoVidro={luzInterna * 0.8} />
				{[-1.5, -0.9, -0.3, 0.3, 0.9].map((x) => (
					<Caixa key={x} p={[x, 0.375, 1.09]} s={[0.025, 0.75, 0.04]} cor="#dcd6cb" />
				))}
				<Caixa p={[1.8, 0.375, 0]} s={[1.15, 0.75, 2.2]} />
				{[2.35, 2.35].map((x, i) => (
					<mesh key={i} position={[x, 0.375, i === 0 ? 1.0 : -1.0]} castShadow>
						<cylinderGeometry args={[0.035, 0.035, 0.75, 16]} />
						<meshStandardMaterial color={PAPEL} roughness={0.9} />
					</mesh>
				))}
			</group>

			{/* laje 1 + volume em balanço com rasgo horizontal */}
			<group position={[0, andar(1) + queda(k1), 0]} visible={k1 > 0.01}>
				<Caixa p={[0.35, 0.79, 0]} s={[4.7, 0.08, 2.9]} />
				<Caixa p={[0.35, 0.95, 0]} s={[4.6, 0.26, 2.8]} />
				<Caixa p={[0.35, 1.25, 0]} s={[4.5, 0.36, 2.7]} vidro brilhoVidro={luzInterna} />
				<Caixa p={[0.35, 1.5, 0]} s={[4.6, 0.16, 2.8]} />
				<Caixa p={[-1.92, 1.25, 0]} s={[0.06, 0.36, 2.8]} />
				<Caixa p={[2.62, 1.25, 0]} s={[0.06, 0.36, 2.8]} />
			</group>

			{/* laje 2 + volume superior com vidro de canto */}
			<group position={[0, andar(2) + queda(k2), 0]} visible={k2 > 0.01}>
				<Caixa p={[-0.45, 1.62, -0.1]} s={[3.3, 0.08, 2.6]} />
				<Caixa p={[-0.45, 2.0, -0.55]} s={[3.2, 0.7, 1.6]} />
				<Caixa p={[-1.2, 2.0, 0.6]} s={[1.7, 0.7, 0.7]} vidro brilhoVidro={luzInterna * 0.9} />
				<Caixa p={[0.62, 2.0, 0.6]} s={[1.05, 0.7, 0.7]} />
				{[-1.9, -1.55, -1.2, -0.85, -0.5].map((x) => (
					<Caixa key={x} p={[x, 2.0, 0.97]} s={[0.03, 0.7, 0.06]} cor="#dcd6cb" />
				))}
			</group>

			{/* cobertura */}
			<group position={[0, andar(3) + queda(k3), 0]} visible={k3 > 0.01}>
				<Caixa p={[-0.3, 2.39, -0.1]} s={[3.9, 0.07, 3.0]} />
			</group>

			{/* escada externa */}
			<group scale={[1, Math.max(0.001, k4), 1]} visible={k4 > 0.01}>
				{Array.from({length: 7}, (_, i) => (
					<Caixa key={i} p={[2.75, 0.06 + i * 0.1, -0.6 + i * 0.12]} s={[0.4, 0.04, 0.12]} />
				))}
			</group>

			{/* árvores de maquete */}
			{[
				[-3.0, 1.0, 0.5],
				[-2.9, -1.6, 0.42],
				[3.2, 1.7, 0.38],
				[3.3, -1.9, 0.46],
			].map(([x, z, r], i) => {
				const k = fase(k5 * arvores, i * 0.15, 0.5);
				return (
					<group key={i} position={[x, 0, z]} scale={Math.max(0.001, k)} visible={k > 0.01}>
						<mesh position={[0, 0.35, 0]} castShadow>
							<cylinderGeometry args={[0.018, 0.022, 0.7, 8]} />
							<meshStandardMaterial color="#d8d1c4" roughness={1} />
						</mesh>
						<mesh position={[0, 0.7 + r * 0.6, 0]} castShadow>
							<icosahedronGeometry args={[r, 1]} />
							<meshStandardMaterial color="#f5f2ec" roughness={1} flatShading />
						</mesh>
					</group>
				);
			})}
		</group>
	);
};

export const Maquetinha: React.FC = () => <Edificio plano={1} ergue={1} arvores={0} />;
export {RoundedBox};
