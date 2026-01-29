import dotenv from "dotenv";
import { resolve } from "path";

// Load .env relative to this script's location
dotenv.config({ path: resolve(__dirname, "../../.env") });

import { query, pool } from "../db";

async function run() {
    console.log("Applying migration: Add is_mandatory to mandatory_task_templates");
    if (!process.env.DATABASE_URL) {
        console.error("ERROR: DATABASE_URL not found in .env");
        process.exit(1);
    }

    try {
        await query(`
            ALTER TABLE mandatory_task_templates 
            ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT TRUE;
        `);
        console.log("Migration SUCCESS");
        await pool.end();
        process.exit(0);
    } catch (e: any) {
        console.error("Migration FAILED:", e.message);
        await pool.end();
        process.exit(1);
    }
}

run();
