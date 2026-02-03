import fs from "fs";
import path from "path";
import { Pool, types } from "pg";
import bcrypt from "bcryptjs";
import { normalizePhoneDigits, last4Digits } from "./utils/phone";

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
        path.join(__dirname, "sql", "schema.sql"), // Standard relative
        path.join(process.cwd(), "apps", "api", "src", "sql", "schema.sql"), // Local dev / Mono root
        path.join(process.cwd(), "api", "src", "sql", "schema.sql"), // Post-dist structure
        path.join(process.cwd(), "sql", "schema.sql"), // Flat structure
        path.join(__dirname, "..", "src", "sql", "schema.sql"), // Another relative
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

    // ONE-TIME CLEANUP for hidden duplicate phone
    try {
        const cleanupPhone = "998905970105";
        const delRes = await query("DELETE FROM users WHERE phone_login = $1", [cleanupPhone]);
        if (delRes.rowCount && delRes.rowCount > 0) {
            console.log(`[db] CLEANUP: Deleted ${delRes.rowCount} user(s) with phone ${cleanupPhone}`);
        }
    } catch (err) {
        console.error("[db] cleanup error:", err);
    }

    await ensureDefaultAdmin();
}

export async function ensureDefaultAdmin() {
    const name = process.env.ADMIN_NAME || "Admin";
    const phone = normalizePhoneDigits(process.env.ADMIN_PHONE || "");
    if (!phone) {
        console.warn("[db] ADMIN_PHONE not set, default admin not created");
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
