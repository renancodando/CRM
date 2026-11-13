# Configurar o Órbita Connect (opcional)

O Órbita funciona sem isto. Há dois modos:

1. **Troca manual (sem GitHub, sem servidor):** *Órbita Connect → Caixa de entrada* importa o JSON que o seu assistente gerou; *Dados compartilhados → Baixar dados autorizados* gera o arquivo para enviar ao assistente. Já funciona assim que o Órbita está aberto.
2. **Automático (repositório privado + ponte serverless):** exige as etapas abaixo, que **só você pode fazer**. Enquanto elas não forem concluídas e verificadas, o Órbita mostra “não verificada” e **não** declara a integração ativa.

## Etapas do proprietário (modo automático)
1. **Crie o repositório privado** `SEU_USUARIO/orbita-dados` (privado, vazio, branch `main`, com um `README.md` inicial). Confirme em *Settings → General → Danger Zone* que a visibilidade é *Private*. Nunca guarde dados comerciais no repositório público do Órbita.
2. **Crie uma GitHub App** (*Settings → Developer settings → GitHub Apps*): permissão **Repository → Contents: Read & write** (nada mais); desmarque webhooks. Gere uma **chave privada (.pem)**. Instale a App **somente** no repositório `orbita-dados` e anote `App ID` e o `Installation ID` (aparece na URL da instalação).
3. **OAuth da App** (mesma App): em *Callback URL* informe `https://SEU-ORBITA.vercel.app/api/connect?acao=callback`. Anote *Client ID* e gere o *Client secret*.
4. **Seu ID numérico do GitHub:** abra `https://api.github.com/users/SEU_USUARIO` e copie o campo `id`. A ponte autoriza **somente** esse ID (não o nome de usuário).
5. **Publique o Órbita na Vercel** (a raiz do repositório, sem build) e defina em *Settings → Environment Variables* os nomes de `api/.env.exemplo` com os seus valores: `ORBITA_ALLOWED_ORIGIN`, `ORBITA_DATA_REPO`, `ORBITA_DATA_BRANCH`, `ORBITA_OWNER_GITHUB_ID`, `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, `GITHUB_APP_ID`, `GITHUB_APP_INSTALLATION_ID`, `GITHUB_APP_PRIVATE_KEY` (cole o PEM; quebras de linha podem ser `\n`), `SESSION_SECRET` (32+ caracteres aleatórios). **Nunca** coloque esses valores em arquivos do repositório.
6. No Órbita: *Órbita Connect → Configuração* → modo **Automático** → *Entrar com GitHub* → *Verificar conexão*. Só quando aparecer “Autenticada” a integração está ativa.
7. **Conecte o ChatGPT (acesso separado):** nas configurações do ChatGPT, adicione o **conector do GitHub** e autorize **somente** o repositório `orbita-dados`. Essa autorização é independente do login do Órbita: um não concede o outro. Peça ao assistente para ler `PROTOCOLO-ORBITA-CONNECT.md` (copie-o para o repositório de dados, por exemplo em `orbita/PROTOCOLO.md`, junto com a pasta `esquemas/`).
8. Defina o **nível de autonomia** (começa no 2: tudo passa por revisão) e o escopo em *Dados compartilhados*.

## Verificar a primeira operação real
1. Mantenha o Órbita aberto e a conexão “Autenticada”.
2. Peça ao assistente: “Registre no Órbita a empresa *Teste Connect* em *SuaCidade – UF* e depois me diga o resultado.”
3. Ele deve criar `entrada/pendentes/<id>.json` no repositório de dados (verifique no GitHub).
4. No Órbita, *Sincronizar agora*. Em nível 2 a operação aparece em *Caixa de entrada → Aguardando sua revisão*; aprove.
5. Confira o arquivo `saida/confirmacoes/<id>.json` com `"aplicada": true` e a empresa na lista. Pergunte ao assistente o resultado: ele só deve confirmar o cadastro depois de ler essa confirmação.
6. Rode a mesma operação de novo (copie o arquivo com o **mesmo id**): nada deve ser duplicado.
7. Reverta a empresa de teste em *Atividades do assistente → Reverter*.

## Revogar o acesso
- ChatGPT: remova o conector GitHub ou revogue a autorização do repositório.
- Órbita: *Configuração → Sair* e, no GitHub, *Settings → Applications* para revogar a OAuth App; para cortar a ponte de vez, desinstale a GitHub App ou apague a variável `GITHUB_APP_PRIVATE_KEY` na Vercel e gere uma nova chave.

## Limites e honestidade operacional
- O repositório é uma **caixa de arquivos**, não um banco: até 40 operações por sincronização, arquivos de até 200 KB, exportação paginada (200 registros por arquivo), regravação só do que mudou.
- Sincronização ocorre enquanto o Órbita está **aberto**. Fechado, as operações aguardam no repositório; nada é processado com o navegador fechado.
- Lembretes criados por tarefas vivem no Órbita (e no ICS). **Não** são notificações do ChatGPT.
- Uso em dois dispositivos: cada navegador tem a sua base local; operações do assistente são aplicadas **uma única vez, em quem as processar primeiro**. A sincronização completa entre dispositivos não é garantida e está **desativada**; use o backup JSON para mover dados.
- Arquivos enviados ao GitHub permanecem no histórico de commits mesmo se removidos depois.
