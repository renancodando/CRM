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

## Arquivos

`index.html` e `estilos.css` definem a composição. `interface.js` cuida da navegação e dos painéis originais, `nucleo/` reúne a lógica sem DOM (esquema, armazenamento, migração, backup, duplicidades, pontuação, ações comerciais, mensagens, propostas, métricas, automações, ICS e lote), `modulos/` os painéis novos (empresa, trabalho, mensagens, propostas, laboratório, financeiro e dados) com `modulos/modulos.css`, `dados.js` as etapas e modelos clássicos, `modelos.js` os sites clássicos e `utilitarios.js` os formatos e downloads. `testes/` guarda as verificações executáveis. `universo.js` contém o globo, reflexos, partículas, iluminação e órbitas Three.js. `icones.js` e `ativos/simbolo.svg` são vetores independentes.

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
node testes/exportacao.mjs DIR   # gera 27 pacotes (9 modelos × padrão/modular/sem 3D) e verifica privacidade e validação
NODE_PATH=$(npm root -g) node testes/isolamento.cjs DIR   # abre cada pacote em um servidor isolado (desktop, celular e sem WebGL)
NODE_PATH=$(npm root -g) node testes/responsividade.cjs   # painéis nos oito tamanhos (precisa do servidor em :3111)
```

Os testes de navegador usam Playwright. Para publicar o Órbita em hospedagem estática, envie a raiz do repositório (sem build).
