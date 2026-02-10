
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import bcrypt from "bcryptjs";

// Load .env
const localEnvPath = path.resolve(__dirname, "../.env");
dotenv.config({ path: localEnvPath });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes("neon") ? { rejectUnauthorized: false } : false
});

async function run() {
    try {
        const phone = "998941234567";
        const password = "4567";
        const name = "Admin";

        console.log(`Ensuring admin ${phone} exists...`);

        const pwdHash = await bcrypt.hash(password, 10);

        // Check if exists
        const res = await pool.query("SELECT id FROM users WHERE phone_login=$1", [phone]);

        if (res.rowCount > 0) {
            console.log("Admin exists, updating password and role...");
            await pool.query(
                "UPDATE users SET password_hash=$1, role='admin', is_active=true, full_name=$2 WHERE phone_login=$3",
                [pwdHash, name, phone]
            );
            console.log("Admin updated.");
        } else {
            console.log("Admin does not exist, creating...");
            await pool.query(
                "INSERT INTO users (full_name, phone_login, password_hash, role, is_active) VALUES ($1, $2, $3, 'admin', true)",
                [name, phone, pwdHash]
            );
            console.log("Admin created.");
        }

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await pool.end();
    }
}

run();
