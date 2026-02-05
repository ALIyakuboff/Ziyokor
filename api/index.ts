import { createApp } from "../apps/api/src/app";
import { initDbIfNeeded } from "../apps/api/src/db";
import { initSocketServer } from "../apps/api/src/socket";

console.log("[Vercel] Initializing API Function...");
let initialized = false;
const app = createApp();

export default async (req: any, res: any) => {
    // Vercel Socket.io workaround:
    if (req.url.startsWith("/socket.io")) {
        if (!res.socket.server.io) {
            console.log("[Vercel-Socket] Initializing Socket.IO on server instance...");
            initSocketServer(res.socket.server);
        }
        // Socket.io handles the request itself if it's a socket request
        return;
    }

    if (!initialized) {
        await initDbIfNeeded().catch(err => console.error("[Vercel-Init] DB Error:", err));
        initialized = true;
    }
    return app(req, res);
};
