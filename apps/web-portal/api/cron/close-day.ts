import { closeDayJob } from "../../../api/src/cron/closeDay";

export default async function handler(req: any, res: any) {
    // Verify cron secret for security
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('[cron] Running closeDay job (via portal)...');
        const { DateTime } = require('luxon');
        const today = DateTime.now().setZone('Asia/Tashkent').toISODate();
        await closeDayJob(today);
        console.log('[cron] job completed successfully for', today);
        return res.status(200).json({ success: true, message: 'Day closed', date: today });
    } catch (error: any) {
        console.error('[cron] job failed:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
