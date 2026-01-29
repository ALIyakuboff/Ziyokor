import "./env";
import { query } from "./db";

async function run() {
    try {
        console.log("Adding started_at column to tasks table...");
        await query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NULL");
        console.log("Success!");
        process.exit(0);
    } catch (e) {
        console.error("Failed:", e);
        process.exit(1);
    }
}

run();
