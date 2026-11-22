# Kakeibo Web (家計簿)

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![CSS Modules](https://img.shields.io/badge/css_modules-000000?style=for-the-badge&logo=cssmodules&logoColor=white)
![Vercel](https://img.shields.io/badge/vercel-%23000000.svg?style=for-the-badge&logo=vercel&logoColor=white)

Front-end do Kakeibo, aplicativo de gerenciamento financeiro pessoal, desenvolvido com React, TypeScript e Vite, consumindo a **kakeibo-api-pds**, a API construída para a disciplina (NestJS, DDD e Clean Architecture).

## O que é o Kakeibo

**Kakeibo (家計簿)** significa "livro de contas da casa". É um método japonês de organização financeira criado em 1904 por Hani Motoko, a primeira jornalista mulher do Japão, e até hoje comum nos lares do país. Em vez de só somar gastos, ele pede que a pessoa registre cada movimentação à mão e _reflita_ sobre ela, para criar consciência sobre o próprio dinheiro.

O método gira em torno de quatro perguntas, feitas todo mês:

1. **Quanto dinheiro eu tenho?** (receitas e saldo disponível)
2. **Quanto quero guardar?** (a meta de economia)
3. **Quanto estou gastando?** (despesas registradas, agrupadas por categoria)
4. **Como posso melhorar?** (a reflexão ao fim do período)

Os gastos são separados em categorias para mostrar para onde o dinheiro vai de fato: sobrevivência (moradia, contas, alimentação), opcionais, cultura e extras. O aplicativo traz essa ideia para o digital: carteiras e transações para registrar, metas para guardar, e um painel por período para refletir sobre o que aconteceu.

## Sobre este front-end

A aplicação é organizada por funcionalidades (features), sem bibliotecas de interface, de gráficos ou de tutorial: componentes, gráficos em SVG, sistema de temas, internacionalização e tour guiado são próprios.

Status: em desenvolvimento ativo.

---

## Visão geral

O front espelha os três contextos da API e respeita o plano do usuário (Free, Plus e Pro):

- **Identity** — login, cadastro, perfil, plano, tema, idioma e tutoriais.
- **Finance** — painel, carteiras, transações e transferências.
- **Planning** — metas, aportes e notificações.

Cada tela consome a API do contexto correspondente, e os recursos que o plano não inclui aparecem bloqueados, sem chamar a API.

---

## Tecnologias

- Node.js
- TypeScript
- React 18
- React Router 6
- Vite
- CSS Modules
- Vercel (deploy)

---

## Arquitetura

O projeto é modular: cada feature concentra suas telas, componentes, hooks e chamadas à API. O que é reutilizado por várias features fica em `shared`, e tema e rotas têm pastas próprias.

```text
src
├── features
├── shared
├── theme
├── styles
├── routes
├── App.tsx
└── main.tsx
```

### Dependências entre camadas

De forma geral, o fluxo da aplicação segue:

```text
 Página
   ↓
 Componentes  →  Hooks
                   ↓
                  API (features/*/api)
                   ↓
          shared/api (http-client)
```

As páginas montam a tela, os hooks cuidam de busca e estado, e apenas os arquivos `api` falam com o cliente HTTP. Nenhum componente usa cor, texto ou formato de número diretamente: tudo vem de tokens de tema (`theme`), de mensagens (`shared/i18n`) e de formatadores (`shared/format`).

---

## Estrutura atual

```text
src
├── features
│   ├── auth            login, cadastro, AuthContext e guards de plano
│   ├── dashboard       painel: período, evolução, receitas/despesas, metas e categorias
│   ├── wallets         carteiras: listar, criar (com saldo inicial), renomear e excluir
│   ├── transactions    filtros, listagem por dia, registrar receita/despesa e excluir
│   ├── transfers       transferências (Plus/Pro): listar, criar, detalhar e reverter
│   ├── goals           metas (Pro): lista, detalhe, aporte, estorno, cancelar e reativar
│   ├── categories      API e hook de categorias (usados no formulário de transação)
│   ├── notifications   avisos (Pro): filtro, marcar como lida
│   ├── plans           cards Free / Plus / Pro e troca de plano
│   ├── profile         conta, aparência, idioma, tutoriais e sessão
│   └── tutorial        tour guiado por tela, dados de exemplo e overlay
├── shared
│   ├── api             http-client (cookie de sessão), ApiError e NetworkError
│   ├── hooks           useAsyncData (busca com recarga e descarte de respostas antigas)
│   ├── ui              Button, TextField, SelectField, Modal, ConfirmDialog, Toast,
│   │                   EmptyState, Alert, LockedFeature, Skeleton, Logo, ícones e charts
│   ├── layout          AppShell e Sidebar das telas autenticadas
│   ├── format          moeda, datas e leitura de valores digitados
│   └── i18n            idiomas (pt/en), mensagens e tradução dos textos da API
├── theme               tokens, paletas, temas e ThemeProvider
├── styles              reset, estilos globais e tema de alto contraste
└── routes              rotas e guards (ProtectedRoute / GuestRoute)
```

Cada feature segue a mesma divisão: `api/`, `components/`, `hooks/` e a página. Uma feature nova entra em `src/features/<nome>` do mesmo jeito.

### Rotas

| Rota                   | Tela            | Plano      |
| ---------------------- | --------------- | ---------- |
| `/login`, `/cadastro`  | Autenticação    | —          |
| `/`                    | Painel          | Free       |
| `/carteiras`           | Carteiras       | Free       |
| `/transacoes`          | Transações      | Free       |
| `/transferencias`      | Transferências  | Plus / Pro |
| `/metas`, `/metas/:id` | Metas e detalhe | Pro        |
| `/notificacoes`        | Notificações    | Pro        |
| `/planos`              | Planos          | Free       |
| `/perfil`              | Perfil          | Free       |

---

## Funcionalidades

### Identity

- Login (`POST /auth/login`, cookie `session` httpOnly) e `GET /users/me`
- Cadastro (`POST /users`: `name?`, `username`, `email`, `password` com no mínimo 8) e redirecionamento ao login
- Perfil: avatar com iniciais, nome, usuário, plano atual e recursos liberados (lidos de `user.features`)
- Troca de tema e de idioma
- Troca de plano (`PATCH /users/me/plan`), sem cobrança, igual ao back
- Tutoriais vistos e reinício (`PATCH`/`DELETE /users/me/tutorials`)

### Finance

**Painel**

- Dados: `GET /finance/dashboard?startDate&endDate` (período escolhido no topo)
- Evolução do saldo, receitas e despesas, últimas transações e despesas por categoria
- Sem a feature do plano, o bloco aparece bloqueado com o plano necessário; despesas por categoria vêm como `null` abaixo do Plus

**Carteiras**

- Saldo total, cartões por carteira, criar, renomear e excluir
- Excluir uma carteira apaga também as transações dela (aviso na confirmação); se houver dinheiro alocado em metas, a API recusa

**Transações**

- Filtros (período, tipo, carteira e categoria), totais e lista agrupada por dia
- Só receitas e despesas podem ser excluídas; saldo inicial, transferências e ajustes aparecem sem o botão
- A API não aceita data futura: o formulário bloqueia e, para hoje, envia o instante atual
- O formulário permite criar uma categoria na hora ("+ Nova categoria"); ainda não há tela de gerenciamento de categorias

**Transferências**

- Exige `TRANSFERS` (Plus/Pro); sem ela a tela mostra o bloqueio e não chama a API (que responderia 403)
- Lista com filtro Todas / Concluídas / Revertidas, detalhe (`GET /transfers/:id`) e reversão com confirmação
- O formulário valida carteiras diferentes e saldo da origem; a API continua sendo a palavra final

### Planning

**Metas**

- Exige `GOALS` (Pro); lista com filtro por situação e detalhe com histórico
- A API usa o status `"IN PROGRESS"` (com espaço); os rótulos ficam em `features/goals/status.ts`
- Prazo: o usuário escolhe um dia (mínimo amanhã) e o front envia o fim desse dia no fuso local
- Ações por situação: Aportar (em andamento), Reativar (expirada, com novo prazo), Renomear, Cancelar (devolve os aportes às carteiras) e Estornar cada aporte ativo
- O aporte valida saldo da carteira e o que falta para o valor-alvo

**Notificações**

- Filtro Todas / Não lidas (`GET /notifications?unread=true`), marcar uma como lida (`PATCH /notifications/:id/read`) e "marcar todas" (uma chamada por item, pois a API não tem rota em lote)
- Hoje só existe o tipo `GOAL_REACHED` (meta alcançada)
- Sem atualização em tempo real: a lista é buscada ao abrir a tela ou trocar o filtro

### Planos

O espelho da Tabela 28 da API fica em `features/plans/plans.ts`, só para exibição. As telas decidem o que mostrar com `useHasFeature` (`features/auth/hooks.ts`), o jeito padrão de checar o plano.

| Recurso                                 | Free | Plus | Pro |
| --------------------------------------- | ---- | ---- | --- |
| Painel, carteiras e transações          | ✔    | ✔    | ✔   |
| Despesas por categoria e transferências | —    | ✔    | ✔   |
| Metas e notificações                    | —    | —    | ✔   |

Trocar de plano abre uma confirmação que lista o que se ganha e o que se perde, e `AuthContext.changePlan` recarrega o usuário, então menu, telas e bloqueios atualizam na hora. Rebaixar mantém os dados; só bloqueia as telas do plano perdido.

---

## Padrões e decisões

### Integração com a API e cookie de sessão

O cookie `session` é `httpOnly`. Com o front na Vercel e a API no Render, são **sites diferentes**, e Safari (ITP) e Chrome bloqueiam cookie de terceiros. Por isso o front chama a API em **`/api`**, no próprio domínio:

- **Produção:** `vercel.json` repassa `/api/:path*` para `https://kakeibo-api-pds.onrender.com/:path*`. O navegador só enxerga a Vercel, então o cookie é do próprio site (first-party) e a API pode usar `SameSite=Lax`.
- **Desenvolvimento:** `vite.config.ts` faz o mesmo para `http://localhost:3000` (`API_PROXY_TARGET` muda o destino).
- **Na Vercel, não defina `VITE_API_URL`** (ou deixe vazio). Se definir, o front volta a chamar o Render direto e o problema retorna.
- **Na API:** `COOKIE_SAMESITE` (padrão `lax`) e `COOKIE_SECURE` (padrão `true`; use `false` só em `http://localhost`, principalmente no Safari).
- **Limite:** o Render gratuito "dorme" e leva dezenas de segundos para acordar; a Vercel pode devolver 504 nessa primeira chamada. Recarregar resolve.

### Dados assíncronos

`useAsyncData` busca, recarrega sob demanda e descarta respostas antigas (troca rápida de filtro não mostra dado velho). Telas de dados usam `Skeleton` enquanto carregam e `EmptyState` quando vazias.

### Valores monetários

Valores digitados (`1.234,56`, `1,234.56`, `49,90`) são convertidos para o formato da API por `parseMoneyInput` em `shared/format`. A exibição usa `Intl` com cache e o idioma atual; a moeda é sempre real (BRL).

### Erros da API

A API devolve mensagens em inglês e um `code`. O front traduz pelo `code` (`INVALID_CREDENTIALS`, `EMAIL_ALREADY_EXISTS`...) em `shared/i18n/api-text.ts`, nunca pelo texto. `NetworkError` cobre falha de rede; código desconhecido mostra uma mensagem genérica.

### Planos e bloqueios

Sem a feature, a tela mostra `LockedFeature` com o plano necessário e **não chama a API** (que responderia 403). Os menus e atalhos seguem a mesma regra.

---

## Temas

Nenhum componente usa cor direta. Tudo lê variáveis CSS (`var(--color-bg-surface)`, `var(--radius-lg)`...).

```text
theme
├── palettes
│   ├── kakeibo.ts      cores brutas da marca (único lugar com hex)
│   └── extra.ts        paletas dos temas extras
├── themes
│   ├── dark.ts         tema Ameixa (padrão): mapeia a paleta para os tokens
│   ├── extra.ts        lista de cores dos demais temas
│   ├── factory.ts      buildTheme: deriva bordas, gradientes e gráficos
│   └── index.ts        registro de temas
├── types.ts            contrato Theme (cores semânticas, gradientes, sombras, raios, fontes)
├── applyTheme.ts       transforma o tema em variáveis CSS (color.bg.surfaceRaised → --color-bg-surface-raised)
└── ThemeProvider.tsx   aplica o tema, guarda a escolha e expõe useTheme()
```

### Temas disponíveis

| Tipo           | Temas                                  |
| -------------- | -------------------------------------- |
| Escuros        | Ameixa (padrão), Vinho, Lagoa, Noturno |
| Claros         | Névoa, Maré, Carmim, Musgo             |
| Acessibilidade | Alto contraste                         |

A escolha fica em **Perfil → Aparência** e é guardada em `localStorage` (`kakeibo:theme`).

### Contraste e acessibilidade

- Todos os pares de texto/fundo têm contraste mínimo de **4,5:1** (WCAG AA).
- O **Alto contraste** segue o eMAG/WCAG: fundo preto, texto branco (7:1 ou mais), links e destaques em amarelo, bordas e foco bem visíveis (`styles/high-contrast.css`).
- Dentro de cartões coloridos (`tone="brand"` / `"accent"`) os tokens de texto são redefinidos a partir da cor do cartão, para não ficarem claros sobre claro em temas claros.
- Foco de teclado visível em todos os controles; a sidebar recolhida se expande também por foco.

### Como alterar

- **Trocar uma cor:** edite `palettes/kakeibo.ts` ou o mapeamento em `themes/dark.ts`.
- **Criar um tema novo:** adicione a paleta em `palettes/extra.ts`, um `buildTheme({...})` em `themes/extra.ts` e liste-o em `themes/index.ts`. Um visual diferente (outros raios, sombras e fontes) é um arquivo `themes/meu-tema.ts` exportando um `Theme`. Os componentes não mudam.
- **Token novo:** se um componente precisar de um que não existe, adicione-o em `types.ts` e em todos os temas (o TypeScript avisa o que falta).
- **Gráficos:** são próprios, em SVG, coloridos só por tokens (`--chart-series-0..4`, `--chart-grid`); novos temas definem esses tokens.

### Escala e layout

- Todo o CSS usa `rem`; o tamanho-base cresce com a tela (`global.css`): 16px até tablet, ≈18px em notebook de 1366px, até 21px em monitores grandes.
- Sidebar recolhida mostra só ícones; com o mouse (ou foco) por cima ela se expande sobre o conteúdo. No celular vira barra inferior.

---

## Idiomas (português e inglês)

```text
shared/i18n
├── locales.ts          idiomas disponíveis (pt, en)
├── i18n.ts             t, tn, tOr, getLocale, setCurrentLocale, intlTag
├── I18nProvider.tsx    idioma atual; remonta as telas ao trocar
├── api-text.ts         textos que nascem na API, traduzidos no front
└── messages/<assunto>.ts   pt (referência) e en, por assunto
```

- `t('chave', { param })`, `tn('chave', n)` (plural: `chave.one` / `chave.other`) e `useI18n()`.
- O idioma fica em `localStorage` (`kakeibo:locale`; padrão: o do navegador, se for pt ou en). Troca em **Perfil → Idioma**.
- Cada arquivo de `messages/` tem `pt` e `en` com as mesmas chaves; o TypeScript cobra as que faltam.
- Textos calculados no topo de um módulo não trocam de idioma: use funções avaliadas na renderização.
- Datas e números seguem o idioma (`shared/format/format.ts`).

### Textos vindos da API

Passam por `shared/i18n/api-text.ts`:

- mensagens de erro, pelo `code`;
- categorias do sistema (transferência, saldo inicial, ajuste) e as nove padrão (Alimentação, Transporte, Moradia, Saúde, Educação, Lazer, Compras, Contas, Outros); categorias criadas pelo usuário ficam como foram escritas;
- descrições automáticas ("Saldo inicial", "Transferência");
- notificações, pelo tipo.

Código de erro novo na API: acrescente `error.<CODIGO>` em `messages/api.ts`.

### Idioma novo

Registre em `locales.ts`, acrescente a versão em cada arquivo de `messages/` e em `messages/index.ts`.

---

## Tutoriais por tela

`src/features/tutorial/` tem um tour guiado "com holofote" para cada tela: escurece o resto, destaca o elemento e coloca uma caixa curta colada nele. Sem dependências externas.

```text
features/tutorial
├── steps.tsx           roteiro: SCREENS, TUTORIAL_ORDER e os passos
├── TutorialProvider.tsx   executa o tour, abre/fecha modais e registra o visto
├── TourOverlay.tsx     bloqueio, recorte e caixa de explicação
├── demo.ts             dados de exemplo (modo demonstração)
├── dom.ts              localizar alvos e esperar elementos
└── types.ts
```

- **Um tutorial por tela** (`dashboard`, `wallets`, `transactions`, `transfers`, `goals`, `goal`, `notifications`, `plans`, `profile`), cerca de 30 caixas no total. O do Painel começa com as boas-vindas (explica o método Kakeibo) e mostra o menu, base da navegação. Itens vizinhos do mesmo contexto são explicados juntos, e cada formulário (modal) é uma caixa só: o tour abre o modal de verdade e o fecha.
- **Quando abrem:** o tutorial de uma tela abre sozinho na primeira visita a ela; ao terminar, nada leva a outra tela. Um tutorial que já abriu na sessão não reabre sozinho.
- **Registro no backend:** os já vistos ficam em `seenTutorials` (`GET /users/me`), então valem em qualquer navegador. `PATCH /users/me/tutorials` marca um como visto e `DELETE /users/me/tutorials` zera todos.
- **Rever:** **Perfil → Tutoriais** lista cada um com "Rever" (leva à tela e mostra o tutorial) e "Recomeçar todos" (zera tudo e volta ao Painel, como na primeira visita). Telas que o plano não inclui não aparecem; se o usuário perder o plano, o tutorial dela vira uma caixa de aviso.
- **Dados de exemplo:** enquanto um tour está aberto, as telas não chamam a API; `demo.ts` responde na hora com carteiras, transações, metas, transferências e notificações fictícias (`setDemoResolver` em `http-client.ts`). O tour é instantâneo e funciona mesmo para quem não tem nada cadastrado (a meta de exemplo mostra o botão Aportar). Sessão e usuário (`/auth`, `/users`) continuam reais e nada do tour grava dados.
- **Controles:** Próximo/Voltar, **Sair**, `←`/`→` e `Esc`. Cliques fora da caixa ficam bloqueados enquanto o tour está aberto. No celular a caixa fica logo abaixo (ou acima) do destaque, sem cobri-lo.
- **Editar:** o roteiro está só em `steps.tsx` (o campo `screen` de cada passo é o id do tutorial). Os alvos são atributos `data-tour="..."` nas telas. Se mudar o formato de alguma resposta da API, ajuste também `demo.ts`. Para criar um tutorial novo, inclua o id em `SCREENS`/`TUTORIAL_ORDER` e em `TUTORIAL_IDS` na API (`identity/domain/tutorial-ids.ts`).

---

## Como executar

### Pré-requisitos

- Node.js 18 ou superior
- npm
- API do Kakeibo rodando em `http://localhost:3000` (veja o README da API)

### Clone o projeto

```bash
git clone <url-do-repositorio>
cd kakeibo-web
```

### Configure as variáveis de ambiente

```bash
cp .env.example .env
```

`VITE_API_URL` deve ficar **vazio**: a API é chamada em `/api` e o Vite repassa para `localhost:3000` (veja [Integração com a API e cookie de sessão](#integração-com-a-api-e-cookie-de-sessão)).

| Variável           | Onde       | Descrição                                                         |
| ------------------ | ---------- | ----------------------------------------------------------------- |
| `VITE_API_URL`     | front      | Vazio por padrão. Só defina para chamar a API direto, sem o proxy |
| `API_PROXY_TARGET` | Vite (dev) | Destino do proxy `/api` (padrão `http://localhost:3000`)          |

### Inicie a aplicação

```bash
npm install
npm run dev
```

A aplicação fica em `http://localhost:5173`.

### Scripts

| Comando                           | O que faz                                              |
| --------------------------------- | ------------------------------------------------------ |
| `npm run dev`                     | Servidor de desenvolvimento com proxy para a API       |
| `npm run build`                   | Verifica os tipos e gera o build de produção em `dist` |
| `npm run preview`                 | Serve o build localmente                               |
| `npm run typecheck`               | Só a verificação de tipos                              |
| `npm test`                        | Roda todos os testes uma vez (Vitest)                  |
| `npm run test:watch`              | Testes em modo observação                              |
| `npm run test:coverage`           | Testes com relatório de cobertura                      |
| `npm run typecheck:tests`         | Verifica os tipos dos arquivos de teste                |
| `npm run lint`                    | ESLint                                                 |
| `npm run format` / `format:check` | Prettier (aplica / só confere)                         |

### Testes e qualidade

Os testes protegem os fluxos principais (login e cadastro, carteiras, transações, transferências, metas, planos e perfil) e a lógica pura (dinheiro, datas, períodos, i18n, cliente HTTP, tutoriais, contraste dos temas).

- **Stack:** Vitest 3 + jsdom + Testing Library + user-event. O Vitest está fixado na versão 3 porque a 5 exige Vite 6.4 ou superior, e o projeto usa Vite 5.
- **`src/test/`:** infraestrutura compartilhada. `mockApi` simula a API trocando o `fetch` (rotas no formato `'GET /wallets'`; rota não simulada devolve 404 e é registrada), `renderApp(rota, { user, api })` monta o app com todos os providers, `fixtures.ts` tem usuário, carteiras e categorias de exemplo.
- **Convenção:** testes de fluxo ficam ao lado da funcionalidade (`*.flow.test.tsx`), usam as chaves de tradução (`t('...')`) em vez de textos fixos e consultam a tela como o usuário (papéis e rótulos).
- **Build:** o `tsconfig.json` cobre tudo (é o que o editor usa, então os testes têm autocompletar e `@/` funcionando); `tsconfig.build.json` exclui os testes e é usado por `npm run build` e `npm run typecheck`, então o deploy não depende deles.

Exemplo de fluxo:

```tsx
const { person, server } = renderApp('/carteiras', { user: userOn('FREE'), api: { 'POST /wallets': ok(novaCarteira) } });
await person.click(await screen.findByRole('button', { name: t('wallets.new') }));
```

### Deploy

Na Vercel, o `vercel.json` já cuida do proxy `/api` e do fallback para `index.html` (rotas do React Router). Não defina `VITE_API_URL`.

---

## Roadmap

### Funcionalidades

- Tela de gerenciamento de categorias
- Atualização em tempo real das notificações
- Rota em lote para "marcar todas como lidas" (depende da API)
- Traduzir o selo do plano na barra superior (hoje mostra o código, como `PRO`)

### Qualidade

- Testes ponta a ponta (Playwright)
- Rodar lint, testes e verificação de tipos automaticamente a cada push (CI)

### Idiomas

- Novos idiomas além de português e inglês (o processo está em [Idioma novo](#idioma-novo))
- Nomes digitados pelo usuário (carteiras, metas) não são traduzidos, por serem dele
