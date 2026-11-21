import {
  BellIcon,
  HomeIcon,
  ListIcon,
  StarIcon,
  SwapIcon,
  TargetIcon,
  UserIcon,
  WalletIcon,
} from "@/shared/ui";
import { t } from "@/shared/i18n";
import type { Screen, ScreenId, TourStep } from "./types";

export const SCREENS: Record<ScreenId, Screen> = {
  dashboard: {
    id: "dashboard",
    get label() {
      return t("tutorial.screen.dashboard");
    },
    route: "/",
    icon: <HomeIcon size={20} />,
  },
  wallets: {
    id: "wallets",
    get label() {
      return t("tutorial.screen.wallets");
    },
    route: "/carteiras",
    icon: <WalletIcon size={20} />,
  },
  transactions: {
    id: "transactions",
    get label() {
      return t("tutorial.screen.transactions");
    },
    route: "/transacoes",
    icon: <ListIcon size={20} />,
  },
  transfers: {
    id: "transfers",
    get label() {
      return t("tutorial.screen.transfers");
    },
    route: "/transferencias",
    icon: <SwapIcon size={20} />,
    feature: "TRANSFERS",
    minPlan: "Plus",
  },
  goals: {
    id: "goals",
    get label() {
      return t("tutorial.screen.goals");
    },
    route: "/metas",
    icon: <TargetIcon size={20} />,
    feature: "GOALS",
    minPlan: "Pro",
  },
  goal: {
    id: "goal",
    get label() {
      return t("tutorial.screen.goal");
    },
    route: "/metas",
    icon: <TargetIcon size={20} />,
    feature: "GOALS",
    minPlan: "Pro",
    hideWhenLocked: true,
  },
  notifications: {
    id: "notifications",
    get label() {
      return t("tutorial.screen.notifications");
    },
    route: "/notificacoes",
    icon: <BellIcon size={20} />,
    feature: "NOTIFICATIONS",
    minPlan: "Pro",
  },
  plans: {
    id: "plans",
    get label() {
      return t("tutorial.screen.plans");
    },
    route: "/planos",
    icon: <StarIcon size={20} />,
  },
  profile: {
    id: "profile",
    get label() {
      return t("tutorial.screen.profile");
    },
    route: "/perfil",
    icon: <UserIcon size={20} />,
  },
};

/** Ordem em que os tutoriais aparecem na lista do Perfil. */
export const TUTORIAL_ORDER: ScreenId[] = [
  "dashboard",
  "wallets",
  "transactions",
  "transfers",
  "goals",
  "goal",
  "notifications",
  "plans",
  "profile",
];

/** Qual tutorial pertence a cada caminho do app (null = nenhum). */
export function tutorialForPath(pathname: string): ScreenId | null {
  if (/^\/metas\/[^/]+$/.test(pathname)) return "goal";
  return (
    TUTORIAL_ORDER.find(
      (id) => id !== "goal" && SCREENS[id].route === pathname,
    ) ?? null
  );
}

const tg = (id: string) => `[data-tour="${id}"]`;

const tx = { key: "tx-new", opener: tg("new-transaction") };
const wallet = { key: "wallet-new", opener: tg("new-wallet") };
const transfer = { key: "transfer-new", opener: tg("new-transfer") };
const goalNew = { key: "goal-new", opener: tg("new-goal") };
const deposit = { key: "goal-deposit", opener: tg("goal-deposit") };

/**
 * Roteiro. Itens que ficam juntos na tela e fazem parte do mesmo contexto são explicados
 * numa caixa só; cada formulário (modal) também é uma caixa só, apontando para o formulário todo.
 * O primeiro passo de cada tela traz a rota. Para editar um texto ou a ordem, mexa só aqui.
 */
const FORM = '[data-tour="modal"] form';

