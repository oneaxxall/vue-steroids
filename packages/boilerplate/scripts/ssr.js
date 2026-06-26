/**
 * Vue Steroids - SSR Bundler Server
 * 
 * Server untuk menggabungkan (bundle) file .tpl menjadi satu JavaScript bundle.
 * Dipanggil oleh Vue Steroids core saat config.serverSide = true.
 * 
 * Alur:
 *   1. Client kirim POST /bundle dengan daftar path komponen
 *   2. Server baca file .tpl, parse script/template/style
 *   3. Generate JavaScript bundle dengan Vue.dynamicComponent()
 *   4. Client inject bundle → semua komponen terdaftar ✅
 * 
 * Usage:
 *   node ssr.js                     (Default: Path '.', Port 8485)
 *   node ssr.js 3000                (Custom port)
 *   node ssr.js ./src 8080          (Custom path & port)
 *   node ssr.js --no-cache          (Disable cache)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// =====================================================
// Configuration
// =====================================================

let PORT = 8485;
let COMPONENTS_BASE_PATH = '.';
let ENABLE_CACHE = true;

const args = process.argv.slice(2);
let portSet = false;
args.forEach((arg, i) => {
    if (arg === '--no-cache') {
        ENABLE_CACHE = false;
    } else if (arg === '--help' || arg === '-h') {
        console.log(`
Usage:
  node ssr.js                     Default: Path '.', Port 8485
  node ssr.js 3000                Custom port
  node ssr.js ./src 8080          Custom path & port
  node ssr.js --no-cache          Disable cache
  node ssr.js -h, --help          Show this help
`);
        process.exit(0);
    } else if (!isNaN(arg) && !portSet) {
        PORT = parseInt(arg);
        portSet = true;
    } else {
        COMPONENTS_BASE_PATH = arg;
    }
});

// =====================================================
// Cache System
// =====================================================

const bundleCache = new Map();
const CACHE_MAX_SIZE = 100;

function getCacheKey(components) {
    const hash = crypto.createHash('md5');
    components.sort().forEach(c => hash.update(c));
    return hash.digest('hex');
}

function getFromCache(key) {
    if (!ENABLE_CACHE) return null;
    const entry = bundleCache.get(key);
    if (entry && Date.now() - entry.timestamp < 60000) {
        return entry.bundle;
    }
    bundleCache.delete(key);
    return null;
}

function setCache(key, bundle) {
    if (!ENABLE_CACHE) return;
    if (bundleCache.size >= CACHE_MAX_SIZE) {
        const firstKey = bundleCache.keys().next().value;
        bundleCache.delete(firstKey);
    }
    bundleCache.set(key, { bundle, timestamp: Date.now() });
}

// =====================================================
// .tpl File Parser
// =====================================================

function parseTpl(content) {
    const result = { script: '', template: '', loadingTemplate: '', style: '' };

    // Extract <script> with export default support
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) {
        let script = scriptMatch[1].trim();
        if (/\bexport\s+default\b/.test(script)) {
            script = script.replace(/\bexport\s+default\b/g, 'module.exports =');
            script = script
                .replace(/\bexport\s+const\b/g, 'const')
                .replace(/\bexport\s+let\b/g, 'let')
                .replace(/\bexport\s+var\b/g, 'var')
                .replace(/\bexport\s+function\b/g, 'function')
                .replace(/\bexport\s+class\b/g, 'class');
        }
        result.script = script;
    }

    const loadingMatch = content.match(/<template\s+[^>]*scope=["']loading["'][^>]*>([\s\S]*?)<\/template>/i);
    if (loadingMatch) {
        result.loadingTemplate = loadingMatch[1].trim();
        const start = content.indexOf(loadingMatch[0]);
        if (start !== -1) {
            content = content.slice(0, start) + content.slice(start + loadingMatch[0].length);
        }
    }

    const templateStartMatch = content.match(/<template[^>]*>/i);
    if (templateStartMatch) {
        const startIdx = templateStartMatch.index;
        const afterStart = content.slice(startIdx + templateStartMatch[0].length);
        let depth = 1;
        const tagRegex = /<\/?template[^>]*>/gi;
        let match;
        while ((match = tagRegex.exec(afterStart)) !== null) {
            if (match[0].toLowerCase().startsWith('</template')) {
                depth--;
            } else {
                depth++;
            }
            if (depth === 0) {
                result.template = afterStart.slice(0, match.index).trim();
                break;
            }
        }
    }

    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) result.style = styleMatch[1].trim();

    return result;
}

function minifyText(text) {
    if (!text) return '';
    return text.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').replace(/>\s+</g, '><').trim();
}

function minifyJS(code) {
    if (!code) return '';
    return code.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('//')).join('\n');
}

function generateBundle(components) {
    let output = '/* PDS Vue Steroids - SSR Bundle */\n';
    let loaded = 0, failed = 0;

    components.forEach(relPath => {
        const normalizedRelPath = relPath.startsWith('/') ? relPath.slice(1) : relPath;
        const fileName = normalizedRelPath.endsWith('.tpl') ? normalizedRelPath : normalizedRelPath + '.tpl';
        const fullPath = path.resolve(process.cwd(), COMPONENTS_BASE_PATH, fileName);
        const componentName = path.basename(relPath).replace(/\.(tpl|vue|html)$/, '');

        if (!fs.existsSync(fullPath)) {
            console.warn('  \u26A0\uFE0F  File not found: ' + fullPath);
            failed++;
            return;
        }

        try {
            const content = fs.readFileSync(fullPath, 'utf8');
            const parsed = parseTpl(content);

            output += '\n/* --- Component: ' + componentName + ' --- */\n';
            output += "Vue.dynamicComponent('" + componentName + "', (function(){\n";
            output += '  var module = { exports: {} };\n';
            output += '  var exports = module.exports;\n';
            output += '  ' + (minifyJS(parsed.script) || 'module.exports = {};') + '\n';
            output += '  var def = module.exports || {};\n';

            if (parsed.template) {
                output += '  def.template = ' + JSON.stringify(minifyText(parsed.template)) + ';\n';
            }
            if (parsed.loadingTemplate) {
                output += '  def.loadingTemplate = ' + JSON.stringify(minifyText(parsed.loadingTemplate)) + ';\n';
            }
            if (parsed.style) {
                output += '  (function(){\n';
                output += "    var id = 'style-" + componentName + "';\n";
                output += "    if(!document.getElementById(id)){\n";
                output += "      var s = document.createElement('style');\n";
                output += '      s.id = id;\n';
                output += '      s.textContent = ' + JSON.stringify(minifyText(parsed.style)) + ';\n';
                output += '      document.head.appendChild(s);\n';
                output += '    }\n';
                output += '  })();\n';
            }

            output += '  return def;\n';
            output += '})());\n';
            loaded++;
            console.log('  \u2705 ' + componentName);
        } catch (err) {
            console.error('  \u274C Error processing ' + componentName + ': ' + err.message);
            failed++;
        }
    });

    return { output, loaded, failed };
}

