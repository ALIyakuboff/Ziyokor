import express from "express";
import cors from "cors";
import helmet from "helmet";

import { authRouter } from "./routes/auth.routes";
import { tasksRouter } from "./routes/tasks.routes";
import { adminRouter } from "./routes/admin.routes";
import { systemRouter } from "./routes/system.routes";

export function createApp() {
    const app = express();

    app.use((req: express.Request, _res: express.Response, next: express.NextFunction) => {
        console.log(`[api] ${req.method} ${req.url}`);
        next();
    });

    app.use(helmet());
    app.use(
        cors({
            origin: true, // Allow all origins for now to fix login
            credentials: true
        })
    );
    app.use(express.json({ limit: "1mb" }));

    app.get("/api/health", (_req: express.Request, res: express.Response) => res.json({ ok: true }));

    app.use("/api/auth", authRouter);
    app.use("/api/tasks", tasksRouter);
    app.use("/api/admin", adminRouter);
    app.use("/api/system", systemRouter);

    // 404
    app.use((_req: express.Request, res: express.Response) => { res.status(404).json({ error: "NOT_FOUND" }); });

    // error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error("[api] error:", err);
        const status = Number(err?.status || 500);
        res.status(status).json({ error: err?.code || "INTERNAL_ERROR", message: err?.message || "Error" });
    });

    return app;
}
