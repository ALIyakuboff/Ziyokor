import { createApp } from "../apps/api/src/app";
import { initDbIfNeeded } from "../apps/api/src/db";
import { initSocketServer } from "../apps/api/src/socket";

console.log("[Vercel] Initializing API Function...");
let initialized = false;
const app = createApp();

export default async (req: any, res: any) => {
    try {
        // Vercel Socket.io workaround:
        if (req.url.startsWith("/socket.io")) {
            if (res.socket && res.socket.server) {
                if (!res.socket.server.io) {
                    console.log("[Vercel-Socket] Initializing Socket.IO on server instance...");
                    initSocketServer(res.socket.server);
                }
            } else {
                console.warn("[Vercel-Socket] res.socket.server not available");
            }
            // Let Socket.io handle it if it can. 
            // We return here to avoid Express handling socket requests.
            return;
        }

        if (!initialized) {
            console.log("[Vercel-Init] Initializing DB...");
            await initDbIfNeeded().catch(err => {
                console.error("[Vercel-Init] DB Initialization Error:", err);
                throw err; // Re-throw to show 500 in Vercel logs
            });
            initialized = true;
        }

        return app(req, res);
    } catch (error: any) {
        console.error("[Vercel-Handler] Fatal Error:", error);
        res.status(500).json({
            error: "API_ERROR",
            message: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
};