// =====================================================
// HTTP Server
// =====================================================

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/bundle') {
        handleBundleRequest(req, res);
    } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            port: PORT,
            basePath: path.resolve(COMPONENTS_BASE_PATH),
            cache: { enabled: ENABLE_CACHE, size: bundleCache.size, maxSize: CACHE_MAX_SIZE }
        }));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found', endpoints: ['POST /bundle', 'GET /health'] }));
    }
});

function handleBundleRequest(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
        try {
            const { components } = JSON.parse(body);
            if (!Array.isArray(components)) throw new Error('Invalid payload: "components" must be an array');
            if (components.length === 0) {
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end('/* No components to bundle */');
                return;
            }

            console.log('\n\uD83D\uDCE6 Bundling ' + components.length + ' components...');

            const cacheKey = getCacheKey(components);
            const cached = getFromCache(cacheKey);
            if (cached) {
                console.log('  \uD83D\uDD25 Cache HIT! Returning cached bundle');
                res.writeHead(200, {
                    'Content-Type': 'application/javascript',
                    'X-Cache': 'HIT',
                    'X-Bundle-Count': components.length
                });
                res.end(cached);
                return;
            }

            const { output, loaded, failed } = generateBundle(components);
            setCache(cacheKey, output);

            const totalSize = (Buffer.byteLength(output, 'utf-8') / 1024).toFixed(1);
            console.log('  \uD83D\uDCCA ' + loaded + ' loaded, ' + failed + ' failed, ' + totalSize + ' KB');

            res.writeHead(200, {
                'Content-Type': 'application/javascript',
                'X-Cache': 'MISS',
                'X-Bundle-Count': components.length,
                'X-Bundle-Loaded': loaded,
                'X-Bundle-Failed': failed,
                'X-Bundle-Size': totalSize + ' KB'
            });
            res.end(output);
        } catch (err) {
            console.error('  \u274C Bundle error: ' + err.message);
            res.writeHead(400, { 'Content-Type': 'application/javascript' });
            res.end('console.error("SSR Bundler Error: ' + err.message.replace(/"/g, "'") + '");');
        }
    });
}

server.listen(PORT, () => {
    console.log('\n\uD83D\uDE80 PDS SSR Bundler Server v2');
    console.log('----------------------------------------');
    console.log('URL   : http://localhost:' + PORT + '/bundle');
    console.log('PATH  : ' + path.resolve(COMPONENTS_BASE_PATH));
    console.log('CACHE : ' + (ENABLE_CACHE ? 'Enabled (TTL: 60s, Max: ' + CACHE_MAX_SIZE + ')' : 'Disabled'));
    console.log('HEALTH: http://localhost:' + PORT + '/health');
    console.log('----------------------------------------\n');
});
