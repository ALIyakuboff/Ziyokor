"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./env");
const db_1 = require("./db");
async function run() {
    try {
        console.log("Adding started_at column to tasks table...");
        await (0, db_1.query)("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NULL");
        console.log("Success!");
        process.exit(0);
    }
    catch (e) {
        console.error("Failed:", e);
        process.exit(1);
    }
}
run();
