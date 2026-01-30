import { apiFetch } from "./client";
export async function login(body) {
    return apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify(body)
    });
}
