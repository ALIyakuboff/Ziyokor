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

        const token = signToken(user);
        res.json({ token, user });
    } catch (e) {
        next(e);
    }
});
