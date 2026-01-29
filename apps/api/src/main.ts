import "./env";
import { createServer } from "http";
import { createApp } from "./app";
import { initDbIfNeeded } from "./db";
import { startCrons } from "./routes/system.routes";
import { initSocketServer } from "./socket";

async function bootstrap() {
    const port = Number(process.env.PORT || 8080);

    await initDbIfNeeded();

    const app = createApp();
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initSocketServer(httpServer);

    httpServer.listen(port, () => {
        console.log(`[api] listening on :${port} (TZ=${process.env.TZ || "system"})`);
    });

    // Start cron jobs inside the API process (good for single-instance deployment).
    // If you run multiple instances later, move crons to a single dedicated worker.
    startCrons();

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
