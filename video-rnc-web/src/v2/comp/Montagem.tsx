import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {carregarFontes, Fundo, PalcoProvider} from '../lib/base';
import {Acabamento} from '../../componentes/Atmosfera';

/** Envolve um corte: carrega fontes, define o palco e aplica grão/vinheta. */
export const Montagem: React.FC<{fundo: Fundo; children: React.ReactNode; cor?: string; grao?: boolean; vinheta?: number}> = ({fundo, children, cor = '#050506', grao = true, vinheta = 0.12}) => {
	const [h] = useState(() => delayRender('fontes v2'));
	const [ok, setOk] = useState(false);
	useEffect(() => {
		carregarFontes().then(() => {
			setOk(true);
			continueRender(h);
		});
	}, [h]);
	return (
		<PalcoProvider value={fundo}>
			<AbsoluteFill style={{background: cor}}>
				{ok && children}
				{grao && <Acabamento vinheta={vinheta} />}
			</AbsoluteFill>
		</PalcoProvider>
	);
};
