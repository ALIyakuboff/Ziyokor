import "../env";
import { pool } from "../db";

async function run() {
    try {
        console.log("Running schema repair...");

        const queries = [
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_project BOOLEAN NOT NULL DEFAULT FALSE;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS template_id UUID NULL REFERENCES mandatory_task_templates(id) ON DELETE SET NULL;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS one_off_by_admin BOOLEAN NOT NULL DEFAULT FALSE;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_carryover BOOLEAN NOT NULL DEFAULT FALSE;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS carryover_from_date DATE NULL;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ NULL;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ NULL;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed_date DATE NULL;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by TEXT NOT NULL DEFAULT 'worker';`, // Removed CHECK for simplicity in migration
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by_id UUID NULL REFERENCES users(id) ON DELETE SET NULL;`,
            `ALTER TABLE tasks ADD COLUMN IF NOT EXISTS deleted_by_id UUID NULL REFERENCES users(id) ON DELETE SET NULL;`
        ];

        for (const q of queries) {
            try {
                await pool.query(q);
                console.log("Executed:", q);
            } catch (err: any) {
                console.warn("Query failed (might be fine):", q, err.message);
            }
        }

        console.log("Schema repair complete.");
    } catch (e) {
        console.error("Migration fatal error:", e);
    } finally {
        await pool.end();
    }
}

run();
