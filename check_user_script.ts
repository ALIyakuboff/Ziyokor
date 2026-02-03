import { query } from './apps/api/src/db';

async function run() {
    try {
        const phone = '998905970105';
        const r = await query('SELECT id, full_name, phone_login, is_active FROM users WHERE phone_login = $1', [phone]);
        console.log('Results for phone 998905970105:', JSON.stringify(r.rows, null, 2));

        const r2 = await query('SELECT id, full_name, phone_login, is_active FROM users WHERE full_name ILIKE $1', ['%Mashrab%']);
        console.log('Results for name Mashrab:', JSON.stringify(r2.rows, null, 2));

        const r3 = await query('SELECT id, full_name, phone_login, is_active FROM users ORDER BY created_at DESC LIMIT 5');
        console.log('Latest 5 users:', JSON.stringify(r3.rows, null, 2));

        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

run();
