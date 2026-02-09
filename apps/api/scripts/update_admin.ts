
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

// Load .env
const envPath = path.resolve(__dirname, "../../.env"); // Adjusted path to be relative to apps/api or root?
// apps/api/scripts/update_admin.ts -> ../../.env (if running from api root, seeing as .env is in apps/api based on ls earlier)
// Let's re-check ls output.
// apps/api/.env exists.
// So if I run from apps/api, and script is in apps/api/scripts, then path is ../.env

const localEnvPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: localEnvPath });

if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("neon") ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        const phone = "998941234567";
        const password = "4567";
        console.log(`Updating admin with phone ${phone}...`);

        const hash = await bcrypt.hash(password, 10);

        // Check if user exists
        const check = await pool.query("SELECT id FROM users WHERE phone_login=$1", [phone]);

        if (check.rows.length > 0) {
            console.log("User exists, updating...");
            await pool.query(
                "UPDATE users SET password_hash=$1, role='admin', is_active=true, full_name='Admin' WHERE phone_login=$2",
                [hash, phone]
            );
        } else {
            console.log("User does not exist, creating...");
            await pool.query(
                "INSERT INTO users (role, full_name, phone_login, password_hash, is_active) VALUES ('admin', 'Admin', $1, $2, true)",
                [phone, hash]
            );
        }

        console.log("Admin credentials updated successfully.");
        console.log(`Login: ${phone}`);
        console.log(`Password: ${password}`);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

run();
