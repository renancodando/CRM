import React from 'react';
import {AbsoluteFill} from 'remotion';
import {config} from '../../config';
import {F, p, ease, lerp, clamp, useLocal, usePalco} from '../lib/base';
import {metal} from '../../lib/estilo';
import {Linha} from '../comp/ui';
import {IconeWhats, Cursor} from '../../componentes/Icones';
import {Logo} from '../../componentes/Logo';
import {Navegador} from '../../componentes/Molduras';
import {Tela, Captura, FundoPalco, Quadro} from './Palco';
import {SiteVao} from '../sites/Vao';
import {SiteLustro} from '../sites/Lustro';
import {SiteBrasa} from '../sites/Brasa';
import {SiteDuarte} from '../sites/Duarte';

export const CAP_MOBILE = 'captura/reparo-mobile.mp4';
export const CAP_DESKTOP = 'captura/reparo-desktop.mp4';
export const CAP_QUADRO = 'captura/reparo-quadro.jpg';

const useTinta = () => {
	const claro = usePalco() === 'marfim';
	return {claro, txt: claro ? '#141416' : '#f5f5f7', sub: claro ? '#5f5b54' : '#9a9da4', linha: claro ? 'rgba(20,20,22,0.25)' : 'rgba(255,255,255,0.3)'};
};

/** Rótulo superior (zona segura) — índice, nome e natureza do projeto */
export const Rotulo: React.FC<{t: number; ini: number; fim: number; n?: string; nome: string; tipo: string}> = ({t, ini, fim, n, nome, tipo}) => {
	const {txt, sub, linha} = useTinta();
	const k = p(t, ini, ini + 0.5) * (1 - p(t, fim - 0.35, fim));
	if (k <= 0) return null;
	return (
		<div style={{position: 'absolute', top: 258, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 18, fontFamily: F.mono, fontSize: 23, letterSpacing: '0.2em', textTransform: 'uppercase', color: sub, opacity: k, transform: `translateY(${(1 - k) * 12}px)`, zIndex: 40}}>
			{n && <span style={{color: txt}}>{n}</span>}
			{n && <span style={{width: 46, height: 1, background: linha}} />}
			<span style={{color: txt}}>{nome}</span>
			<span>· {tipo}</span>
		</div>
	);
};

const Frase: React.FC<{t: number; linhas: React.ReactNode[]; ini: number; sai?: number; top: number; tam?: number; alinhamento?: 'center' | 'left'}> = ({t, linhas, ini, sai, top, tam = 92, alinhamento = 'center'}) => {
	const {txt} = useTinta();
	return (
		<div style={{position: 'absolute', top, left: 70, right: 70, textAlign: alinhamento, fontFamily: F.inter, fontWeight: 600, fontSize: tam, letterSpacing: '-0.045em', lineHeight: 1.0, color: txt, zIndex: 45}}>
			{linhas.map((l, i) => (
				<Linha key={i} t={t} ini={ini + i * 0.13} sai={sai !== undefined ? sai + i * 0.04 : undefined}>
					{l}
				</Linha>
			))}
		</div>
	);
};
const Destaque: React.FC<{children: React.ReactNode; k?: number}> = ({children, k = 1}) => {
	const {claro} = useTinta();
	return <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.16em', letterSpacing: '-0.02em', ...metal(k, claro ? 0.5 : 1, claro)}}>{children}</span>;
};

