import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Estudio} from './modelos/Estudio';
import {Carro} from './modelos/Carro';
import {Celular} from './modelos/Celular';
import {Frasco} from './modelos/Frasco';
import {Moldura} from './modelos/Moldura';
import {Camara} from './modelos/comum';
import {carregarFontes} from './lib/base';

export const TesteGL: React.FC = () => {
	const [h] = useState(() => delayRender());
	const [ok, setOk] = useState(false);
	useEffect(() => {
		carregarFontes().then(() => {
			setOk(true);
			continueRender(h);
		});
	}, [h]);
	const f = useCurrentFrame();
	const cena = Math.floor(f / 10);
	if (!ok) return null;
	return (
		<AbsoluteFill style={{background: cena === 2 ? '#a65a1f' : '#070809'}}>
			<ThreeCanvas width={1080} height={1920} gl={{antialias: true, toneMappingExposure: 1.1}} dpr={1}>
				{cena === 0 && (
					<>
						<Camara pos={[7.5, 2.6, 10.5]} alvo={[0, 0.5, 0]} fov={30} />
						<Estudio />
						<mesh rotation-x={-Math.PI / 2}>
							<planeGeometry args={[40, 40]} />
							<meshPhysicalMaterial color="#0b0c0e" roughness={0.25} metalness={0.6} />
						</mesh>
						<Carro cor="#8f0f17" rugosidade={0.06} />
					</>
				)}
				{cena === 1 && (
					<>
						<Camara pos={[3.6, 1.2, 5.2]} alvo={[0, 0, -0.2]} fov={36} />
						<Estudio intensidade={0.9} />
						<directionalLight position={[2, 3, 4]} intensity={1.2} />
						<Celular explode={1} dispersao={0.6} rot={[0, -0.5, 0]} destaque="bateria" destaqueK={1} />
					</>
				)}
				{cena === 2 && (
					<>
						<Camara pos={[0.8, 0.4, 5.2]} alvo={[0, 0.2, 0]} fov={34} />
						<Estudio intensidade={1} quente tom="#6b3410" />
						<mesh position={[0, 0, -3]}>
							<planeGeometry args={[12, 12]} />
							<meshBasicMaterial color="#c9772f" />
						</mesh>
						<mesh position={[1.6, 1.4, -2.5]}>
							<circleGeometry args={[1.2, 48]} />
							<meshBasicMaterial color="#ffd9a3" />
						</mesh>
						<group rotation={[0, 0.5, 0]}>
							<Frasco />
						</group>
					</>
				)}
				{cena === 3 && (
					<>
						<Camara pos={[1.2, 0.6, 7.5]} alvo={[0, 0, 0]} fov={32} />
						<Estudio />
						<group rotation={[0.1, -0.35, 0]}>
							<Moldura />
						</group>
					</>
				)}
			</ThreeCanvas>
		</AbsoluteFill>
	);
};
