# Dynamic Component Registration in Vue 2

## Overview
This feature allows components to be registered and recognized automatically even if the component is registered **after** the Vue instance is initialized. This is very useful for:
- Lazy loading components via AJAX
- Dynamic component loading from the server
- Plugins that add components at runtime

## API

### `Vue.defineComponent(name, component)`

Registers a component globally that can be resolved even if the Vue instance has already been initialized.

## Usage Examples

### 1. Basic Usage

```javascript
// Initialize Vue instance WITHOUT registering the component first
const app = new Vue({
  el: '#app',
  data: { message: 'Hello Vue 2!' }
})

// Components can still be registered later!
Vue.defineComponent('my-dynamic-component', {
  template: '<div>This is a dynamic component!</div>'
})

// Now the component can be used directly in the template
// <my-dynamic-component></my-dynamic-component>
```

### 2. Lazy Loading via AJAX

```javascript
// Vue instance is already running
const app = new Vue({
  el: '#app',
  data: { componentLoaded: false }
})

// Load component dynamically via AJAX
fetch('/api/components/my-component.js')
  .then(response => response.json())
  .then(componentDefinition => {
    // Register component after Vue instance is running
    Vue.defineComponent('my-ajax-component', componentDefinition)
    
    // Update state if needed
    app.componentLoaded = true
    
    // Component can now be used!
    console.log('Component registered successfully!')
  })
  .catch(error => {
    console.error('Failed to load component:', error)
  })
```

### 3. Dynamic Import with Webpack

```javascript
// Components can be loaded on-demand
function loadComponent() {
  return import('./MyComponent.vue').then(module => {
    Vue.defineComponent('my-lazy-component', module.default)
    return module.default
  })
}

// Call when needed
loadComponent()

// In the template, the component is automatically available after loading
// <my-lazy-component></my-lazy-component>
```

### 4. Plugin Component Registration

```javascript
// plugin.js
export default {
  install(Vue) {
    // Load and register components dynamically
    const asyncComponents = [
      'DatePicker',
      'TimePicker',
      'ColorPicker'
    ]
    
    asyncComponents.forEach(name => {
      fetch(`/api/components/${name.toLowerCase()}.js`)
        .then(res => res.json())
        .then(def => Vue.defineComponent(name, def))
    })
  }
}

// main.js
import MyPlugin from './plugin'
Vue.use(MyPlugin)

// Components will be automatically available after loading
```

## Differences from Vue.component()

### Vue.component()
- Must be called **before** the Vue instance is created
- If called after the instance is created, the component will not be detected in existing templates
- Requires a re-render or new instance

### Vue.defineComponent() (NEW)
- Can be called **anytime**, even after the Vue instance is running
- Components are automatically detected in templates without needing a re-render
- Does not require `<component :is>` or conditional rendering `v-if`

## How It Works

1. `Vue.defineComponent()` registers the component in the **global registry**
2. When Vue renders a template and encounters a component tag, the `resolveAsset()` function will:
   - First check `$options.components` (traditional way)
   - If not found, check the **global dynamic registry**
   - Return the component if found
3. The component is resolved automatically on the next render

## Important Notes

### Component Name
Components are registered with several name variations automatically:
```javascript
Vue.defineComponent('my-component', {...})

// All of these will resolve to the same component:
// <my-component>
// <myComponent>  
// <MyComponent>
```

### Reactivity
- Dynamically registered components will automatically appear in the template
- No need to manipulate state or force re-render
- Vue will automatically resolve the component on the next render cycle

### Compatibility
- 100% compatible with existing Vue 2 code
- Does not change Vue.component() behavior
- Can be used alongside the traditional approach

## Testing

```javascript
describe('Dynamic Component Registration', () => {
  it('should resolve component registered after Vue instance init', () => {
    const Vue = require('vue')
    
    // Create instance first
    const vm = new Vue({
      template: '<dynamic-comp></dynamic-comp>'
    }).$mount()
    
    // Register component later
    Vue.defineComponent('dynamic-comp', {
      render: h => h('div', 'Dynamic!')
    })
    
    // Force re-render
    vm.$forceUpdate()
    
    expect(vm.$el.textContent).toBe('Dynamic!')
  })
})
```

## Migration from Vue.component()

If you are already using `Vue.component()`, you do not need to change anything. 
`Vue.defineComponent()` is an **additional API**, not a replacement.

However, if you want components to be loadable dynamically after instance init, 
use `Vue.defineComponent()` instead of `Vue.component()`.

```javascript
// Before (cannot resolve after init)
Vue.component('my-comp', {...})

// After (can resolve anytime)
Vue.defineComponent('my-comp', {...})
```
