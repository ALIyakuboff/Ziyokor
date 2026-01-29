import { apiFetch } from "./client";
import type { SessionUser } from "../state/session";

export async function login(body: { phone_login: string; password: string }) {
    return apiFetch<{ token: string; user: SessionUser }>("/auth/login", {
        method: "POST",
        body: JSON.stringify(body)
    });
}
