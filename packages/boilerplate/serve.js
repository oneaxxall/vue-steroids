#!/usr/bin/env node

/**
 * serve.js — Static file server untuk development
 * 
 * Melayani file statis dari direktori boilerplate.
 * Halaman utama: index.html
 * Port default: 8000
 * 
 * Usage:
 *   node serve.js              (Port 8000)
 *   node serve.js 3000         (Port 3000)
 *   node serve.js 3000 ./public (Port 3000, root ./public)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2] || '8000', 10);
const ROOT = path.resolve(process.argv[3] || __dirname);

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

const server = http.createServer((req, res) => {
    let url = req.url.split('?')[0];

    // Default ke index.html
    if (url === '/') url = '/index.html';

    const filePath = path.join(ROOT, url);

    // Security: prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();

    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // SPA fallback: jika file tidak ditemukan, kembalikan index.html
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
