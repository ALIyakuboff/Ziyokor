import type { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
    res.status(200).json({
        ok: true,
        message: "Vercel Function is working!",
        env: {
            NODE_ENV: process.env.NODE_ENV,
            HAS_DB: !!process.env.DATABASE_URL
        },
        query: req.query
    });
}
