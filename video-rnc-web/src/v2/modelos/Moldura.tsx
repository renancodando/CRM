import React, {useMemo} from 'react';
import * as THREE from 'three';
import {retArredondado, useEscovado} from './comum';

/**
 * A Moldura — símbolo da RNC Web: uma janela (tela) em metal escovado
 * com a barra superior de um navegador. Recurso visual recorrente do filme.
 */
export const Moldura: React.FC<{escala?: number; brilho?: number; luzes?: string[]}> = ({escala = 1}) => {
	const escovado = useEscovado();
	const geo = useMemo(() => {
		const anel = new THREE.ExtrudeGeometry(retArredondado(2.2, 1.6, 0.26, {w: 1.86, h: 1.26, r: 0.12}), {
			depth: 0.18,
			bevelEnabled: true,
			bevelThickness: 0.05,
			bevelSize: 0.04,
			bevelSegments: 6,
			curveSegments: 32,
		});
		anel.translate(0, 0, -0.09);
		const barra = new THREE.ExtrudeGeometry(retArredondado(1.86, 0.08, 0.0), {depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3});
		barra.translate(0, 0.38, -0.06);
		return {anel, barra};
	}, []);
	return (
		<group scale={escala}>
			<mesh geometry={geo.anel}>
				<meshPhysicalMaterial color="#d9dde2" metalness={1} roughness={0.26} roughnessMap={escovado} clearcoat={0.4} clearcoatRoughness={0.2} />
			</mesh>
			<mesh geometry={geo.barra}>
				<meshPhysicalMaterial color="#c4c9cf" metalness={1} roughness={0.3} roughnessMap={escovado} />
			</mesh>
			{/* três pontos da barra */}
			{[-0.78, -0.68, -0.58].map((x) => (
				<mesh key={x} position={[x, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
					<cylinderGeometry args={[0.03, 0.03, 0.1, 20]} />
					<meshPhysicalMaterial color="#eef0f2" metalness={1} roughness={0.15} />
				</mesh>
			))}
		</group>
	);
};