// ————————————————————————————————————————————————————————— GANCHO (site real)
/** Começa colado no 3D do site (parece animação) e recua até revelar a página. */
export const CenaGancho: React.FC<{recuo?: number; texto?: boolean; capInicio?: number}> = ({recuo = 2.35, texto = true, capInicio = 0}) => {
	const {t, d} = useLocal();
	const {claro} = useTinta();
	const z = p(t, recuo, recuo + 1.25, ease.camera);
	const w = lerp(1080, 640, z);
	const zoom = lerp(1.9, 1, z);
	return (
		<AbsoluteFill>
			<FundoPalco luz={z} />
			<AbsoluteFill style={{perspective: 2200}}>
				<div style={{position: 'absolute', left: 540 - w / 2, top: lerp(0, 940 - (640 * 16) / 18, z), transform: `rotateY(${lerp(0, -9, z) + p(t, recuo + 1.2, d, ease.suave) * 4}deg) rotateX(${lerp(0, 3, z)}deg)`}}>
					<Tela w={w} raio={lerp(0, 58, z)} reflexo={0.1 * z} borda={z}>
						<div style={{position: 'absolute', inset: 0, transform: `scale(${zoom})`, transformOrigin: '540px 330px'}}>
							<Captura arquivo={CAP_MOBILE} inicio={capInicio} />
						</div>
						<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(4,4,5,0) 0%, rgba(4,4,5,0) 34%, rgba(4,4,5,0.92) 52%, #040405 64%)', opacity: 1 - z}} />
					</Tela>
				</div>
			</AbsoluteFill>
			{texto && (
				<>
					<div style={{position: 'absolute', top: 1080, left: 0, right: 0, textAlign: 'center', fontFamily: F.inter, fontWeight: 650, fontSize: 120, letterSpacing: '-0.05em', lineHeight: 1, color: '#fff', textShadow: '0 4px 40px rgba(0,0,0,0.65)', zIndex: 45}}>
						<Linha t={t} ini={0.3} sai={recuo - 0.15}>
							Parece
						</Linha>
						<Linha t={t} ini={0.45} sai={recuo - 0.1}>
							<span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.12em'}}>animação.</span>
						</Linha>
					</div>
					<div style={{position: 'absolute', top: 262, left: 0, right: 0, textAlign: 'center', fontFamily: F.inter, fontWeight: 600, fontSize: 80, letterSpacing: '-0.045em', color: claro ? '#141416' : '#f5f5f7', zIndex: 45}}>
						<Linha t={t} ini={recuo + 0.5} sai={d - 0.3}>
							<span>
								Mas é um <Destaque k={p(t, recuo + 0.8, recuo + 2.0, ease.inOut)}>site.</Destaque>
							</span>
						</Linha>
					</div>
				</>
			)}
			<div style={{position: 'absolute', left: 0, right: 0, top: 1500, textAlign: 'center', fontFamily: F.mono, fontSize: 22, letterSpacing: '0.18em', color: claro ? '#5f5b54' : '#9a9da4', opacity: p(t, recuo + 0.9, recuo + 1.4) * (1 - p(t, d - 0.3, d))}}>
				REPARO FINO · PROJETO RNC WEB
			</div>
		</AbsoluteFill>
	);
};

// ————————————————————————————————————————————————————————— REPARO FINO (celular + computador)
export const CenaReparo: React.FC<{capInicio?: number; capDesk?: number; frase?: boolean}> = ({capInicio = 4.6, capDesk = 2.5, frase = true}) => {
	const {t, d} = useLocal();
	const w = 640;
	const h = (w * 16) / 9;
	const mov = p(t, 0.6, 2.2, ease.camera);
	const desk = p(t, 1.0, 2.4, ease.camera);
	const sai = p(t, d - 0.5, d, ease.in);
	return (
		<AbsoluteFill>
			<FundoPalco foco={[40, 45]} />
			<AbsoluteFill style={{perspective: 2200}}>
				<div style={{position: 'absolute', left: lerp(540 - w / 2, 70, mov), top: lerp(940 - h / 2, 330, mov), transform: `rotateY(${lerp(-5, 10, mov)}deg) scale(${lerp(1, 0.86, mov)}) translateZ(${-sai * 600}px)`, transformOrigin: '0 0', opacity: 1 - sai}}>
					<Tela w={w} raio={58} reflexo={0}>
						<Captura arquivo={CAP_MOBILE} inicio={capInicio} />
					</Tela>
				</div>
				<div style={{position: 'absolute', left: lerp(900, 150, desk), top: 1000, transform: `rotateY(${lerp(-40, -14, desk) + p(t, 2.4, d, ease.suave) * 6}deg) translateZ(${lerp(-500, 60, desk) - sai * 600}px)`, opacity: desk * (1 - sai), transformOrigin: '0 50%'}}>
					<Navegador largura={880} url="tecnica-alpha.vercel.app">
						<Captura arquivo={CAP_DESKTOP} inicio={capDesk} largura={1440} altura={900} />
					</Navegador>
				</div>
			</AbsoluteFill>
			{frase && <Rotulo t={t} ini={0.3} fim={d} n="01" nome="Reparo Fino" tipo="site real" />}
			{frase && (
				<div style={{position: 'absolute', left: 620, top: 520, width: 380, fontFamily: F.inter, fontWeight: 600, fontSize: 56, letterSpacing: '-0.04em', lineHeight: 1.02, color: '#f5f5f7', zIndex: 45}}>
					<Linha t={t} ini={2.0} sai={d - 0.45}>
						No celular
					</Linha>
					<Linha t={t} ini={2.15} sai={d - 0.4}>
						<span>
							e no <Destaque k={p(t, 2.4, 3.6, ease.inOut)}>computador.</Destaque>
						</span>
					</Linha>
				</div>
			)}
		</AbsoluteFill>
	);
};

