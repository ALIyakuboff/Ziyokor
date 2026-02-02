"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signToken = signToken;
exports.verifyPassword = verifyPassword;
exports.authRequired = authRequired;
exports.requireRole = requireRole;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./db");
const phone_1 = require("./utils/phone");
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
function signToken(user) {
    return jsonwebtoken_1.default.sign({ sub: user.id, role: user.role, full_name: user.full_name, phone_login: user.phone_login }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}
async function verifyPassword(phone_login, password) {
    const phone = (0, phone_1.normalizePhoneDigits)(phone_login);
    const r = await (0, db_1.query)("SELECT id, password_hash, role, full_name, phone_login, is_active FROM users WHERE phone_login=$1 LIMIT 1", [phone]);
    if (!r.rows.length)
        return null;
    const u = r.rows[0];
    if (!u.is_active)
        return null;
    const ok = await bcryptjs_1.default.compare(password, u.password_hash);
    if (!ok)
        return null;
    const user = {
        id: u.id,
        role: u.role,
        full_name: u.full_name,
        phone_login: u.phone_login
    };
    return user;
}
function authRequired(req, res, next) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) {
        res.status(401).json({ error: "UNAUTHORIZED" });
        return;
    }
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            id: payload.sub,
            role: payload.role,
            full_name: payload.full_name,
            phone_login: payload.phone_login
        };
        next();
    }
    catch {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }
}
function requireRole(role) {
    return (req, res, next) => {
        const u = req.user;
        if (!u)
            return res.status(401).json({ error: "UNAUTHORIZED" });
        if (u.role !== role)
            return res.status(403).json({ error: "FORBIDDEN" });
        next();
    };
}
