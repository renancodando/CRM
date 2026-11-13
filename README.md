# Órbita — Prospecção & Vendas

Um espaço para organizar empresas, acompanhar conversas e vender sites. Interface inspirada na referência fornecida, com materiais translúcidos, luzes quentes e frias e um globo 3D com órbitas reais.

Repositório: https://github.com/renancodando/CRM

## Abrir

```sh
python3 -m http.server 3000
```

Acesse `http://localhost:3000`. Não há instalação, compilação, autenticação, banco de dados ou dependência de CDN. Todos os recursos visuais e o Three.js estão incluídos.

## Funcionalidades

**Dados e segurança**
- Armazenamento principal em IndexedDB, com migração versionada e idempotente a partir de `orbita-prospeccao-v1/v2`. As chaves antigas e uma cópia integral do texto original **nunca são apagadas**. Registros da antiga demonstração (v1) são preservados e marcados como "legado v1" (podem ir à lixeira, com recuperação).
- Backup JSON v3 com checksum (importa também v1 e v2), importação com prévia, comparação e resolução de conflitos, pontos de recuperação automáticos, exportação CSV, lixeira, histórico de alterações, verificação de integridade e pedido de armazenamento persistente. Dados continuam apenas neste navegador: não há sincronização entre dispositivos.

**CRM comercial**
- Central individual por empresa (identificação, comercial, histórico, produção e negociação) com ações rápidas. Nada é registrado como enviado, aceito ou pago sem a sua confirmação.
- Prevenção de duplicidades (WhatsApp/telefone, e-mail, domínio, perfil social e nome), mesclagem que preserva todos os relacionamentos e listas de não contatar/recusadas excluídas de campanhas e recomendações.
- Pontuação de prioridade transparente e configurável (não é probabilidade de venda), Radar Comercial com filtros, central de trabalho diário, cadastro em lote por CSV com prévia, exportação ICS e automações locais que apenas sugerem.
- Pipeline de oito etapas (Encontrada → Verificada → Mensagem enviada → Respondeu → Demonstração enviada → Negociação → Proposta enviada → Fechada) mais as situações perdida, recusada, pausada e não contatar; arrastar e soltar e controles por teclado/celular.

**Mensagens, propostas e análise**
- Gerador determinístico com 14 situações e variações, baseado nos dados reais da empresa; abre o WhatsApp com o texto, mas só registra o envio quando você confirma.
- Propostas com versões, prévia, impressão/PDF, HTML independente, pagamentos parciais confirmados manualmente e pós-venda.
- Laboratório de Vendas: indicadores com denominadores explícitos, funil, conversão por nicho/estratégia/faixa de preço, tempos médios, experimentos A/B com intervalo de confiança e regra de amostra mínima. Central financeira separa estimativa, negociado, recebido, pendente e custos.

**Estúdio de Sites 2.0** (os nove modelos e suas cenas 3D permanecem como estavam)
- Editor visual com seleção de elementos na prévia, edição contextual, composição modular opcional (ordem, ocultar seções, variantes de cabeçalho, apresentação, serviços, FAQ e rodapé), tipografia, espaçamento, controle de animações e de efeitos 3D, desfazer/refazer, histórico, salvamento automático, versões, comparação de duas ou três demonstrações, prévia em sete larguras e restauração da configuração original.
- Textos sugeridos a partir da ficha da empresa, sempre revisáveis, sem inventar preços, avaliações, garantias, registros ou experiência. Dados privados do CRM nunca entram no site.
- Exportação ZIP com verificação (links, recursos, licenças, credenciais, noindex/canonical) e manifesto de integridade.

## Órbita Quant — inteligência matemática sobre dados reais

Camada analítica única (`nucleo/quant/`), usada por todos os painéis, relatórios e pelo Connect. Valores monetários em centavos inteiros; dado ausente nunca vira zero (os estados são: zero comprovado, desconhecido, não registrado, não aplicável, insuficiente).

- **Indicadores** (~35, dicionário em *Quant → Configuração*): prospecção (empresas únicas × mensagens, taxas com intervalo de Wilson), funil, vendas, contratado × recebido × pendente × conciliado, custos, resultado, margem, ticket médio/mediano, desconto, horas, retorno por hora, CAC financeiro e econômico, tempos de resposta e fechamento. Clique em qualquer número: significado, fórmula, substituição, interpretação, limitações, ação e os registros de origem.
- **Modos** Visual, Analítico e Completo; períodos (dia a ano, personalizado, histórico) com comparação com o período equivalente (período em andamento é sinalizado).
- **Financeiro:** fluxo de caixa (saldo inicial obrigatório para saldo absoluto), compromissos futuros separados do caixa, rentabilidade por projeto com preço mínimo/por hora/por margem, comparação de condições (valor líquido, VP, VPL, TIR, payback com as taxas que você informar), concentração (CR1, CR3, HHI, Pareto), regimes de caixa e competência.
- **Estatística real:** descritiva, quartis/IQR/MAD, Pearson/Spearman, Wilson, Fisher exato, Mann-Whitney, Holm, bootstrap, Kaplan-Meier (empresas em observação não são perdas), regressão linear, decomposição preço-volume-mix + Shapley (soma exata), atribuição multitoque (primeiro, último, linear e temporal sob meia-vida configurada).
- **Operação:** cronômetro e horas manuais, tarefas com dependências, capacidade, Lei de Little, caminho crítico e priorização por programação inteira, metas, diário de decisões, conhecimento versionado, diagnóstico, anomalias, qualidade dos dados, conciliação (CSV/OFX locais), fechamento de períodos e auditoria.
- **Perguntas em português** (sem IA externa): a pergunta vira uma consulta estruturada, mostrada e editável antes de executar; somente leitura. **Observatório:** grafo de relacionamentos reais com lista acessível, caminhos, componentes e centralidade explicada. **Relatórios** em HTML, texto, CSV, JSON e PDF/impressão.

