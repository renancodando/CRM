import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F} from '../lib/base';
import {metal} from '../../lib/estilo';
import {Montagem} from '../comp/Montagem';
import {MarcaMini} from '../comp/ui';
import {Tela, Quadro, FundoPalco} from './Palco';
import {SiteLustro} from '../sites/Lustro';
import {SiteBrasa} from '../sites/Brasa';
import {CAP_QUADRO} from './Cenas';

/** Capa do Reels (1080×1920). Texto principal no centro seguro (o feed corta para 4:5 / 1:1). */
export const Capa: React.FC = () => (
	<Montagem fundo="preto" vinheta={0.35}>
		<FundoPalco foco={[50, 46]} />
		<AbsoluteFill style={{perspective: 2000}}>
			<div style={{position: 'absolute', left: 60, top: 760, transform: 'rotateY(24deg) translateZ(-260px)', opacity: 0.85}}>
				<Tela w={430} raio={40} reflexo={0.06}>
					<SiteLustro t={4.6} />
				</Tela>
			</div>
			<div style={{position: 'absolute', left: 590, top: 760, transform: 'rotateY(-24deg) translateZ(-260px)', opacity: 0.85}}>
				<Tela w={430} raio={40} reflexo={0.06}>
					<SiteBrasa t={5.6} />
				</Tela>
			</div>
			<div style={{position: 'absolute', left: 540 - 300, top: 640, transform: 'rotateX(4deg)'}}>
				<Tela w={600} raio={52} reflexo={0.1}>
					<Quadro arquivo={CAP_QUADRO} />
				</Tela>
			</div>
		</AbsoluteFill>
		<div style={{position: 'absolute', top: 300, left: 60, right: 60, textAlign: 'center', fontFamily: F.inter, fontWeight: 650, fontSize: 122, letterSpacing: '-0.055em', lineHeight: 0.98, color: '#f5f5f7'}}>
			Espera…
			<br />
			isso é um <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.14em', ...metal(0.55)}}>site?</span>
		</div>
		<div style={{position: 'absolute', top: 1700, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, fontFamily: F.inter, fontSize: 30, color: '#f5f5f7'}}>
			<MarcaMini tam={40} />
			<b style={{letterSpacing: '-0.03em'}}>
				RNC <span style={{fontWeight: 300}}>WEB</span>
			</b>
			<span style={{opacity: 0.6}}>· criação de sites</span>
		</div>
	</Montagem>
);