// ————————————————————————————————————————————————————————— SITES CRIADOS
export type Camera = 'baixo' | 'lado' | 'zoom';
export const CenaSite: React.FC<{site: 'vao' | 'lustro' | 'brasa'; camera: Camera; n?: string; atraso?: number; modo?: 'completo' | 'curto'; rotulo?: boolean}> = ({site, camera, n, atraso = 0.15, modo = 'completo', rotulo = true}) => {
	const {t, d} = useLocal();
	const w = 700;
	const h = (w * 16) / 9;
	const ent = p(t, 0, 0.9, ease.camera);
	const sai = p(t, d - 0.55, d, ease.in);
	const vida = p(t, 0.9, d - 0.55, ease.suave);
	let tr = '';
	if (camera === 'baixo') tr = `translateY(${(1 - ent) * 380}px) rotateX(${lerp(38, 4, ent) - vida * 3}deg) scale(${1 + vida * 0.04}) translateZ(${-sai * 700}px) rotateY(${sai * 28}deg)`;
	if (camera === 'lado') tr = `translateX(${(1 - ent) * 420}px) rotateY(${lerp(-72, -12, ent) + vida * 7}deg) translateZ(${-sai * 600}px) translateX(${-sai * 300}px)`;
	if (camera === 'zoom') tr = `scale(${lerp(1.6, 1, ent) + vida * 0.03}) rotateZ(${lerp(-3, 0, ent)}deg) translateY(${-sai * 500}px) rotateX(${sai * -30}deg)`;
	const nomes = {vao: ['Vão Arquitetura', 'conceito'], lustro: ['Lustro Estética Automotiva', 'conceito'], brasa: ['Brasa Restaurante', 'conceito']}[site];
	const ts = Math.max(0, t - atraso);
	return (
		<AbsoluteFill>
			<FundoPalco foco={[50, 42]} />
			<AbsoluteFill style={{perspective: 2000, perspectiveOrigin: '50% 48%'}}>
				<div style={{position: 'absolute', left: 540 - w / 2, top: 940 - h / 2, transform: tr, transformOrigin: camera === 'zoom' ? '32% 22%' : '50% 50%', opacity: Math.min(1, ent * 2) * (1 - sai * 0.9)}}>
					<Tela w={w} raio={56}>
						{site === 'vao' && <SiteVao t={ts} modo={modo} />}
						{site === 'lustro' && <SiteLustro t={ts} modo={modo} />}
						{site === 'brasa' && <SiteBrasa t={ts} modo={modo} />}
					</Tela>
				</div>
			</AbsoluteFill>
			{rotulo && <Rotulo t={t} ini={0.25} fim={d} n={n} nome={nomes[0]} tipo={nomes[1]} />}
		</AbsoluteFill>
	);
};

