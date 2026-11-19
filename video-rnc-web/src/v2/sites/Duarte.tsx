import React from 'react';
import {F, p, ease, lerp, clamp} from '../lib/base';
import {Pagina} from '../comp/Pagina';

/**
 * DUARTE CLIMATIZAÇÃO — exemplo de site institucional BÁSICO (o que a oferta entrega).
 * Mostra a mesma informação antes (solta) e depois (organizada). Negócio fictício.
 */
const NAVY = '#0F2A44';
const CIANO = '#1696BF';
const SIMPLES = 'Arial, "Liberation Sans", Helvetica, sans-serif';

type Estado = {txt: string; x: number; y: number; fs: number; cor: string; peso: number; fonte?: string};
type Frag = {a: Estado; d: Estado};

const FRAGS: Frag[] = [
	{a: {txt: 'DUARTE CLIMATIZAÇÃO', x: 28, y: 150, fs: 21, cor: '#222', peso: 900, fonte: SIMPLES}, d: {txt: 'Duarte Climatização', x: 22, y: 92, fs: 16, cor: NAVY, peso: 700}},
	{a: {txt: 'instalação,', x: 28, y: 190, fs: 15, cor: '#333', peso: 400, fonte: SIMPLES}, d: {txt: 'Instalação', x: 30, y: 344, fs: 12.5, cor: NAVY, peso: 600}},
	{a: {txt: 'manutenção', x: 108, y: 190, fs: 15, cor: '#333', peso: 400, fonte: SIMPLES}, d: {txt: 'Manutenção', x: 152, y: 344, fs: 12.5, cor: NAVY, peso: 600}},
	{a: {txt: 'e limpeza', x: 200, y: 190, fs: 15, cor: '#333', peso: 400, fonte: SIMPLES}, d: {txt: 'Limpeza', x: 274, y: 344, fs: 12.5, cor: NAVY, peso: 600}},
	{a: {txt: 'atendemos residencias e empresas', x: 28, y: 236, fs: 15, cor: '#333', peso: 400, fonte: SIMPLES}, d: {txt: 'Residências e empresas', x: 34, y: 245, fs: 10.5, cor: CIANO, peso: 600}},
	{a: {txt: 'ORÇAMENTO SEM COMPROMISSO!!', x: 28, y: 266, fs: 15, cor: '#c62828', peso: 700, fonte: SIMPLES}, d: {txt: 'Orçamento sem compromisso', x: 112, y: 446, fs: 10.5, cor: '#5d6b78', peso: 400}},
	{a: {txt: 'chama no zap', x: 28, y: 296, fs: 15, cor: '#333', peso: 400, fonte: SIMPLES}, d: {txt: 'Pedir orçamento no WhatsApp', x: 72, y: 410, fs: 13.5, cor: '#fff', peso: 700}},
	{a: {txt: 'seg a sab 8 as 18', x: 28, y: 326, fs: 15, cor: '#333', peso: 400, fonte: SIMPLES}, d: {txt: 'Seg. a sáb. · 8h às 18h', x: 46, y: 486, fs: 12, cor: NAVY, peso: 500}},
	{a: {txt: 'rua das acacias 210 centro', x: 28, y: 356, fs: 15, cor: '#333', peso: 400, fonte: SIMPLES}, d: {txt: 'Rua das Acácias, 210 — Centro', x: 46, y: 512, fs: 12, cor: NAVY, peso: 500}},
];
const COLA = [
	{txt: 'de ar condicionado split!!', x: 28, y: 212},
	{txt: 'tel / whats no perfil', x: 28, y: 386},
];

const hx = (c: string) => (c.length === 4 ? [1, 2, 3].map((i) => parseInt(c[i] + c[i], 16)) : [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)));
const cor = (a: string, b: string, k: number) => `rgb(${hx(a).map((v, i) => Math.round(v + (hx(b)[i] - v) * k)).join(',')})`;

