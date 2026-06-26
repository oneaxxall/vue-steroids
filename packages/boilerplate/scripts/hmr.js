#!/usr/bin/env node

/**
 * PDS Vue Steroids - HMR Server
 * 
 * Hot Module Replacement WebSocket server untuk development.
 * Mendengarkan perubahan file dan mengirim event ke client.
 * 
 * Alur:
 *   1. Client connect ke WebSocket server
 *   2. Client kirim sinyal "watch" dengan daftar extensions
 *   3. Server mulai watch file dengan extensions tsb (chokidar)
 *   4. Saat file berubah → server kirim event ke client
 *   5. Client handle event (hot-reload komponen/style/script)
 * 
 * Usage:
 *   node scripts/hmr.js                  (Default: Port 8003)
 *   node scripts/hmr.js 8003             (Custom port)
 *   node scripts/hmr.js --port 8003      (Named argument)
 * 
 * Dependencies:
 *   npm install ws chokidar
 */

const WebSocket = require('ws');
const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs');

// =====================================================
// Configuration
// =====================================================

const PORT = parseInt(process.argv[2] || process.env.HMR_PORT || '8003', 10);
const HOST = process.env.HMR_HOST || '0.0.0.0';

// =====================================================
// HMR Server
// =====================================================

class HMRServer {
    constructor(options = {}) {
        this.port = options.port || PORT;
        this.host = options.host || HOST;
        this.wss = null;
        this.clients = new Map();  // clientId → { ws, extensions, watcher }
        this.clientIdCounter = 0;
    }

    /**
     * Start WebSocket server
     */
    start() {
        this.wss = new WebSocket.Server({
            host: this.host,
            port: this.port
        });

        console.log(`\n🚀 HMR Server started`);
        console.log(`   WebSocket: ws://${this.host}:${this.port}`);
        console.log(`   Waiting for client connections...\n`);

        this.wss.on('connection', (ws) => {
            const clientId = ++this.clientIdCounter;
            const clientInfo = { ws, extensions: [], watcher: null };
            this.clients.set(clientId, clientInfo);

            console.log(`[HMR] ✅ Client connected: #${clientId} (total: ${this.clients.size})`);

            // Kirim sinyal connected
            this.send(ws, { type: 'connected', clientId });

            ws.on('message', (raw) => {
                try {
                    const data = JSON.parse(raw.toString());
                    this.handleMessage(clientId, data);
                } catch (err) {
                    console.error(`[HMR] ❌ Invalid message from #${clientId}:`, err.message);
                    this.send(ws, { type: 'error', message: 'Invalid message format' });
                }
            });

            ws.on('close', () => {
                console.log(`[HMR] ❌ Client disconnected: #${clientId}`);
                this.cleanup(clientId);
            });

            ws.on('error', (err) => {
                console.error(`[HMR] ❌ Client error #${clientId}:`, err.message);
                this.cleanup(clientId);
            });
        });

        this.wss.on('error', (err) => {
            console.error(`[HMR] ❌ Server error:`, err.message);
        });
    }

    /**
     * Handle incoming message dari client
     */
    handleMessage(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        switch (data.type) {
            case 'watch':
                this.startWatching(clientId, data.extensions);
                break;

            case 'unwatch':
                this.stopWatching(clientId);
                break;

            case 'ping':
                this.send(client.ws, { type: 'pong', timestamp: Date.now() });
                break;

            default:
                console.log(`[HMR] Unknown message type from #${clientId}: ${data.type}`);
        }
    }

