"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const auth_routes_1 = require("./routes/auth.routes");
const tasks_routes_1 = require("./routes/tasks.routes");
const admin_routes_1 = require("./routes/admin.routes");
const system_routes_1 = require("./routes/system.routes");
function createApp() {
    const app = (0, express_1.default)();
    app.use((req, _res, next) => {
        console.log(`[api] ${req.method} ${req.url}`);
        next();
    });
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({
        origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
        credentials: true
    }));
    app.use(express_1.default.json({ limit: "1mb" }));
    app.get("/api/health", (_req, res) => res.json({ ok: true }));
    app.use("/api/auth", auth_routes_1.authRouter);
    app.use("/api/tasks", tasks_routes_1.tasksRouter);
    app.use("/api/admin", admin_routes_1.adminRouter);
    app.use("/api/system", system_routes_1.systemRouter);
    // 404
    app.use((_req, res) => res.status(404).json({ error: "NOT_FOUND" }));
    // error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err, _req, res, _next) => {
        console.error("[api] error:", err);
        const status = Number(err?.status || 500);
        res.status(status).json({ error: err?.code || "INTERNAL_ERROR", message: err?.message || "Error" });
    });
    return app;
}
