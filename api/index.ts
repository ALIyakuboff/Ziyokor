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
            // Optionally disable auto-init if you are sure DB is ready:
            // await initDbIfNeeded(); 
            try {
                await initDbIfNeeded();
            } catch (initErr: any) {
                console.error("[Vercel-Init] DB Initialization Error:", initErr);
                // We continue for now to see if the actual request works
            }
            initialized = true;
        }

        return app(req, res);
    } catch (error: any) {
        console.error("[Vercel-Handler] Fatal Error:", error);
        res.status(500).json({
            error: "API_ERROR",
            message: error.message || "Unknown error occurred",
            details: error.code || undefined,
            stack: error.stack // Include stack to help user debug
        });
    }
};
