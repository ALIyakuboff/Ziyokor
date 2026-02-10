import fs from "fs";
import path from "path";
import { Pool, types } from "pg";
import bcrypt from "bcryptjs";
import { normalizePhoneDigits, last4Digits } from "../utils/phone";

// Force DATE (1082) to be returned as string "YYYY-MM-DD"
types.setTypeParser(1082, (str) => str);

// Parse BIGINT as int (safe for our IDs, but be careful with huge numbers)
// 20 = BIGINT (int8)
types.setTypeParser(20, (str: string) => parseInt(str, 10));

console.log("[db] Connecting to:", process.env.DATABASE_URL?.split("@")[1] || "unknown host");

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("supabase") || process.env.DATABASE_URL?.includes("neon")
        ? { rejectUnauthorized: false }
        : false
});

pool.on('connect', (client) => {
    client.query("SET timezone TO 'Asia/Tashkent'");
});

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> {
    try {
        return await pool.query(text, params) as any;
    } catch (e: any) {
        console.error("[db] query error:", e.message);
        throw e;
    }
}

export async function initDbIfNeeded() {
    const autoInit = (process.env.DB_AUTO_INIT || "").toLowerCase() === "true";
    if (!autoInit) return;

    // Apply schema
    const paths = [
        path.join(__dirname, "..", "sql", "schema.sql"), // Standard relative from src/db
        path.join(process.cwd(), "apps", "api", "src", "sql", "schema.sql"), // Local dev / Mono root
        path.join(process.cwd(), "api", "src", "sql", "schema.sql"), // Post-dist structure
        path.join(process.cwd(), "sql", "schema.sql"), // Flat structure
        path.join(__dirname, "..", "..", "src", "sql", "schema.sql"), // Another relative
    ];

    let p = "";
    for (const cand of paths) {
        if (fs.existsSync(cand)) {
            p = cand;
            break;
        }
    }

    if (!p) {
        console.warn("[db] schema.sql not found in any of:", paths);
        return;
    }

    console.log("[db] found schema at:", p);

    const sql = fs.readFileSync(p, "utf8");
    await pool.query(sql);
    console.log("[db] schema applied");

    // --- MIGRATIONS ---

    // 1. Aggressive Cleanup: Delete ANY duplicate/conflicting mandatory tasks 
    // This removes duplicates even if they were marked as "deleted" to allow index creation.
    try {
        console.log("[db] Aggressive Migration: Cleaning up ALL duplicate mandatory tasks...");
        const cleanupRes = await query(`
            DELETE FROM tasks
            WHERE id IN (
                SELECT id FROM (
                    SELECT id, row_number() OVER (PARTITION BY template_id, assigned_date ORDER BY created_at ASC) as rn
                    FROM tasks
                    WHERE template_id IS NOT NULL
                ) t
                WHERE t.rn > 1
            )
        `);
        console.log(`[db] Aggressive Migration: Deleted ${cleanupRes.rowCount || 0} duplicate tasks.`);
    } catch (err: any) {
        console.error("[db] Aggressive Migration cleanup error:", err.message);
    }

    // 2. Force Unique Index Creation
    try {
        console.log("[db] Aggressive Migration: Forcing Unique Index idx_tasks_tpl_assigned_unique...");
        // Drop any potential old versions first
        await query(`DROP INDEX IF EXISTS idx_tasks_template_assigned`);
        await query(`DROP INDEX IF EXISTS idx_tasks_tpl_assigned_unique`);

        await query(`
            CREATE UNIQUE INDEX idx_tasks_tpl_assigned_unique 
            ON tasks(template_id, assigned_date);
        `);
        console.log("[db] Aggressive Migration: Unique Index successfully created.");
    } catch (err: any) {
        console.error("[db] Aggressive Migration index error (CRITICAL 42P10):", err.message);
    }

    // 3. Update Status Constraint (Fix for 23514)
    try {
        console.log("[db] Migration: Updating tasks status constraint...");
        // valid statuses: pending, in_progress, done, missed, started, problem, testing

        // Try to drop the default named constraint. Postgres usually names it tasks_status_check
        await query(`ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check`);

        // Re-add with new values
        await query(`
            ALTER TABLE tasks 
            ADD CONSTRAINT tasks_status_check 
            CHECK (status IN ('pending','in_progress','done','missed','started','problem','testing'))
        `);
        console.log("[db] Migration: Status constraint updated successfully.");
    } catch (err: any) {
        console.error("[db] Migration status constraint error:", err.message);
    }

    // ONE-TIME CLEANUP for hidden duplicate phone
    // Cleanup block removed to prevent accidental user deletion

    await ensureDefaultAdmin();
}

export async function ensureDefaultAdmin() {
    const name = process.env.ADMIN_NAME || "Admin";
    const phone = normalizePhoneDigits(process.env.ADMIN_PHONE || "");
    if (!phone) {
        console.warn("[db] ADMIN_PHONE not set, default admin not created");
        return;
    }
    // EMERGENCY BLOCK: Do not recreate this specific old admin
    if (phone === "998934040902") {
        console.warn("[db] ADMIN_PHONE is blocked user 998934040902 - SKIPPING creation");
        return;
    }
    const pwdRaw = (process.env.ADMIN_PASSWORD || "").trim() || last4Digits(phone);
    const pwdHash = await bcrypt.hash(pwdRaw, 10);

    const existing = await query<{ id: string }>("SELECT id FROM users WHERE phone_login=$1 LIMIT 1", [phone]);
    if (existing.rows.length) {
        console.log("[db] admin exists, ensuring is_active=true");
        // Ensure the admin is active and has the correct role
        await query("UPDATE users SET is_active=true, role='admin' WHERE phone_login=$1", [phone]);
        return;
    }

    await query(
        `INSERT INTO users (full_name, phone_login, password_hash, role, is_active)
     VALUES ($1,$2,$3,'admin',true)`,
        [name, phone, pwdHash]
    );
    console.log(`[db] default admin created (phone=${phone}, password=${pwdRaw})`);
}
