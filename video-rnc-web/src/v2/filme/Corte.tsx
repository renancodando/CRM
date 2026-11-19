import React from 'react';
import {Audio, staticFile, useVideoConfig, useCurrentFrame} from 'remotion';
import {Plano, PalcoProvider, Fundo} from '../lib/base';
import {Legendas, Fala} from '../comp/ui';
import {Montagem} from '../comp/Montagem';
import {CenaGancho, CenaReparo, CenaSite, CenaTransformacao, CenaOferta, CenaFinal, AberturaCuriosidade, AberturaDesejo, CenaLeque} from './Cenas';
import roteiros from './roteiros.json';
import narracao from '../../../v2/audio/narracao.json';
import duracoes from '../../../public/audio/narracao-v2/duracoes.json';

export type IdCorte = keyof typeof roteiros;

/* eslint-disable @typescript-eslint/no-explicit-any */
const Cena: React.FC<{tipo: string; props: any}> = ({tipo, props}) => {
	switch (tipo) {
		case 'gancho':
			return <CenaGancho {...props} />;
		case 'reparo':
			return <CenaReparo {...props} />;
		case 'site':
			return <CenaSite {...props} />;
		case 'transformacao':
			return <CenaTransformacao {...props} />;
		case 'oferta':
			return <CenaOferta {...props} />;
		case 'final':
			return <CenaFinal {...props} />;
		case 'curiosidade':
			return <AberturaCuriosidade />;
		case 'desejo':
			return <AberturaDesejo />;
		case 'leque':
			return <CenaLeque />;
		default:
			return null;
	}
};

export const duracaoCorte = (id: IdCorte) => Math.max(...roteiros[id].cenas.map((c) => c.de + c.dur));

export const Corte: React.FC<{id: IdCorte; audio?: boolean}> = ({id, audio = true}) => {
	const r = roteiros[id];
	const textos = Object.fromEntries(narracao.falas.map((f) => [f.id, f.texto]));
	const falas: Fala[] = r.falas
		.filter((f: any) => f.legenda)
		.map((f) => ({ini: f.ini, fim: f.ini + (duracoes as Record<string, number>)[f.id], texto: textos[f.id].replace('...', '…')}));
	return (
		<Montagem fundo={r.fundo as Fundo} cor={r.fundo === 'marfim' ? '#ECE7DE' : '#040405'} vinheta={r.fundo === 'marfim' ? 0.08 : 0.35}>
			<PalcoProvider value={r.fundo as Fundo}>
				{r.cenas.map((c, i) => (
					<Plano key={i} de={c.de} dur={c.dur + (i < r.cenas.length - 1 ? 0.0 : 0)} nome={`${c.tipo} ${i}`}>
						<Cena tipo={c.tipo} props={(c as any).props ?? {}} />
					</Plano>
				))}
				<Legendas falas={falas} y={1360} claro={r.fundo === 'marfim'} />
				{audio && <Audio src={staticFile(`audio/v2/mix-${id}.wav`)} />}
			</PalcoProvider>
		</Montagem>
	);
};
