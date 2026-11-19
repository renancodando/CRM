import React from 'react';
import * as THREE from 'three';
import {RoundedBox} from '@react-three/drei';
import {useTexturaCanvas, useEscovado} from './comum';

/** Frasco de perfume em vidro espesso com líquido âmbar e tampa de latão escovado. */
export const Frasco: React.FC<{nivel?: number; reflexo?: number}> = ({nivel = 0.78}) => {
	const escovado = useEscovado();
	const rotulo = useTexturaCanvas(800, 300, (c) => {
		c.clearRect(0, 0, 800, 300);
		c.fillStyle = 'rgba(255,246,230,0.92)';
		c.textAlign = 'center';
		c.font = '500 118px "Bodoni Moda V"';
		c.fillText('ÂMBAR', 400, 150);
		c.font = '400 30px "Bodoni Moda V"';
		c.fillText('EAU DE PARFUM  ·  N° 7', 400, 220);
	});
	const altLiquido = 1.12 * nivel;
	return (
		<group>
			{/* líquido */}
			<RoundedBox args={[0.84, altLiquido, 0.4]} radius={0.06} smoothness={4} position={[0, -0.56 + 0.07 + altLiquido / 2, 0]}>
				<meshPhysicalMaterial color="#e08a35" roughness={0.12} clearcoat={1} emissive="#8a3c0c" emissiveIntensity={0.55} />
			</RoundedBox>
			{/* vidro espesso: casca externa + bordas internas */}
			<RoundedBox args={[1.0, 1.28, 0.56]} radius={0.1} smoothness={6}>
				<meshPhysicalMaterial color="#fff8ee" transparent opacity={0.2} roughness={0.02} clearcoat={1} clearcoatRoughness={0.01} envMapIntensity={2.4} depthWrite={false} />
			</RoundedBox>
			<RoundedBox args={[0.92, 1.2, 0.48]} radius={0.08} smoothness={4}>
				<meshPhysicalMaterial color="#ffe9cc" transparent opacity={0.1} roughness={0.05} side={THREE.BackSide} envMapIntensity={1.5} depthWrite={false} />
			</RoundedBox>
			{/* rótulo gravado */}
			<mesh position={[0, -0.02, 0.282]}>
				<planeGeometry args={[0.78, 0.29]} />
				<meshBasicMaterial map={rotulo} transparent toneMapped={false} />
			</mesh>
			{/* gargalo */}
			<mesh position={[0, 0.72, 0]}>
				<cylinderGeometry args={[0.1, 0.12, 0.18, 40]} />
				<meshPhysicalMaterial color="#d5b27a" metalness={1} roughness={0.25} />
			</mesh>
			{/* tampa de latão escovado */}
			<RoundedBox args={[0.52, 0.5, 0.52]} radius={0.04} smoothness={4} position={[0, 1.04, 0]}>
				<meshPhysicalMaterial color="#c99f63" metalness={1} roughness={0.3} roughnessMap={escovado} clearcoat={0.3} />
			</RoundedBox>
		</group>
	);
};
