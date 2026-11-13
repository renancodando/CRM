# Protocolo Órbita Connect — versão 1.0

Contrato para assistentes externos autorizados (ex.: ChatGPT com o conector GitHub) consultarem e atualizarem o Órbita **sem executar código**. A comunicação acontece só por arquivos JSON em um **repositório privado de dados** (sugerido: `SEU_USUARIO/orbita-dados`), nunca neste repositório de código.

Esquemas formais (JSON Schema 2020-12): [`esquemas/`](esquemas/indice.json), gerados a partir de `nucleo/connect/protocolo.js`.

## Estrutura do repositório privado
```
entrada/pendentes/<id>.json        ← o assistente cria aqui (uma operação por arquivo)
entrada/processadas/AAAA-MM/<id>.json   ← o Órbita arquiva depois de processar
saida/confirmacoes/<id>.json       ← o Órbita escreve o resultado real
saida/exportacoes/<entidade>-0001.json  ← dados autorizados, paginados (200 registros/arquivo)
saida/manifesto.json               ← lista de arquivos, versão dos dados, escopo e data
saida/estado-sync.json             ← última sincronização e nº de operações aguardando revisão
conflitos/                         ← reservado
```

## Como o assistente CONSULTA
1. Leia `saida/manifesto.json`. Confira `geradoEm` e `escopo`: **se for antigo, informe ao usuário que os dados podem estar desatualizados**; não trate como estado atual.
2. Leia os arquivos listados (`empresas`, `historico`, `tarefas`, `propostas`, `pagamentos`, `custos`, `sessoes`, `indicadores`, `relatorio-mes`). Só existe o que o usuário autorizou em *Dados compartilhados*. Um registro que existe apenas no navegador e ainda não foi sincronizado **não está disponível**: diga isso.
3. Valores monetários estão em **centavos inteiros** (`valorCentavos`). Indicadores trazem `estado` (`ok`, `zero comprovado`, `informação desconhecida`, `informação não registrada`, `não aplicável`, `informação insuficiente para análise`): não converta desconhecido em zero.

## Como o assistente REGISTRA (enviar operações)
Crie `entrada/pendentes/<id>.json` com:
```json
{
  "protocolo": "1.0",
  "id": "op-2026-11-14-0001",
  "tipo": "empresa.criar",
  "origem": "chatgpt",
  "criadaEm": "2026-11-14T09:00:00-03:00",
  "dados": { "nome": "Supera Cell", "cidade": "Recife", "estado": "PE", "nicho": "celulares", "whatsapp": "81999990001" }
}
```
Regras gerais
- **`id` único** e igual ao nome do arquivo. Reenviar a mesma operação é seguro (idempotência); reutilizar o id com conteúdo diferente é rejeitado.
- **Datas absolutas** ISO 8601 com fuso (`2026-11-14T09:00:00-03:00`) ou `AAAA-MM-DD` quando só a data existe. Converta “amanhã/sexta” usando o fuso do usuário antes de enviar; não invente horário quando só houver data (`prazoSomenteData`).
- **Dinheiro em centavos inteiros.** Não invente taxas, datas de pagamento, parcelas, impostos ou valores.
- **Não invente** conteúdo de mensagens, respostas, horários ou fatos. Se o usuário só disse “respondeu”, omita `texto`. Guarde sua interpretação em `interpretacao` (separada do texto original).
- Sugerir uma mensagem **não** é registrar envio: `conversa.mensagem_enviada` exige `confirmadoPeloUsuario: true` e só deve ser criada quando o usuário disser que enviou. O mesmo vale para demonstrações apresentadas, vendas e pagamentos.
- Não envie prints, documentos pessoais ou dados bancários. Registre apenas fatos confirmados; coloque dúvidas em `comentario`.
- Campos desconhecidos são rejeitados (`additionalProperties: false`). Nenhuma operação concede permissões; permissões só são alteradas no Órbita.

