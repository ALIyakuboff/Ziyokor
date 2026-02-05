import "./env";
import { createServer } from "http";
import { createApp } from "./app";
import { initDbIfNeeded } from "./db";
import { startCrons } from "./routes/system.routes";
import { initSocketServer } from "./socket";

async function bootstrap() {
    const port = Number(process.env.PORT || 8080);

    const app = createApp();
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initSocketServer(httpServer);

    httpServer.listen(port, () => {
        console.log(`[api] listening on :${port} (TZ=${process.env.TZ || "system"})`);

        // Background tasks to avoid Render timeout
        initDbIfNeeded().then(() => {
            console.log("[api] DB and migrations successful");
            startCrons();
        }).catch(err => {
            console.error("[api] Background init failed:", err);
        });
    });

    // Graceful shutdown
    const shutdown = () => {
        console.log("[api] shutting down...");
        httpServer.close(() => process.exit(0));
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

bootstrap().catch((e) => {
    console.error("[api] fatal:", e);
    process.exit(1);
});
