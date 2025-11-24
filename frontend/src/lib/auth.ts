// src/lib/auth.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

type AuthResponse = {
  token: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
};

export async function loginRequest(email: string, password: string) {
  if (!API_URL) throw new Error("Missing API URL");
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Login failed (${res.status})`);
  }

  return (await res.json()) as AuthResponse;
}

export async function registerRequest(
  name: string,
  email: string,
  password: string
) {
  if (!API_URL) throw new Error("Missing API URL");
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Register failed (${res.status})`);
  }

  return (await res.json()) as AuthResponse;
}
