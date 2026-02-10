
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load .env
const envPath = path.resolve(__dirname, "../../.env");
const localEnvPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: localEnvPath });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("neon") ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        const phone = "998934040902";
        console.log(`Deactivating user with phone ${phone}...`);

        const res = await pool.query(
            "UPDATE users SET is_active=false, phone_login=$1 || '_deactivated_' || to_char(now(), 'YYYYMMDDHH24MISS'), role='worker' WHERE phone_login=$1 RETURNING id",
            [phone]
        );

        if (res.rowCount > 0) {
            console.log(`User ${phone} deactivated and phone number changed.`);
        } else {
            console.log("User not found.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

run();
