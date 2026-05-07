import { api } from "./api";

export interface User {
  id: number;
  nama: string;
  email: string;
  level: "admin" | "petugas" | "super_admin";
  id_kantor: number;
  k_alias?: string | null;
  kantor_logo?: string | null;
}

export async function login(username: string, password: string): Promise<User> {
  const res = await api.post<{ token: string; user: User } | { requires_2fa: boolean; temp_token: string }>("/api/auth/login", {
    username,
    password,
  });

  // Jika server meminta 2FA, throw error khusus agar frontend bisa menangani
  if ("requires_2fa" in res && res.requires_2fa) {
    const err = new Error("2FA_REQUIRED") as Error & { temp_token: string; requires_2fa: boolean };
    err.temp_token = (res as { requires_2fa: boolean; temp_token: string }).temp_token;
    err.requires_2fa = true;
    throw err;
  }

  return (res as { token: string; user: User }).user;
}

export async function verify2FA(temp_token: string, code: string): Promise<User> {
  const res = await api.post<{ token: string; user: User }>("/api/auth/2fa/verify", {
    temp_token,
    code,
  });
  return res.user;
}

export async function counterLogin(
  username: string,
  password: string,
  alias: string
): Promise<User> {
  const res = await api.post<{ token: string; user: User }>(
    "/api/auth/counter-login",
    { username, password, alias }
  );
  // Save token to localStorage so apiFetch can send it as Bearer header.
  // Cookie forwarding via Next.js proxy is unreliable for subsequent requests.
  if (typeof window !== "undefined" && res.token) {
    localStorage.setItem("counter_token_bearer", res.token);
  }
  return res.user;
}

export async function counterLogout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("counter_token_bearer");
  }
  await api.post("/api/auth/counter-logout").catch(() => {});
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout");
}

export async function getMe(): Promise<User> {
  return api.get<User>("/api/auth/me");
}

export async function changePassword(
  passwordLama: string,
  passwordBaru: string
): Promise<void> {
  await api.put("/api/auth/change-password", {
    password_lama: passwordLama,
    password_baru: passwordBaru,
  });
}

// ─── 2FA ──────────────────────────────────────────────────────

export async function setup2FA(code: string): Promise<{ message: string }> {
  return api.post("/api/auth/2fa/setup", { code });
}

export async function disable2FA(): Promise<{ message: string }> {
  return api.post("/api/auth/2fa/disable");
}

export async function get2FAStatus(): Promise<{ twofa_enabled: boolean }> {
  return api.get("/api/auth/2fa/status");
}
