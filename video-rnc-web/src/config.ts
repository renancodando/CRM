/**
 * CONFIGURAÇÃO DO COMERCIAL — altere aqui textos, preço, logotipo e contato.
 * Depois de alterar, rode `npm run render` (e `npm run audio` se mudar a narração).
 */
export const config = {
	marca: {
		/** Parte forte do logotipo */
		nome: 'RNC',
		/** Parte leve do logotipo */
		complemento: 'WEB',
		/**
		 * Opcional: caminho de um logotipo em imagem dentro de /public (ex.: 'logo.png').
		 * Se preenchido, substitui o logotipo tipográfico.
		 */
		imagem: '' as string,
		assinatura: 'Sites profissionais. Identidades únicas.',
	},

	gancho: {
		rotulo: 'Agora mesmo',
		busca: 'assistência técnica perto de mim',
		linha1: 'Alguém está',
		linha1Destaque: 'procurando.',
		pergunta: 'Vai encontrar',
		perguntaDestaque: 'você?',
		/** Buscas que flutuam ao fundo — o espectador reconhece o próprio nicho */
		buscasAoFundo: [
			'clínica odontológica perto de mim',
			'estética automotiva aberta agora',
			'loja de roupas no centro',
			'conserto de celular hoje',
			'escritório de contabilidade',
			'salão de beleza agendar',
			'pet shop com entrega',
			'advogado trabalhista',
			'padaria artesanal',
			'oficina mecânica',
			'fisioterapia domiciliar',
			'arquiteto de interiores',
			'academia perto de mim',
			'assistência técnica notebook',
		],
		frase: ['Sua empresa', 'merece ser'],
		fraseDestaque: 'vista.',
	},

	vitrine: {
		linha1: 'Cada negócio é único.',
		linha2: 'Seu site também.',
	},

	beneficios: ['Mais profissionalismo.', 'Mais confiança.', 'Mais facilidade para entrar em contato.'],

	oferta: {
		rotulo: 'Sites a partir de',
		moeda: 'R$',
		valor: '600',
		detalhe: 'Projeto personalizado  ·  Responsivo  ·  WhatsApp integrado',
	},

	encerramento: {
		frase: ['O próximo passo', 'do seu negócio'],
		fraseDestaque: 'começa aqui.',
		cta: 'Solicite sua demonstração',
		assinatura: 'Seu negócio merece uma presença digital profissional.',
	},

	/**
	 * CONTATO — deixe vazio até ter os dados definitivos.
	 * Quando preenchidos, aparecem no encerramento abaixo do botão.
	 * Ex.: whatsapp: '(11) 90000-0000', instagram: '@rncweb'
	 */
	contato: {
		whatsapp: '',
		instagram: '',
		site: '',
	},
};

export type Config = typeof config;