## Órbita Connect — assistente externo (opcional)

O ChatGPT (ou outro assistente) lê e grava **arquivos JSON** em um repositório privado de dados; o Órbita valida, aplica de forma atômica e idempotente e publica confirmações. Protocolo: [PROTOCOLO-ORBITA-CONNECT.md](PROTOCOLO-ORBITA-CONNECT.md) e [esquemas/](esquemas/indice.json). Configuração e passos que dependem de você: [docs/CONFIGURAR-CONNECT.md](docs/CONFIGURAR-CONNECT.md). Há também o modo totalmente local por troca de arquivos. Níveis de autonomia 1–4 e permissões por operação são definidos só no Órbita; revisão, conflitos por campo, reversão com auditoria e escopo de dados compartilhados. A ponte serverless (`api/connect.js`, Vercel) autentica a sua conta GitHub pelo ID numérico, restringe caminhos e exige Origin e CSRF.

## Órbita Conversão — da primeira mensagem ao fechamento, com método

Módulo de negociação baseado em evidências: fila de oportunidades com pontuação **explicável** (dado desconhecido reduz a confiança, não vale zero), seis abordagens de primeira mensagem (direta, consultiva, com demonstração, diagnóstico, baixo atrito, autonomia) com justificativa, técnica, evidência, pontos negativos e próxima mensagem; interpretação de respostas como **hipóteses**; catálogo de 21 objeções com respostas respeitosas (recusa e "pare" encerram o contato); proposta de valor limitada ao que o projeto entrega; follow-up com limites configuráveis; consentimento por canal e lista de não contatar; laboratório de experimentos controlados (sorteio estratificado, Wilson, Fisher, h de Cohen, correção por análises planejadas, sem vencedor em amostra pequena); diagnóstico do funil; memória comercial regularizada; treino com clientes fictícios isolados do CRM. Nada é enviado nem marcado como enviado sem a sua confirmação, e "venda fechada" nunca é inferida. Detalhes, limites científicos e primeiros experimentos: [docs/ORBITA-CONVERSAO.md](docs/ORBITA-CONVERSAO.md).

## Publicação, acompanhamento, negociação e diagnóstico

- **Publicar no Cloudflare** (Estúdio): gera, audita privacidade, envia por Direct Upload via ponte serverless autenticada, verifica o link e registra a publicação. [docs/CLOUDFLARE-PUBLICACAO.md](docs/CLOUDFLARE-PUBLICACAO.md)
- **Acompanhamento** das demonstrações (Worker + R2, anônimo e com consentimento): [rastreio/LEIA-ME.md](rastreio/LEIA-ME.md)
- **Negociação, Ofertas e Diagnóstico**: dossiê, leitura contextual, próxima melhor ação, simulador financeiro, motor de desconto, proposta profissional, funil de 19 etapas, gargalos, plano do dia e laboratório: [docs/NEGOCIACAO-E-DIAGNOSTICO.md](docs/NEGOCIACAO-E-DIAGNOSTICO.md)

## Arquivos

`index.html` e `estilos.css` definem a composição. `interface.js` cuida da navegação e dos painéis originais, `nucleo/` reúne a lógica sem DOM (esquema, armazenamento, migração, backup, duplicidades, pontuação, ações comerciais, mensagens, propostas, métricas, automações, ICS e lote), `modulos/` os painéis novos (empresa, trabalho, mensagens, propostas, laboratório, financeiro e dados) com `modulos/modulos.css`, `dados.js` as etapas e modelos clássicos, `modelos.js` os sites clássicos e `utilitarios.js` os formatos e downloads. `api/` é a ponte serverless opcional do Connect, `esquemas/` os JSON Schemas do protocolo e `testes/` as verificações executáveis. `universo.js` contém o globo, reflexos, partículas, iluminação e órbitas Three.js. `icones.js` e `ativos/simbolo.svg` são vetores independentes.

A imagem ambiental não contém a interface, o globo, a base ou os controles. Esses elementos são implementados separadamente. A cena usa um único contexto WebGL, resolução ajustável, pausa em aba oculta e respeito a movimento reduzido. Sem WebGL, a composição de reserva preserva os controles HTML.

