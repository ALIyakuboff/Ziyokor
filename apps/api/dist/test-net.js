"use strict";
async function test() {
    try {
        const res = await fetch('https://google.com');
        console.log('Public Internet Access:', res.ok);
    }
    catch (e) {
        console.error('No Internet Access for Node:', e.message);
    }
}
test();
