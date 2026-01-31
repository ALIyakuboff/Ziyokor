import { pool } from "../db";

async function run() {
    try {
        console.log("Running migration...");
        await pool.query("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_project BOOLEAN NOT NULL DEFAULT FALSE;");
        console.log("Migration successful: added is_project column.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await pool.end();
    }
}

run();
