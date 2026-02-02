"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const envPath = path_1.default.resolve(process.cwd(), ".env");
dotenv_1.default.config({ path: envPath });
if (!process.env.DATABASE_URL) {
    // Fallback: search up a level if not found (sometimes turbo runs from a slightly different context)
    dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), "..", ".env") });
}
console.log("[env] DATABASE_URL loaded:", !!process.env.DATABASE_URL);
