import React from 'react';
import {AbsoluteFill} from 'remotion';
import {config} from '../config';
import {SANS, SERIF, MONO} from '../fonts';
import {useT, useLayout, M, CENAS, p, ease, lerp} from '../lib/tempo';
import {COR} from '../lib/estilo';
import {Logo} from '../componentes/Logo';
import {Linha} from '../componentes/Texto';
import {Cursor, IconeSeta, IconeWhats} from '../componentes/Icones';

export const Encerramento: React.FC = () => {
	const t = useT();
	const {W, V} = useLayout();
	const [ini] = CENAS.final;
	if (t < ini) return null;
	const E = config.encerramento;
	const C = config.contato;

	const logoSobe = p(t, M.proximoPasso - 0.4, M.proximoPasso + 0.5, ease.inOut);
	const logoY = V ? lerp(860, 470, logoSobe) : lerp(430, 190, logoSobe);
	const logoTam = V ? lerp(170, 120, logoSobe) : lerp(180, 110, logoSobe);
	const brilho = p(t, M.encerramento + 0.2, M.encerramento + 1.2, ease.inOut);
	const brilho0 = p(t, M.logoFinal + 0.5, M.logoFinal + 1.5, ease.inOut);

	const fraseSai = M.encerramento - 0.45;
	const ctaK = p(t, M.cta, M.cta + 0.7, ease.out);
	const clique = p(t, M.cliqueCta, M.cliqueCta + 0.45, (x) => x);
	const pressionado = Math.sin(Math.min(1, clique) * Math.PI);
	const ctaY = V ? 1240 : 700;

	const curK = p(t, M.cta + 0.25, M.cliqueCta - 0.02, ease.inOut);
	const curOp = p(t, M.cta + 0.2, M.cta + 0.4) * (1 - p(t, M.cliqueCta + 0.6, M.cliqueCta + 0.9));

	const contatos = [C.whatsapp && {i: 'w', v: C.whatsapp}, C.instagram && {i: 'i', v: C.instagram}, C.site && {i: 's', v: C.site}].filter(Boolean) as {
		i: string;
		v: string;
	}[];
	const contatoK = p(t, M.encerramento + 0.3, M.encerramento + 1.0);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					background: `radial-gradient(ellipse ${V ? '75% 35%' : '45% 55%'} at 50% ${V ? 40 : 40}%, rgba(205,210,222,0.11), transparent 70%)`,
					opacity: p(t, ini, ini + 1),
				}}
			/>
			<div style={{position: 'absolute', left: 0, right: 0, top: logoY, display: 'flex', justifyContent: 'center'}}>
				<Logo t={t} ini={M.logoFinal} tamanho={logoTam} brilho={t > M.encerramento ? brilho : brilho0} reflexo={false} />
			</div>

			{/* o próximo passo */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: V ? 760 : 380,
					textAlign: 'center',
					fontFamily: SANS,
					fontSize: V ? 104 : 82,
					fontWeight: 600,
					letterSpacing: '-0.045em',
					lineHeight: 1.0,
					color: COR.branco,
				}}
			>
				<div style={{display: V ? 'block' : 'flex', justifyContent: 'center', gap: '0.25em'}}>
					{E.frase.map((l, i) => (
						<Linha key={l} t={t} ini={M.proximoPasso + i * 0.14} sai={fraseSai + i * 0.04}>
							{l}
						</Linha>
					))}
				</div>
				<Linha t={t} ini={M.proximoPasso + 0.4} sai={fraseSai + 0.1}>
					<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '1.18em', color: COR.prata}}>{E.fraseDestaque}</span>
				</Linha>
			</div>

			{/* assinatura final */}
			<div
				style={{
					position: 'absolute',
					left: V ? 90 : 0,
					right: V ? 90 : 0,
					top: V ? 800 : 400,
					textAlign: 'center',
					fontFamily: SANS,
					fontSize: V ? 76 : 64,
					fontWeight: 500,
					letterSpacing: '-0.035em',
					lineHeight: 1.08,
					color: COR.branco,
				}}
			>
				{(() => {
					const palavras = E.assinatura.split(' ');
					const meio = V ? Math.ceil(palavras.length / 2) : Math.ceil(palavras.length / 2);
					const l1 = palavras.slice(0, meio).join(' ');
					const l2 = palavras.slice(meio).join(' ');
					return (
						<>
							<Linha t={t} ini={M.encerramento + 0.12}>
								{l1}
							</Linha>
							<Linha t={t} ini={M.encerramento + 0.28}>
								<span style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 400, fontSize: '1.12em', color: COR.prata}}>{l2}</span>
							</Linha>
						</>
					);
				})()}
			</div>

			{/* CTA */}
			<div style={{position: 'absolute', left: 0, right: 0, top: ctaY, display: 'flex', justifyContent: 'center'}}>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 22,
						padding: V ? '36px 54px' : '30px 46px',
						borderRadius: 999,
						background: `linear-gradient(180deg, #ffffff, #dfe2e7)`,
						color: '#0b0c0e',
						fontFamily: SANS,
						fontSize: V ? 46 : 38,
						fontWeight: 600,
						letterSpacing: '-0.02em',
						boxShadow: `0 0 0 1px rgba(255,255,255,0.4), 0 20px 60px -10px rgba(255,255,255,${0.18 + pressionado * 0.2}), inset 0 -3px 0 rgba(0,0,0,0.12)`,
						opacity: ctaK,
						transform: `translateY(${(1 - ctaK) * 40}px) scale(${(0.94 + 0.06 * ctaK) * (1 - pressionado * 0.05)})`,
						filter: `blur(${(1 - ctaK) * 8}px)`,
					}}
				>
					{E.cta}
					<div style={{transform: `translateX(${pressionado * 8}px)`}}>
						<IconeSeta size={V ? 44 : 38} color="#0b0c0e" />
					</div>
				</div>
			</div>
			{curOp > 0 && (
				<Cursor x={lerp(V ? W * 0.86 : W * 0.72, W / 2 + (V ? 150 : 140), curK)} y={lerp(V ? 1720 : 1000, ctaY + (V ? 70 : 58), curK)} clique={clique} opacidade={curOp} escala={1.5} />
			)}

			{/* contato (preenchido em config.contato) */}
			{contatos.length > 0 && (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: ctaY + (V ? 200 : 160),
						display: 'flex',
						flexDirection: V ? 'column' : 'row',
						alignItems: 'center',
						justifyContent: 'center',
						gap: V ? 18 : 50,
						fontFamily: MONO,
						fontSize: V ? 38 : 30,
						color: COR.branco,
						letterSpacing: '0.02em',
						opacity: contatoK,
					}}
				>
					{contatos.map((c) => (
						<div key={c.i} style={{display: 'flex', alignItems: 'center', gap: 16}}>
							{c.i === 'w' ? <IconeWhats size={V ? 40 : 32} color={COR.prata} /> : <span style={{color: COR.cinza}}>{c.i === 'i' ? '◎' : '↗'}</span>}
							{c.v}
						</div>
					))}
				</div>
			)}
		</AbsoluteFill>
	);
};
