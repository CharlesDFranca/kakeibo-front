import { ApiError, NetworkError, type ApiErrorBody } from "./api-error";

const BASE_URL = (
  import.meta.env.VITE_API_URL ?? "https://s5ck2ngk-3000.brs.devtunnels.ms/"
).replace(/\/+$/, "");

type Envelope<T> =
  | { success: true; data: T }
  | { success: false; errors: ApiErrorBody; message?: string };

type RequestOptions = { method?: string; body?: unknown };

/**
 * Cliente HTTP único da aplicação. A sessão é um cookie httpOnly, por isso
 * `credentials: 'include'` em todas as chamadas.
 */
export async function request<T>(
  path: string,
  { method = "GET", body }: RequestOptions = {},
): Promise<T> {
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
