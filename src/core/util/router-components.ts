import { debugLog } from './options'
import { warn } from './debug'

/**
 * Built-in Router Components: <router-view> and <router-link>
 */

export function installRouterComponents(Vue: any): void {
  // Register <router-view>
  Vue.component('router-view', {
    name: 'RouterView',
    functional: true,
    render(h: any, { parent, data }: any) {
      const router = parent.$router
      if (!router) {
        warn('[RouterView] router instance not found')
        return h()
      }

      const route = router.currentRoute
      const componentName = route.component
      
      if (!componentName) {
        return h() // Empty render
      }

      // Check if page component is registered as dynamic component
      const component = Vue.options.components[componentName] || 
                      (parent.$options.components && parent.$options.components[componentName]) ||
                      (Vue as any)._dynamicComponents && (Vue as any)._dynamicComponents[componentName]

      if (!component) {
        debugLog(`[RouterView] Component ${componentName} not found yet`)
        return h()
      }

      // Handle Layout
      const layoutName = route.layout || 'default'
      const layoutCompName = `layout-${layoutName}`
      const layoutComponent = Vue.options.components[layoutCompName] || 
                             (Vue as any)._dynamicComponents && (Vue as any)._dynamicComponents[layoutCompName]

      if (layoutComponent) {
        // Render with layout
        return h(layoutCompName, data, [
          h(componentName, data)
        ])
      }

      // Render without layout
      return h(componentName, data)
    }
  })

  // Register <router-link>
  Vue.component('router-link', {
    name: 'RouterLink',
    props: {
      to: {
        type: String,
        required: true
      },
      tag: {
        type: String,
        default: 'a'
      },
      activeClass: {
        type: String,
        default: 'router-link-active'
      },
      exact: {
        type: Boolean,
        default: false
      }
    },
    render(h: any) {
      const currentPath = this.$route ? this.$route.path : '/'
      const isActive = this.exact 
        ? currentPath === this.to 
        : currentPath.startsWith(this.to)

      const isA = this.tag === 'a'
      
      const linkData: any = {
        class: {
          [this.activeClass]: isActive
        },
        on: {
          click: (e: Event) => {
            e.preventDefault()
            this.$router.navigate(this.to)
          }
        }
      }

      if (isA) {
        linkData.attrs = { href: this.to }
      }

      return h(this.tag, linkData, this.$slots.default)
    }
  })
}
