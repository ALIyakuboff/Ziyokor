
import "../src/env";
import { query, pool } from "../src/db";

async function verifyBlock() {
    const phone = "998934040902";
    console.log(`Verifying block for user ${phone}...`);

    try {
        const res = await query(
            "SELECT id, full_name, is_active FROM users WHERE phone_login = $1",
            [phone]
        );

        if (res.rowCount === 0) {
            console.log(`User ${phone} not found.`);
        } else {
            const user = res.rows[0];
            console.log(`User: ${user.full_name}, is_active: ${user.is_active}`);
            if (user.is_active === false) {
                console.log("SUCCESS: User is blocked.");
            } else {
                console.log("FAILURE: User is NOT blocked.");
            }
        }
    } catch (e) {
        console.error("Error verifying block:", e);
    } finally {
        await pool.end();
        process.exit(0);
    }
}

verifyBlock();
