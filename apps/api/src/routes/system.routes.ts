import { Router } from "express";
import cron from "node-cron";
import { authRequired, requireRole } from "../auth";
import { closeDayJob } from "../cron/closeDay";
import { generateMandatoryJob } from "../cron/generateMandatory";
import { purge3MonthsJob } from "../cron/purge3Months";
import { APP_TZ, todayISO } from "../utils/date";

export const systemRouter = Router();

// Manual trigger endpoints (admin only)
systemRouter.use(authRequired, requireRole("admin"));

systemRouter.post("/jobs/generate-mandatory", async (req, res, next) => {
    try {
        const date = (req.query.date as string) || todayISO();
        await generateMandatoryJob(date);
        res.json({ ok: true, date });
    } catch (e) {
        next(e);
    }
});

systemRouter.post("/jobs/close-day", async (req, res, next) => {
    try {
        const date = (req.query.date as string) || todayISO();
        await closeDayJob(date);
        res.json({ ok: true, date });
    } catch (e) {
        next(e);
    }
});

systemRouter.post("/jobs/purge-3months", async (_req, res, next) => {
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
