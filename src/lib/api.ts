// Use relative URL ("") in production so API calls go through Next.js rewrite proxy,
// which sets cookies on the frontend domain (antrianonline.net) not the backend domain.
// In local dev, set NEXT_PUBLIC_API_URL=http://localhost:8080 in .env.local.
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth, ...fetchOptions } = options;

  // If body is FormData, let the browser set the Content-Type (with boundary).
  const isFormData = !!fetchOptions.body && typeof (fetchOptions.body as any).append === 'function';
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(fetchOptions.headers as Record<string, string>),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...fetchOptions,
      headers,
      credentials: "include",
    });
  } catch (err: unknown) {
    const e = err as Error;
    throw new ApiError(`Network error when fetching ${API_BASE}${path}: ${e.message}`, 0, null);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.error || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// Convenience methods
export const api = {
  get: <T = unknown>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "GET", ...opts }),

  post: <T = unknown>(path: string, data?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(data), ...opts }),

  put: <T = unknown>(path: string, data?: unknown, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "PUT", body: JSON.stringify(data), ...opts }),

  delete: <T = unknown>(path: string, opts?: FetchOptions) =>
    apiFetch<T>(path, { method: "DELETE", ...opts }),

  postForm: <T = unknown>(path: string, formData: FormData, opts?: FetchOptions) => {
    const { skipAuth, ...rest } = opts ?? {};
    return apiFetch<T>(path, {
      method: "POST",
      body: formData,
      skipAuth,
      // Do NOT set Content-Type — let the browser set multipart boundary automatically
      headers: { ...(rest.headers as Record<string, string>) },
      ...rest,
    });
  },
};
