export type HandlerResponse = {
    status?: number;
    headers?: Record<string, string>;
    content: string;
};