### Operações aceitas
| tipo | sensível | resumo |
|---|---|---|
| `empresa.criar` | não | Cadastra empresa. Verifica duplicidade (WhatsApp, telefone, e-mail, domínio, perfil, nome+cidade); dúvida → revisão. `statusSite: "sem-site"` exige `evidenciaSite`, senão fica “desconhecido”. |
| `empresa.atualizar` | não | Atualiza campos. Envie `base` (valores que você viu) para permitir mesclagem segura; campo alterado no Órbita depois → conflito, nada é sobrescrito. |
| `empresa.etapa` | não | Etapas: encontrada, verificada, mensagem, respondeu, demonstracao, negociacao, proposta (“fechada” só via `venda.registrar`). |
| `empresa.situacao` | não* | ativa, perdida, recusada, pausada, nao-contatar. *Reativar quem pediu para não ser contatado sempre exige revisão. |
| `conversa.mensagem_enviada` | não | Mensagem efetivamente enviada (confirmada pelo usuário). |
| `conversa.resposta_recebida` | não | Resposta, interesse, objeções, pedido de demonstração, pedido para parar, recusa. |
| `demonstracao.apresentada` | sim | Registra apresentação de uma demonstração existente. |
| `demonstracao.link_registrado` | não | Cadastra o link; **não** significa publicação verificada. |
| `proposta.criar` | sim | Cria proposta (não enviada). |
| `venda.registrar` | sim | Venda contratada. **Não** registra pagamento. |
| `pagamento.registrar` | sim | Pagamento informado pelo usuário (`valorCentavos`, `recebidoEm`). Não é conciliação. |
| `custo.registrar` / `sessao.registrar` | não | Custos e horas de trabalho. |
| `tarefa.criar` / `tarefa.atualizar` | não | Tarefas/follow-ups; geram lembrete **dentro do Órbita** (não é notificação do ChatGPT). |
| `conversao.rascunho_mensagem` | não | Salva um **rascunho** de mensagem para sua revisão (auditoria de linguagem anexada). Nunca envia e nunca registra mensagem enviada. |
| `conversao.objecao_registrada` | não | Registra uma objeção do cliente (catálogo do Órbita Conversão). |
| `conversao.consentimento` | sim | Registra/revoga consentimento por canal (`origemConsentimento` obrigatória ao autorizar). Revogar bloqueia o contato. |
| `conversao.experimento_criar` | não | Cria um experimento de conversão (hipótese, critério, 2–4 variantes, mínimo ≥ 10). Não sorteia empresas nem envia nada. |
| `negociacao.oferta_registrada` | sim | Registra oferta apresentada / contraproposta / valor negociado (`tipoOferta`, `valorCentavos`). Não envia proposta nem concede desconto. |
| `negociacao.proxima_acao` | não | Atualiza o texto da próxima ação (e retorno). |
| `negociacao.followup_sugerido` | não | Rascunho + tarefa de follow-up para sua revisão. Rejeitada se o contato estiver bloqueado. Nunca envia. |
| `publicacao.registrar` | não | Registra uma publicação feita fora do Órbita (https obrigatório, **não verificada**). |
| `reversao.solicitar` | sim | Pede a reversão de uma operação aplicada; sempre revisão. |

### Estados de processamento
`recebida` → `aguardando-revisao` | `pendente-dependencia` | `conflito` | `aplicada` | `rejeitada` | `revertida`.
Antes disso a operação está apenas “preparada” (no seu lado) e “registrada no GitHub” (arquivo criado). **Só diga ao usuário que algo foi cadastrado quando `saida/confirmacoes/<id>.json` tiver `"aplicada": true`.**

## Como verificar a confirmação
Leia `saida/confirmacoes/<id>.json`: `estado`, `aplicada`, `mensagem`, `registros` (entidade e id criados), `erros`, `conflitos`, `revisao`. Se o arquivo ainda não existir, o Órbita não processou (aberto? sincronizando?): informe “enviada, aguardando o Órbita”.

## Rejeição, conflito e reversão
- **Rejeitada**: leia `erros`, corrija e envie nova operação com **novo id**.
- **Conflito**: o Órbita preservou os dados atuais e mostra as duas versões ao usuário; aguarde a decisão dele.
- **Aguardando revisão**: o usuário precisa aprovar no Órbita (nível de autonomia 2, operações sensíveis, duplicidades).
- **Reversão**: envie `reversao.solicitar`. Pagamentos revertidos ficam `estornado` (histórico preservado); cadastros com histórico posterior não são revertidos automaticamente.

## Níveis de autonomia (definidos só no Órbita)
1 Consulta · 2 Sugestão (tudo passa por revisão) · 3 Rotineiras automáticas (empresas, respostas, tarefas…); sensíveis exigem revisão · 4 Ampliado (sensíveis automáticos por categoria liberada). Exclusões, correção de pagamentos históricos e lotes grandes sempre exigem revisão.

## Limites
Até 40 operações processadas por sincronização, 60 KB por operação, 200 KB por arquivo exportado. O GitHub é uma caixa de arquivos, não um banco de dados: não crie milhares de arquivos por dia. Versões compatíveis: `1.x`.

## Consultas novas (escopos em *Dados compartilhados*, desligados por padrão)
- `negociacoes`: `negociacoes-*.json` — estágio, quem aguarda, dias desde a última interação, próxima ação recomendada (com o que foi descartado) e leituras (fato, hipótese, confiança). Valores só com `financeiro`.
- `publicacoes`: `publicacoes-*.json` e `metricas-demonstracoes-*.json` (agregados; sem eventos brutos).
- `diagnostico`: `diagnostico-0001.json` — funil, gargalos (com denominadores) e plano do dia.
- Com `financeiro`: `condicoes-comerciais-0001.json` (**somente** preços públicos, parcelas, prazos) e `ofertas-*.json`. Custos, margens, preço mínimo, taxas e estratégia **nunca** são exportados.

## Sincronização incremental
O hash que decide se um arquivo exportado mudou **ignora `geradoEm`**; assim, sem mudanças nos dados, nada é regravado. A cada 6 horas uma sincronização grava `saida/estado-sync.json` (batimento) para que o assistente saiba que a ponte está viva e quando foi a última verificação; `geradoEm` dos arquivos de exportação indica quando aquele conteúdo foi gerado pela última vez (mudou). Em caso de dúvida sobre atualidade, consulte `ultimaSincronizacao`.
