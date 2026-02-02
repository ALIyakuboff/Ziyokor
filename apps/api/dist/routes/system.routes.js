"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.systemRouter = void 0;
exports.startCrons = startCrons;
const express_1 = require("express");
const node_cron_1 = __importDefault(require("node-cron"));
const auth_1 = require("../auth");
const closeDay_1 = require("../cron/closeDay");
const generateMandatory_1 = require("../cron/generateMandatory");
const purge3Months_1 = require("../cron/purge3Months");
const date_1 = require("../utils/date");
exports.systemRouter = (0, express_1.Router)();
// Manual trigger endpoints (admin only)
exports.systemRouter.use(auth_1.authRequired, (0, auth_1.requireRole)("admin"));
exports.systemRouter.post("/jobs/generate-mandatory", async (req, res, next) => {
    try {
        const date = req.query.date || (0, date_1.todayISO)();
        await (0, generateMandatory_1.generateMandatoryJob)(date);
        res.json({ ok: true, date });
    }
    catch (e) {
        next(e);
    }
});
exports.systemRouter.post("/jobs/close-day", async (req, res, next) => {
    try {
        const date = req.query.date || (0, date_1.todayISO)();
        await (0, closeDay_1.closeDayJob)(date);
        res.json({ ok: true, date });
    }
    catch (e) {
        next(e);
    }
});
exports.systemRouter.post("/jobs/purge-3months", async (_req, res, next) => {
    try {
        const result = await (0, purge3Months_1.purge3MonthsJob)();
        res.json({ ok: true, result });
    }
    catch (e) {
        next(e);
    }
});
// ---- Cron runner (called from main.ts) ----
let started = false;
function startCrons() {
    if (started)
        return;
    started = true;
    // 08:00 generate mandatory tasks
    node_cron_1.default.schedule("0 8 * * *", async () => {
        const date = (0, date_1.todayISO)();
        await (0, generateMandatory_1.generateMandatoryJob)(date);
    }, { timezone: date_1.APP_TZ });
    // 23:55 close day
    node_cron_1.default.schedule("55 23 * * *", async () => {
        const date = (0, date_1.todayISO)();
        await (0, closeDay_1.closeDayJob)(date);
    }, { timezone: date_1.APP_TZ });
    // 02:10 purge data older than 3 months
    node_cron_1.default.schedule("10 2 * * *", async () => {
        await (0, purge3Months_1.purge3MonthsJob)();
    }, { timezone: date_1.APP_TZ });
    console.log(`[cron] started (TZ=${date_1.APP_TZ})`);
}
