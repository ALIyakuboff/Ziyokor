import { query } from './apps/api/src/db';

async function run() {
    try {
        const phone = '905970105';
        const r = await query('SELECT id, full_name, phone_login, is_active FROM users WHERE phone_login LIKE $1', [`%${phone}%`]);
        console.log(`Results for phone containing ${phone}:`, JSON.stringify(r.rows, null, 2));

        const r2 = await query('SELECT id, full_name, phone_login, is_active FROM users WHERE is_active = false');
        console.log('All inactive users:', JSON.stringify(r2.rows, null, 2));

        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

run();
