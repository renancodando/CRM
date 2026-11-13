# Estúdio de Sites

Implementação em módulos ES, sem dependências adicionais. Use o mesmo servidor estático do CRM:

```sh
python3 -m http.server 3000
```

## Organização

- `catalogo.js`: nove identidades, nichos, paletas e conteúdo comercial inicial editável.
- `ilustracoes.js`: smartphones, mecanismo, dentes e veículos em SVG/CSS.
- `componentes.js`: elementos semânticos compartilhados, contatos e seções.
- `modelos/`: composições distintas por modelo; ordem, agrupamentos e elementos próprios.
- `estilos/`: base, linguagem visual de cada nicho e adaptações responsivas de cada identidade.
- `seguranca.js`: seleção explícita de campos públicos, SVG permitido, URLs, WhatsApp e contraste.
- `gerador.js`: documentos de prévia e arquivos independentes.
- `interacoes-site.js`: menu, navegação ativa, FAQ nativo, revelações, cursor e pedidos pelo WhatsApp.
- `zip.js`: arquivo ZIP com UTF-8 e CRC32, gerado no navegador sem biblioteca ou servidor.
- `painel.js` e `estudio.css`: galeria, editor, prévia por dispositivo, histórico e registro de publicação.

## Geração

Cada ZIP tem `index.html`, `css/estilos.css`, `css/responsividade.css`, `js/configuracao.js`, `js/interacoes.js`, `assets/icones/marca.svg`, `robots.txt`, `sitemap.xml`, `vercel.json`, `netlify.toml` e `LEIA-ME.md`.

O HTML já contém os textos públicos renderizados; o JavaScript apenas acrescenta as interações. O conteúdo permanece legível sem animações e sem JavaScript. O formulário de WhatsApp precisa de JavaScript, mas os links de serviço funcionam diretamente.

Prévia não é publicação. Os nomes dos modelos e os textos comerciais iniciais são referências editáveis. A galeria mostra um aviso de prévia. Sem telefone, os links não contêm números inventados e o formulário fica indisponível. Antes de exportar, o usuário precisa informar empresa, cidade, WhatsApp, serviços e confirmar a veracidade e autorização dos dados. Em odontologia, CRO e responsável profissional também são exigidos.

Avaliações não são criadas pelo gerador. Somente depoimentos informados e autorizados são renderizados. Preços, endereço, horários, garantia e registro profissional não são inventados. Os textos iniciais de serviços devem ser revisados para refletir o que a empresa oferece.

## Dados e publicação

Rascunhos e demonstrações ficam em `demonstracoes` no mesmo estado local do CRM, sem alterar a versão nem apagar dados existentes. Não há upload, sincronização, criação de repositório ou deploy automático. Backups exportados pelo CRM incluem os projetos; a importação mantém os registros atuais.

A configuração exportada é uma lista permitida de campos públicos. Identificadores do CRM, histórico de contato, notas, orçamento de venda do site e credenciais não são exportados.

O SVG aceita somente formas e gradientes locais. Não permite scripts, eventos, imagens, referências remotas, foreignObject ou animações executáveis. URLs aceitam apenas HTTP(S), sem usuário/senha. A cor dos botões e dos painéis precisa manter contraste de pelo menos 4,5:1 com seus textos.

Os formulários preparam mensagens no WhatsApp; nunca simulam atendimento confirmado ou disponibilidade de agenda. O usuário realiza o envio e a equipe confirma o serviço e o horário.

A exportação sem URL definitiva recebe `noindex` e robots bloqueado. Configure o endereço e gere novamente para habilitar canonical, sitemap e indexação. A publicação deve ser feita pelo usuário na própria conta. O histórico registra o link informado, sem alegar verificação da hospedagem.

## Limites

Não há backend, login, agenda compartilhada, pagamento, mensageria automática ou verificação externa de dados comerciais. O armazenamento depende do navegador. Faça backups. Alterações em `js/configuracao.js` de um ZIP já exportado não reescrevem o HTML; personalize novamente no Estúdio e exporte uma nova versão.

Autoria: renancodando.
