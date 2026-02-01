import { Request, Response } from 'express';
import { closeDayJob } from '../../apps/api/src/cron/closeDay';

export default async function handler(req: Request, res: Response) {
    // Verify cron secret for security
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('[cron] Running closeDay job...');
        await closeDayJob();
        console.log('[cron] closeDay job completed successfully');
        return res.status(200).json({ success: true, message: 'Day closed successfully' });
    } catch (error: any) {
        console.error('[cron] closeDay job failed:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
