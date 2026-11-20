import React from 'react';
import {AbsoluteFill} from 'remotion';
import {F, p, ease, lerp, clamp, useLocal} from '../lib/base';
import {metal} from '../../lib/estilo';
import {Linha} from '../comp/ui';
import {Pagina} from '../comp/Pagina';
import {Tela, FundoPalco} from './Palco';
import {LustroMobile, MapaEscuro, RUBI, VERDE_WHATS} from '../../sites/novos/Desktop';

/* "Seu Instagram não é o seu site." — vídeo explicativo (interfaces genéricas, sem logos de terceiros). */

const TEAL = '#14918c';
const BRANCO = '#f5f5f7';
const CINZA = '#9a9da4';

// ————————————————————————————————————————————————————————— interfaces (390 × 693)
const Post: React.FC<{i: number}> = ({i}) => {
	const estilos: React.CSSProperties[] = [
		{background: '#060607'},
		{background: RUBI},
		{background: 'linear-gradient(160deg,#1b1c20,#060607)'},
		{background: '#e9ecef'},
		{background: '#111114'},
		{background: 'linear-gradient(90deg,#2a2c31 50%,#8c0c14 50%)'},
	];
	const textos = ['LUSTRO', 'VITRIFI\nCAÇÃO', '', 'AGENDA\nABERTA', '92 GU', 'ANTES | DEPOIS'];
	const k = i % 6;
	return (
		<div style={{width: 128, height: 128, position: 'relative', overflow: 'hidden', ...estilos[k], display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.unbounded, fontWeight: 800, fontSize: k === 4 ? 24 : 13, letterSpacing: 1.5, whiteSpace: 'pre', textAlign: 'center', color: k === 3 ? '#060607' : '#f2f3f5'}}>
			{k === 2 &&
				[0, 1, 2].map((j) => (
					<div key={j} style={{position: 'absolute', left: -20, right: -20, top: 34 + j * 26, height: j === 1 ? 4 : 2, background: 'linear-gradient(90deg,transparent,#fff,transparent)', transform: 'skewY(-8deg)'}} />
				))}
			{k === 0 ? <span style={{backgroundImage: 'linear-gradient(180deg,#fff,#7a7f87 55%,#e1e4e8)', WebkitBackgroundClip: 'text', color: 'transparent'}}>{textos[k]}</span> : textos[k]}
		</div>
	);
};

