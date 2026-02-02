import { createApp } from "../apps/api/src/app";
import { initDbIfNeeded } from "../apps/api/src/db";

console.log("[Vercel] Initializing API Function...");
let initialized = false;
const app = createApp();

export default async (req: any, res: any) => {
    if (!initialized) {
        await initDbIfNeeded().catch(err => console.error("[Vercel-Init] DB Error:", err));
        initialized = true;
    }
    return app(req, res);
};
