import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Montagem} from './comp/Montagem';
import {Plano, Fundo, useLocal} from './lib/base';
import {SiteVao} from './sites/Vao';
import {SiteLustro} from './sites/Lustro';
import {SiteBrasa} from './sites/Brasa';
import {Corte, duracaoCorte, IdCorte} from './filme/Corte';
import roteiros from './filme/roteiros.json';
import {Capa} from './filme/Capa';
import {LogoRNC} from '../componentes/LogoRNC';
import {useCurrentFrame} from 'remotion';
const TesteLogo: React.FC = () => {
	const f = useCurrentFrame();
	return (
		<Montagem fundo="preto" grao={false}>
			<AbsoluteFill style={{background: f < 50 ? '#f8f7f7' : '#060607', alignItems: 'center', justifyContent: 'center'}}>
				<LogoRNC t={f / 30} ini={0} largura={900} variante={f < 50 ? 'original' : 'escuro'} brilho={0.4} />
			</AbsoluteFill>
		</Montagem>
	);
};

const Site: React.FC<{site: string}> = ({site}) => {
	const {t} = useLocal();
	return <AbsoluteFill>{site === 'vao' && <SiteVao t={t} />}
			{site === 'lustro' && <SiteLustro t={t} />}
			{site === 'brasa' && <SiteBrasa t={t} />}</AbsoluteFill>;
};

const Teste: React.FC<{site: string; fundo: Fundo; dur: number}> = ({site, fundo, dur}) => (
	<Montagem fundo={fundo}>
		<Plano de={0} dur={dur}>
			<Site site={site} />
		</Plano>
	</Montagem>
);

const W = 1080;
const H = 1920;
export const RootV2: React.FC = () => (
	<>
		<Composition id="S-vao" component={Teste} durationInFrames={210} fps={30} width={W} height={H} defaultProps={{site: 'vao', fundo: 'livre' as Fundo, dur: 7}} />
		<Composition id="S-lustro" component={Teste} durationInFrames={210} fps={30} width={W} height={H} defaultProps={{site: 'lustro', fundo: 'livre' as Fundo, dur: 7}} />
		<Composition id="S-brasa" component={Teste} durationInFrames={195} fps={30} width={W} height={H} defaultProps={{site: 'brasa', fundo: 'livre' as Fundo, dur: 6.5}} />
		{(Object.keys(roteiros) as IdCorte[]).map((id) => (
			<Composition key={id} id={`Filme-${id}`} component={Corte} durationInFrames={Math.round(duracaoCorte(id) * 30)} fps={30} width={W} height={H} defaultProps={{id, audio: false}} />
		))}
		<Composition id="TesteLogo" component={TesteLogo} durationInFrames={100} fps={30} width={W} height={H} />
		<Composition id="Capa" component={Capa} durationInFrames={1} fps={30} width={W} height={H} />
	</>
);