const Icone: React.FC<{tipo: number}> = ({tipo}) => (
	<svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke={CIANO} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
		{tipo === 0 && <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M9 4.5l3 2 3-2M9 19.5l3-2 3 2" />}
		{tipo === 1 && <path d="M14.5 6.5a4 4 0 0 0-5.3 5.3L4 17l3 3 5.2-5.2a4 4 0 0 0 5.3-5.3l-2.4 2.4-2.6-.6-.6-2.6Z" />}
		{tipo === 2 && <path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5Z" />}
	</svg>
);

/** k: 0 = informação solta · 1 = site organizado. toque: 0..1 toque no botão do WhatsApp */
export const SiteDuarte: React.FC<{k: number; toque?: number}> = ({k, toque = 0}) => {
	const e = (i: number) => ease.inOut(clamp((k - i * 0.035) / 0.72));
	const estrutura = p(k, 0.55, 1);
	return (
		<Pagina fundo={cor('#e4e4e4', '#ffffff', p(k, 0.1, 0.6))}>
			{/* "antes": cartão de post simples */}
			<div style={{position: 'absolute', left: 16, right: 16, top: 128, height: 290, borderRadius: 6, background: '#f6f6f6', boxShadow: '0 1px 3px rgba(0,0,0,0.12)', opacity: 1 - p(k, 0.05, 0.4)}} />
			{COLA.map((c) => (
				<div key={c.txt} style={{position: 'absolute', left: c.x, top: c.y, fontFamily: SIMPLES, fontSize: 15, color: '#333', opacity: 1 - p(k, 0, 0.3)}}>
					{c.txt}
				</div>
			))}

			{/* "depois": estrutura */}
			<div style={{opacity: estrutura}}>
				<div style={{position: 'absolute', left: 0, right: 0, top: 78, height: 44, borderBottom: '1px solid #e7ecf1'}} />
				<div style={{position: 'absolute', right: 22, top: 92, display: 'flex', flexDirection: 'column', gap: 4}}>
					{[0, 1, 2].map((i) => (
						<i key={i} style={{width: 18, height: 2, background: NAVY, borderRadius: 1}} />
					))}
				</div>
				<div style={{position: 'absolute', left: 22, right: 22, top: 140, fontFamily: F.inter, fontWeight: 750, fontSize: 27, lineHeight: 1.08, letterSpacing: -0.9, color: NAVY, transform: `translateY(${(1 - estrutura) * 12}px)`}}>
					Ar-condicionado instalado e cuidado do jeito certo.
				</div>
				<div style={{position: 'absolute', left: 22, top: 240, width: 160, height: 24, borderRadius: 12, background: 'rgba(22,150,191,0.1)'}} />
				{[0, 1, 2].map((i) => (
					<div key={i} style={{position: 'absolute', left: 22 + i * 122, top: 284, width: 102, height: 86, borderRadius: 14, background: '#f3f7fa', boxShadow: '0 0 0 1px #e3eaf0', transform: `scale(${lerp(0.9, 1, estrutura)})`}}>
						<div style={{position: 'absolute', left: 8, top: 12}}>
							<Icone tipo={i} />
						</div>
					</div>
				))}
				<div style={{position: 'absolute', left: 22, right: 22, top: 398, height: 42, borderRadius: 12, background: '#1fa855', boxShadow: '0 8px 20px rgba(31,168,85,0.3)', transform: `scale(${1 - Math.sin(clamp(toque) * Math.PI) * 0.04})`, overflow: 'hidden'}}>
					{toque > 0 && toque < 1 && <div style={{position: 'absolute', left: '50%', top: '50%', width: 400 * toque, height: 400 * toque, marginLeft: -200 * toque, marginTop: -200 * toque, borderRadius: '50%', background: `rgba(255,255,255,${0.35 * (1 - toque)})`}} />}
				</div>
				<svg style={{position: 'absolute', left: 22, top: 485}} width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={CIANO} strokeWidth={2}>
					<circle cx={12} cy={12} r={9} />
					<path d="M12 7v5l3 2" />
				</svg>
				<svg style={{position: 'absolute', left: 22, top: 511}} width={16} height={16} viewBox="0 0 24 24" fill={CIANO}>
					<path d="M12 21.5s7-6.2 7-11.8A7 7 0 0 0 5 9.7c0 5.6 7 11.8 7 11.8Z" />
				</svg>
			</div>

			{/* fragmentos que se reorganizam */}
			{FRAGS.map((f, i) => {
				const kk = e(i);
				const est = kk < 0.5 ? f.a : f.d;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: lerp(f.a.x, f.d.x, kk),
							top: lerp(f.a.y, f.d.y, kk),
							fontFamily: kk < 0.5 ? f.a.fonte ?? F.inter : f.d.fonte ?? F.inter,
							fontSize: lerp(f.a.fs, f.d.fs, kk),
							fontWeight: est.peso,
							color: cor(f.a.cor, f.d.cor, kk),
							letterSpacing: kk < 0.5 ? 0 : -0.2,
							whiteSpace: 'nowrap',
							opacity: kk > 0.42 && kk < 0.58 ? 1 - Math.sin(((kk - 0.42) / 0.16) * Math.PI) * 0.85 : 1,
						}}
					>
						{est.txt}
					</div>
				);
			})}
		</Pagina>
	);
};
