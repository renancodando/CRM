import React from 'react';
import {Environment, Lightformer} from '@react-three/drei';

/** Ambiente de estúdio com softboxes (reflexos controlados). tom: cor de fundo do ambiente refletido */
export const Estudio: React.FC<{intensidade?: number; faixas?: number; tom?: string; quente?: boolean; tempoReal?: boolean}> = ({
	intensidade = 1,
	faixas = 1,
	tom = '#1a1b1e',
	quente = false,
	tempoReal = false,
}) => (
	<Environment resolution={256} frames={tempoReal ? Infinity : 1}>
		<color attach="background" args={[tom]} />
		{/* faixas de teto */}
		{[-1.6, 0, 1.6].map((z, i) => (
			<Lightformer key={z} form="rect" intensity={4 * faixas * intensidade * (i === 1 ? 1 : 0.8)} position={[0, 6, z]} scale={[12, 0.5, 1]} rotation-x={Math.PI / 2} />
		))}
		{/* softbox grande frontal-superior */}
		<Lightformer form="rect" intensity={1.4 * intensidade} position={[0, 4, 7]} scale={[10, 4, 1]} rotation-x={-0.5} color={quente ? '#ffd6a0' : '#ffffff'} />
		{/* recortes laterais */}
		<Lightformer form="rect" intensity={2.2 * intensidade} position={[-7, 1.5, 0]} scale={[4, 3, 1]} rotation-y={Math.PI / 2} color={quente ? '#ffb46b' : '#ffffff'} />
		<Lightformer form="rect" intensity={1.6 * intensidade} position={[7, 1.5, -1]} scale={[4, 3, 1]} rotation-y={-Math.PI / 2} />
		{/* rebatedor de chão */}
		<Lightformer form="rect" intensity={0.4 * intensidade} position={[0, -3, 0]} scale={[10, 10, 1]} rotation-x={-Math.PI / 2} />
	</Environment>
);
