
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

// Load .env
const envPath = path.resolve(__dirname, ".env");
dotenv.config({ path: envPath });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("neon") ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        const phone = "998934040902";
        console.log(`Force activating admin with phone ${phone}...`);

        const res = await pool.query(
            "UPDATE users SET is_active=true, role='admin' WHERE phone_login=$1 RETURNING id",
            [phone]
        );

        if (res.rowCount > 0) {
            console.log("Admin activated successfully.");
        } else {
            console.log("Admin not found with this phone number. Please check credentials.");
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

run();
