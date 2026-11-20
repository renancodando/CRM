import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile} from 'remotion';
import {carregarFontes} from './v2/lib/base';
import {Fundo, Acabamento} from './componentes/Atmosfera';
import {Gancho} from './cenas/Gancho';
import {Marca} from './cenas/Marca';
import {Vitrine} from './cenas/Vitrine';
import {Responsivo} from './cenas/Responsivo';
import {Oferta} from './cenas/Oferta';
import {Encerramento} from './cenas/Encerramento';
import {useT, p, M} from './lib/tempo';

export const Comercial: React.FC<{comAudio?: boolean}> = ({comAudio = true}) => {
	const [handle] = useState(() => delayRender('fontes'));
	useEffect(() => {
		carregarFontes().then(() => continueRender(handle));
	}, [handle]);
	const t = useT();
	// fundo começa preto absoluto e ganha luz acetinada após o gancho inicial
	const luz = p(t, 0.6, 2.5) * (1 - 0.6 * p(t, M.silencio, M.linhaLuz)) + 0.6 * p(t, M.preco, M.preco + 1);
	return (
		<AbsoluteFill style={{background: '#040405'}}>
			<Fundo luz={Math.min(1, luz)} />
			<Gancho />
			<Marca />
			<Vitrine />
			<Responsivo />
			<Oferta />
			<Encerramento />
			<Acabamento />
			{comAudio && <Audio src={staticFile('audio/mix.wav')} />}
		</AbsoluteFill>
	);
};
