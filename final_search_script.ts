import { query } from './apps/api/src/db';

async function run() {
    try {
        const phone = '998905970105';
        const r = await query('SELECT id, full_name, phone_login, role, is_active FROM users WHERE phone_login = $1', [phone]);
        console.log(`EXACT MATCH for ${phone}:`, JSON.stringify(r.rows, null, 2));

        const partial = phone.slice(-9); // last 9 digits
        const r2 = await query('SELECT id, full_name, phone_login, role, is_active FROM users WHERE phone_login LIKE $1', [`%${partial}%`]);
        console.log(`PARTIAL MATCH for ${partial}:`, JSON.stringify(r2.rows, null, 2));

        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

run();
