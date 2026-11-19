import React from 'react';
import {AbsoluteFill, Composition} from 'remotion';
import {Montagem} from './comp/Montagem';
import {Plano, Fundo, useLocal} from './lib/base';
import {SiteVao} from './sites/Vao';
import {SiteNucleo} from './sites/Nucleo';
import {SiteLustro} from './sites/Lustro';
import {SiteAmbar} from './sites/Ambar';

const Site: React.FC<{site: string}> = ({site}) => {
	const {t} = useLocal();
	return <AbsoluteFill>{site === 'vao' && <SiteVao t={t} />}
			{site === 'nucleo' && <SiteNucleo t={t} />}
			{site === 'lustro' && <SiteLustro t={t} />}
			{site === 'ambar' && <SiteAmbar t={t} />}</AbsoluteFill>;
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
		<Composition id="S-nucleo" component={Teste} durationInFrames={210} fps={30} width={W} height={H} defaultProps={{site: 'nucleo', fundo: 'livre' as Fundo, dur: 7}} />
		<Composition id="S-lustro" component={Teste} durationInFrames={210} fps={30} width={W} height={H} defaultProps={{site: 'lustro', fundo: 'livre' as Fundo, dur: 7}} />
		<Composition id="S-ambar" component={Teste} durationInFrames={180} fps={30} width={W} height={H} defaultProps={{site: 'ambar', fundo: 'livre' as Fundo, dur: 6}} />
	</>
);