// ————————————————————————————————————————————————————————— TRANSFORMAÇÃO
type TT = {m: number; k0: number; k1: number; outra: number; toque: number};
export const CenaTransformacao: React.FC<{curta?: boolean; T?: TT}> = ({curta = false, T: TP}) => {
	const {t, d} = useLocal();
	const {txt, sub, claro} = useTinta();
	const T = TP ?? (curta ? {m: 0.3, k0: 0.5, k1: 1.9, outra: 99, toque: 2.8} : {m: 0.3, k0: 1.55, k1: 3.4, outra: 3.25, toque: 4.7});
	const k = p(t, T.k0, T.k1, (x) => x);
	const toque = clamp((t - T.toque) / 0.5);
	const w = 600;
	const h = (w * 16) / 9;
	const top = 486;
	const ent = p(t, 0, 0.7, ease.camera);
	const sai = p(t, d - 0.6, d, ease.inOut);
	const depois = t > (T.k0 + T.k1) / 2;
	return (
		<AbsoluteFill>
			<FundoPalco foco={[50, 55]} />
			{!curta && <Frase t={t} ini={T.m} sai={T.outra - 0.35} top={268} tam={74} linhas={['Mesmo negócio.', 'Mesmas informações.']} />}
			{curta && <Frase t={t} ini={T.m} sai={d - 0.45} top={268} tam={74} linhas={['Serviços organizados.', 'Contato a um toque.']} />}
			<div style={{position: 'absolute', top: 290, left: 0, right: 0, textAlign: 'center', fontFamily: F.inter, fontWeight: 600, fontSize: 104, letterSpacing: '-0.05em', color: txt, zIndex: 45}}>
				<Linha t={t} ini={T.outra} sai={d - 0.45}>
					<span>
						Outra <Destaque k={p(t, T.outra + 0.3, T.outra + 1.4, ease.inOut)}>impressão.</Destaque>
					</span>
				</Linha>
			</div>
			<AbsoluteFill style={{perspective: 2000}}>
				<div style={{position: 'absolute', left: 540 - w / 2, top: top + (1 - ent) * 200, opacity: ent, transform: `rotateX(${lerp(14, 2, ent)}deg) translateZ(${-sai * 400}px) translateX(${-sai * 260}px) rotateY(${sai * 25}deg)`}}>
					<Tela w={w} raio={50}>
						<SiteDuarte k={k} toque={toque} />
					</Tela>
					<div style={{position: 'absolute', left: 26, top: 26, padding: '10px 18px', borderRadius: 999, fontFamily: F.mono, fontSize: 20, letterSpacing: '0.16em', background: depois ? '#0F2A44' : '#5a5a5a', color: '#fff', opacity: ent}}>{depois ? 'DEPOIS' : 'ANTES'}</div>
					{t > T.toque - 0.3 && t < T.toque + 0.7 && (
						<div style={{position: 'absolute', left: w / 2 - 30, top: 419 * 2.769 * (w / 1080) - 30, width: 60, height: 60, borderRadius: '50%', background: 'rgba(255,255,255,0.45)', border: '2px solid #fff', boxShadow: '0 6px 20px rgba(0,0,0,0.35)', opacity: p(t, T.toque - 0.3, T.toque - 0.1) * (1 - p(t, T.toque + 0.4, T.toque + 0.7)), transform: `scale(${1 - Math.sin(toque * Math.PI) * 0.2})`}} />
					)}
				</div>
			</AbsoluteFill>
			<div style={{position: 'absolute', left: 0, right: 0, top: 436, textAlign: 'center', fontFamily: F.mono, fontSize: 20, letterSpacing: '0.16em', color: sub, opacity: p(t, 1, 1.5) * (1 - sai)}}>
				EXEMPLO DE SITE BÁSICO · NEGÓCIO FICTÍCIO
			</div>
			{claro && null}
		</AbsoluteFill>
	);
};

