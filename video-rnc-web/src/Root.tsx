import React from 'react';
import {Composition} from 'remotion';
import {Comercial} from './Comercial';
import {TL} from './lib/tempo';

export const Root: React.FC = () => {
	const frames = Math.round(TL.duracao * TL.fps);
	return (
		<>
			<Composition id="RNCWeb-9x16" component={Comercial} durationInFrames={frames} fps={TL.fps} width={1080} height={1920} defaultProps={{comAudio: true}} />
			<Composition id="RNCWeb-16x9" component={Comercial} durationInFrames={frames} fps={TL.fps} width={1920} height={1080} defaultProps={{comAudio: true}} />
		</>
	);
};
