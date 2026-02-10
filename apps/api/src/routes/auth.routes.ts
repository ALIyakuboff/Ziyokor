import { Router } from "express";
import { z } from "zod";
import { mustParse } from "../utils/validate";
import { signToken, verifyPassword } from "../auth";

export const authRouter = Router();

authRouter.post("/login", async (req: any, res: any, next: any) => {
    try {
        const body = mustParse(
            z.object({
                phone_login: z.string().min(3),
                password: z.string().min(1)
            }),
            req.body
        );

        const user = await verifyPassword(body.phone_login, body.password);
        if (!user) return res.status(401).json({ error: "INVALID_CREDENTIALS" });

        // Explicit check for active status (although verifyPassword does it, double safety for explicit error)
        const dbUser = await import("../db").then(m => m.query("SELECT is_active FROM users WHERE id=$1", [user.id]));
        if (dbUser.rows.length && !dbUser.rows[0].is_active) {
            return res.status(403).json({ error: "ACCOUNT_DISABLED" });
        }

        const token = signToken(user);
        res.json({ token, user });
    } catch (e) {
        next(e);
    }
});