// ————————————————————————————————————————————————————————— OFERTA
type TO = {linha: number; rotulo: number; de: number; risco: number; preco: number; validade: number; itens: number};
export const CenaOferta: React.FC<{compacta?: boolean; T?: TO}> = ({compacta = false, T: TP}) => {
	const {t, d} = useLocal();
	const {txt, sub, claro} = useTinta();
	const T = TP ?? (compacta ? {linha: 0.15, rotulo: 0.35, de: 0.6, risco: 1.3, preco: 1.6, validade: 2.2, itens: 2.5} : {linha: 0.3, rotulo: 0.6, de: 1.2, risco: 2.9, preco: 4.2, validade: 4.9, itens: 5.3});
	const corre = p(t, T.linha, T.linha + 0.7, ease.inOut);
	const risco = p(t, T.risco, T.risco + 0.5, ease.inOut);
	const sobe = p(t, T.preco - 0.05, T.preco + 0.8, ease.out);
	const brilho = p(t, T.preco + 0.6, T.preco + 1.7, ease.inOut);
	const sai = p(t, d - 0.4, d, ease.in);
	const linhaY = 990;
	const tam = 300;
	const itens = ['Design personalizado', 'Versão para celular', 'Botão de WhatsApp', 'Mapa e horários', 'Estrutura básica de SEO'];
	const valor = (
		<div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', fontFamily: F.inter, lineHeight: 0.8}}>
			<span style={{fontSize: tam * 0.3, fontWeight: 300, marginTop: tam * 0.05, marginRight: tam * 0.06, ...metal(brilho - 0.1, claro ? 0.5 : 1, claro)}}>R$</span>
			<span style={{fontSize: tam, fontWeight: 700, letterSpacing: '-0.06em', ...metal(brilho, claro ? 0.5 : 1, claro)}}>{config.oferta.valor}</span>
		</div>
	);
	return (
		<AbsoluteFill style={{opacity: 1 - sai}}>
			<FundoPalco foco={[50, 50]} luz={0.7 + 0.3 * sobe} />
			<AbsoluteFill style={{background: `radial-gradient(ellipse 60% 16% at 50% ${linhaY / 19.2}%, ${claro ? 'rgba(255,255,255,0.7)' : 'rgba(220,225,235,0.16)'}, transparent 70%)`, opacity: sobe}} />
			{/* rótulo */}
			<div style={{position: 'absolute', top: 280, left: 0, right: 0, textAlign: 'center', fontFamily: F.inter, fontWeight: 600, fontSize: 30, letterSpacing: `${lerp(0.6, 0.34, p(t, T.rotulo, T.rotulo + 0.9))}em`, color: sub, opacity: p(t, T.rotulo, T.rotulo + 0.6)}}>
				OFERTA DE FIM DE ANO
			</div>
			<div style={{position: 'absolute', top: 336, left: 0, right: 0, textAlign: 'center', fontFamily: F.inter, fontWeight: 500, fontSize: 50, letterSpacing: '-0.03em', color: txt}}>
				<Linha t={t} ini={T.rotulo + 0.2}>
					Site institucional ou landing page
				</Linha>
			</div>
			{/* preço anterior riscado */}
			<div style={{position: 'absolute', top: 452, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: p(t, T.de, T.de + 0.5)}}>
				<div style={{position: 'relative', fontFamily: F.inter, fontSize: 58, fontWeight: 400, color: sub, letterSpacing: '-0.02em'}}>
					de R$ 968
					<div style={{position: 'absolute', left: -8, top: '54%', height: 4, width: `calc(${risco * 100}% + 16px)`, background: claro ? '#b3121b' : '#f5f5f7', borderRadius: 2, transform: 'rotate(-4deg)'}} />
				</div>
			</div>
			<div style={{position: 'absolute', top: linhaY - tam * 0.86 - 70, left: 0, right: 0, textAlign: 'center', fontFamily: F.serif, fontStyle: 'italic', fontSize: 50, color: txt, opacity: p(t, T.preco - 0.2, T.preco + 0.3)}}>por</div>
			{/* valor nascendo da linha de luz */}
			<div style={{position: 'absolute', left: 0, right: 0, top: linhaY - tam * 0.86, height: tam * 0.86, overflow: 'hidden'}}>
				<div style={{transform: `translateY(${(1 - sobe) * 100}%)`, filter: `blur(${(1 - sobe) * 10}px)`}}>{valor}</div>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: linhaY + 6, height: tam * 0.42, overflow: 'hidden', opacity: 0.15, maskImage: 'linear-gradient(180deg,#000,transparent 80%)', WebkitMaskImage: 'linear-gradient(180deg,#000,transparent 80%)'}}>
				<div style={{transform: `scaleY(-1) translateY(${(1 - sobe) * 100}%)`, transformOrigin: '50% 0', filter: 'blur(3px)'}}>
					<div style={{transform: `translateY(${-tam * 0.86}px)`}}>{valor}</div>
				</div>
			</div>
			<div style={{position: 'absolute', top: linhaY, left: 540 - 460 * corre, width: 920 * corre, height: 2, background: claro ? 'linear-gradient(90deg,transparent,#141416 20%,#141416 80%,transparent)' : 'linear-gradient(90deg,transparent,#fff 20%,#fff 80%,transparent)', boxShadow: claro ? 'none' : '0 0 16px rgba(255,255,255,0.5)'}} />
			{/* validade */}
			<div style={{position: 'absolute', top: linhaY + 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: p(t, T.validade, T.validade + 0.5), transform: `translateY(${(1 - p(t, T.validade, T.validade + 0.5)) * 14}px)`}}>
				<div style={{padding: '16px 34px', borderRadius: 999, boxShadow: `0 0 0 1.5px ${claro ? '#141416' : 'rgba(255,255,255,0.55)'}`, fontFamily: F.inter, fontWeight: 600, fontSize: 38, color: txt, letterSpacing: '-0.01em'}}>Válida até 20/12/2026</div>
			</div>
			{/* o que está incluído */}
			<div style={{position: 'absolute', top: linhaY + 190, left: 110, right: 110, display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '14px 30px', fontFamily: F.inter, fontSize: 30, color: txt}}>
				{itens.map((it, i) => {
					const k = p(t, T.itens + i * 0.1, T.itens + 0.4 + i * 0.1);
					return (
						<span key={it} style={{opacity: k, display: 'flex', alignItems: 'center', gap: 10}}>
							<span style={{color: claro ? '#1f7a43' : '#7be29f'}}>✓</span>
							{it}
						</span>
					);
				})}
			</div>
			<div style={{position: 'absolute', top: 1418, left: 90, right: 90, textAlign: 'center', fontFamily: F.inter, fontSize: 23, lineHeight: 1.35, color: sub, opacity: p(t, T.itens + 0.5, T.itens + 1.0)}}>
				Valor da modalidade básica, conforme escopo definido em proposta. Recursos avançados, animações 3D e sistemas sob medida têm orçamento à parte.
			</div>
		</AbsoluteFill>
	);
};

