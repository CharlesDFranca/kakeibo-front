/**
 * Um arquivo por assunto, cada um com `pt` (referência) e `en` (mesmas chaves, o compilador cobra).
 * Para criar um assunto novo: crie o arquivo e some aqui.
 */
import * as api from './api';
import * as app from './app';
import * as auth from './auth';
import * as dashboard from './dashboard';
import * as goals from './goals';
import * as layout from './layout';
import * as notifications from './notifications';
import * as plans from './plans';
import * as profile from './profile';
import * as transactions from './transactions';
import * as transfers from './transfers';
import * as tutorial from './tutorial';
import * as wallets from './wallets';

const parts = [api, app, auth, dashboard, goals, layout, notifications, plans, profile, transactions, transfers, tutorial, wallets];

const pt = Object.assign({}, ...parts.map((p) => p.pt)) as UnionToIntersection<(typeof parts)[number]['pt']>;
const en = Object.assign({}, ...parts.map((p) => p.en)) as Record<keyof typeof pt, string>;

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type MessageKey = keyof typeof pt;

export const MESSAGES: Record<'pt' | 'en', Record<MessageKey, string>> = { pt: pt as Record<MessageKey, string>, en };
