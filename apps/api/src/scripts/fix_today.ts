import path from "path";
import dotenv from "dotenv";

const p = path.join(__dirname, "../../.env");
console.log("Loading .env from:", p);
const res = dotenv.config({ path: path.join(__dirname, "../../.env") });
if (res.error) console.error("Dotenv Error:", res.error);
console.log("DATABASE_URL loaded:", !!process.env.DATABASE_URL);

async function main() {
    try {
        const { query, pool } = await import("../db");
        // import "../env"; // Not needed if we loaded it manually

        const today = "2026-01-29";
        console.log("Fixing day:", today);

        // 1. Remove closure
        const del = await query("DELETE FROM day_closures WHERE date=$1", [today]);
        console.log("Deleted closure:", del.rowCount);

        // 2. Reset missed tasks to pending
        const up = await query(
            "UPDATE tasks SET status='pending' WHERE assigned_date=$1 AND status='missed'",
            [today]
        );
        console.log("Reset tasks to pending:", up.rowCount);

        await pool.end();

    } catch (e) {
        console.error(e);
    }
}

main();
