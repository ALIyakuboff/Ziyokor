"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./env");
const http_1 = require("http");
const app_1 = require("./app");
const db_1 = require("./db");
const system_routes_1 = require("./routes/system.routes");
const socket_1 = require("./socket");
async function bootstrap() {
    const port = Number(process.env.PORT || 8080);
    await (0, db_1.initDbIfNeeded)();
    const app = (0, app_1.createApp)();
    const httpServer = (0, http_1.createServer)(app);
    // Initialize Socket.IO
    (0, socket_1.initSocketServer)(httpServer);
    httpServer.listen(port, () => {
        console.log(`[api] listening on :${port} (TZ=${process.env.TZ || "system"})`);
    });
    // Start cron jobs inside the API process (good for single-instance deployment).
    // If you run multiple instances later, move crons to a single dedicated worker.
    (0, system_routes_1.startCrons)();
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
