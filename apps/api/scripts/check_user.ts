
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load .env
const localEnvPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: localEnvPath });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("neon") ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        const phone = "998934040902";
        console.log(`Checking user with phone ${phone}...`);

        const res = await pool.query(
            "SELECT id, full_name, phone_login, role, is_active FROM users WHERE phone_login=$1",
            [phone]
        );

        if (res.rowCount > 0) {
            console.log("Found User:", res.rows[0]);
        } else {
            console.log("User NOT found.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

run();
