import { query } from './apps/api/src/db';
import bcrypt from 'bcryptjs';

async function run() {
    const full_name = 'Vali Aliyev';
    const phone = '998901234567';
    const pwd = phone.slice(-4); // last 4 digits: 4567

    try {
        console.log(`Adding worker: ${full_name} (${phone})`);
        const hash = await bcrypt.hash(pwd, 10);

        const exists = await query('SELECT id FROM users WHERE phone_login=$1 LIMIT 1', [phone]);
        if (exists.rows.length) {
            console.log('User already exists.');
            process.exit(0);
        }

        await query(
            `INSERT INTO users(full_name, phone_login, password_hash, role, is_active)
             VALUES($1, $2, $3, 'worker', true)`,
            [full_name, phone, hash]
        );

        console.log(`Worker created successfully. Password: ${pwd}`);
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

run();
