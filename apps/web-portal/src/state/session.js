const LS_TOKEN = "wc_token";
const LS_USER = "wc_user";
export function useSession() {
    const token = localStorage.getItem(LS_TOKEN);
    const userStr = localStorage.getItem(LS_USER);
    const user = userStr ? JSON.parse(userStr) : null;
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
