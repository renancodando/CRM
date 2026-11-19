import React from 'react';
import {F, p, ease, lerp, clamp} from '../lib/base';
import {Pagina, Grao} from '../comp/Pagina';

/**
 * BRASA — restaurante de alta gastronomia (projeto conceitual).
 * Identidade: carvão, brasa e creme · Bodoni Moda + Space Grotesk · menu degustação e reserva.
 */
const CARVAO = '#120F0E';
const BRASA = '#E2582B';
const CREME = '#EFE6D8';
const OURO = '#C9A46A';
const CINZA = '#8E857C';

const TEMPOS = [
	['I', 'Pão de fermentação natural', 'manteiga tostada, flor de sal'],
	['II', 'Vieira na brasa', 'milho verde, limão-cravo'],
	['III', 'Abóbora assada no carvão', 'castanha, sálvia'],
	['IV', 'Peixe do dia', 'tucupi, ervas do quintal'],
	['V', 'Costela de 18 horas', 'purê defumado'],
];
// dezembro de 2026 começa numa terça-feira
const DIAS = Array.from({length: 31}, (_, i) => i + 1);
const HORARIOS = ['19h00', '19h30', '20h00', '21h00'];

export const SiteBrasa: React.FC<{t: number; modo?: 'completo' | 'curto'}> = ({t, modo = 'completo'}) => {
	const c = modo === 'curto';
	const T = c ? {menu: 0.7, reserva: 1.9, dia: 2.35, hora: 2.75, ok: 3.25} : {menu: 1.35, reserva: 3.2, dia: 3.75, hora: 4.25, ok: 4.95};

	const intro = p(t, 0, 1.1, ease.out);
	const respiro = 0.75 + 0.25 * Math.sin(t * 2.2) + 0.08 * Math.sin(t * 7.3);
	const menu = p(t, T.menu, T.menu + 0.7, ease.camera);
	const folha = p(t, T.reserva, T.reserva + 0.6, ease.camera);
	const dia = t > T.dia ? 1 : 0;
	const hora = t > T.hora ? 1 : 0;
	const ok = p(t, T.ok, T.ok + 0.5, ease.out);
	const ativo = Math.min(TEMPOS.length - 1, Math.floor(clamp((t - T.menu - 0.4) / 0.32, 0, 9)));

	const toque = (x: number, y: number, ti: number) =>
		t > ti - 0.3 && t < ti + 0.45 ? (
			<div style={{position: 'absolute', left: x - 13, top: y - 13, width: 26, height: 26, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', border: '1.2px solid #fff', opacity: p(t, ti - 0.3, ti - 0.1) * (1 - p(t, ti + 0.2, ti + 0.45)), transform: `scale(${1 - Math.sin(clamp((t - ti) / 0.25) * Math.PI) * 0.2})`, zIndex: 20}} />
		) : null;

	return (
		<Pagina fundo={CARVAO}>
			{/* luz de brasa (abstrata) */}
			<div style={{position: 'absolute', left: -120, right: -120, bottom: -260 + menu * 120, height: 520, background: `radial-gradient(ellipse 50% 40% at 50% 60%, rgba(226,88,43,${0.55 * respiro}), rgba(140,40,12,${0.25 * respiro}) 45%, transparent 72%)`, opacity: intro}} />
			<Grao opacidade={0.12} seed={12} />

			<div style={{position: 'absolute', top: 92, left: 22, right: 22, display: 'flex', alignItems: 'center', fontFamily: F.grotesk, color: CREME, opacity: intro}}>
				<span style={{fontSize: 9, letterSpacing: 2.6, color: CINZA}}>COZINHA DE FOGO</span>
				<span style={{marginLeft: 'auto', fontSize: 11, padding: '6px 12px', borderRadius: 999, boxShadow: `0 0 0 1px ${OURO}`, color: OURO}}>Reservar</span>
			</div>

			{/* abertura */}
			<div style={{position: 'absolute', left: 0, right: 0, top: lerp(160, 104, menu), transform: `scale(${lerp(1, 0.42, menu)})`, transformOrigin: '22px 0', textAlign: menu > 0.5 ? 'left' : 'center'}}>
				<div style={{fontFamily: F.bodoni, fontSize: 132, letterSpacing: -4, lineHeight: 0.9, color: CREME, overflow: 'hidden', height: 122, paddingLeft: menu > 0.5 ? 22 : 0}}>
					{'Brasa'.split('').map((l, i) => {
						const k = p(t, 0.1 + i * 0.07, 0.8 + i * 0.07, ease.out);
						return (
							<span key={i} style={{display: 'inline-block', transform: `translateY(${(1 - k) * 100}%)`, color: i === 0 ? BRASA : CREME}}>
								{l}
							</span>
						);
					})}
				</div>
			</div>
			<div style={{position: 'absolute', left: 22, right: 22, top: 300, fontFamily: F.bodoni, color: CREME, opacity: p(t, 0.8, 1.3) * (1 - menu)}}>
				<div style={{fontSize: 22, lineHeight: 1.2, textAlign: 'center'}}>
					Tudo o que sai da nossa cozinha
					<br />
					passa pelo <span style={{color: BRASA, fontStyle: 'normal'}}>fogo.</span>
				</div>
				<div style={{fontFamily: F.grotesk, fontSize: 10, letterSpacing: 2, textAlign: 'center', color: CINZA, marginTop: 18}}>MENU DEGUSTAÇÃO · SÓ COM RESERVA</div>
			</div>

			{/* menu degustação */}
			<div style={{position: 'absolute', left: 22, right: 22, top: 170, opacity: menu, transform: `translateY(${(1 - menu) * 40}px)`}}>
				<div style={{display: 'flex', alignItems: 'baseline', fontFamily: F.grotesk, color: CINZA, fontSize: 9, letterSpacing: 2}}>
					<span>MENU DE VERÃO</span>
					<span style={{marginLeft: 'auto'}}>7 TEMPOS</span>
				</div>
				{TEMPOS.map(([n, nome, desc], i) => {
					const k = p(t, T.menu + 0.25 + i * 0.1, T.menu + 0.75 + i * 0.1, ease.out);
					const at = i === ativo && t > T.menu + 0.4;
					return (
						<div key={n} style={{display: 'flex', gap: 14, padding: '11px 0', borderBottom: '1px solid rgba(239,230,216,0.1)', opacity: k * (1 - folha * 0.6), transform: `translateY(${(1 - k) * 14}px)`}}>
							<div style={{width: 22, fontFamily: F.bodoni, fontSize: 13, color: at ? BRASA : OURO}}>{n}</div>
							<div>
								<div style={{fontFamily: F.bodoni, fontSize: 19, color: at ? '#fff' : CREME, letterSpacing: -0.2}}>{nome}</div>
								<div style={{fontFamily: F.grotesk, fontSize: 10.5, color: CINZA, marginTop: 3}}>{desc}</div>
							</div>
							{at && <div style={{marginLeft: 'auto', alignSelf: 'center', width: 6, height: 6, borderRadius: 3, background: BRASA, boxShadow: `0 0 10px ${BRASA}`}} />}
						</div>
					);
				})}
				<div style={{marginTop: 18, height: 44, borderRadius: 999, background: BRASA, color: '#fff', fontFamily: F.grotesk, fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p(t, T.menu + 0.8, T.menu + 1.2), transform: `scale(${1 - Math.sin(clamp((t - T.reserva + 0.1) / 0.25) * Math.PI) * 0.04})`}}>Reservar mesa</div>
			</div>
			{toque(195, 170 + 5 * 56 + 40, T.reserva - 0.05)}

			{/* folha de reserva */}
			{folha > 0 && (
				<div style={{position: 'absolute', left: 0, right: 0, top: lerp(693, 128, folha), height: 600, borderRadius: '26px 26px 0 0', background: '#1B1715', boxShadow: '0 -20px 50px rgba(0,0,0,0.6)', padding: '18px 20px', fontFamily: F.grotesk, color: CREME}}>
					<div style={{width: 36, height: 4, borderRadius: 2, background: 'rgba(239,230,216,0.25)', margin: '0 auto 14px'}} />
					<div style={{fontFamily: F.bodoni, fontSize: 26, letterSpacing: -0.4}}>Reservar mesa</div>
					<div style={{display: 'flex', marginTop: 14, fontSize: 10, color: CINZA, letterSpacing: 1.5}}>
						<span>DEZEMBRO 2026</span>
						<span style={{marginLeft: 'auto'}}>‹ ›</span>
					</div>
					<div style={{display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginTop: 10, textAlign: 'center', fontSize: 11}}>
						{['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
							<div key={i} style={{color: CINZA, fontSize: 9, paddingBottom: 4}}>
								{d}
							</div>
						))}
						{[null, null, ...DIAS].map((d, i) => {
							const sel = d === 12 && dia;
							return (
								<div key={i} style={{height: 30, borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', background: sel ? BRASA : 'transparent', color: d === null ? 'transparent' : d < 4 ? 'rgba(239,230,216,0.25)' : sel ? '#fff' : CREME, fontWeight: sel ? 700 : 400}}>
									{d ?? ''}
								</div>
							);
						})}
					</div>
					<div style={{fontSize: 10, color: CINZA, letterSpacing: 1.5, marginTop: 14}}>HORÁRIO</div>
					<div style={{display: 'flex', gap: 6, marginTop: 8}}>
						{HORARIOS.map((h) => {
							const sel = h === '20h00' && hora;
							return (
								<div key={h} style={{flex: 1, padding: '9px 0', textAlign: 'center', borderRadius: 10, fontSize: 12, boxShadow: `0 0 0 1px ${sel ? BRASA : 'rgba(239,230,216,0.2)'}`, background: sel ? 'rgba(226,88,43,0.18)' : 'transparent', color: h === '21h00' ? 'rgba(239,230,216,0.3)' : CREME}}>
									{h}
								</div>
							);
						})}
					</div>
					<div style={{display: 'flex', alignItems: 'center', marginTop: 14, fontSize: 13}}>
						<span>Pessoas</span>
						<span style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14}}>
							<span style={{width: 26, height: 26, borderRadius: 13, boxShadow: '0 0 0 1px rgba(239,230,216,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>−</span>2
							<span style={{width: 26, height: 26, borderRadius: 13, boxShadow: '0 0 0 1px rgba(239,230,216,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center'}}>+</span>
						</span>
					</div>
				</div>
			)}
			{toque(20 + (2 + 11) % 7 * 50 + 25, 128 + 112 + Math.floor((2 + 11) / 7) * 34 + 32, T.dia)}
			{toque(20 + 2 * 89 + 40, 128 + 112 + 5 * 34 + 70, T.hora)}

			{/* confirmação */}
			{ok > 0 && (
				<div style={{position: 'absolute', inset: 0, background: `rgba(18,15,14,${0.92 * ok})`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: F.grotesk, color: CREME, opacity: ok}}>
					<svg width={64} height={64} viewBox="0 0 64 64">
						<circle cx={32} cy={32} r={30} fill="none" stroke={BRASA} strokeWidth={2} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ok} />
						<path d="M20 33 l8 8 l16 -18" fill="none" stroke={BRASA} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp(ok * 2 - 1)} />
					</svg>
					<div style={{fontFamily: F.bodoni, fontSize: 30, marginTop: 18}}>Mesa reservada</div>
					<div style={{fontSize: 13, color: CINZA, marginTop: 8}}>Sábado, 12 de dezembro · 20h00 · 2 pessoas</div>
					<div style={{fontSize: 11, color: OURO, marginTop: 18, letterSpacing: 1}}>Confirmação enviada no seu WhatsApp</div>
				</div>
			)}
		</Pagina>
	);
};
