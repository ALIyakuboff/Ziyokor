"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../db");
async function resetData() {
    try {
        console.log("Deleting all tasks...");
        // task_comments will auto-delete due to CASCADE
        await (0, db_1.query)('DELETE FROM tasks');
        console.log("All tasks deleted successfully.");
    }
    catch (e) {
        console.error("Error deleting tasks:", e);
    }
    finally {
        await db_1.pool.end();
    }
}
resetData();
