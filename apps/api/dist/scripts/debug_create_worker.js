"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, "../../.env") });
// import "./src/env"; // Not needed if manual load
// Dynamic imports to ensure env is loaded first
async function main() {
    try {
        const { query, pool } = await Promise.resolve().then(() => __importStar(require("../db")));
        const { signToken } = await Promise.resolve().then(() => __importStar(require("../auth")));
        console.log("DB URL loaded:", !!process.env.DATABASE_URL);
        // 1. Get Admin User
        const res = await query("SELECT * FROM users WHERE role='admin' LIMIT 1");
        if (!res.rows.length) {
            console.error("No admin found");
            return;
        }
        const admin = res.rows[0];
        console.log("Admin found:", admin.phone_login);
        // 2. Generate Token
        const token = signToken(admin);
        console.log("Token generated");
        // 3. Call API
        const response = await fetch("http://localhost:8080/admin/workers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                full_name: "Test Worker",
                phone_login: "998991112233"
            })
        });
        const json = await response.json();
        console.log("Status:", response.status);
        console.log("Body:", JSON.stringify(json, null, 2));
        await pool.end();
    }
    catch (e) {
        console.error(e);
    }
}
main();
