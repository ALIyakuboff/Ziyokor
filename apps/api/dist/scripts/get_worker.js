"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("../env");
const db_1 = require("../db");
async function run() {
    try {
        const res = await (0, db_1.query)("SELECT id, full_name, phone_login, role FROM users WHERE role='worker' LIMIT 1");
        if (res.rows.length) {
            console.log('WORKER:', JSON.stringify(res.rows[0]));
        }
        else {
            console.log('NO_WORKER_FOUND');
        }
    }
    catch (e) {
        console.error(e);
    }
    finally {
        process.exit();
    }
}
run();
