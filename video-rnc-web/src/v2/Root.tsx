import React from 'react';
import {Composition} from 'remotion';
import {TesteGL} from './TesteGL';
import {Montagem} from './comp/Montagem';
import {Plano, Fundo} from './lib/base';
import {Arquitetura} from './cenas/Arquitetura';
import {Nucleo} from './cenas/Nucleo';
import {Lustro} from './cenas/Lustro';

const durTeste: Record<string, number> = {nucleo: 7.5, 'nucleo-simples': 5, 'nucleo-isto': 4, arq: 5.5, 'arq-espera': 5.5, lustro: 7, 'lustro-desejo': 10, 'lustro-claro': 3.5};
const Teste: React.FC<{cena: string; fundo: Fundo}> = ({cena, fundo}) => (
	<Montagem fundo={fundo}>
		<Plano de={0} dur={durTeste[cena] ?? 8}>
			{cena === 'arq' && <Arquitetura texto="narrativa" />}
			{cena === 'arq-espera' && <Arquitetura texto="espera" />}
			{cena === 'nucleo' && <Nucleo modo="completo" />}
			{cena === 'lustro' && <Lustro modo="completo" />}
			{cena === 'lustro-desejo' && <Lustro modo="desejo" />}
			{cena === 'lustro-claro' && <Lustro modo="claro" />}
			{cena === 'nucleo-simples' && <Nucleo modo="simples" />}
			{cena === 'nucleo-isto' && <Nucleo modo="isto" />}
		</Plano>
	</Montagem>
);

const W = 1080;
const H = 1920;
export const RootV2: React.FC = () => (
	<>
		<Composition id="TesteGL" component={TesteGL} durationInFrames={40} fps={30} width={W} height={H} />
		<Composition id="T-arq" component={Teste} durationInFrames={165} fps={30} width={W} height={H} defaultProps={{cena: 'arq', fundo: 'livre' as Fundo}} />
		<Composition id="T-arq-preto" component={Teste} durationInFrames={165} fps={30} width={W} height={H} defaultProps={{cena: 'arq-espera', fundo: 'preto' as Fundo}} />
		<Composition id="T-nucleo" component={Teste} durationInFrames={225} fps={30} width={W} height={H} defaultProps={{cena: 'nucleo', fundo: 'livre' as Fundo}} />
		<Composition id="T-nucleo-simples" component={Teste} durationInFrames={150} fps={30} width={W} height={H} defaultProps={{cena: 'nucleo-simples', fundo: 'preto' as Fundo}} />
		<Composition id="T-nucleo-isto" component={Teste} durationInFrames={120} fps={30} width={W} height={H} defaultProps={{cena: 'nucleo-isto', fundo: 'marfim' as Fundo}} />
		<Composition id="T-lustro" component={Teste} durationInFrames={210} fps={30} width={W} height={H} defaultProps={{cena: 'lustro', fundo: 'livre' as Fundo}} />
		<Composition id="T-lustro-desejo" component={Teste} durationInFrames={300} fps={30} width={W} height={H} defaultProps={{cena: 'lustro-desejo', fundo: 'preto' as Fundo}} />
		<Composition id="T-lustro-claro" component={Teste} durationInFrames={105} fps={30} width={W} height={H} defaultProps={{cena: 'lustro-claro', fundo: 'marfim' as Fundo}} />
	</>
);
