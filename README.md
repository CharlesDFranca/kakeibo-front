# Kakeibo Web

Front-end do Kakeibo em React + TypeScript (Vite). Etapas prontas: login, cadastro, dashboard, carteiras, transações, transferências e metas.

## Como rodar

```bash
cp .env.example .env     # VITE_API_URL fica vazio: a API é chamada em /api
npm install
npm run dev              # http://localhost:5173 (o Vite repassa `/api/*` para a API em `localhost:3000`)
```

## Estrutura

```
src/
  theme/            sistema de temas (ver abaixo)
  styles/global.css reset e estilos globais (só variáveis de tema)
  shared/
    api/            cliente HTTP (cookie de sessão) e ApiError
    hooks/          useAsyncData (busca com recarga e descarte de respostas antigas)
    ui/             componentes base: Button, TextField, SelectField, Modal, ConfirmDialog, Toast, EmptyState, Alert, Logo, Skeleton, ícones, gráficos (AreaChart, DonutChart)
    layout/         AppShell e Sidebar das telas autenticadas
    format/         moeda e datas em pt-BR
  features/
    auth/           api, validação, mensagens de erro, AuthContext, páginas de login/cadastro
    wallets/        carteiras: listar, criar (com saldo inicial), renomear e excluir
    transactions/   transações: filtros, listagem por dia, registrar receita/despesa e excluir
    transfers/      transferências (plano Plus/Pro): listar com filtro, criar, ver detalhe e reverter
    goals/          metas (plano Pro): lista, detalhe, criar, aportar, estornar, renomear, cancelar, reativar
    categories/     API e hook de categorias (usados no formulário de transação)
    dashboard/      painel: período, evolução do saldo, receitas/despesas, metas, últimas transações, categorias
  routes/           rotas e guards (ProtectedRoute / GuestRoute)
```

Cada feature nova (carteiras, transações, metas...) entra em `src/features/<nome>` com a mesma divisão.

## Temas

Nenhum componente usa cor direta. Tudo lê variáveis CSS (`var(--color-bg-surface)`, `var(--radius-lg)`...).

- `theme/palettes/kakeibo.ts`: as cores brutas da marca (único lugar com hex).
- `theme/types.ts`: contrato `Theme` (cores semânticas, gradientes, sombras, raios, fontes).
- `theme/themes/dark.ts`: tema escuro, que mapeia a paleta para os tokens.
- `theme/themes/index.ts`: registro de temas.
- `theme/applyTheme.ts`: transforma o tema em variáveis CSS (`color.bg.surfaceRaised` vira `--color-bg-surface-raised`).
- `theme/ThemeProvider.tsx`: aplica o tema e guarda a escolha; `useTheme()` expõe `setThemeId`.

**Trocar uma cor:** edite `palettes/kakeibo.ts` ou o mapeamento em `themes/dark.ts`.

**Criar um tema novo (inclusive visual diferente, com outros raios, sombras e fontes):** crie `themes/meu-tema.ts` exportando um `Theme` e adicione em `themes/index.ts`. Os componentes não mudam.

Se um componente precisar de um token que não existe, adicione-o em `types.ts` e em todos os temas (o TypeScript avisa o que falta).

## Integração com a API

- Login: `POST /auth/login` (cookie `session` httpOnly), depois `GET /users/me`.
- Cadastro: `POST /users` (`name?`, `username`, `email`, `password` com no mínimo 8), depois redireciona ao login.
- Erros da API (`INVALID_CREDENTIALS`, `EMAIL_ALREADY_EXISTS`...) são traduzidos em `features/auth/error-messages.ts`.

## Dashboard

- Dados: `GET /finance/dashboard?startDate&endDate` (período escolhido no topo) e `GET /planning/dashboard` (metas).
- Planos (Tabela 28): sem a feature, o bloco aparece bloqueado com o plano necessário. Despesas por categoria vêm como `null` abaixo do Plus; as metas só são consultadas no Pro (senão a API responde 403).
- Gráficos próprios em SVG, coloridos só por tokens do tema (`--chart-series-0..4`, `--chart-grid`); novos temas definem esses tokens.
- Todos os itens da sidebar têm tela.

## Carteiras e transações

| Rota | Tela |
|---|---|
| `/carteiras` | Saldo total, cartões por carteira, criar/renomear/excluir |
| `/transacoes` | Filtros (período, tipo, carteira, categoria), totais, lista agrupada por dia, nova transação, excluir |

- Valores digitados em reais (`1.234,56`, `49,90`) são convertidos para o formato da API em `shared/format/money-input.ts`.
- Só receitas e despesas podem ser excluídas; saldo inicial, transferências e ajustes aparecem sem o botão. Transações ligadas a metas devolvem erro explicativo da API.
- A API não aceita data futura: o formulário bloqueia e, para hoje, envia o instante atual.
- O formulário permite criar uma categoria na hora ("+ Nova categoria"). Ainda não há tela de gerenciamento de categorias.
- Excluir uma carteira apaga também as transações dela (aviso na confirmação); se houver dinheiro alocado em metas, a API recusa.
- Mensagens de erro da API ficam em `shared/api/error-messages.ts`.

## Transferências

- Rota `/transferencias`. Exige a feature TRANSFERS (Plus/Pro); sem ela a tela mostra o bloqueio e não chama a API (que responderia 403).
- Lista com filtro Todas/Concluídas/Revertidas, detalhe (`GET /transfers/:id`) ao clicar na linha e reversão com confirmação.
- O formulário valida carteiras diferentes e saldo da origem antes de enviar; a API continua sendo a palavra final (ex.: reversão recusada se o destino não tiver saldo).
- `useHasFeature` (`features/auth/hooks.ts`) é o jeito padrão de checar o plano nas próximas telas.

## Metas

- Rotas `/metas` (lista com filtro por situação) e `/metas/:id` (detalhe e histórico). Exigem a feature GOALS (Pro); sem ela mostram o bloqueio e não chamam a API.
- A API usa o status `"IN PROGRESS"` (com espaço); os rótulos em português ficam em `features/goals/status.ts`.
- Prazo: o usuário escolhe um dia (mínimo amanhã) e o front envia o fim desse dia no fuso local; a API exige pelo menos 1 dia à frente.
- Ações por situação: Aportar (em andamento), Reativar (expirada, com novo prazo), Renomear, Cancelar (em andamento ou expirada; devolve os aportes às carteiras) e Estornar cada aporte ainda ativo.
- O formulário de aporte valida saldo da carteira e o que falta para o valor-alvo; a API continua sendo a palavra final.
- O dashboard agora liga cada meta ao seu detalhe e tem o atalho "Ver todas".

## Perfil e planos

- `/perfil`: avatar com iniciais, nome, usuário, plano atual, recursos liberados (lidos de `user.features`, vindos da API), seletor de tema e botão de sair. A API não devolve e-mail, então ele não aparece.
- `/planos`: cards Free / Plus / Pro (espelho da Tabela 28 em `features/plans/plans.ts`, só para exibição), plano atual destacado. Trocar de plano abre uma confirmação que lista o que se ganha e o que se perde; chama `PATCH /users/me/plan` e recarrega o usuário (`AuthContext.changePlan`), então menu, telas e bloqueios (`useHasFeature`) atualizam na hora.
- A troca é direta, sem cobrança (igual ao back). Rebaixar mantém os dados; só bloqueia as telas do plano perdido.
- O selo do plano e o avatar na barra superior levam a essas telas; "Planos" e "Perfil" entraram na sidebar.

## Notificações

- `/notificacoes` (plano Pro): lista de avisos com filtro Todas / Não lidas (`GET /notifications?unread=true`), marcar uma como lida (`PATCH /notifications/:id/read`) e "marcar todas" (uma chamada por item, pois a API não tem rota em lote).
- Hoje só existe o tipo `GOAL_REACHED` (meta alcançada), gerado pelo evento `GoalReached` do back. Sem o plano Pro a tela mostra o bloqueio e não chama a API.
- Não há atualização em tempo real: a lista é buscada ao abrir a tela ou trocar o filtro.

## Temas e escala

- 9 temas (`src/theme/themes`): Ameixa (padrão), Vinho, Lagoa, Noturno (escuros), Névoa, Maré, Carmim, Musgo (claros) e Alto contraste. Cada tema extra é só uma lista de cores em `themes/extra.ts`; `themes/factory.ts` deriva bordas, gradientes e gráficos. A escolha fica em Perfil → Aparência. Todos os pares de texto/fundo têm contraste mínimo de 4,5:1 (WCAG AA). O **Alto contraste** segue o eMAG/WCAG: fundo preto, texto branco (7:1 ou mais), links e destaques em amarelo, bordas e foco bem visíveis, em `styles/high-contrast.css`.
- Dentro de cartões coloridos (`tone="brand"`/`"accent"`) os tokens de texto são redefinidos a partir da cor do cartão, para não ficarem claros sobre claro em temas claros.
- Para criar outro tema: adicionar a paleta em `palettes/extra.ts`, um `buildTheme({...})` em `extra.ts` e listá-lo em `themes/index.ts`.
- Sidebar recolhida mostra só ícones; com o mouse (ou foco de teclado) por cima ela se expande sobre o conteúdo, mostrando o nome de cada item. No celular continua como barra inferior.
- Todo o CSS usa `rem`; o tamanho-base cresce com a tela (`global.css`): 16px até tablet, ≈18px em notebook de 1366px, até 21px em monitores grandes.
# kakeibo-front
# kakeibo-api-pds

## Cookie de sessão e deploy (Vercel + Render)

O cookie `session` é `httpOnly`. Com o front na Vercel e a API no Render, são **sites diferentes**, e Safari (ITP) e Chrome bloqueiam cookie de terceiros (`SameSite=None`). Por isso o front chama a API em **`/api`**, no próprio domínio:

- Produção: `vercel.json` repassa `/api/:path*` para `https://kakeibo-api-pds.onrender.com/:path*`. O navegador só enxerga a Vercel, então o cookie é do próprio site (first-party) e a API pode usar `SameSite=Lax`.
- Desenvolvimento: `vite.config.ts` faz o mesmo para `http://localhost:3000` (`API_PROXY_TARGET` muda o destino).
- Na Vercel, **não defina `VITE_API_URL`** (ou deixe vazio). Se definir, o front volta a chamar o Render direto e o problema retorna.
- Na API: `COOKIE_SAMESITE` (padrão `lax`) e `COOKIE_SECURE` (padrão `true`; use `false` só em `http://localhost`, principalmente no Safari).
- Limite: o Render gratuito "dorme" e leva dezenas de segundos para acordar; a Vercel pode devolver 504 nessa primeira chamada. Recarregar resolve.

## Tutoriais por tela

`src/features/tutorial/` tem um tour guiado "com holofote" para cada tela: escurece o resto, destaca o elemento e coloca uma caixa curta colada nele. Sem dependências externas.

- **Um tutorial por tela** (`dashboard`, `wallets`, `transactions`, `transfers`, `goals`, `goal`, `notifications`, `plans`, `profile`), cerca de 30 caixas no total. O do Painel começa com as boas-vindas (explica o método Kakeibo) e mostra o menu, que é a base da navegação. Os outros vão direto ao ponto. Itens vizinhos do mesmo contexto são explicados juntos, e cada formulário (modal) é uma caixa só (o tour abre o modal de verdade e fecha).
- **Quando abrem:** o tutorial de uma tela abre sozinho na primeira vez que o usuário a visita; ao terminar, nada leva a outra tela. Um tutorial que já abriu na sessão não reabre sozinho.
- **Registro no backend:** os já vistos ficam em `seenTutorials` (`GET /users/me`), então valem em qualquer navegador. `PATCH /users/me/tutorials` marca um como visto e `DELETE /users/me/tutorials` zera todos.
- **Rever:** **Perfil → Tutoriais** lista cada um com "Rever" (leva à tela e mostra o tutorial) e "Recomeçar todos" (zera tudo e volta ao Painel, como na primeira visita). Telas que o plano não inclui não aparecem na lista; se o usuário perder o plano, o tutorial dela vira uma caixa de aviso.
- **Dados de exemplo (modo demonstração):** enquanto um tour está aberto, as telas não chamam a API; `demo.ts` responde na hora com carteiras, transações, metas, transferências e notificações fictícias (`setDemoResolver` em `http-client.ts`). Assim o tour é instantâneo e funciona mesmo para quem não tem nada cadastrado (a meta de exemplo mostra o botão Aportar). Sessão e usuário (`/auth`, `/users`) continuam reais e nada do tour grava dados. Ao terminar, volta à tela de origem com os dados reais.
- **Controles:** Próximo/Voltar, **Sair**, `←`/`→` e `Esc`. Cliques fora da caixa ficam bloqueados enquanto o tour está aberto. No celular a caixa fica logo abaixo (ou acima) do destaque, sem cobri-lo.
- **Editar:** o roteiro está só em `steps.tsx` (o campo `screen` de cada passo é o id do tutorial). Os alvos são atributos `data-tour="..."` nas telas. Se mudar o formato de alguma resposta da API, ajuste também `demo.ts`. Para criar um tutorial novo, inclua o id em `SCREENS`/`TUTORIAL_ORDER` e em `TUTORIAL_IDS` na API (`identity/domain/tutorial-ids.ts`).

## Idiomas (português e inglês)

- `src/shared/i18n/`: `t('chave', { param })`, `tn('chave', n)` (plural: `chave.one`/`chave.other`), `useI18n()`. O idioma fica em `localStorage` (padrão: o do navegador, se for pt ou en); troca em Perfil → Idioma e remonta as telas.
- Os textos ficam em `messages/<assunto>.ts`, cada um com `pt` (referência) e `en` com as mesmas chaves (o TypeScript cobra as que faltam). Para um idioma novo: registre em `locales.ts`, acrescente a versão em cada arquivo de `messages/` e em `messages/index.ts`.
- Textos calculados no topo de um módulo não trocam de idioma: use funções avaliadas na renderização.
- **Textos vindos da API** passam por `shared/i18n/api-text.ts`: mensagens de erro (pelo `code`, nunca pelo texto em inglês da API), categorias do sistema (`transfer`, `opening balance`, `adjustment`), descrições automáticas ("Saldo inicial", "Transferência") e notificações. Código de erro novo na API: acrescente `error.<CODIGO>` em `messages/api.ts`; se faltar, o app mostra uma mensagem genérica.
- Datas e números seguem o idioma (`shared/format/format.ts`); a moeda é sempre real. Valores digitados aceitam `1.234,56` e `1,234.56`.
