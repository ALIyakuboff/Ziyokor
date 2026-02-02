"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.initDbIfNeeded = initDbIfNeeded;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const phone_1 = require("./utils/phone");
// Force DATE (1082) to be returned as string "YYYY-MM-DD"
pg_1.types.setTypeParser(1082, (str) => str);
// Parse BIGINT as int (safe for our IDs, but be careful with huge numbers)
// 20 = BIGINT (int8)
pg_1.types.setTypeParser(20, (str) => parseInt(str, 10));
console.log("[db] Connecting to:", process.env.DATABASE_URL?.split("@")[1] || "unknown host");
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === "production" || process.env.DATABASE_URL?.includes("supabase") || process.env.DATABASE_URL?.includes("neon")
        ? { rejectUnauthorized: false }
        : false
});
async function query(text, params) {
    try {
        return await exports.pool.query(text, params);
    }
    catch (e) {
        console.error("[db] query error:", e.message);
        throw e;
    }
}
async function initDbIfNeeded() {
    const autoInit = (process.env.DB_AUTO_INIT || "").toLowerCase() === "true";
    if (!autoInit)
        return;
    // Apply schema
    const schemaPath = path_1.default.join(__dirname, "sql", "schema.sql");
    // When compiled to dist, schema will not be there unless copied.
    // In dev, we run from src. So also try src path fallback.
    const srcSchemaPath = path_1.default.join(process.cwd(), "apps", "api", "src", "sql", "schema.sql");
    const p = fs_1.default.existsSync(schemaPath) ? schemaPath : srcSchemaPath;
    if (!fs_1.default.existsSync(p)) {
        console.warn("[db] schema.sql not found, skipping auto init");
        return;
    }
    const sql = fs_1.default.readFileSync(p, "utf8");
    await exports.pool.query(sql);
    console.log("[db] schema applied");
    await ensureDefaultAdmin();
}
async function ensureDefaultAdmin() {
    const name = process.env.ADMIN_NAME || "Admin";
    const phone = (0, phone_1.normalizePhoneDigits)(process.env.ADMIN_PHONE || "");
    if (!phone) {
        console.warn("[db] ADMIN_PHONE not set, default admin not created");
        return;
    }
    const pwdRaw = (process.env.ADMIN_PASSWORD || "").trim() || (0, phone_1.last4Digits)(phone);
    const pwdHash = await bcryptjs_1.default.hash(pwdRaw, 10);
    const existing = await query("SELECT id FROM users WHERE phone_login=$1 LIMIT 1", [phone]);
    if (existing.rows.length) {
        console.log("[db] admin exists, ensuring is_active=true");
        // Ensure the admin is active and has the correct role
        await query("UPDATE users SET is_active=true, role='admin' WHERE phone_login=$1", [phone]);
        return;
    }
    await query(`INSERT INTO users (full_name, phone_login, password_hash, role, is_active)
     VALUES ($1,$2,$3,'admin',true)`, [name, phone, pwdHash]);
    console.log(`[db] default admin created (phone=${phone}, password=${pwdRaw})`);
}