A biblioteca Three.js está em `bibliotecas/`, com sua licença MIT. A textura da Terra vem do exemplo público de Three Globe: https://cdn.jsdelivr.net/npm/three-globe/example/img/earth-blue-marble.jpg. O cenário ambiental foi gerado para este projeto e está otimizado em WebP.

Criado por **renancodando**.


## Estúdio de Sites

Abra **Estúdio de Sites** na navegação ou **Criar demonstração** dentro do cadastro de uma empresa. O cadastro ganhou um campo de nicho, sem alterar os registros existentes.

- Assistência: Precision Cell, Oficina Mobile e Pronto Tech.
- Odontologia: Sorriso Prime, Odonto Clara e Essenza Odontologia.
- Automotivo: Blue Wash, Impacto Car Care e Brisa Auto Spa.

Na galeria, selecione a empresa e o modelo. Personalize identidade, SVG, paleta, contatos, localização, textos, serviços, preços, FAQ, garantia, informações profissionais e avaliações autorizadas. As prévias usam os sites reais em 1440, 768 e 390 px. O gerador foi preparado também para as larguras de 320, 375, 430, 1024 e 1920 px.

**Salvar rascunho** guarda a demonstração localmente. **Gerar projeto** verifica os campos públicos e a autorização; **Exportar ZIP** baixa todos os arquivos independentes. Notas internas, contato comercial de prospecção, valores de negociação e histórico do CRM não entram na exportação. Somente os campos públicos selecionados são incluídos. O histórico do Estúdio integra o backup JSON do CRM.

Os sites exportados não usam fotos, imagens remotas, fontes externas, frameworks, banco, IA ou arquivos do CRM. As cenas principais usam modelos tridimensionais, materiais físicos e iluminação de estúdio: chassi e vidro nos celulares, cobre e aço no mecanismo, esmalte cerâmico e contornos de ouro nos dentes. Os modelos automotivos Blue Wash e Impacto Car Care usam geometria detalhada de vicent091036, licenciada sob CC BY 4.0 e com atribuição preservada. Brisa Auto Spa destaca a gota e os círculos na água. As formas SVG/CSS permanecem como alternativa gráfica. Blue Wash e Brisa usam água procedural em WebGL, com resposta ao ponteiro e ao toque. Todos os recursos necessários são incluídos nos ZIPs. Os pacotes incluem HTML, CSS, JavaScript, ícone vetorial, robots, sitemap, configuração Vercel, Netlify e instruções. Sem URL definitiva, a indexação fica desativada até uma nova exportação com a URL correta.

A publicação é manual e não é executada pelo CRM. Em **Demonstrações salvas → Publicação e link**, siga as instruções para sua conta e registre o endereço publicado. Não há campos para tokens nem credenciais. Os links registrados são informados por você e não são verificados automaticamente.

Consulte [estudio/LEIA-ME.md](estudio/LEIA-ME.md) para a organização e os limites do gerador.


## Testes

```sh
node testes/oraculo.mjs          # os nove modelos geram saída idêntica à referência gravada (testes/oraculo-referencia.json)
node testes/dados.mjs            # migração, backup, importação, mesclagem, lixeira e pontuação
node testes/metricas.mjs         # indicadores, experimentos, radar e automações
node testes/quant-base.mjs; node testes/quant-metricas.mjs; node testes/quant-analises.mjs; node testes/quant-audit.mjs; node testes/quant-grafo.mjs   # matemática, indicadores, auditoria e grafo
node testes/connect-motor.mjs; node testes/connect-sync.mjs; node testes/connect-ponte.cjs; node testes/gerar-esquemas.mjs --conferir   # protocolo, sincronização, ponte e esquemas
node testes/conversao-dominio.mjs; node testes/conversao-linguagem.mjs; node testes/conversao-lab.mjs; node testes/conversao-connect.mjs   # Órbita Conversão
NODE_PATH=$(npm root -g) node testes/conversao-ui.cjs   # painel de conversão no navegador (servidor em :3111)
node testes/ofertas.mjs; node testes/negociacao-conversa.mjs; node testes/negociacao-motor.mjs; node testes/diagnostico.mjs; node testes/connect-negociacao.mjs; node testes/rastreio.mjs; node testes/publicacao-cliente.mjs; node testes/migracao-evolucao.mjs; node testes/publicacao-ponte.cjs   # publicação, rastreio, negociação, ofertas e diagnóstico
NODE_PATH=$(npm root -g) node testes/evolucao-ui.cjs   # novas telas no navegador (ponte simulada)
node testes/exportacao.mjs DIR   # gera 27 pacotes (9 modelos × padrão/modular/sem 3D) e verifica privacidade e validação
NODE_PATH=$(npm root -g) node testes/isolamento.cjs DIR   # abre cada pacote em um servidor isolado (desktop, celular e sem WebGL)
NODE_PATH=$(npm root -g) node testes/responsividade.cjs   # painéis nos oito tamanhos (precisa do servidor em :3111)
```

Os testes de navegador usam Playwright. Para publicar o Órbita em hospedagem estática, envie a raiz do repositório (sem build).
