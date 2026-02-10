
import "../src/env";
import { query, pool } from "../src/db";

async function blockUser() {
    const phone = "998934040902";
    console.log(`Blocking user with phone: ${phone}...`);

    try {
        const res = await query(
            "UPDATE users SET is_active = false WHERE phone_login = $1 RETURNING id, full_name, is_active",
            [phone]
        );

        if (res.rowCount === 0) {
            console.log(`User ${phone} not found.`);
        } else {
            console.log(`User ${phone} (ID: ${res.rows[0].id}, Name: ${res.rows[0].full_name}) has been blocked. is_active: ${res.rows[0].is_active}`);
        }
    } catch (e) {
        console.error("Error blocking user:", e);
    } finally {
        await pool.end();
    }
}

blockUser();
