import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { query } from "./db";
import { normalizePhoneDigits } from "./utils/phone";

export type Role = "admin" | "worker";

export type AuthedUser = {
    id: string;
    role: Role;
    full_name: string;
    phone_login: string;
};

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export function signToken(user: AuthedUser) {
    return jwt.sign(
        { sub: user.id, role: user.role, full_name: user.full_name, phone_login: user.phone_login },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );
}

export async function verifyPassword(phone_login: string, password: string) {
    const phone = normalizePhoneDigits(phone_login);
    const r = await query<{ id: string; password_hash: string; role: Role; full_name: string; phone_login: string; is_active: boolean }>(
        "SELECT id, password_hash, role, full_name, phone_login, is_active FROM users WHERE phone_login=$1 LIMIT 1",
        [phone]
    );
    if (!r.rows.length) return null;
    const u = r.rows[0];
    if (!u.is_active) return null;

    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return null;

    const user: AuthedUser = {
        id: u.id,
        role: u.role,
        full_name: u.full_name,
        phone_login: u.phone_login
    };
    return user;
}

export function authRequired(req: any, res: any, next: any) {
    const h = req.headers.authorization || "";
    const token = h.startsWith("Bearer ") ? h.slice(7) : "";
    if (!token) {
        res.status(401).json({ error: "UNAUTHORIZED" });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = {
            id: payload.sub,
            role: payload.role,
            full_name: payload.full_name,
            phone_login: payload.phone_login
        } satisfies AuthedUser;
        next();
    } catch {
        return res.status(401).json({ error: "UNAUTHORIZED" });
    }
}

export function requireRole(role: Role) {
    return (req: any, res: any, next: any) => {
        const u = (req as any).user as AuthedUser | undefined;
        if (!u) return res.status(401).json({ error: "UNAUTHORIZED" });
        if (u.role !== role) return res.status(403).json({ error: "FORBIDDEN" });
        next();
    };
}
