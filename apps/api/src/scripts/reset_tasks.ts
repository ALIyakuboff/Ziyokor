import 'dotenv/config';
import { query, pool } from '../db';

async function resetData() {
    try {
        console.log("Deleting all tasks...");
        // task_comments will auto-delete due to CASCADE
        await query('DELETE FROM tasks');
        console.log("All tasks deleted successfully.");
    } catch (e) {
        console.error("Error deleting tasks:", e);
    } finally {
        await pool.end();
    }
}

resetData();
