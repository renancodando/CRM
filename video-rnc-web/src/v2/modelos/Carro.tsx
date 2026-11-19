import React, {useMemo} from 'react';
import * as THREE from 'three';

/** Perfil lateral de um cupê conceitual (x = comprimento, y = altura) */
const perfilCarroceria = () => {
	const s = new THREE.Shape();
	s.moveTo(-2.22, 0.2);
	s.lineTo(-1.93, 0.2);
	s.lineTo(-1.93, 0.3);
	s.absarc(-1.45, 0.3, 0.48, Math.PI, 0, true);
	s.lineTo(-0.97, 0.18);
	s.lineTo(0.97, 0.18);
	s.lineTo(0.97, 0.3);
	s.absarc(1.45, 0.3, 0.48, Math.PI, 0, true);
	s.lineTo(1.93, 0.2);
	s.lineTo(2.18, 0.22);
	s.bezierCurveTo(2.36, 0.26, 2.4, 0.5, 2.3, 0.6);
	s.bezierCurveTo(1.7, 0.74, 1.0, 0.82, 0.55, 0.85);
	s.lineTo(-1.45, 0.9);
	s.bezierCurveTo(-1.9, 0.91, -2.2, 0.86, -2.3, 0.74);
	s.bezierCurveTo(-2.36, 0.6, -2.34, 0.34, -2.22, 0.2);
	return s;
};

const perfilCabine = () => {
	const s = new THREE.Shape();
	s.moveTo(0.62, 0.8);
	s.bezierCurveTo(0.25, 1.02, -0.05, 1.22, -0.5, 1.25);
	s.lineTo(-0.85, 1.24);
	s.bezierCurveTo(-1.35, 1.18, -1.72, 1.0, -1.98, 0.86);
	s.lineTo(0.62, 0.8);
	return s;
};

const Roda: React.FC<{x: number; z: number; giro: number}> = ({x, z, giro}) => {
	const lado = Math.sign(z);
	return (
		<group position={[x, 0.33, z]} rotation={[0, 0, -giro]}>
			<mesh rotation={[Math.PI / 2, 0, 0]}>
				<cylinderGeometry args={[0.34, 0.34, 0.3, 48]} />
				<meshStandardMaterial color="#0c0c0d" roughness={0.85} />
			</mesh>
			<group position={[0, 0, lado * 0.152]}>
				<mesh rotation={[Math.PI / 2, 0, 0]}>
					<cylinderGeometry args={[0.24, 0.24, 0.01, 48]} />
					<meshPhysicalMaterial color="#1b1d20" metalness={0.9} roughness={0.25} />
				</mesh>
				{Array.from({length: 5}, (_, i) => (
					<mesh key={i} rotation={[0, 0, (i / 5) * Math.PI * 2]} position={[0, 0, lado * 0.008]}>
						<boxGeometry args={[0.44, 0.05, 0.02]} />
						<meshPhysicalMaterial color="#b8bfc6" metalness={1} roughness={0.18} />
					</mesh>
				))}
				<mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, lado * 0.012]}>
					<cylinderGeometry args={[0.05, 0.05, 0.02, 24]} />
					<meshPhysicalMaterial color="#d0d5da" metalness={1} roughness={0.15} />
				</mesh>
			</group>
			{/* pinça de freio */}
			<mesh position={[0.12, 0.12, lado * 0.1]} rotation={[0, 0, 0.6]}>
				<boxGeometry args={[0.12, 0.18, 0.05]} />
				<meshStandardMaterial color="#b3121b" roughness={0.4} />
			</mesh>
		</group>
	);
};

/** Cupê conceitual. cor/rugosidade controlam a pintura (polimento/vitrificação). */
export const Carro: React.FC<{cor: string; rugosidade?: number; farol?: number; lanterna?: number; giroRodas?: number}> = ({
	cor,
	rugosidade = 0.08,
	farol = 1,
	lanterna = 1,
	giroRodas = 0,
}) => {
	const geo = useMemo(() => {
		const corpo = new THREE.ExtrudeGeometry(perfilCarroceria(), {depth: 1.62, bevelEnabled: true, bevelThickness: 0.22, bevelSize: 0.16, bevelSegments: 10, curveSegments: 64});
		corpo.translate(0, 0, -0.81);
		const cabine = new THREE.ExtrudeGeometry(perfilCabine(), {depth: 1.22, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.1, bevelSegments: 10, curveSegments: 48});
		cabine.translate(0, 0, -0.61);
		corpo.computeVertexNormals();
		return {corpo, cabine};
	}, []);
	const pintura = useMemo(() => new THREE.Color(cor), [cor]);
	return (
		<group>
			<mesh geometry={geo.corpo} castShadow>
				<meshPhysicalMaterial color={pintura} metalness={0.55} roughness={rugosidade} clearcoat={1} clearcoatRoughness={Math.min(0.6, rugosidade * 0.6)} />
			</mesh>
			<mesh geometry={geo.cabine}>
				<meshPhysicalMaterial color="#07090b" metalness={0.4} roughness={0.03} clearcoat={1} clearcoatRoughness={0.02} />
			</mesh>
			{/* caixas de roda (sombra interna) */}
			{[-1.45, 1.45].map((x) => (
				<mesh key={x} position={[x, 0.33, 0]} rotation={[Math.PI / 2, 0, 0]}>
					<cylinderGeometry args={[0.46, 0.46, 1.9, 32, 1, true]} />
					<meshBasicMaterial color="#020202" side={THREE.BackSide} />
				</mesh>
			))}
			{[-1.45, 1.45].flatMap((x) => [-0.86, 0.86].map((z) => <Roda key={`${x}${z}`} x={x} z={z} giro={giroRodas} />))}
			{/* assinatura de luz dianteira */}
			<mesh position={[2.33, 0.56, 0]}>
				<boxGeometry args={[0.03, 0.035, 1.72]} />
				<meshBasicMaterial color={new THREE.Color(1.6 * farol + 0.05, 1.6 * farol + 0.05, 1.7 * farol + 0.05)} toneMapped={false} />
			</mesh>
			{/* lanterna traseira contínua */}
			<mesh position={[-2.33, 0.72, 0]}>
				<boxGeometry args={[0.03, 0.04, 1.76]} />
				<meshBasicMaterial color={new THREE.Color(2.2 * lanterna + 0.08, 0.05 * lanterna, 0.06 * lanterna)} toneMapped={false} />
			</mesh>
		</group>
	);
};
