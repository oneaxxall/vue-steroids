/**
 * v-loading directive
 * Provides a premium loading overlay for any element
 */

const SPINNER_HTML = `
  <div class="v-loading-spinner">
    <svg viewBox="0 0 50 50">
      <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
    </svg>
  </div>
`

const STYLE_ID = 'vue-loading-directive-style'

function injectStyles() {
  if (document.getElementById(STYLE_ID)) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .v-loading-parent--relative {
      position: relative !important;
    }
    .v-loading-mask {
      position: absolute;
      z-index: 2000;
      background-color: rgba(255, 255, 255, 0.7);
      margin: 0;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      transition: opacity 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(2px);
      border-radius: inherit;
    }
    .v-loading-spinner {
      width: 42px;
      height: 42px;
    }
    .v-loading-spinner svg {
      animation: rotate 2s linear infinite;
      height: 100%;
      width: 100%;
    }
    .v-loading-spinner .path {
      stroke: #6366f1;
      stroke-linecap: round;
      animation: dash 1.5s ease-in-out infinite;
    }
    @keyframes rotate {
      100% { transform: rotate(360deg); }
    }
    @keyframes dash {
      0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; }
      50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; }
      100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; }
    }
  `
  document.head.appendChild(style)
}

export const LoadingDirective = {
  bind(el: any, binding: any) {
    injectStyles()
    
    const mask = document.createElement('div')
    mask.className = 'v-loading-mask'
    mask.innerHTML = SPINNER_HTML
    mask.style.display = binding.value ? 'flex' : 'none'
    mask.style.opacity = binding.value ? '1' : '0'
    
    el.loadingMask = mask
    
    if (binding.value) {
      el.classList.add('v-loading-parent--relative')
      el.appendChild(mask)
    }
  },

  update(el: any, binding: any) {
    if (binding.value !== binding.oldValue) {
      if (binding.value) {
        el.classList.add('v-loading-parent--relative')
        el.appendChild(el.loadingMask)
        el.loadingMask.style.display = 'flex'
        setTimeout(() => {
          el.loadingMask.style.opacity = '1'
        }, 0)
      } else {
        el.loadingMask.style.opacity = '0'
        setTimeout(() => {
          if (!binding.value && el.loadingMask.parentNode === el) {
            el.loadingMask.style.display = 'none'
            el.removeChild(el.loadingMask)
            el.classList.remove('v-loading-parent--relative')
          }
        }, 300)
      }
    }
  },

  unbind(el: any) {
    if (el.loadingMask && el.loadingMask.parentNode === el) {
      el.removeChild(el.loadingMask)
    }
    el.loadingMask = null
  }
}
