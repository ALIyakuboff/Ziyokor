import path from "path";
import dotenv from "dotenv";
dotenv.config({ path: path.join(__dirname, "../../.env") });

// import "./src/env"; // Not needed if manual load
// Dynamic imports to ensure env is loaded first

async function main() {
    try {
        const { query, pool } = await import("../db");
        const { signToken } = await import("../auth");

        console.log("DB URL loaded:", !!process.env.DATABASE_URL);

        // 1. Get Admin User
        const res = await query("SELECT * FROM users WHERE role='admin' LIMIT 1");
        if (!res.rows.length) {
            console.error("No admin found");
            return;
        }
        const admin = res.rows[0];
        console.log("Admin found:", admin.phone_login);

        // 2. Generate Token
        const token = signToken(admin);
        console.log("Token generated");

        // 3. Call API
        const response = await fetch("http://localhost:8080/admin/workers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                full_name: "Test Worker",
                phone_login: "998991112233"
            })
        });

        const json = await response.json();
        console.log("Status:", response.status);
        console.log("Body:", JSON.stringify(json, null, 2));

        await pool.end();

    } catch (e) {
        console.error(e);
    }
}

main();
