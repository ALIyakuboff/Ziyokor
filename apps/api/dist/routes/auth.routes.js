"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const validate_1 = require("../utils/validate");
const auth_1 = require("../auth");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post("/login", async (req, res, next) => {
    try {
        const body = (0, validate_1.mustParse)(zod_1.z.object({
            phone_login: zod_1.z.string().min(3),
            password: zod_1.z.string().min(1)
        }), req.body);
        const user = await (0, auth_1.verifyPassword)(body.phone_login, body.password);
        if (!user)
            return res.status(401).json({ error: "INVALID_CREDENTIALS" });
        const token = (0, auth_1.signToken)(user);
        res.json({ token, user });
    }
    catch (e) {
        next(e);
    }
});
