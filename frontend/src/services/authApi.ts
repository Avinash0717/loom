import { api } from "./api";

export interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        email: string;
        active_workspace_id: string;
    };
}

export function login(email: string, password: string) {
    const params = new URLSearchParams({
        email,
        password,
    });

    return api.post<LoginResponse>(`/user/login?${params.toString()}`);
}

export function logout() {
    return api.post<{ message: string }>("/user/logout");
}

export interface RegisterResponse {
  token: string;
  user: {
    id: number;
    username: string;
    email: string;
    active_workspace_id: string;
  };
}

export function register(
  username: string,
  email: string,
  password: string
) {
  const params = new URLSearchParams({
    username,
    email,
    password,
  });

  return api.post<RegisterResponse>(
    `/user/register?${params.toString()}`
  );
}

export function heartbeat() {
  return api.post<{ message: string }>("/user/heartbeat");
}