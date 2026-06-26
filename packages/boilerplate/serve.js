#!/usr/bin/env node

/**
 * serve.js — All-in-One Development Server
 * 
 * Menggabungkan static file server + HMR WebSocket + TailwindCSS watch
 * dalam satu perintah.
 * 
 * Features:
 *   - Static file server (localhost:8000)
 *   - SPA fallback ke index.html
 *   - HMR WebSocket server (localhost:8003)
 *   - TailwindCSS auto-watch + compile
 * 
 * Usage:
 *   node serve.js              (Port 8000 + HMR 8003 + Tailwind watch)
 *   node serve.js 3000         (Port 3000 + HMR 8003)
 *   node serve.js 3000 8004    (Port 3000 + HMR 8004)
 *   node serve.js --no-hmr     (Tanpa HMR)
 *   node serve.js --no-tailwind (Tanpa TailwindCSS)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// =====================================================
// Configuration
// =====================================================

const args = process.argv.slice(2);
const HTTP_PORT = parseInt(args.find(a => /^\d+$/.test(a)) || '8000', 10);
const HMR_PORT = parseInt(args.find(a => /^\d+$/.test(a) && a !== String(HTTP_PORT)) || '8003', 10);
const NO_HMR = args.includes('--no-hmr');
const NO_TAILWIND = args.includes('--no-tailwind');
const ROOT = path.resolve(__dirname);

// =====================================================
// MIME Types
// =====================================================

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.tff': 'font/tff',
    '.otf': 'font/otf',
    '.map': 'application/json',
    '.tpl': 'text/plain; charset=utf-8',
    '.vue': 'text/plain; charset=utf-8',
};

// =====================================================
// 1. HTTP Static File Server
// =====================================================

function startHttpServer(port) {
    const server = http.createServer((req, res) => {
        let url = req.url.split('?')[0];
        if (url === '/') url = '/index.html';

        const filePath = path.join(ROOT, url);

        if (!filePath.startsWith(ROOT)) {
            res.writeHead(403);
            res.end('Forbidden');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();

        fs.readFile(filePath, (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    const indexPath = path.join(ROOT, 'index.html');
                    fs.readFile(indexPath, (err2, data2) => {
                        if (err2) {
                            res.writeHead(404);
                            res.end('404 Not Found');
                            return;
                        }
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(data2);
                    });
                } else {
                    res.writeHead(500);
                    res.end('500 Internal Server Error');
                }
                return;
            }

            const mime = MIME_TYPES[ext] || 'application/octet-stream';
            res.writeHead(200, {
                'Content-Type': mime,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            });
            res.end(data);
        });
    });

    server.listen(port, () => {
        console.log(`   📄 HTTP  : http://localhost:${port}`);
    });

    return server;
}

// =====================================================
// 2. HMR WebSocket Server
// =====================================================

function startHmrServer(port) {
    if (NO_HMR) {
        console.log('   ⚡ HMR   : disabled (--no-hmr)');
        return null;
    }

    // Check if scripts/hmr.js exists
    const hmrPath = path.join(ROOT, 'scripts', 'hmr.js');
    if (!fs.existsSync(hmrPath)) {
        console.log('   ⚡ HMR   : scripts/hmr.js not found, skipping');
        return null;
    }

    const child = spawn('node', [hmrPath, String(port)], {
        cwd: ROOT,
        stdio: 'pipe',
        detached: false
    });

    child.stdout.on('data', (data) => {
        process.stdout.write(data.toString());
    });

    child.stderr.on('data', (data) => {
        process.stderr.write(data.toString());
    });

    child.on('error', (err) => {
        console.log('   ⚡ HMR   : failed to start:', err.message);
    });

    child.on('exit', (code) => {
        if (code !== 0 && code !== null) {
            console.log(`   ⚡ HMR   : exited with code ${code}`);
        }
    });

    return child;
}

// =====================================================
// 3. TailwindCSS Watcher
// =====================================================

function startTailwindWatcher() {
    if (NO_TAILWIND) {
        console.log('   🎨 TW    : disabled (--no-tailwind)');
        return null;
    }

    const inputCss = path.join(ROOT, 'public', 'css', 'input.css');
    const outputCss = path.join(ROOT, 'public', 'css', 'tailwind.css');

    if (!fs.existsSync(inputCss)) {
        console.log('   🎨 TW    : public/css/input.css not found, skipping');
        return null;
    }

    // Coba pakai postcss-cli, fallback ke npx
    const bin = fs.existsSync(path.join(ROOT, 'node_modules', '.bin', 'postcss'))
        ? path.join(ROOT, 'node_modules', '.bin', 'postcss')
        : 'npx postcss';

    const child = spawn(bin, [
        inputCss,
        '-o', outputCss,
        '--watch',
        '--verbose'
    ], {
        cwd: ROOT,
        stdio: 'pipe',
        detached: false
    });

    child.stdout.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) console.log(`   🎨 TW    : ${msg}`);
    });

    child.stderr.on('data', (data) => {
        const msg = data.toString().trim();
        if (msg) console.log(`   🎨 TW    : ${msg}`);
    });

    child.on('error', (err) => {
        console.log('   🎨 TW    : failed to start:', err.message);
    });

    child.on('exit', (code) => {
        if (code !== 0 && code !== null) {
            console.log(`   🎨 TW    : exited with code ${code}`);
        }
    });

    return child;
}

// =====================================================
// Main
// =====================================================

console.log('\n🚀 Vue Steroids Dev Server');
console.log('----------------------------------------');

// Start HTTP server
startHttpServer(HTTP_PORT);

// Start HMR
const hmrProcess = startHmrServer(HMR_PORT);

// Start TailwindCSS
const twProcess = startTailwindWatcher();

console.log(`   📁 Root  : ${ROOT}`);
console.log('----------------------------------------');
console.log('   Press Ctrl+C to stop all services\n');

// Graceful shutdown
function shutdown() {
    console.log('\n   Shutting down...');
    
    if (hmrProcess) {
        hmrProcess.kill('SIGTERM');
        setTimeout(() => hmrProcess.kill('SIGKILL'), 3000);
    }
    
    if (twProcess) {
        twProcess.kill('SIGTERM');
        setTimeout(() => twProcess.kill('SIGKILL'), 3000);
    }

    setTimeout(() => {
        process.exit(0);
    }, 1000);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
