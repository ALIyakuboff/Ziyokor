const ENV_API_URL = import.meta.env.VITE_API_URL;
const IS_PROD = import.meta.env.PROD;
export const API_BASE = ENV_API_URL
    ? (ENV_API_URL.endsWith("/api") ? ENV_API_URL : `${ENV_API_URL}/api`)
    : "/api";

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
        if (res.status === 401 || res.status === 403) {
            localStorage.removeItem("wc_token");
            localStorage.removeItem("wc_user");
            window.location.href = "/login";
        }
        const msg = data?.error || data?.message || "API_ERROR";
        throw new Error(msg);
    }
    return data as T;
}
