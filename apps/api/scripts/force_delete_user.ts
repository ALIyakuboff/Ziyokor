
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
        console.log(`Force deleting user with phone ${phone}...`);

        // First find the user
        const findRes = await pool.query("SELECT id FROM users WHERE phone_login=$1", [phone]);
        if (findRes.rowCount === 0) {
            console.log("User not found!");
            return;
        }
        const userId = findRes.rows[0].id;
        console.log(`User ID: ${userId}`);

        // Delete from DB (Cascade should handle related data)
        const delRes = await pool.query("DELETE FROM users WHERE id=$1", [userId]);

        console.log(`Deleted ${delRes.rowCount} user(s).`);

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

run();