// ————————————————————————————————————————————————————————— FINAL (convergência + marca + convite)
const MINIS: {tipo: 'cap' | 'vao' | 'lustro' | 'brasa'; ts: number}[] = [
	{tipo: 'cap', ts: 0},
	{tipo: 'vao', ts: 3.1},
	{tipo: 'lustro', ts: 4.5},
	{tipo: 'brasa', ts: 2.2},
];
type TF = {conv: number; logo: number; frase: number; cta: number; clique: number};
export const CenaFinal: React.FC<{curta?: boolean; T?: TF}> = ({curta = false, T: TP}) => {
	const {t, d} = useLocal();
	const {txt, sub, claro} = useTinta();
	const T = TP ?? (curta ? {conv: 0.9, logo: 0.8, frase: 1.4, cta: 1.9, clique: 2.7} : {conv: 1.6, logo: 1.7, frase: 2.5, cta: 3.3, clique: 4.4});
	const orb = t * 0.45;
	const conv = p(t, T.conv - 0.6, T.conv + 0.4, ease.in);
	const flash = Math.max(0, 1 - Math.abs(t - T.conv - 0.4) / 0.35);
	const ctaK = p(t, T.cta, T.cta + 0.6, ease.out);
	const clique = clamp((t - T.clique) / 0.45);
	const press = Math.sin(clique * Math.PI);
	const C = config.contato;
	const contato = [C.whatsapp, C.instagram, C.site].filter(Boolean).join('   ·   ');
	return (
		<AbsoluteFill>
			<FundoPalco foco={[50, 40]} />
			<AbsoluteFill style={{perspective: 1800, perspectiveOrigin: '50% 40%'}}>
				{conv < 1 &&
					MINIS.map((m, i) => {
						const a = orb + (i / MINIS.length) * Math.PI * 2;
						const r = lerp(420, 0, conv);
						const x = Math.cos(a) * r;
						const z = Math.sin(a) * r - 200;
						const w = lerp(300, 60, conv);
						return (
							<div key={i} style={{position: 'absolute', left: 540 - w / 2, top: 760 - (w * 16) / 18, transform: `translate3d(${x}px, ${Math.sin(a * 2) * 30}px, ${z}px) rotateY(${-a * 57.3 + 90}deg)`, opacity: (1 - conv) * p(t, 0, 0.4)}}>
								<Tela w={w} raio={lerp(28, 8, conv)} reflexo={0.08}>
									{m.tipo === 'cap' && <Quadro arquivo={CAP_QUADRO} />}
									{m.tipo === 'vao' && <SiteVao t={m.ts} />}
									{m.tipo === 'lustro' && <SiteLustro t={m.ts} />}
									{m.tipo === 'brasa' && <SiteBrasa t={m.ts} />}
								</Tela>
							</div>
						);
					})}
			</AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 40%, ${claro ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.5)'}, transparent 40%)`, opacity: flash}} />
			<div style={{position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center'}}>
				<Logo t={t} ini={T.logo} tamanho={168} brilho={p(t, T.logo + 0.8, T.logo + 1.9, ease.inOut)} reflexo={false} escuro={claro} />
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 880, textAlign: 'center', fontFamily: F.inter, fontWeight: 500, fontSize: 64, letterSpacing: '-0.035em', color: txt}}>
				<Linha t={t} ini={T.frase}>
					<span>
						Presença digital <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400, fontSize: '1.14em'}}>à altura.</span>
					</span>
				</Linha>
			</div>
			<div style={{position: 'absolute', left: 0, right: 0, top: 1060, display: 'flex', justifyContent: 'center'}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 20,
						padding: '34px 48px',
						borderRadius: 999,
						background: claro ? '#141416' : 'linear-gradient(180deg,#ffffff,#dfe2e7)',
						color: claro ? '#fff' : '#0b0c0e',
						fontFamily: F.inter,
						fontSize: 42,
						fontWeight: 650,
						letterSpacing: '-0.02em',
						boxShadow: `0 20px 60px -10px rgba(${claro ? '0,0,0' : '255,255,255'},${0.2 + press * 0.15})`,
						opacity: ctaK,
						transform: `translateY(${(1 - ctaK) * 40}px) scale(${(0.94 + 0.06 * ctaK) * (1 - press * 0.05)})`,
						filter: `blur(${(1 - ctaK) * 8}px)`,
					}}
				>
					<IconeWhats size={46} color={claro ? '#fff' : '#0b0c0e'} />
					Peça sua demonstração pelo WhatsApp
				</div>
			</div>
			{t > T.cta + 0.2 && <Cursor x={lerp(900, 760, p(t, T.cta + 0.2, T.clique, ease.inOut))} y={lerp(1450, 1130, p(t, T.cta + 0.2, T.clique, ease.inOut))} clique={clique} opacidade={p(t, T.cta + 0.2, T.cta + 0.4) * (1 - p(t, T.clique + 0.6, T.clique + 0.9))} escala={1.5} />}
			<div style={{position: 'absolute', left: 0, right: 0, top: 1230, textAlign: 'center', fontFamily: F.mono, fontSize: 24, letterSpacing: '0.14em', color: sub, opacity: p(t, T.cta + 0.4, T.cta + 0.9)}}>
				{contato || 'CRIAÇÃO DE SITES · LANDING PAGES · SITES INSTITUCIONAIS'}
			</div>
		</AbsoluteFill>
	);
};

