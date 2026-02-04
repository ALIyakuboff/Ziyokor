import { Router } from "express";
import { DateTime } from "luxon";
import cron from "node-cron";
import { authRequired, requireRole } from "../auth";
import { closeDayJob } from "../cron/closeDay";
import { generateMandatoryJob } from "../cron/generateMandatory";
import { purge3MonthsJob } from "../cron/purge3Months";
import { APP_TZ, todayISO } from "../utils/date";
import { initDbIfNeeded, query } from "../db";

export const systemRouter = Router();

// Manual trigger endpoints (admin only)
systemRouter.get("/health", async (_req, res) => {
    res.json({
        ok: true,
        now: DateTime.now().setZone(APP_TZ).toISO(),
        today: todayISO(),
        timezone: APP_TZ,
        env_tz: process.env.TZ,
        node_version: process.versions.node
    });
});

systemRouter.get("/closures", async (_req, res) => {
    try {
        const result = await query("SELECT * FROM day_closures ORDER BY date DESC LIMIT 20");
        res.json({ ok: true, closures: result.rows });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Public init endpoint (use with caution, or add a secret header check if needed)
systemRouter.post("/init-db", async (req: any, res: any) => {
    try {
        await initDbIfNeeded();
        // Also force admin check explicitly just in case env var is missing but we want to try
        // await ensureDefaultAdmin(); 
        res.json({ ok: true, message: "DB init triggered" });
    } catch (e: any) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Helper middleware for Vercel Crons or Admin
const cronOrAdmin = (req: any, res: any, next: any) => {
    const isCron = req.headers["x-vercel-cron"] === "1";
    if (isCron) return next();
    return requireRole("admin")(req, res, next);
};

systemRouter.post("/jobs/generate-mandatory", authRequired, cronOrAdmin, async (req: any, res: any, next: any) => {
    try {
        const date = (req.query.date as string) || todayISO();
        await generateMandatoryJob(date);
        res.json({ ok: true, date });
    } catch (e) {
        next(e);
    }
});

systemRouter.post("/jobs/close-day", authRequired, cronOrAdmin, async (req: any, res: any, next: any) => {
    try {
        const date = (req.query.date as string) || todayISO();
        await closeDayJob(date);
        res.json({ ok: true, date });
    } catch (e) {
        next(e);
    }
});

systemRouter.post("/jobs/purge-3months", authRequired, cronOrAdmin, async (_req: any, res: any, next: any) => {
    try {
        const result = await purge3MonthsJob();
        res.json({ ok: true, result });
    } catch (e) {
        next(e);
    }
});

// ---- Cron runner (called from main.ts) ----
let started = false;

export function startCrons() {
    if (started) return;
    started = true;

    // 08:00 generate mandatory tasks
    cron.schedule(
        "0 8 * * *",
        async () => {
            const date = todayISO();
            await generateMandatoryJob(date);
        },
        { timezone: APP_TZ }
    );

    // 23:55 close day
    cron.schedule(
        "55 23 * * *",
        async () => {
            const date = todayISO();
            await closeDayJob(date);
        },
        { timezone: APP_TZ }
    );

    // 02:10 purge data older than 3 months
    cron.schedule(
        "10 2 * * *",
        async () => {
            await purge3MonthsJob();
        },
        { timezone: APP_TZ }
    );

    console.log(`[cron] started (TZ=${APP_TZ})`);
}
