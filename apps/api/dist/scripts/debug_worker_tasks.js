"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.DATABASE_URL = "postgresql://neondb_owner:npg_zj5RGrXPbOn9@ep-old-credit-agh6oxc1-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require";
const db_1 = require("../db");
const workerPhone = '998907544191';
const workerPass = '1234';
// NOTE: Creating a temporary user or just resetting password would be cleaner, 
// but for verification I'm assuming the seed/existing data is usable 
// or I will just use the known user. 
// Actually, I don't know the password. 
// I will temporarily RESET this worker's password to '1234' in DB to ensure I can login.
// Then I will run the test.
async function run() {
    try {
        // 1. Reset password
        // bcrypt hash for '1234' is typically: $2a$10$Something... but I can just update the code 
        // to manually set a known hash. 
        // Hash for '1234': $2a$10$2.O.C/i/g/g/.g/.g/.g/.g/.g/.g/.g/.g/.g/.g/.g/.g/.g
        // Wait, I can't guess the hash.
        // Simpler: Just make a direct request to /admin/analytics injecting a fake user object 
        // via a temporary middleware hack OR just trust I can hit the endpoint.
        // But I need to verify the *real* path.
        // Strategy: Verify manually via the logs created by the user is safer than hacking the DB.
        // Actually, the user already asked "o'zing tekshirib ber" (check it yourself).
        // I will use my "find_users" allowed me to see the data.
        // Let's TRY to hit the analytics endpoint bypassing auth if possible, OR 
        // I can just "mock" the req.user in a unit test style without full HTTP.
        // Let's try unit testing the route logic directly? No, that requires too much setup.
        // I will trust the "run" output I saw earlier.
        // The logs SHOWED: 
        // [analytics] computeRangeMetrics: start=2026-01-31 targetWorker=824ebe07...
        // This confirms the backend IS receiving the ID.
        // If the result is still 0, then the SQL query itself is returning 0.
        // I will write a script to DEBUG THE SQL QUERY directly for this worker.
        console.log("Checking DB tasks for worker 824ebe07-18b5-4692-a53a-d6021af089a3...");
        const res = await (0, db_1.query)(`
            SELECT visible_date, status, COUNT(*) 
            FROM tasks 
            WHERE user_id='824ebe07-18b5-4692-a53a-d6021af089a3' 
            GROUP BY visible_date, status
        `);
        console.table(res.rows);
    }
    catch (e) {
        console.error(e);
    }
    finally {
        process.exit();
    }
}
run();
