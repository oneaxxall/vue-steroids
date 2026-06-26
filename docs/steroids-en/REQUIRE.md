# Steroids Native Module System (Require)

This feature allows you to import local JavaScript files using the `module.exports` pattern (like in Node.js) directly in the browser without needing external bundlers such as Webpack or Vite.

## Main Features
1.  **Synchronous Require**: Supports synchronous `require()` calls inside Vue methods.
2.  **Asynchronous Require**: Supports `requireAsync()` for non-blocking loading.
3.  **Module Caching**: Loaded files are stored in memory to prevent repeated requests.
4.  **Debugging Support**: Supports `sourceURL` so required files appear in Chrome DevTools Sources for debugging.

---

## 1. Setting Up a Module File (.js)
Write your JavaScript file using the `module.exports` standard.

```javascript
// file: /app/util/email-exporter.js

const Header = "--- Email Export ---";

module.exports = {
    exportToHtml: function(blocks) {
        console.log("Exporting...");
        return `<html><body>${Header}</body></html>`;
    },
    version: "1.0.0"
};
```

---

## 2. Usage in Vue Components (.tpl)

### A. Synchronous Usage (Standard)
Use inside methods or lifecycle hooks. The `.js` extension is optional.

```javascript
<script>
module.exports = {
    methods: {
        handleExport: function() {
            // Load the module synchronously
            const exporter = require('/app/util/email-exporter');
            
            this.html = exporter.exportToHtml(this.blocks);
            alert('Export Successful version: ' + exporter.version);
        }
    }
}
</script>
```

### B. Asynchronous Usage (Recommended for large files)
Use this if the file is very large to avoid blocking the UI thread.

```javascript
async mounted() {
    const bigModule = await requireAsync('/app/large-lib');
    bigModule.init();
}
```

---

## 3. Technical Details
- **Pathing**: Paths must be absolute from the project root (starting with `/`).
- **Sync XHR**: The `require()` function uses Synchronous XMLHttpRequest as a fallback if the module is not yet in cache. This ensures compatibility with synchronous code flow in Vue 2.
- **Isolation**: Each module is executed in its own scope. Global variables defined without `var/let/const` will still leak into `window`.

## 4. Debugging Tips
If you want to debug a required file:
1. Open Chrome DevTools.
2. Go to the **Sources** tab.
3. Look under `(no domain)` or use `Ctrl + P` then type your JS file name.
4. You can set breakpoints normally because this system includes `//# sourceURL`.

---

> [!IMPORTANT]
> This feature is only available in **PDS Vue Dev (Steroids Edition)**. Make sure you are using the latest `dist/vue.js` version after May 14, 2026.