const allSteps = (): TourStep[] => [
  // ── Começo ──────────────────────────────────────────────
  {
    id: "welcome",
    screen: "dashboard",
    route: "/",
    title: t("tutorial.welcome.title"),
    text: t("tutorial.welcome.text"),
  },

  // ── Painel ──────────────────────────────────────────────
  {
    id: "dashboard-menu",
    screen: "dashboard",
    route: "/",
    target: tg("sidebar"),
    placement: "right",
    nav: true,
    title: t("tutorial.dashboard-menu.title"),
    text: t("tutorial.dashboard-menu.text"),
  },
  {
    id: "dashboard-top",
    screen: "dashboard",
    target: tg("topbar-actions"),
    placement: "bottom",
    title: t("tutorial.dashboard-top.title"),
    text: t("tutorial.dashboard-top.text"),
  },
  {
    id: "dashboard-evolution",
    screen: "dashboard",
    target: tg("evolution"),
    placement: "bottom",
    title: t("tutorial.dashboard-evolution.title"),
    text: t("tutorial.dashboard-evolution.text"),
  },
  {
    id: "dashboard-goals",
    screen: "dashboard",
    target: tg("goals-dash"),
    placement: "top",
    title: t("tutorial.dashboard-goals.title"),
    text: t("tutorial.dashboard-goals.text"),
  },
  {
    id: "dashboard-side",
    screen: "dashboard",
    target: tg("dash-side"),
    placement: "left",
    title: t("tutorial.dashboard-side.title"),
    text: t("tutorial.dashboard-side.text"),
  },

  // ── Carteiras ───────────────────────────────────────────
  {
    id: "wallets-new",
    screen: "wallets",
    route: "/carteiras",
    target: tg("new-wallet"),
    placement: "bottom",
    title: t("tutorial.wallets-new.title"),
    text: t("tutorial.wallets-new.text"),
  },
  {
    id: "wallets-form",
    screen: "wallets",
    modal: wallet,
    target: FORM,
    placement: "auto",
    title: t("tutorial.wallets-form.title"),
    text: t("tutorial.wallets-form.text"),
  },
  {
    id: "wallets-card",
    screen: "wallets",
    target: tg("wallet-card"),
    placement: "bottom",
    title: t("tutorial.wallets-card.title"),
    text: t("tutorial.wallets-card.text"),
  },

  // ── Transações ──────────────────────────────────────────
  {
    id: "transactions-new",
    screen: "transactions",
    route: "/transacoes",
    target: tg("new-transaction"),
    placement: "bottom",
    title: t("tutorial.transactions-new.title"),
    text: t("tutorial.transactions-new.text"),
  },
  {
    id: "transactions-form",
    screen: "transactions",
    modal: tx,
    target: FORM,
    placement: "auto",
    title: t("tutorial.transactions-form.title"),
    text: t("tutorial.transactions-form.text"),
  },
  {
    id: "transactions-filters",
    screen: "transactions",
    target: tg("tx-filters"),
    placement: "bottom",
    title: t("tutorial.transactions-filters.title"),
    text: t("tutorial.transactions-filters.text"),
  },
  {
    id: "transactions-row",
    screen: "transactions",
    target: tg("tx-row"),
    optional: true,
    placement: "bottom",
    title: t("tutorial.transactions-row.title"),
    text: t("tutorial.transactions-row.text"),
  },

  // ── Transferências ──────────────────────────────────────
  {
    id: "transfers-new",
    screen: "transfers",
    route: "/transferencias",
    target: tg("new-transfer"),
    placement: "bottom",
    title: t("tutorial.transfers-new.title"),
    text: t("tutorial.transfers-new.text"),
  },
  {
    id: "transfers-form",
    screen: "transfers",
    modal: transfer,
    target: FORM,
    placement: "auto",
    title: t("tutorial.transfers-form.title"),
    text: t("tutorial.transfers-form.text"),
  },
  {
    id: "transfers-list",
    screen: "transfers",
    target: tg("transfer-list"),
    optional: true,
    placement: "top",
    title: t("tutorial.transfers-list.title"),
    text: t("tutorial.transfers-list.text"),
  },

  // ── Metas ───────────────────────────────────────────────
  {
    id: "goals-new",
    screen: "goals",
    route: "/metas",
    target: tg("new-goal"),
    placement: "bottom",
    title: t("tutorial.goals-new.title"),
    text: t("tutorial.goals-new.text"),
  },
  {
    id: "goals-form",
    screen: "goals",
    modal: goalNew,
    target: FORM,
    placement: "auto",
    title: t("tutorial.goals-form.title"),
    text: t("tutorial.goals-form.text"),
  },
  {
    id: "goals-card",
    screen: "goals",
    target: tg("goal-card"),
    placement: "bottom",
    title: t("tutorial.goals-card.title"),
    text: t("tutorial.goals-card.text"),
  },

  // ── Dentro de uma meta ──────────────────────────────────
  {
    id: "goal-summary",
    screen: "goal",
    route: "/metas/demo-g1",
    target: tg("goal-summary"),
    placement: "bottom",
    title: t("tutorial.goal-summary.title"),
    text: t("tutorial.goal-summary.text"),
  },
  {
    id: "goal-deposit",
    screen: "goal",
    target: tg("goal-deposit"),
    placement: "bottom",
    title: t("tutorial.goal-deposit.title"),
    text: t("tutorial.goal-deposit.text"),
  },
  {
    id: "goal-deposit-form",
    screen: "goal",
    modal: deposit,
    target: FORM,
    placement: "auto",
    title: t("tutorial.goal-deposit-form.title"),
    text: t("tutorial.goal-deposit-form.text"),
  },
  {
    id: "goal-history",
    screen: "goal",
    target: tg("goal-history"),
    placement: "top",
    title: t("tutorial.goal-history.title"),
    text: t("tutorial.goal-history.text"),
  },

  // ── Notificações ────────────────────────────────────────
  {
    id: "notifications-filters",
    screen: "notifications",
    route: "/notificacoes",
    target: tg("notif-filters"),
    placement: "bottom",
    title: t("tutorial.notifications-filters.title"),
    text: t("tutorial.notifications-filters.text"),
  },
  {
    id: "notifications-list",
    screen: "notifications",
    target: [tg("notif-list"), tg("notif-empty")],
    placement: "top",
    title: t("tutorial.notifications-list.title"),
    text: t("tutorial.notifications-list.text"),
  },

  // ── Planos ──────────────────────────────────────────────
  {
    id: "plans-cards",
    screen: "plans",
    route: "/planos",
    target: tg("plan-cards"),
    placement: "top",
    title: t("tutorial.plans-cards.title"),
    text: t("tutorial.plans-cards.text"),
  },

  // ── Perfil ──────────────────────────────────────────────
  {
    id: "profile-id",
    screen: "profile",
    route: "/perfil",
    target: tg("profile-id"),
    placement: "bottom",
    title: t("tutorial.profile-id.title"),
    text: t("tutorial.profile-id.text"),
  },
  {
    id: "profile-theme",
    screen: "profile",
    target: tg("profile-theme"),
    placement: "left",
    title: t("tutorial.profile-theme.title"),
    text: t("tutorial.profile-theme.text"),
  },
  {
    id: "profile-tutorial",
    screen: "profile",
    target: tg("profile-tutorial"),
    placement: "top",
    title: t("tutorial.profile-tutorial.title"),
    text: t("tutorial.profile-tutorial.text"),
  },
];

const LOCKED_TEXT = (screen: Screen) =>
  t("tutorial.locked", { plan: screen.minPlan ?? "" });

/** Monta o roteiro para o plano do usuário: telas bloqueadas viram uma única caixa de aviso. */
export function buildSteps(features: string[]): TourStep[] {
  const steps: TourStep[] = [];
  const seenLocked = new Set<string>();

  for (const step of allSteps()) {
    const screen = SCREENS[step.screen];
    const locked =
      screen.feature !== undefined && !features.includes(screen.feature);
    if (!locked) {
      steps.push(step);
      continue;
    }
    if (screen.hideWhenLocked || seenLocked.has(screen.id)) continue;
    seenLocked.add(screen.id);
    // só uma caixa central, com o aviso do plano
    steps.push({
      id: `${screen.id}-locked`,
      screen: step.screen,
      route: step.route,
      title: screen.label,
      text: LOCKED_TEXT(screen),
      locked: true,
      minPlan: screen.minPlan,
    });
  }
  return steps;
}
