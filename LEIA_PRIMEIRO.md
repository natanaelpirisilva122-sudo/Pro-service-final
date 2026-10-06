# Pro Service — 6º período, fase 2

Integração do frontend React com o backend Node.js/Express e persistência MySQL.
Base: frontend com login de cliente/prestador e backend corrigido das etapas anteriores.

## Situação da entrega

- Código de integração implementado; build de produção do React concluído.
- Oito cenários HTTP aprovados (nove testes contando o agrupador).
- Teste com MySQL incluído, mas sua execução neste ambiente parou em ECONNREFUSED 127.0.0.1:3306, antes do fluxo de negócio.
- A demonstração completa no banco local é obrigatória antes de apresentar. Não há alegação de persistência validada nesta entrega.
- Não foi feita alteração no site publicado nem em repositório remoto.

## Abrir no VS Code

Extraia o ZIP e abra a pasta ProService_Fase2 no VS Code.
Pré-requisitos: Node.js 20 ou superior, npm e MySQL 8 iniciado, com usuário e senha conhecidos.
Não é preciso instalar Redis, NestJS, PostgreSQL ou Socket.IO: esta versão mantém Express e MySQL do backend entregue anteriormente.

### 1. Configurar o backend

Abra um terminal na raiz da pasta e execute:

```bash
cd backend
cp .env.example .env
npm ci
```

Edite `.env` no VS Code. Preencha `DB_USER` e `DB_PASSWORD` com suas credenciais locais.
Mantenha `DB_HOST=127.0.0.1` e `DB_PORT=3306` se o MySQL usa essas configurações.
Gere uma chave com `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` e copie o resultado para `JWT_SECRET`.

`DB_NAME=db_ProService` corresponde ao banco da etapa anterior. Se ele contiver uma estrutura antiga diferente da versão corrigida, use `DB_NAME=db_ProService_Fase2` para criar um ambiente separado, sem apagar o existente. Esse banco separado não importará automaticamente dados anteriores.

```bash
npm run db:setup
npm run test:http
npm run test:integration
npm run dev
```

O usuário MySQL precisa ter permissão para criar o banco e suas tabelas durante `db:setup`.
A inicialização não exclui tabelas nem registros e pode ser repetida. Ela não é uma migração automática de esquemas antigos.
O teste de integração cria contas com e-mails únicos `@example.test` e remove apenas essas contas e seus registros associados ao terminar. Ele usa um servidor HTTP temporário e não exige `npm run dev` em execução.

API: http://localhost:3000/api/v1
Documentação: http://localhost:3000/docs
Diagnóstico da conexão: http://localhost:3000/health

### 2. Iniciar o frontend

Abra um segundo terminal na raiz do projeto:

```bash
cd frontend
npm ci
npm run dev
```

Abra http://localhost:5173. A porta 5173 é fixa; se estiver ocupada, encerre a instância anterior.
O Vite encaminha `/api` para o backend na porta 3000.
Crie uma conta de prestador e uma de cliente. Não há senha de demonstração pré-cadastrada.

### 3. Demonstrar a integração

Siga `docs/DEMONSTRACAO.md`. O relatório em PDF descreve a implementação e os limites da validação.
Use um navegador para o cliente e uma janela anônima para o prestador. Após uma alteração em outra sessão, clique em **Atualizar lista**.

### 4. Gerar versão de produção

```bash
cd frontend
npm run build
```

O diretório `frontend/dist` já acompanha esta entrega como build verificado. Para desenvolvimento, use `npm run dev`.
Se hospedar as camadas separadamente, crie `frontend/.env` com `VITE_API_URL=https://ENDERECO-REAL-DA-API/api/v1` antes do build e configure `FRONTEND_URL` no backend com a origem HTTPS do frontend. O frontend publicado sozinho não fornece backend ou banco. Configure redirecionamento das rotas React para `index.html` no host estático.

## Diagnóstico

| Mensagem | Verificação |
| --- | --- |
| ECONNREFUSED 127.0.0.1:3306 | Inicie o MySQL e confira DB_HOST/DB_PORT. |
| Access denied | Corrija DB_USER/DB_PASSWORD e permissões. |
| Unknown database | Execute npm run db:setup com o DB_NAME desejado. |
| Campo ou tabela inexistente | Confira se o banco corresponde a database/schema.sql; use um banco separado se necessário. |
| Não foi possível conectar à API | Mantenha o backend em execução na porta 3000. |
| Origem bloqueada/CORS em produção | Ajuste FRONTEND_URL e refaça o build com VITE_API_URL correto. |
| Muitas tentativas de login | Aguarde a janela de 15 minutos do limitador. |

## Organização

- `frontend/src/services/api.js`: HTTP, token, timeout e erros.
- `frontend/src/pages/`: telas conectadas à API.
- `backend/src/`: routes, controllers, services, repositories e middlewares.
- `backend/database/`: estrutura relacional e habilidades iniciais.
- `backend/tests/`: testes HTTP e integração real com MySQL.
- `docs/`: roteiro de demonstração, relatório e resultados observados.

A sessão armazena apenas o token em sessionStorage; os dados de negócio são solicitados à API. Ao recarregar, `/auth/me` verifica a sessão. Fechar a sessão da aba remove o armazenamento da sessão. Tokens vencidos exigem novo login. A autorização é conferida no backend.
Não há chat, processamento financeiro ou atualização em tempo real implementados neste escopo.
