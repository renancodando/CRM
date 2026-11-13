# Órbita Conversão — ferramenta única (Preparar Mensagem + Conversão + Negociação)

## O que mudou
"Preparar Mensagem" e "Negociação" **deixaram de existir como módulos e itens de menu**. Tudo acontece em **Órbita Conversão → Conversa**, com a empresa já selecionada. Rotas antigas (`mensagens.abrir`, `negociacao.abrir`, `data-rascunho`) redirecionam para o módulo unificado.

| Antes | Agora |
|---|---|
| Preparar Mensagem (`modulos/mensagens.js`) | Compositor de mensagens (`modulos/conversa.js`), com o catálogo de tipos, experimentos legados, registro de demonstração apresentada e agendamento de retorno |
| Conversão (abordagens A–F, interpretação, objeções) | Estratégia comercial + alternativas (recomendada, mais direta, mais consultiva) |
| Negociação (dossiê, leitura, continuidade, importar conversa) | Contexto da empresa (histórico, leitura, importar conversa) + próxima ação na Estratégia |
| Rascunhos em dois lugares (`estado.rascunhos` e `estado.conversao.rascunhos`) | **Um só repositório**: `estado.rascunhos`, com estados de mensagem |

Migração versionada (`mensagens-unificadas-1`, em `normalizarEstado`): idempotente, preserva ids, textos, estratégia, origem (inclusive rascunhos criados via Connect) e `operacaoId`; a entrada não é mutada. Backups antigos continuam importáveis.

## Fluxo (uma interface, três áreas)
1. **Contexto da empresa**: dados com a origem de cada um (confirmada, fornecida por você, pública não verificada, desconhecida), contatos por papel, oferta vigente, demonstração, histórico, respostas, objeções, próxima ação, importar conversa.
2. **Estratégia comercial**: estágio e objetivo imediato, ação recomendada com justificativa, abordagem, evidências e graus, limitações, riscos, dados faltantes e por que as outras ações foram descartadas.
3. **Compositor**: mensagem editável, três alternativas estratégicas, validação factual em tempo real, qualidade textual (não é probabilidade de venda), prévia, copiar, rascunho e **Abrir WhatsApp e enviar**.

"Conversar e converter" abre este espaço com a empresa carregada a partir de: Empresas (lista e ficha), Hoje e Radar, Plano do dia, evidências dos Gargalos, Publicações, Ofertas e Propostas.

## WhatsApp direto
`https://wa.me/<55DDDNÚMERO>?text=<mensagem codificada>` (acentos, emoji, URL e quebras de linha testados). O número é normalizado (aceita +55, 55, 0, máscara) e validado por estrutura (DDD existente; celular de 9 dígitos começando com 9; fixo com aviso). **O Órbita não adiciona o nono dígito por conta própria** e **estrutura válida não é WhatsApp confirmado**: o número só passa a "confirmado" quando você registra uma resposta recebida dele. Nada é enviado: o WhatsApp abre com o texto preenchido.

Estados da mensagem: rascunho → preparada → copiada → WhatsApp aberto → **envio confirmado** → resposta registrada → encerrada (ou cancelada). Depois de abrir o WhatsApp, o Órbita pergunta *"Você enviou a mensagem?"* (Sim, enviei / Não enviei / Decidir depois); a pendência sobrevive ao recarregar. **Somente a confirmação explícita registra o envio**, com o texto exato (editável, caso tenha mudado no WhatsApp) e: empresa, contato, número, data/hora, estratégia, variante, experimento, estágio, versão do motor (`conversao-2.0`), próxima ação e prazo de follow-up. O texto registrado pode ser corrigido depois; o anterior fica guardado. Não há confirmação de leitura/entrega: o Órbita não as inventa.

## Contatos
Cada empresa pode ter vários contatos (proprietário, sócio, responsável comercial, atendimento, principal, outro). Proprietário/sócio/responsável exigem **origem da informação**; sem evidência o papel não é afirmado.

## Limitações
- Evidência científica majoritariamente indireta; qualidade textual é heurística interna.
- Validação do número é só estrutural. A abertura real do WhatsApp (app/Web) em iPhone, Android e desktop **não** foi testada em dispositivos: foi testada a URL gerada e a abertura interceptada no navegador.
- Auditoria digital, radar de oportunidades, portal do cliente, Asaas etc. (demais etapas do pedido) **ainda não foram implementados** nesta entrega.
