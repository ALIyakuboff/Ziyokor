"use strict";
async function run() {
    // Worker: 824ebe07-18b5-4692-a53a-d6021af089a3
    // But I need a token.
    // Actually, I can just check the ADMIN's view of this worker, since the issue is "mismatch".
    // If Admin sees 0% for this worker, then the issue is the query.
    // If Admin sees 100%, but Worker sees 0%, then it's a role issue.
    // Based on the user's screenshot, it was the WORKER VIEW that was 0%.
    // So I need to see what the worker API returns.
    // I can't easily get a worker token without password.
    // ALTERNATIVE: I will inspect the logs from the server.
    // The previous logs showed:
    // [analytics] computeRangeMetrics: start=2026-01-31 targetWorker=824ebe07...
    // I will assume the server is accessible at localhost:8080.
    // I'll try to hit a public endpoint to verify connectivity first.
    try {
        const res = await fetch('http://localhost:8080/health'); // or similar
        console.log('Server status:', res.status);
    }
    catch (e) {
        console.log('Server not reachable:', e.message);
    }
}
run();
