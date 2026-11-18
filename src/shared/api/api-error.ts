export type ApiErrorBody = {
    code: string;
    type: string;
    message: string;
    details?: Record<string, unknown>;
};

/** Erro devolvido pela API (envelope `{ success: false, errors }`). */
export class ApiError extends Error {
    constructor(
        public readonly code: string,
        message: string,
        public readonly status: number,
        public readonly details?: Record<string, unknown>,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export class NetworkError extends Error {
    constructor() {
        super('Não foi possível conectar ao servidor.');
        this.name = 'NetworkError';
    }
}
