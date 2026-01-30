const ENV_API_URL = import.meta.env.VITE_API_URL;
export const API_BASE = ENV_API_URL ? `${ENV_API_URL}/api` : "/api";

export async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
    const token = localStorage.getItem("wc_token");
    const res = await fetch(`${API_BASE}${path}`, {
        ...opts,
        headers: {
            "Content-Type": "application/json",
            ...(opts?.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = data?.error || data?.message || "API_ERROR";
        throw new Error(msg);
    }
    return data as T;
}
