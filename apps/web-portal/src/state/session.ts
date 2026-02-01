export type SessionUser = {
    id: string;
    role: "worker" | "admin";
    full_name: string;
    phone_login: string;
};

type SessionCtx = {
    token: string | null;
    user: SessionUser | null;
    setSession: (token: string, user: SessionUser) => void;
    logout: () => void;
};

const LS_TOKEN = "wc_token";
const LS_USER = "wc_user";

export function useSession(): SessionCtx {
    const token = localStorage.getItem(LS_TOKEN);
    const userStr = localStorage.getItem(LS_USER);
    let user: SessionUser | null = null;
    try {
        user = userStr ? (JSON.parse(userStr) as SessionUser) : null;
    } catch (e) {
        console.error("Failed to parse user session", e);
        localStorage.removeItem(LS_USER);
    }

    return {
        token,
        user,
        setSession: (t, u) => {
            localStorage.setItem(LS_TOKEN, t);
            localStorage.setItem(LS_USER, JSON.stringify(u));
            window.location.reload();
        },
        logout: () => {
            localStorage.removeItem(LS_TOKEN);
            localStorage.removeItem(LS_USER);
            window.location.reload();
        }
    };
}