    /**
     * Start watching files sesuai extensions yang dikirim client
     * Client menentukan extensions apa yang di-watch (dari Vue.config.hmrFiles)
     */
    startWatching(clientId, extensions) {
        const client = this.clients.get(clientId);
        if (!client) return;

        // Hentikan watcher lama jika ada
        this.stopWatching(clientId);

        client.extensions = extensions || ['css', 'vue', 'tpl', 'js'];

        // Build pattern: **/*.{css,vue,tpl,js}
        const pattern = `**/*.{${client.extensions.join(',')}}`;

        // Root path: current working directory
        const rootPath = process.cwd();

        console.log(`[HMR] 👀 #${clientId} watching: ${pattern}`);
        console.log(`[HMR]    Root: ${rootPath}`);

        // Buat chokidar watcher
        const watcher = chokidar.watch(pattern, {
            cwd: rootPath,
            ignored: [
                /(^|[\/\\])node_modules[\/\\]/,
                /(^|[\/\\])dist[\/\\]/,
                /(^|[\/\\])\.(git|svn|hg)[\/\\]/,
                /(^|[\/\\])\.DS_Store/
            ],
            persistent: true,
            ignoreInitial: true,
            followSymlinks: false,
            awaitWriteFinish: {
                stabilityThreshold: 100,
                pollInterval: 50
            }
        });

        // Handler perubahan file
        watcher.on('change', (filePath) => {
            this.handleFileChange(clientId, filePath);
        });

        // Handler file baru
        watcher.on('add', (filePath) => {
            // Hanya kirim event untuk file yang baru ditambahkan
            // Biasanya tidak perlu hot-reload untuk file baru
            console.log(`[HMR] 📄 File added: ${filePath}`);
        });

        // Handler file dihapus
        watcher.on('unlink', (filePath) => {
            console.log(`[HMR] 🗑️  File removed: ${filePath}`);
            this.send(client.ws, {
                type: 'change',
                file: filePath,
                ext: path.extname(filePath).slice(1),
                content: null,
                timestamp: Date.now()
            });
        });

        // Error handler
        watcher.on('error', (error) => {
            console.error(`[HMR] ❌ Watcher error #${clientId}:`, error.message);
        });

        // Ready handler
        watcher.on('ready', () => {
            console.log(`[HMR] ✅ #${clientId} watcher ready`);
        });

        client.watcher = watcher;

        // Kirim konfirmasi ke client
        this.send(client.ws, {
            type: 'watch-start',
            extensions: client.extensions,
            root: rootPath,
            timestamp: Date.now()
        });
    }

    /**
     * Handle file change: kirim event ke client
     */
    handleFileChange(clientId, filePath) {
        const client = this.clients.get(clientId);
        if (!client || !client.ws) return;

        const ext = path.extname(filePath).slice(1).toLowerCase();

        // Baca konten file untuk tipe yang bisa hot-reload
        let content = null;
        if (['tpl', 'vue', 'css'].includes(ext)) {
            try {
                content = fs.readFileSync(filePath, 'utf-8');
            } catch (e) {
                // File mungkin sudah dihapus
                console.warn(`[HMR] ⚠️  Could not read file: ${filePath}`);
                return;
            }
        }

        // Kirim event ke client
        this.send(client.ws, {
            type: 'change',
            file: filePath,
            ext: ext,
            content: content,
            timestamp: Date.now()
        });

        console.log(`[HMR] 🔄 #${clientId} changed: ${filePath} (${ext})`);
        if (content) {
            const size = (Buffer.byteLength(content, 'utf-8') / 1024).toFixed(1);
            console.log(`[HMR]    Size: ${size} KB`);
        }
    }

    /**
     * Stop watching untuk client
     */
    stopWatching(clientId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        if (client.watcher) {
            client.watcher.close().then(() => {
                console.log(`[HMR] ⏹️  #${clientId} watcher stopped`);
            });
            client.watcher = null;
        }
    }

    /**
     * Cleanup saat client disconnect
     */
    cleanup(clientId) {
        this.stopWatching(clientId);
        this.clients.delete(clientId);
        console.log(`[HMR] 💨 #${clientId} cleaned up (remaining: ${this.clients.size})`);
    }

    /**
     * Kirim pesan ke client
     */
    send(ws, data) {
        try {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify(data));
            }
        } catch (err) {
            console.error('[HMR] Send error:', err.message);
        }
    }

    /**
     * Stop server
     */
    stop() {
        console.log('\n[HMR] Shutting down...');

        for (const [clientId] of this.clients) {
            this.cleanup(clientId);
        }

        if (this.wss) {
            this.wss.close(() => {
                console.log('[HMR] Server stopped');
            });
        }
    }
}

// =====================================================
// Main
// =====================================================

const server = new HMRServer();

// Graceful shutdown
process.on('SIGINT', () => {
    server.stop();
    process.exit(0);
});

process.on('SIGTERM', () => {
    server.stop();
    process.exit(0);
});

// Uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('[HMR] Uncaught exception:', err.message);
});

process.on('unhandledRejection', (reason) => {
    console.error('[HMR] Unhandled rejection:', reason);
});

// Start
server.start();