// ————————————————————————————————————————————————————————— ABERTURAS ALTERNATIVAS
/** Curiosidade: começa como uma página simples e se revela. */
export const AberturaCuriosidade: React.FC = () => {
	const {t, d} = useLocal();
	const z = p(t, d - 1.1, d, ease.camera);
	const w = lerp(1080, 700, z);
	return (
		<AbsoluteFill>
			<FundoPalco luz={z} />
			<div style={{position: 'absolute', left: 540 - w / 2, top: lerp(0, 940 - (700 * 16) / 18, z), transform: `rotateY(${-z * 6}deg)`}}>
				<Tela w={w} raio={lerp(0, 56, z)} reflexo={0.1 * z}>
					<SiteVao t={Math.max(0, t - 1.9)} />
				</Tela>
			</div>
			<div style={{position: 'absolute', top: 360, left: 70, right: 70, fontFamily: F.inter, fontWeight: 600, fontSize: 84, letterSpacing: '-0.045em', lineHeight: 1.0, color: '#1E1D1A', zIndex: 45}}>
				<Linha t={t} ini={0.25} sai={1.75}>
					Parece um
				</Linha>
				<Linha t={t} ini={0.4} sai={1.8}>
					site simples.
				</Linha>
			</div>
			<div style={{position: 'absolute', top: 1360, left: 0, right: 0, textAlign: 'center', fontFamily: F.inter, fontWeight: 600, fontSize: 72, letterSpacing: '-0.045em', color: '#1E1D1A', zIndex: 45, opacity: 1 - z}}>
				<Linha t={t} ini={2.4} sai={d - 1.2}>
					<span>
						Até você <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400}}>tocar.</span>
					</span>
				</Linha>
			</div>
		</AbsoluteFill>
	);
};

