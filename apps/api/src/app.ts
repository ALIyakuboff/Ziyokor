import express from "express";
import cors from "cors";
import helmet from "helmet";

import { authRouter } from "./routes/auth.routes";
import { tasksRouter } from "./routes/tasks.routes";
import { adminRouter } from "./routes/admin.routes";
import { systemRouter } from "./routes/system.routes";

export function createApp() {
    const app = express();

    app.use((req, _res, next) => {
        console.log(`[api] ${req.method} ${req.url}`);
        next();
    });

    app.use(helmet());
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true,
            credentials: true
        })
    );
    app.use(express.json({ limit: "1mb" }));

    app.get("/health", (_req, res) => res.json({ ok: true }));

    app.use("/auth", authRouter);
    app.use("/tasks", tasksRouter);
    app.use("/admin", adminRouter);
    app.use("/system", systemRouter);

    // 404
    app.use((_req, res) => res.status(404).json({ error: "NOT_FOUND" }));

    // error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _req: any, res: any, _next: any) => {
        console.error("[api] error:", err);
        const status = Number(err?.status || 500);
        res.status(status).json({ error: err?.code || "INTERNAL_ERROR", message: err?.message || "Error" });
    });

    return app;
}
