
import "../src/env";
import { signToken } from "../src/auth";
import { authRequired } from "../src/auth";

async function testAuth() {
    console.log("Testing auth block...");

    // Mock user (we know this ID exists and is blocked from previous steps)
    // ID from previous output: c231c1a9-28b1-49c6-800f-0e2fdf4adb50
    const blockedUser = {
        id: "c231c1a9-28b1-49c6-800f-0e2fdf4adb50",
        role: "admin" as const,
        full_name: "Admin",
        phone_login: "998934040902"
    };

    const token = signToken(blockedUser);
    console.log("Generated token for blocked user.");

    // Mock Express Request/Response
    const req = {
        headers: {
            authorization: `Bearer ${token}`
        }
    };

    const res = {
        status: (code: number) => {
            console.log(`Response Status: ${code}`);
            return {
                json: (body: any) => {
                    console.log("Response Body:", body);
                }
            };
        }
    };

    const next = () => {
        console.log("FAILURE: next() was called - User was NOT blocked!");
    };

    try {
        await authRequired(req, res, next);
    } catch (e) {
        console.error("Error during auth check:", e);
    }

    // allow async operations to complete
    setTimeout(() => process.exit(0), 1000);
}

testAuth();
