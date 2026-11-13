# Órbita — Prospecção & Vendas

Um espaço para organizar empresas, acompanhar conversas e vender sites. Interface inspirada na referência fornecida, com materiais translúcidos, luzes quentes e frias e um globo 3D com órbitas reais.

Repositório: https://github.com/renancodando/CRM

## Abrir

```sh
python3 -m http.server 3000
```

Acesse `http://localhost:3000`. Não há instalação, compilação, autenticação, banco de dados ou dependência de CDN. Todos os recursos visuais e o Three.js estão incluídos.

## Funcionalidades

- Cadastro e edição de empresas com contato, valor, anotações e histórico.
- Busca global com `Ctrl K`, filtros por etapa e período e exportação CSV.
- Pipeline visual com arrastar e soltar; cada cartão também permite mudar a etapa pelo teclado.
- Indicadores calculados a partir das oportunidades locais.
- Mensagens personalizáveis por empresa, intenção e tom; cópia, download e rascunhos. Nenhum envio automático.
- Lembretes editáveis, conclusão de ações e notificações dentro da interface.
- Estúdio de Sites com nove modelos comerciais, prévias reais, personalização ao vivo e ZIP independente.
- Modelos clássicos preservados com download de HTML.
- Relatórios, backup JSON e importação que preserva os registros atuais.
- Nome da plataforma e perfil editáveis, pausa, qualidade visual e contraste reforçado.

O CRM inicia vazio, sem empresas, oportunidades, mensagens ou lembretes de exemplo. Os indicadores mostram apenas os seus cadastros. A navegação funciona na mesma tela, por painéis contextuais.

Na primeira abertura desta versão, os registros da antiga demonstração salvos no navegador são apagados uma única vez. Nome, marca e preferências são preservados. Os novos cadastros permanecem salvos nas próximas visitas. Os modelos de site continuam disponíveis para prévia e download mesmo antes do primeiro cadastro.

Os dados ficam apenas no `localStorage` do navegador. Exporte um backup antes de trocar de dispositivo. Lembretes não enviam notificações quando o site está fechado. O gerador usa modelos locais de texto, sem serviço de IA.

## Arquivos

`index.html` e `estilos.css` definem a composição. `interface.js` cuida das interações, `dados.js` das etapas, modelos e estado inicial, `modelos.js` dos sites exportáveis e `utilitarios.js` dos formatos e downloads. `universo.js` contém o globo, reflexos, partículas, iluminação e órbitas Three.js. `icones.js` e `ativos/simbolo.svg` são vetores independentes.

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

Os sites exportados não usam fotos, imagens remotas, fontes externas, frameworks, banco, IA ou arquivos do CRM. As ilustrações são SVG e CSS. Os pacotes incluem HTML, CSS, JavaScript, ícone vetorial, robots, sitemap, configuração Vercel, Netlify e instruções. Sem URL definitiva, a indexação fica desativada até uma nova exportação com a URL correta.

A publicação é manual e não é executada pelo CRM. Em **Demonstrações salvas → Publicação e link**, siga as instruções para sua conta e registre o endereço publicado. Não há campos para tokens nem credenciais. Os links registrados são informados por você e não são verificados automaticamente.

Consulte [estudio/LEIA-ME.md](estudio/LEIA-ME.md) para a organização e os limites do gerador.
