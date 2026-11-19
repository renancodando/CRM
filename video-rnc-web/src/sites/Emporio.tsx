import React from 'react';
import {SANS, SERIF} from '../fonts';
import {p, ease} from '../lib/tempo';

const CREME = '#f4efe6';
const TERRA = '#b5532f';
const VERDE = '#23392d';

const Produto: React.FC<{nome: string; detalhe: string; arte: React.ReactNode; fundo: string}> = ({nome, detalhe, arte, fundo}) => (
	<div style={{background: '#fffaf2', borderRadius: 14, overflow: 'hidden', border: '1px solid #e6dccb'}}>
		<div style={{height: 230, background: fundo, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{arte}</div>
		<div style={{padding: '22px 24px'}}>
			<div style={{fontFamily: SERIF, fontStyle: 'normal', fontSize: 28, color: VERDE}}>{nome}</div>
			<div style={{fontSize: 15, color: '#7b7262', marginTop: 6}}>{detalhe}</div>
		</div>
	</div>
);

/** Site demonstrativo — empório / negócio local. Desenhado em 1440px. */
export const SiteEmporio: React.FC<{t: number; ini: number; rolagem?: number; hover?: number}> = ({t, ini, rolagem = 0, hover = 0}) => {
	const e = (d: number) => p(t, ini + d, ini + d + 0.7, ease.out);
	const sobe = (d: number): React.CSSProperties => ({opacity: e(d), transform: `translateY(${(1 - e(d)) * 30}px)`});
	return (
		<div style={{width: 1440, minHeight: 1800, background: CREME, fontFamily: SANS, color: VERDE, transform: `translateY(${-rolagem}px)`}}>
			<div style={{height: 34, background: VERDE, color: '#e9e2d3', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', letterSpacing: '0.04em'}}>
				Aberto hoje das 7h às 19h · Retire na loja ou peça pelo WhatsApp
			</div>
			<div style={{height: 96, display: 'flex', alignItems: 'center', padding: '0 80px'}}>
				<div style={{fontFamily: SERIF, fontSize: 36, letterSpacing: '-0.01em'}}>
					Empório <span style={{fontStyle: 'italic', color: TERRA}}>Aurora</span>
				</div>
				<div style={{display: 'flex', gap: 42, margin: '0 auto', fontSize: 16, color: '#4d5a50'}}>
					<span>Produtos</span>
					<span>Cestas</span>
					<span>Nossa história</span>
					<span>Visite</span>
				</div>
				<div
					style={{
						background: TERRA,
						color: '#fff',
						fontSize: 15,
						fontWeight: 600,
						padding: '14px 26px',
						borderRadius: 999,
						transform: `scale(${1 + hover * 0.05})`,
						boxShadow: hover ? `0 12px 28px rgba(181,83,47,${0.35 * hover})` : 'none',
					}}
				>
					Fazer pedido
				</div>
			</div>
			<div style={{display: 'flex', padding: '30px 80px 0', gap: 60, height: 620}}>
				<div style={{width: 600, paddingTop: 70}}>
					<div style={{...sobe(0), fontSize: 14, letterSpacing: '0.26em', color: TERRA, fontWeight: 600}}>PADARIA · EMPÓRIO · CAFÉ</div>
					<div style={{...sobe(0.08), fontFamily: SERIF, fontSize: 92, lineHeight: 0.98, letterSpacing: '-0.02em', marginTop: 22}}>
						Feito aqui, <span style={{fontStyle: 'italic', color: TERRA}}>todos os dias.</span>
					</div>
					<div style={{...sobe(0.16), fontSize: 19, lineHeight: 1.6, color: '#5c665e', marginTop: 26, width: 500}}>
						Pães de fermentação natural, cafés especiais e produtos da região, escolhidos com carinho para a sua mesa.
					</div>
					<div style={{...sobe(0.24), display: 'flex', gap: 14, marginTop: 38}}>
						<div style={{background: VERDE, color: '#f4efe6', padding: '18px 30px', borderRadius: 999, fontSize: 17, fontWeight: 600}}>
							Ver produtos
						</div>
						<div style={{border: `1.5px solid ${VERDE}`, padding: '18px 30px', borderRadius: 999, fontSize: 17}}>Como chegar</div>
					</div>
				</div>
				{/* composição ilustrada */}
				<div style={{flex: 1, position: 'relative', ...sobe(0.12)}}>
					<div style={{position: 'absolute', inset: '10px 0 40px 40px', borderRadius: '280px 280px 24px 24px', background: '#e7d8bf', overflow: 'hidden'}}>
						<div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 170, background: '#c99d6b'}} />
						<svg viewBox="0 0 600 560" style={{position: 'absolute', inset: 0, width: '100%', height: '100%'}}>
							<circle cx="430" cy="140" r="70" fill="#f3c46d" opacity="0.8" />
							{/* pão */}
							<ellipse cx="260" cy="410" rx="180" ry="78" fill="#a8612f" />
							<ellipse cx="260" cy="396" rx="172" ry="66" fill="#c27a3e" />
							{[-90, -30, 30, 90].map((dx) => (
								<path key={dx} d={`M${240 + dx} 350 q 30 30 50 70`} stroke="#e3a865" strokeWidth="10" strokeLinecap="round" fill="none" />
							))}
							{/* pote */}
							<rect x="440" y="290" width="110" height="150" rx="18" fill="#f6efe2" stroke="#d8c6a6" strokeWidth="3" />
							<rect x="440" y="282" width="110" height="26" rx="8" fill={TERRA} />
							<rect x="458" y="340" width="74" height="54" rx="6" fill="#efe2c9" />
							{/* xícara */}
							<path d="M90 300 h110 v40 a55 55 0 0 1 -110 0 Z" fill="#fffaf2" />
							<path d="M200 312 a22 22 0 0 1 0 40" stroke="#fffaf2" strokeWidth="10" fill="none" />
							<ellipse cx="145" cy="300" rx="55" ry="10" fill="#5a3a22" />
						</svg>
					</div>
					<div
						style={{
							position: 'absolute',
							left: 0,
							bottom: 70,
							background: '#fffaf2',
							borderRadius: 16,
							padding: '18px 22px',
							boxShadow: '0 20px 40px rgba(60,40,20,0.18)',
							display: 'flex',
							gap: 14,
							alignItems: 'center',
						}}
					>
						<div style={{width: 12, height: 12, borderRadius: '50%', background: '#3f9a5c'}} />
						<div>
							<div style={{fontSize: 16, fontWeight: 700}}>Fornada saindo agora</div>
							<div style={{fontSize: 14, color: '#7b7262'}}>Pão de fermentação natural</div>
						</div>
					</div>
				</div>
			</div>
			<div style={{padding: '70px 80px'}}>
				<div style={{fontFamily: SERIF, fontSize: 52}}>Da nossa cozinha para a sua mesa</div>
				<div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 22, marginTop: 36}}>
					<Produto nome="Pão de fermentação" detalhe="Assado diariamente" fundo="#ead9bd" arte={<div style={{width: 150, height: 80, borderRadius: '50%', background: '#b86f36'}} />} />
					<Produto nome="Cafés especiais" detalhe="Torra artesanal" fundo="#d8c3a5" arte={<div style={{width: 90, height: 120, borderRadius: 12, background: VERDE}} />} />
					<Produto nome="Queijos da região" detalhe="Seleção da casa" fundo="#efe0b5" arte={<div style={{width: 130, height: 90, background: '#f2c955', clipPath: 'polygon(0 100%, 100% 100%, 100% 30%, 0 0)'}} />} />
					<Produto nome="Cestas de café" detalhe="Monte a sua" fundo="#e2cdb7" arte={<div style={{width: 150, height: 90, borderRadius: '0 0 70px 70px', background: TERRA}} />} />
				</div>
			</div>
		</div>
	);
};
