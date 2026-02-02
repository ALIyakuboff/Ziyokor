import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";

import { authRouter } from "./routes/auth.routes";
import { tasksRouter } from "./routes/tasks.routes";
import { adminRouter } from "./routes/admin.routes";
import { systemRouter } from "./routes/system.routes";

export function createApp() {
    const app = express();

    app.use((req: Request, _res: Response, next: NextFunction) => {
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

    app.get(["/api/health", "/health"], (_req: Request, res: Response) => res.json({ ok: true }));

    app.use(["/api/auth", "/auth"], authRouter);
    app.use(["/api/tasks", "/tasks"], tasksRouter);
    app.use(["/api/admin", "/admin"], adminRouter);
    app.use(["/api/system", "/system"], systemRouter);

    // 404
    app.use((_req: Request, res: Response) => { res.status(404).json({ error: "NOT_FOUND" }); });

    // error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // error handler
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: any, _req: Request, res: any, _next: NextFunction) => {
        console.error("[api] error:", err);
        const status = Number(err?.status || 500);
        res.status(status).json({ error: err?.code || "INTERNAL_ERROR", message: err?.message || "Error" });
    });

    return app;
}
