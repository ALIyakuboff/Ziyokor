process.env.TZ = "Asia/Tashkent";
import dotenv from "dotenv";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
    // Fallback: search up a level if not found (sometimes turbo runs from a slightly different context)
    dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });
}

console.log("[env] DATABASE_URL loaded:", !!process.env.DATABASE_URL);
