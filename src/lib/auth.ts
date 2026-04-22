import { api } from "./api";

export interface User {
  id: number;
  nama: string;
  email: string;
  level: "admin" | "petugas";
  id_kantor: number;
  k_alias?: string | null;
  kantor_logo?: string | null;
}

export async function login(username: string, password: string): Promise<User> {
  const res = await api.post<{ token: string; user: User }>("/api/auth/login", {
    username,
    password,
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
  return res.user;
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