export const PerfilSocial: React.FC<{rolagem?: number; esmaece?: number}> = ({rolagem = 0, esmaece = 0}) => (
	<Pagina fundo="#000">
		<div style={{position: 'absolute', left: 0, right: 0, top: 0, transform: `translateY(${-rolagem}px)`, fontFamily: F.inter, color: BRANCO}}>
			<div style={{position: 'absolute', top: 70, left: 18, right: 18, display: 'flex', alignItems: 'center', fontWeight: 700, fontSize: 17}}>
				lustro.estetica
				<span style={{marginLeft: 'auto', display: 'flex', gap: 16}}>
					<span style={{width: 20, height: 20, borderRadius: 6, border: `2px solid ${BRANCO}`}} />
					<span style={{display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 3}}>
						{[0, 1, 2].map((j) => (
							<i key={j} style={{width: 20, height: 2, background: BRANCO}} />
						))}
					</span>
				</span>
			</div>
			<div style={{position: 'absolute', top: 112, left: 18, right: 18, display: 'flex', alignItems: 'center', gap: 22}}>
				<div style={{width: 80, height: 80, borderRadius: 40, padding: 3, background: `conic-gradient(${TEAL}, #0b3f44, ${TEAL})`}}>
					<div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#060607', border: '3px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.unbounded, fontWeight: 800, fontSize: 13, letterSpacing: 1.5}}>LUSTRO</div>
				</div>
				{[
					['312', 'publicações'],
					['4.820', 'seguidores'],
					['180', 'seguindo'],
				].map(([n, l]) => (
					<div key={l} style={{textAlign: 'center', flex: 1}}>
						<div style={{fontWeight: 700, fontSize: 17}}>{n}</div>
						<div style={{fontSize: 12, color: '#c8c8c8'}}>{l}</div>
					</div>
				))}
			</div>
			<div style={{position: 'absolute', top: 205, left: 18, right: 18, fontSize: 13, lineHeight: 1.45}}>
				<b>Lustro Estética Automotiva</b>
				<div style={{color: '#d0d0d0'}}>Polimento · Vitrificação · Higienização</div>
				<div style={{color: '#d0d0d0'}}>Centro · seg. a sáb.</div>
				<div style={{color: '#7fb6ff'}}>suaempresa.com.br</div>
			</div>
			<div style={{position: 'absolute', top: 290, left: 18, right: 18, display: 'flex', gap: 8}}>
				{['Seguir', 'Mensagem'].map((b, j) => (
					<div key={b} style={{flex: 1, height: 32, borderRadius: 8, background: j === 0 ? TEAL : '#262626', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
						{b}
					</div>
				))}
			</div>
			<div style={{position: 'absolute', top: 336, left: 18, display: 'flex', gap: 16}}>
				{['Antes e depois', 'Agenda', 'Serviços'].map((h) => (
					<div key={h} style={{textAlign: 'center', fontSize: 11, color: '#d0d0d0'}}>
						<div style={{width: 60, height: 60, borderRadius: 30, border: '1.5px solid #444', marginBottom: 5, background: '#111114'}} />
						{h}
					</div>
				))}
			</div>
			<div style={{position: 'absolute', top: 432, left: 0, right: 0, display: 'grid', gridTemplateColumns: 'repeat(3, 128px)', gap: 3, opacity: 1 - esmaece * 0.6}}>
				{Array.from({length: 24}, (_, i) => (
					<div key={i} style={{opacity: 1 - esmaece * Math.min(1, i / 10)}}>
						<Post i={i} />
					</div>
				))}
			</div>
		</div>
	</Pagina>
);

export const BuscaLocal: React.FC<{digitado: number; botaoSite: number; t: number}> = ({digitado, botaoSite, t}) => {
	const busca = 'estética automotiva perto de mim';
	const n = Math.round(busca.length * clamp(digitado));
	const r = clamp(digitado * 1.4 - 0.4);
	return (
		<Pagina fundo="#121316">
			<div style={{position: 'absolute', top: 80, left: 16, right: 16, height: 46, borderRadius: 23, background: '#26272c', display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px', fontFamily: F.inter, fontSize: 14, color: BRANCO}}>
				<svg width={18} height={18} viewBox="0 0 24 24" fill="none">
					<circle cx="10.5" cy="10.5" r="6.5" stroke="#9aa0a6" strokeWidth="2" />
					<path d="M15.5 15.5L20 20" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round" />
				</svg>
				{busca.slice(0, n)}
				<span style={{width: 1.5, height: 18, background: BRANCO, opacity: digitado < 1 && Math.floor(t * 3) % 2 === 0 ? 1 : 0}} />
			</div>
			<div style={{position: 'absolute', top: 140, left: 18, display: 'flex', gap: 18, fontFamily: F.inter, fontSize: 12.5, color: '#9aa0a6'}}>
				{['Todos', 'Mapas', 'Imagens', 'Notícias'].map((a, i) => (
					<span key={a} style={{color: i === 0 ? BRANCO : '#9aa0a6', borderBottom: i === 0 ? `2px solid ${BRANCO}` : 'none', paddingBottom: 6}}>
						{a}
					</span>
				))}
			</div>
			<div style={{position: 'absolute', top: 178, left: 16, opacity: r}}>
				<MapaEscuro w={358} h={150} pulso={(t * 0.9) % 1} />
			</div>
			<div style={{position: 'absolute', top: 340, left: 16, right: 16, padding: 16, borderRadius: 16, background: '#1c1d22', fontFamily: F.inter, color: BRANCO, opacity: r, transform: `translateY(${(1 - r) * 20}px)`}}>
				<div style={{fontSize: 18, fontWeight: 600}}>Lustro Estética Automotiva</div>
				<div style={{fontSize: 12.5, color: '#9aa0a6', marginTop: 4}}>Estética automotiva · Centro</div>
				<div style={{fontSize: 12.5, marginTop: 6}}>
					<span style={{color: '#7bd88f'}}>Aberto</span> · fecha às 19h
				</div>
				<div style={{fontSize: 12.5, color: '#9aa0a6', marginTop: 2}}>Av. Central, 1200 — Centro</div>
				<div style={{display: 'flex', gap: 8, marginTop: 14}}>
					{['Rotas', 'Ligar', 'Site', 'Salvar'].map((b) => {
						const s = b === 'Site';
						return (
							<div key={b} style={{flex: 1, height: 34, borderRadius: 17, fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: s ? `rgba(20,145,140,${0.25 + botaoSite * 0.75})` : '#2a2b31', color: BRANCO, boxShadow: s && botaoSite > 0 ? `0 0 ${18 * botaoSite}px rgba(20,145,140,0.9), 0 0 0 1px ${TEAL}` : 'none', transform: `scale(${s ? 1 + botaoSite * 0.06 : 1})`}}>
								{b}
							</div>
						);
					})}
				</div>
			</div>
			{[0, 1].map((i) => (
				<div key={i} style={{position: 'absolute', top: 540 + i * 70, left: 18, right: 18, opacity: r * 0.5}}>
					<div style={{width: 180, height: 12, borderRadius: 6, background: '#2a2b31'}} />
					<div style={{width: 280, height: 9, borderRadius: 5, background: '#222328', marginTop: 10}} />
					<div style={{width: 220, height: 9, borderRadius: 5, background: '#222328', marginTop: 8}} />
				</div>
			))}
		</Pagina>
	);
};

/** Site próprio no celular, com a barra de endereço */
export const SiteProprio: React.FC<{rolagem?: number; t: number; endereco?: number}> = ({rolagem = 0, t, endereco = 1}) => (
	<Pagina fundo="#060607">
		<div style={{position: 'absolute', top: 0, left: 0, right: 0, height: 110, background: '#1b1c20', zIndex: 3}}>
			<div style={{position: 'absolute', left: 14, right: 14, bottom: 12, height: 38, borderRadius: 12, background: '#2b2c31', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: F.inter, fontSize: 15, color: BRANCO, boxShadow: endereco > 1 ? `0 0 0 ${2 * (endereco - 1)}px ${TEAL}` : 'none'}}>
				<svg width={12} height={12} viewBox="0 0 24 24">
					<rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="#9aa0a6" />
					<path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" stroke="#9aa0a6" strokeWidth="2.2" fill="none" />
				</svg>
				suaempresa<b>.com.br</b>
			</div>
		</div>
		<div style={{position: 'absolute', top: 110, left: 0, width: 390}}>
			<LustroMobile rolagem={rolagem} t={t} />
		</div>
	</Pagina>
);

// ————————————————————————————————————————————————————————— peças de cena
const Cartao: React.FC<{k: number; x: number; y: number; texto: string; sinal?: '+' | '!' | '✓'; largura?: number}> = ({k, x, y, texto, sinal = '+', largura = 430}) => {
	if (k <= 0) return null;
	const cor = sinal === '!' ? '#e0a33a' : sinal === '✓' ? VERDE_WHATS : TEAL;
	return (
		<div style={{position: 'absolute', left: x, top: y, width: largura, padding: '22px 26px', borderRadius: 26, background: 'rgba(17,17,20,0.88)', backdropFilter: 'blur(12px)', boxShadow: '0 0 0 1px rgba(255,255,255,0.12), 0 30px 60px -20px rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', gap: 18, fontFamily: F.inter, fontSize: 36, fontWeight: 600, color: BRANCO, letterSpacing: '-0.02em', opacity: k, transform: `translateX(${(1 - k) * 60}px) scale(${0.94 + 0.06 * k})`, zIndex: 30}}>
			<span style={{width: 44, height: 44, flex: 'none', borderRadius: 22, background: cor, color: '#06110f', fontSize: 28, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{sinal}</span>
			{texto}
		</div>
	);
};

const Titulo: React.FC<{t: number; ini: number; sai?: number; n: string; rotulo: string; titulo: React.ReactNode}> = ({t, ini, sai, n, rotulo, titulo}) => (
	<div style={{position: 'absolute', top: 262, left: 70, right: 70, zIndex: 40}}>
		<div style={{display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.mono, fontSize: 24, letterSpacing: '0.2em', color: CINZA, opacity: p(t, ini, ini + 0.4) * (sai ? 1 - p(t, sai, sai + 0.3) : 1)}}>
			<span style={{color: BRANCO}}>{n}</span>
			<span style={{width: 46, height: 1, background: 'rgba(255,255,255,0.35)'}} />
			{rotulo}
		</div>
		<div style={{fontFamily: F.inter, fontWeight: 600, fontSize: 84, letterSpacing: '-0.045em', lineHeight: 1.0, color: BRANCO, marginTop: 14}}>
			<Linha t={t} ini={ini + 0.1} sai={sai}>
				{titulo}
			</Linha>
		</div>
	</div>
);
const It: React.FC<{children: React.ReactNode; k?: number}> = ({children, k = 0.5}) => <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.14em', ...metal(k)}}>{children}</span>;

// ————————————————————————————————————————————————————————— CENAS
export const EGancho: React.FC = () => {
	const {t, d} = useLocal();
	const abre = p(t, 2.45, 3.6, ease.camera);
	const w = lerp(560, 300, abre);
	const paineis = [
		{x: lerp(540, 200, abre), rot: lerp(0, 18, abre), rot2: 0, conteudo: <PerfilSocial rolagem={t * 22} />, rotulo: 'Rede social'},
		{x: 540, rot: 0, conteudo: <BuscaLocal digitado={1} botaoSite={0} t={t} />, rotulo: 'Google'},
		{x: lerp(540, 880, abre), rot: lerp(0, -18, abre), conteudo: <SiteProprio t={t} />, rotulo: 'Site próprio'},
	];
	return (
		<AbsoluteFill>
			<FundoPalco foco={[50, 50]} />
			<div style={{position: 'absolute', top: 270, left: 0, right: 0, textAlign: 'center', fontFamily: F.inter, fontWeight: 650, fontSize: 104, letterSpacing: '-0.05em', lineHeight: 0.98, color: BRANCO, zIndex: 40}}>
				<Linha t={t} ini={0.15} sai={2.3}>
					Seu Instagram
				</Linha>
				<Linha t={t} ini={0.3} sai={2.35}>
					<span>
						não é o seu <It k={p(t, 0.6, 1.8, ease.inOut)}>site.</It>
					</span>
				</Linha>
			</div>
			<div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', fontFamily: F.inter, fontWeight: 600, fontSize: 86, letterSpacing: '-0.045em', lineHeight: 1.0, color: BRANCO, zIndex: 40}}>
				<Linha t={t} ini={2.55} sai={d - 0.35}>
					E tudo bem.
				</Linha>
				<div style={{fontSize: 52, fontWeight: 500, color: CINZA, marginTop: 16}}>
					<Linha t={t} ini={3.1} sai={d - 0.3}>
						<span>
							Cada um tem um <span style={{color: BRANCO}}>papel.</span>
						</span>
					</Linha>
				</div>
			</div>
			<AbsoluteFill style={{perspective: 2000}}>
				{paineis.map((pn, i) => {
					const vis = i === 0 ? 1 : abre;
					const h = (w * 16) / 9;
					return (
						<div key={i} style={{position: 'absolute', left: pn.x - w / 2, top: lerp(560, 760, abre), opacity: vis, transform: `rotateY(${pn.rot}deg) translateZ(${i === 1 ? 60 * abre : 0}px)`, zIndex: i === 1 ? 2 : 1}}>
							<Tela w={w} raio={lerp(52, 32, abre)} reflexo={0.08}>
								{pn.conteudo}
							</Tela>
							<div style={{position: 'absolute', top: h + 26, left: -40, right: -40, textAlign: 'center', fontFamily: F.mono, fontSize: 22, letterSpacing: '0.16em', textTransform: 'uppercase', color: BRANCO, opacity: p(t, 3.4 + i * 0.12, 3.8 + i * 0.12)}}>
								{pn.rotulo}
							</div>
						</div>
					);
				})}
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

export const ESocial: React.FC = () => {
	const {t, d} = useLocal();
	const w = 600;
	const ent = p(t, 0, 0.8, ease.camera);
	const virada = 4.75; // segunda fala (algoritmo)
	const esmaece = p(t, virada + 0.6, virada + 2.2, ease.inOut);
	const sai = p(t, d - 0.5, d, ease.in);
	return (
		<AbsoluteFill>
			<FundoPalco foco={[40, 55]} />
			<Titulo t={t} ini={0.2} sai={virada - 0.35} n="01" rotulo="REDE SOCIAL" titulo={<span>Relacionamento.</span>} />
			<Titulo t={t} ini={virada} sai={d - 0.4} n="01" rotulo="REDE SOCIAL" titulo={<span>Alcance <It>emprestado.</It></span>} />
			<AbsoluteFill style={{perspective: 2000}}>
				<div style={{position: 'absolute', left: 70, top: 480, transform: `translateX(${(1 - ent) * -300}px) rotateY(${lerp(30, 10, ent)}deg) translateZ(${-sai * 500}px)`, opacity: ent * (1 - sai)}}>
					<Tela w={w} raio={52}>
						<PerfilSocial rolagem={p(t, 0.8, d, ease.suave) * 260} esmaece={esmaece} />
					</Tela>
				</div>
			</AbsoluteFill>
			<Cartao k={p(t, 1.0, 1.5, ease.out) * (1 - p(t, virada - 0.3, virada))} x={560} y={620} texto="Bastidores" />
			<Cartao k={p(t, 1.8, 2.3, ease.out) * (1 - p(t, virada - 0.3, virada))} x={560} y={760} texto="Proximidade" />
			<Cartao k={p(t, 2.6, 3.1, ease.out) * (1 - p(t, virada - 0.3, virada))} x={560} y={900} texto="Frequência" />
			<Cartao k={p(t, virada + 0.4, virada + 0.9, ease.out)} x={500} y={660} largura={500} sinal="!" texto="Quem vê: o algoritmo" />
			<Cartao k={p(t, virada + 2.1, virada + 2.6, ease.out)} x={500} y={820} largura={500} sinal="!" texto="Regras da plataforma" />
			<Cartao k={p(t, virada + 3.1, virada + 3.6, ease.out)} x={500} y={980} largura={500} sinal="!" texto="Posts antigos somem" />
		</AbsoluteFill>
	);
};

export const EBusca: React.FC = () => {
	const {t, d} = useLocal();
	const w = 600;
	const ent = p(t, 0, 0.8, ease.camera);
	const seg = 3.9;
	const botao = p(t, d - 1.6, d - 1.1);
	const toque = clamp((t - (d - 0.95)) / 0.4);
	const zoom = p(t, d - 0.9, d, ease.in);
	return (
		<AbsoluteFill>
			<FundoPalco foco={[55, 55]} />
			<Titulo t={t} ini={0.2} sai={d - 0.6} n="02" rotulo="GOOGLE" titulo={<span>Intenção de <It>compra.</It></span>} />
			<AbsoluteFill style={{perspective: 2000}}>
				<div style={{position: 'absolute', left: 410, top: 480, transform: `translateX(${(1 - ent) * 300}px) rotateY(${lerp(-30, -10, ent) + zoom * 10}deg) scale(${1 + zoom * 0.25})`, transformOrigin: '30% 60%', opacity: ent}}>
					<Tela w={w} raio={52}>
						<BuscaLocal digitado={p(t, 0.5, 2.4, (x) => x)} botaoSite={botao} t={t} />
					</Tela>
					{toque > 0 && toque < 1 && <div style={{position: 'absolute', left: w * 0.53 - 30, top: 438 * 2.769 * (w / 1080) - 30, width: 60, height: 60, borderRadius: 30, background: 'rgba(255,255,255,0.45)', border: '2px solid #fff', transform: `scale(${1 - Math.sin(toque * Math.PI) * 0.2})`}} />}
				</div>
			</AbsoluteFill>
			<Cartao k={p(t, seg + 0.2, seg + 0.7, ease.out) * (1 - p(t, d - 0.7, d - 0.4))} x={70} y={640} largura={400} sinal="✓" texto="Endereço" />
			<Cartao k={p(t, seg + 0.9, seg + 1.4, ease.out) * (1 - p(t, d - 0.7, d - 0.4))} x={70} y={780} largura={400} sinal="✓" texto="Horário" />
			<Cartao k={p(t, seg + 1.7, seg + 2.2, ease.out) * (1 - p(t, d - 0.7, d - 0.4))} x={70} y={920} largura={400} sinal="✓" texto="Um motivo" />
		</AbsoluteFill>
	);
};

export const ESite: React.FC = () => {
	const {t, d} = useLocal();
	const w = 600;
	const ent = p(t, 0, 0.9, ease.camera);
	const sai = p(t, d - 0.5, d, ease.in);
	const lista = ['Endereço próprio', 'Serviços organizados', 'A sua identidade', 'Abre sem aplicativo', 'WhatsApp a um toque'];
	return (
		<AbsoluteFill>
			<FundoPalco foco={[50, 55]} />
			<Titulo t={t} ini={0.25} sai={d - 0.4} n="03" rotulo="SITE PRÓPRIO" titulo={<span>Seu <It>endereço.</It></span>} />
			<AbsoluteFill style={{perspective: 2000}}>
				<div style={{position: 'absolute', left: 70, top: 480, transform: `scale(${lerp(1.3, 1, ent)}) rotateY(${lerp(0, 9, ent)}deg) translateZ(${-sai * 400}px)`, transformOrigin: '50% 30%', opacity: 1 - sai}}>
					<Tela w={w} raio={52}>
						<SiteProprio t={t} rolagem={p(t, 3.5, d - 0.4, ease.inOut) * 230} endereco={1 + p(t, 0.8, 1.4) * (1 - p(t, 2.4, 2.9))} />
					</Tela>
				</div>
			</AbsoluteFill>
			{lista.map((it, i) => (
				<Cartao key={it} k={p(t, (i === 0 ? 1.0 : 3.0 + (i - 1) * 0.75), (i === 0 ? 1.5 : 3.5 + (i - 1) * 0.75), ease.out) * (1 - sai)} x={540} y={560 + i * 140} largura={480} sinal="✓" texto={it} />
			))}
		</AbsoluteFill>
	);
};

/** Síntese: os três trabalham juntos e convergem no site */
export const EJuntos: React.FC = () => {
	const {t, d} = useLocal();
	const ent = p(t, 0, 0.9, ease.camera);
	const l1 = p(t, 0.9, 1.6, ease.inOut);
	const l2 = p(t, 2.4, 3.1, ease.inOut);
	const l3 = p(t, 4.4, 5.1, ease.inOut);
	const sai = p(t, d - 0.45, d, ease.in);
	const linha = (x1: number, y1: number, x2: number, y2: number, k: number, cor: string) => (
		<line x1={x1} y1={y1} x2={x1 + (x2 - x1) * k} y2={y1 + (y2 - y1) * k} stroke={cor} strokeWidth={4} strokeLinecap="round" style={{filter: `drop-shadow(0 0 8px ${cor})`}} />
	);
	return (
		<AbsoluteFill style={{opacity: 1 - sai}}>
			<FundoPalco foco={[50, 62]} />
			<div style={{position: 'absolute', top: 262, left: 70, right: 70, fontFamily: F.inter, fontWeight: 600, fontSize: 62, letterSpacing: '-0.04em', lineHeight: 1.08, color: BRANCO, zIndex: 40}}>
				<Linha t={t} ini={0.25}>
					<span>
						O Instagram <span style={{color: TEAL}}>atrai.</span>
					</span>
				</Linha>
				<Linha t={t} ini={1.85}>
					<span>
						O Google <span style={{color: TEAL}}>mostra o caminho.</span>
					</span>
				</Linha>
				<Linha t={t} ini={3.7}>
					<span>
						O site apresenta sua empresa <It k={p(t, 4.2, 5.4, ease.inOut)}>por inteiro.</It>
					</span>
				</Linha>
			</div>
			<svg style={{position: 'absolute', inset: 0, width: 1080, height: 1920, zIndex: 5}} viewBox="0 0 1080 1920">
				{linha(230, 860, 450, 1000, l1, TEAL)}
				{linha(850, 860, 630, 1000, l2, TEAL)}
				{linha(540, 1390, 540, 1470, l3, VERDE_WHATS)}
			</svg>
			<AbsoluteFill style={{perspective: 1800}}>
				<div style={{position: 'absolute', left: 90, top: 640, transform: `rotateY(16deg) scale(${ent})`, opacity: ent}}>
					<Tela w={250} raio={26} reflexo={0}>
						<PerfilSocial />
					</Tela>
					<div style={{textAlign: 'center', fontFamily: F.mono, fontSize: 19, letterSpacing: '0.12em', color: CINZA, marginTop: 12}}>LINK NA BIO</div>
				</div>
				<div style={{position: 'absolute', left: 740, top: 640, transform: `rotateY(-16deg) scale(${ent})`, opacity: ent}}>
					<Tela w={250} raio={26} reflexo={0}>
						<BuscaLocal digitado={1} botaoSite={1} t={t} />
					</Tela>
					<div style={{textAlign: 'center', fontFamily: F.mono, fontSize: 19, letterSpacing: '0.12em', color: CINZA, marginTop: 12}}>BOTÃO “SITE”</div>
				</div>
				<div style={{position: 'absolute', left: 540 - 175, top: 760, transform: `scale(${lerp(0.8, 1, ent) + l3 * 0.04})`, opacity: ent, zIndex: 3}}>
					<Tela w={350} raio={34} reflexo={0} style={{boxShadow: `0 0 0 ${2 + l3 * 2}px ${TEAL}, 0 0 ${60 * l3}px rgba(20,145,140,0.6), 0 60px 120px -30px rgba(0,0,0,0.95)`}}>
						<SiteProprio t={t} />
					</Tela>
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1478, display: 'flex', justifyContent: 'center', opacity: l3, zIndex: 6}}>
				<div style={{padding: '18px 34px', borderRadius: 999, background: VERDE_WHATS, color: '#fff', fontFamily: F.inter, fontWeight: 700, fontSize: 32}}>Conversa no WhatsApp</div>
			</div>
		</AbsoluteFill>
	);
};
