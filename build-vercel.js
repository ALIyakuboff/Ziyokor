const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Custom Vercel Build...');

const appDir = path.join(__dirname, 'apps', 'web-portal');
const sourceDist = path.join(appDir, 'dist');
const targetDist = path.join(__dirname, 'dist');

try {
    // 1. Install Dependencies
    console.log('📦 Installing dependencies...');
    // We assume pnpm install is run by Vercel's installCommand, but we can run a specific one for the app if needed.
    // Given previous logs, install seems fine.

    // 2. Build the Web Portal
    console.log('🛠️ Building Web Portal...');
    // We use the local vite binary to ensure we use the installed version
    const viteBin = path.join(appDir, 'node_modules', '.bin', 'vite');
    // Fallback to npx if local binary not found (though it should be there because we moved vite to dependencies)
    const buildCmd = `cd "${appDir}" && npm run build`;

    console.log(`> Running: ${buildCmd}`);
    execSync(buildCmd, { stdio: 'inherit', shell: true });

    // 3. Verify Output
    if (!fs.existsSync(sourceDist)) {
        console.error('❌ Error: Build successful but "dist" folder not found in apps/web-portal!');
        console.log('Contents of apps/web-portal:');
        fs.readdirSync(appDir).forEach(file => console.log(` - ${file}`));
        process.exit(1);
    }

    console.log('✅ Build output found.');

    // 4. Move to Root Dist
    console.log('🚚 Moving artifacts to verified Root Output Directory...');

    // Clean target
    if (fs.existsSync(targetDist)) {
        fs.rmSync(targetDist, { recursive: true, force: true });
    }

    // Move (Rename)
    // On some systems renaming across devices/partitions fails, so we try rename, fallback to cp
    try {
        fs.renameSync(sourceDist, targetDist);
    } catch (err) {
        console.log('⚠️ Rename failed, trying copy...', err.message);
        fs.cpSync(sourceDist, targetDist, { recursive: true });
    }

    // 5. Final Verification
    if (fs.existsSync(targetDist) && fs.readdirSync(targetDist).length > 0) {
        console.log('🎉 Success! Files are in root/dist.');
        console.log('Contents:', fs.readdirSync(targetDist));
    } else {
        console.error('❌ Error: Root dist is empty or missing!');
        process.exit(1);
    }

} catch (error) {
    console.error('🔥 Build Script Failed:', error.message);
    process.exit(1);
}
