# Built-in Route & Navigation System

This built-in routing system is designed to provide reactive access to the browser URL without requiring an external library like Vue Router. This feature integrates the URL state directly into Vue's reactivity core.

## 1. Accessing the `$route` Object

The `$route` object is automatically available on every Vue component instance via `this.$route`.

```javascript
// Example access within methods or lifecycle hooks
mounted() {
    console.log("Current path:", this.$route.path);
    console.log("Query 'id':", this.$route.query.id);
}
```

## 2. Reactive Properties

The following properties are reactive and will trigger updates on UI or `watchers` when the URL changes:

| Property | Description | Example |
| :--- | :--- | :--- |
| `path` | Main URL path (pathname) | `/admin/settings` |
| `fullPath` | Full path including query & hash | `/admin?tab=1#top` |
| `hash` | Fragment after the `#` sign | `#section-1` |
| `query` | Query string parameters object | `{ id: '123', sort: 'desc' }` |
| `path1` | First segment of the path | `admin` (from `/admin/settings`) |
| `path2` | Second segment of the path | `settings` (from `/admin/settings`) |
| `path3` | Third segment of the path | `profile` (from `/admin/settings/profile`) |
| `path4..5` | Fourth and fifth segments | (empty string if not present) |

## 3. Using Watchers

You can watch specific URL part changes using the standard Vue `watch` block.

### Watching Specific Path Segments
Very useful for modular Odoo-based applications where the first segment often determines the active module.

```javascript
watch: {
    '$route.path1': function(newVal, oldVal) {
        if (newVal === 'discuss') {
            this.initDiscussModule();
        }
    }
}
```

### Watching Query or Hash
```javascript
watch: {
    '$route.query.search': function(keyword) {
        this.performSearch(keyword);
    },
    '$route.hash': function(newHash) {
        this.scrollToElement(newHash);
    }
}
```

## 4. Navigation API

Navigation can be done declaratively in the template or programmatically in the script.

### Navigation Methods
- `this.$route.push(url | object)`: Add a new history entry.
- `this.$route.replace(url | object)`: Replace the current history entry.
- `this.$route.back()`: Go back to the previous page.
- `this.$route.forward()`: Go forward to the next page.

### Usage Examples
```javascript
// String Navigation
this.$route.push('/dashboard');

// Object Navigation with Query
this.$route.push({ 
    path: '/search', 
    query: { q: 'vue-steroids' } 
});

// Replace Navigation (doesn't add to history stack)
this.$route.replace('/login');
```

## 5. Global Access (Outside Components)

If you need to navigate outside `.vue` files or components (e.g., in plain JS helpers), you can use `Vue.router`.

```javascript
// In plain JS file
Vue.router.push('/logout');
```

---

> **Note:** This system automatically listens to `popstate` and `hashchange` events, so navigation using the browser's Back/Forward buttons will remain in sync with the `$route` state.
