/**
 * PDS Vue Steroids - SSR Bundler Server (POC)
 * Standalone server to bundle .tpl components into a single JS file.
 * 
 * Usage: 
 *   node ssr.js               (Default: Path '.', Port 8485)
 *   node ssr.js 3000          (Path '.', Port 3000)
 *   node ssr.js ./src 8080    (Path './src', Port 8080)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration with smart argument detection
let PORT = 8485;
let COMPONENTS_BASE_PATH = '.';

const arg1 = process.argv[2];
const arg2 = process.argv[3];

if (arg1) {
    if (!isNaN(arg1)) {
        // Jika argumen pertama adalah angka, jadikan PORT
        PORT = parseInt(arg1);
    } else {
        // Jika argumen pertama bukan angka, jadikan BASE_PATH
        COMPONENTS_BASE_PATH = arg1;
        if (arg2 && !isNaN(arg2)) {
            PORT = parseInt(arg2);
        }
    }
}

/**
 * Robustly parse .tpl file content (Replicates Core Steroids Logic)
 */
function parseTpl(content) {
    const result = {
        script: '',
        template: '',
        loadingTemplate: '',
        style: ''
    };

    // Extract <script>
    const scriptMatch = content.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    if (scriptMatch) result.script = scriptMatch[1].trim();

    // Extract <template scope="loading">
    const loadingMatch = content.match(/<template\s+[^>]*scope=["']loading["'][^>]*>([\s\S]*?)<\/template>/i);
    if (loadingMatch) {
        result.loadingTemplate = loadingMatch[1].trim();
        // Use a safer way to remove to avoid regex issues in content
        const start = content.indexOf(loadingMatch[0]);
        if (start !== -1) {
            content = content.slice(0, start) + content.slice(start + loadingMatch[0].length);
        }
    }

    // Extract <template> (Nested-safe)
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

    // Extract <style>
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    if (styleMatch) result.style = styleMatch[1].trim();

    return result;
}

/**
 * Basic minifier for HTML and CSS (Safe to remove all newlines)
 */
function minifyText(text) {
    if (!text) return '';
    return text
        .replace(/\r?\n|\r/g, ' ')  // Ganti baris baru dengan spasi
        .replace(/\s+/g, ' ')       // Satukan spasi ganda
        .replace(/>\s+</g, '><')    // Hapus spasi antar tag HTML
        .trim();
}

/**
 * Safe minifier for JavaScript
 * ONLY removes indentation and empty lines. Preserves newlines for ASI safety.
 */
function minifyJS(code) {
    if (!code) return '';
    return code
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0 && !line.startsWith('//'))
        .join('\n');
}

const server = http.createServer((req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/bundle') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const { components } = JSON.parse(body);
                if (!Array.isArray(components)) throw new Error('Invalid format');

                console.log(`📦 Bundling ${components.length} components...`);
                let output = '/* PDS Vue Steroids - SSR Bundle */\n';
                
                components.forEach(relPath => {
                    // Normalize path: hapus leading slash agar tidak dianggap root oleh path.join
                    const normalizedRelPath = relPath.startsWith('/') ? relPath.slice(1) : relPath;
                    const fileName = normalizedRelPath.endsWith('.tpl') ? normalizedRelPath : normalizedRelPath + '.tpl';
                    
                    const fullPath = path.resolve(process.cwd(), COMPONENTS_BASE_PATH, fileName);
                    const componentName = path.basename(relPath).replace('.tpl', '');

                    if (fs.existsSync(fullPath)) {
                        const content = fs.readFileSync(fullPath, 'utf8');
                        const { script, template, loadingTemplate, style } = parseTpl(content);

                        output += `\n/* --- Component: ${componentName} --- */\n`;
                        output += `Vue.dynamicComponent('${componentName}', (function(){\n`;
                        output += `  var module = { exports: {} };\n`;
                        output += `  var exports = module.exports;\n`;
                        output += `  ${minifyJS(script) || 'module.exports = {};'}\n`;
                        output += `  var def = module.exports || {};\n`;
                        
                        if (template) {
                            output += `  def.template = ${JSON.stringify(minifyText(template))};\n`;
                        }
                        if (loadingTemplate) {
                            output += `  def.loadingTemplate = ${JSON.stringify(minifyText(loadingTemplate))};\n`;
                        }
                        
                        // Handle Styles if present
                        if (style) {
                            output += `  (function(){\n`;
                            output += `    var id = 'style-${componentName}';\n`;
                            output += `    if(!document.getElementById(id)){\n`;
                            output += `      var s = document.createElement('style');\n`;
                            output += `      s.id = id; s.textContent = ${JSON.stringify(minifyText(style))};\n`;
                            output += `      document.head.appendChild(s);\n`;
                            output += `    }\n`;
                            output += `  })();\n`;
                        }

                        output += `  return def;\n`;
                        output += `})());\n`;
                        console.log(`  ✅ Added: ${componentName}`);
                    } else {
                        console.warn(`  ⚠️ File not found: ${fullPath}`);
                    }
                });

                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(output);
            } catch (err) {
                console.error(`  ❌ Error: ${err.message}`);
                res.writeHead(400);
                res.end(`console.error("SSR Bundler Error: ${err.message}");`);
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`\n🚀 PDS SSR Bundler Server`);
    console.log(`----------------------------------------`);
    console.log(`URL   : http://localhost:${PORT}/bundle`);
    console.log(`PATH  : ${path.resolve(COMPONENTS_BASE_PATH)}`);
    console.log(`----------------------------------------\n`);
});
