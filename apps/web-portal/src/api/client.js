export const API_BASE = import.meta.env?.VITE_API_URL || "http://localhost:8080";
export async function apiFetch(path, opts) {
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
    return data;
}
