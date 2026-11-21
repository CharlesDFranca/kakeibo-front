import { ApiError, NetworkError, type ApiErrorBody } from "./api-error";

// Por padrão a API é chamada em "/api" (mesmo domínio do front). Em produção a Vercel
// repassa "/api/*" para o Render (vercel.json) e em desenvolvimento o Vite faz o mesmo
// (vite.config.ts). Assim o cookie de sessão é do próprio site e não é bloqueado como
// cookie de terceiros pelo Safari/Chrome. VITE_API_URL só serve para apontar direto
// para outra URL (nesse caso o cookie volta a ser cross-site).
const BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

type Envelope<T> =
  | { success: true; data: T }
  | { success: false; errors: ApiErrorBody; message?: string };

/**
 * Modo demonstração (tutorial): enquanto houver um resolvedor, as chamadas de dados não vão
 * à rede e respondem na hora com exemplos fictícios. Sessão e usuário (`/auth`, `/users`)
 * continuam reais.
 */
type DemoResolver = (path: string, method: string) => unknown;
let demoResolver: DemoResolver | null = null;
export function setDemoResolver(resolver: DemoResolver | null): void {
  demoResolver = resolver;
}

type RequestOptions = { method?: string; body?: unknown };

/**
 * Cliente HTTP único da aplicação. A sessão é um cookie httpOnly, por isso
 * `credentials: 'include'` em todas as chamadas.
 */
export async function request<T>(
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
  if (demoResolver && !/^\/?(auth|users)(\/|$)/.test(path)) {
    await Promise.resolve();
    return demoResolver(path, method) as T;
  }

  let response: Response;
  try {
    const url = `${BASE_URL}/${path.replace(/^\/+/, "")}`;

    response = await fetch(url, {
      method,
      credentials: "include",
      headers: body !== undefined ? { "Content-Type": "application/json" } : {},
      body: body !== undefined ? JSON.stringify(body) : null,
    });
  } catch {
    throw new NetworkError();
  }

  if (response.status === 204) return undefined as T;

  let payload: Envelope<T> | null = null;
  try {
    payload = (await response.json()) as Envelope<T>;
  } catch {
    /* corpo vazio ou inválido */
  }

  if (!response.ok || !payload || !payload.success) {
    const error = payload && !payload.success ? payload.errors : null;
    throw new ApiError(
      error?.code ?? `HTTP_${response.status}`,
      error?.message ?? "Erro inesperado.",
      response.status,
      error?.details,
    );
  }

  return payload.data;
}
