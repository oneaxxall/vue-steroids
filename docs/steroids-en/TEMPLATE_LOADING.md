# Documentation: Template Loading (`scope="loading"`)

The `template scope="loading"` feature is one of the main innovations in the **Vue 2 Steroids** framework that allows developers to define loading UI declaratively inside `.tpl` files without cluttering the main template with `v-if` logic.

---

## 🚀 Usage

Simply add a `<template scope="loading">` block alongside your main template.

```html
<script>
module.exports = {
    name: 'MyComponent',
    asyncComponents: [
        '/components/heavy-chart',
        '/components/data-table'
    ],
    // ... other logic
}
</script>

<!-- This template will automatically appear while asyncComponents are loading -->
<template scope="loading">
    <div class="flex items-center justify-center p-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span class="ml-3 text-xs font-bold text-neutral-500 uppercase tracking-widest">
            Loading Dependencies...
        </span>
    </div>
</template>

<!-- Main template (automatically renders after everything is ready) -->
<template>
    <div class="p-6">
        <heavy-chart />
        <data-table />
    </div>
</template>
```

---

## ⚙️ How It Works

Unlike the standard approach that uses `v-if` at the user-land level, this feature is implemented directly in the **Core Lifecycle** of Vue 2 Steroids.

### 1. Parsing & Extraction
When a `.tpl` file is loaded via `loadAsyncComponent`, the loader separates the content by tag:
- `<template scope="loading">` is extracted to the `loadingTemplate` property.
- Standard `<template>` is extracted to the `template` property.

### 2. Reactive State Management
The `initAsyncComponents` function in the core engine automatically detects the presence of `loadingTemplate`. If present, the system sets the internal reactive property `this.$loading = true`.

### 3. Render Swapping (Core Level)
The magic happens inside the internal `_render` method (at `src/core/instance/render.ts`). The framework intercepts before rendering occurs:

```typescript
// Pseudocode Logic in Core
if (vm.$loading && vm.$options.loadingTemplate) {
    // Use the render function from loadingTemplate compilation
    return renderLoading(vm); 
} else {
    // Use the main render function
    return renderMain(vm);
}
```

The system swaps the render function *on-the-fly*. Once all components in `asyncComponents` have finished fetching, `$loading` changes to `false`, triggering an automatic re-render to the main template.

---

## 🌟 Key Benefits

1.  **Code Isolation**: Your main template doesn't need to know about loading state. No more `v-if="!isLoading"` wrapping the entire page.
2.  **Zero Boilerplate**: You don't need to create an `isLoading: true` variable in `data()` manually.
3.  **Static Optimization**: The framework separates cache optimization (`staticRenderFns`) between the loading template and the main template, ensuring maximum performance.
4.  **Consistent UX**: Ensures users don't see elements that aren't ready (e.g., custom component tags that haven't been registered) during the fetch process.

---

## 🔄 Lifecycle Flow

1.  **Fetch `.tpl`**: File is downloaded and parsed.
2.  **Instance Init**: The `$loading` property is set to `true`.
3.  **First Render**: Framework detects `$loading: true`, renders `loadingTemplate`.
4.  **Async Load**: All files in `asyncComponents` are downloaded in parallel.
5.  **Completion**: After everything is done, `$loading` is set to `false`.
6.  **Auto Re-render**: Vue detects the reactive change, calls `_render` again, and now renders the main template.

---

> [!TIP]
> You can use the same loading template globally by setting it at the layout level if your application has a consistent loading pattern.

---

## 🧩 Dynamic Component Support

The `loadingTemplate` feature is not limited to static `.tpl` files; it is also fully supported by the framework's dynamic component registration system.

### 1. Manual Registration via `defineDynamicComponent`
You can register a component programmatically by including the `loadingTemplate` property.

```javascript
Vue.defineDynamicComponent('custom-widget', {
    asyncComponents: ['/api/heavy-data'],
    loadingTemplate: `<div class="shimmer">Loading widget data...</div>`,
    template: `<div class="widget-content"><heavy-data /></div>`
});
```

### 2. Auto-Fetch Integration
The **Auto-Fetch** system (which loads components based on tag names automatically) has been configured to extract loading blocks. If you use an unregistered tag:

1.  Framework detects the `<user-profile />` tag.
2.  Framework looks for the file `/components/user/user-profile.tpl`.
3.  If that file has a `<template scope="loading">`, the property is automatically registered in the global registry.

### 3. Understanding the Loading Phase Differences
It is important to distinguish between two loading phases that occur:

| Phase | Description | UI Status |
|------|-----------|-----------|
| **Fetching Component** | When the `.tpl` file is being downloaded for the first time. | Empty placeholder (very brief transition). |
| **Initializing Dependencies** | The `.tpl` file is already present, but waiting for its `asyncComponents`. | **`loadingTemplate` is rendered.** |

This feature is designed to provide instant feedback to users when a large module is preparing its sub-components, ensuring the application remains responsive even while performing many parallel I/O operations.
