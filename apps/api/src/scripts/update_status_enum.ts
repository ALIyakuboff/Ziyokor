
import { query } from "../db";

async function run() {
    console.log("Updating tasks status check constraint...");
    // Drop the old constraint
    try {
        await query(`ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;`);
    } catch (e) {
        console.log("Error dropping constraint (might not exist):", e);
    }

    // Add new constraint including new statuses: 'problem', 'testing'
    // We keep 'pending', 'in_progress' (mapped to Started?), 'done', 'missed'
    // User asked for: Problem, Started, Testing, Done.
    // We should probably map 'Started' to 'in_progress' or add 'started'.
    // Let's add all requested: 'problem', 'started', 'testing'.
    // And keep existing: 'pending', 'in_progress', 'done', 'missed' to avoid breaking old data.
    await query(`
        ALTER TABLE tasks 
        ADD CONSTRAINT tasks_status_check 
        CHECK (status IN ('pending', 'in_progress', 'started', 'testing', 'problem', 'done', 'missed'));
    `);

    console.log("Constraint updated.");
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
