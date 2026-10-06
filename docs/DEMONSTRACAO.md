# Demonstração da fase 2

Duração sugerida: 6 a 8 minutos. Execute somente após configurar o MySQL e obter aprovação em `npm run test:integration`.

1. **Arquitetura:** apresente React, API REST em Express e MySQL. Mostre a camada de acesso HTTP e um controller/service/repository.
2. **Prestador:** crie uma conta, complete a descrição, cidade/UF e preço, salve e vincule uma habilidade. Atualize a página para conferir o retorno da API.
3. **Cliente:** em outra sessão, cadastre-se, busque o prestador e abra o perfil.
4. **Solicitação:** informe título, descrição, categoria, endereço, cidade, UF e valor opcional. Envie e anote o ID retornado.
5. **Evidência HTTP:** em Ferramentas do Desenvolvedor > Network/Rede, mostre o POST `/api/v1/servicos`, status 201 e o mesmo ID no JSON. Oculte o cabeçalho Authorization ao capturar imagens.
6. **Evidência SQL:** consulte no MySQL `SELECT id, cliente_id, prestador_id, titulo, status FROM servicos ORDER BY id DESC LIMIT 10;` e localize o mesmo ID. Recarregue a página do cliente.
7. **Prestador:** abra Solicitações recebidas, clique Atualizar lista e aceite. Vá à Agenda e conclua. Explique que apenas o prestador responsável pode executar essas ações.
8. **Cliente:** clique Atualizar lista, observe CONCLUIDO, registre uma avaliação e abra novamente o perfil do prestador para conferir a média e o comentário.
9. **Persistência:** reinicie a API e recarregue o frontend; o serviço e a avaliação devem continuar disponíveis. Essa verificação depende do MySQL e ainda precisa ser realizada no ambiente local.
10. **Consistência:** demonstre senha incorreta, campo obrigatório inválido, tentativa de acesso sem token e bloqueio de avaliação duplicada pelo teste automatizado.

## Evidências a capturar no ambiente real

- Perfil salvo e habilidade vinculada.
- Solicitação na tela, resposta HTTP e linha SQL com o mesmo identificador.
- Mudanças PENDENTE, ACEITO e CONCLUIDO nas duas contas.
- Avaliação persistida e média do prestador.
- Saída aprovada do teste de integração com MySQL.
- Dados após reiniciar o backend.

Não substitua essas evidências por telas preenchidas manualmente ou por dados simulados. As imagens dessas etapas não foram fabricadas nesta entrega.

## Correspondência com a orientação recebida

| Exigência | Implementação e comprovação |
| --- | --- |
| Integração frontend/backend | Formulários e consultas chamam `/api/v1`, usando JSON e Bearer JWT. |
| Coerência arquitetural | React e API Express em camadas, com repositórios MySQL. |
| Comunicação real | Requisições de cadastro, login, busca, contratação, status e avaliação. Demonstrar na aba Rede. |
| Funcionalidades operacionais | Executar o percurso cliente/prestador no ambiente com MySQL. |
| Consistência | Validação no servidor, autorização, transações no cadastro, status controlado e avaliação única. |
| Demonstração clara | Relacionar ID da tela, resposta HTTP e registro no banco. |
