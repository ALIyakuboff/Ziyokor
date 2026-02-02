"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = require("path");
// Load .env relative to this script's location
dotenv_1.default.config({ path: (0, path_1.resolve)(__dirname, "../../.env") });
const db_1 = require("../db");
async function run() {
    console.log("Applying migration: Add is_mandatory to mandatory_task_templates");
    if (!process.env.DATABASE_URL) {
        console.error("ERROR: DATABASE_URL not found in .env");
        process.exit(1);
    }
    try {
        await (0, db_1.query)(`
            ALTER TABLE mandatory_task_templates 
            ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT TRUE;
        `);
        console.log("Migration SUCCESS");
        await db_1.pool.end();
        process.exit(0);
    }
    catch (e) {
        console.error("Migration FAILED:", e.message);
        await db_1.pool.end();
        process.exit(1);
    }
}
run();