/** Desejo: o nome de um negócio comum ganha identidade e vira site. */
export const AberturaDesejo: React.FC = () => {
	const {t, d} = useLocal();
	const {txt} = useTinta();
	const m = p(t, 2.0, 2.8, ease.inOut);
	const painel = p(t, 2.5, 3.4, ease.camera);
	const w = 680;
	return (
		<AbsoluteFill>
			<FundoPalco />
			<div style={{position: 'absolute', top: 290, left: 70, right: 70, fontFamily: F.inter, fontWeight: 600, fontSize: 80, letterSpacing: '-0.045em', lineHeight: 1.02, color: txt, zIndex: 45}}>
				<Linha t={t} ini={0.2} sai={2.6}>
					Você sabe o quanto
				</Linha>
				<Linha t={t} ini={0.35} sai={2.65}>
					<span>
						o seu negócio é <span style={{fontFamily: F.serif, fontStyle: 'italic', fontWeight: 400}}>bom.</span>
					</span>
				</Linha>
			</div>
			<div style={{position: 'absolute', top: 290, left: 70, right: 70, fontFamily: F.inter, fontWeight: 600, fontSize: 90, letterSpacing: '-0.045em', lineHeight: 1.02, color: txt, zIndex: 45}}>
				<Linha t={t} ini={2.85} sai={d - 0.3}>
					Seu site
				</Linha>
				<Linha t={t} ini={3.0} sai={d - 0.25}>
					<span>
						mostra <Destaque k={p(t, 3.2, 4.4, ease.inOut)}>isso?</Destaque>
					</span>
				</Linha>
			</div>
			{/* nome em fonte padrão */}
			<div style={{position: 'absolute', left: 0, right: 0, top: 960, textAlign: 'center', fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 50, color: '#8d8d8d', opacity: p(t, 0.8, 1.2) * (1 - m)}}>Brasa — cozinha de fogo</div>
			<AbsoluteFill style={{perspective: 2000}}>
				<div style={{position: 'absolute', left: 540 - w / 2, top: 520, opacity: painel, transform: `translateY(${(1 - painel) * 260}px) rotateX(${lerp(30, 3, painel)}deg)`}}>
					<Tela w={w} raio={54}>
						<SiteBrasa t={Math.max(0, t - 2.3)} />
					</Tela>
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};

// ————————————————————————————————————————————————————————— LEQUE (três identidades lado a lado)
export const CenaLeque: React.FC = () => {
	const {t, d} = useLocal();
	const {txt} = useTinta();
	const ab = p(t, 0, 1.0, ease.camera);
	const sai = p(t, d - 0.45, d, ease.in);
	const w = 520;
	const itens: {site: 'vao' | 'lustro' | 'brasa'; ts: number}[] = [
		{site: 'vao', ts: 3.4},
		{site: 'lustro', ts: 4.6},
		{site: 'brasa', ts: 1.9},
	];
	return (
		<AbsoluteFill>
			<FundoPalco foco={[50, 50]} />
			<Frase t={t} ini={0.3} sai={d - 0.4} top={268} tam={76} linhas={[<span key="a">Cada negócio,</span>, <span key="b">uma <Destaque k={p(t, 0.6, 1.8, ease.inOut)}>identidade.</Destaque></span>]} />
			<AbsoluteFill style={{perspective: 1800, perspectiveOrigin: '50% 55%'}}>
				{itens.map((it, i) => {
					const lado = i - 1;
					const ang = lado * lerp(0, 24, ab);
					const x = lado * lerp(0, 300, ab);
					return (
						<div key={it.site} style={{position: 'absolute', left: 540 - w / 2, top: 520, transform: `translateX(${x}px) translateZ(${lado === 0 ? 80 : -120}px) rotateY(${-ang}deg) translateY(${sai * -200}px)`, opacity: (1 - sai) * Math.min(1, t * 3), zIndex: lado === 0 ? 2 : 1}}>
							<Tela w={w} raio={44}>
								{it.site === 'vao' && <SiteVao t={it.ts + t * 0.3} />}
								{it.site === 'lustro' && <SiteLustro t={it.ts + t * 0.3} />}
								{it.site === 'brasa' && <SiteBrasa t={it.ts + t * 0.3} />}
							</Tela>
						</div>
					);
				})}
			</AbsoluteFill>
			{txt && null}
		</AbsoluteFill>
	);
};
