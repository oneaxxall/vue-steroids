import type VNode from '../vnode'

/**
 * Proof of Concept: XML Props Parser
 * Extracts <props> from children and converts to propsData
 */

function castValue(val: any): any {
  if (typeof val === 'string') {
    const trimmed = val.trim()
    if (
      (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
      (trimmed.startsWith('{') && trimmed.endsWith('}'))
    ) {
      return parseOdooExpression(trimmed)
    } else if (trimmed === 'true') {
      return true
    } else if (trimmed === 'false') {
      return false
    } else if (trimmed !== '' && !isNaN(Number(trimmed))) {
      return Number(trimmed)
    }
    return val
  }
  return val
}

export function extractXmlProps(children: Array<VNode> | undefined): Record<string, any> | undefined {
  if (!children || !children.length) return undefined

  let propsNodeIndex = -1
  const props: Record<string, any> = {}

  // Find <props> node
  for (let i = 0; i < children.length; i++) {
    const node = children[i]
    if (node.tag && (node.tag.endsWith('props') || node.tag === 'props')) {
      propsNodeIndex = i
      break
    }
  }

  if (propsNodeIndex === -1) return undefined

  const propsNode = children[propsNodeIndex]
  const propChildren = propsNode.children

  if (propChildren) {
    const collectFields = (nodes: Array<VNode>) => {
      nodes.forEach(child => {
        if (!child.tag) return
        
        const tagName = child.tag.replace(/^vue-component-\d+-/, '').toLowerCase()
        const rawAttrs = child.data && child.data.attrs ? child.data.attrs : {}
        
        // Smart Casting for attributes
        const attrs: Record<string, any> = {}
        for (const key in rawAttrs) {
          attrs[key] = castValue(rawAttrs[key])
        }
        
        if (tagName === 'field') {
          const propName = 'fields'
          if (!props[propName]) props[propName] = []
          props[propName].push({ ...attrs })
          
          // Browser might nest unknown self-closing tags
          if (child.children) {
            collectFields(child.children)
          }
        } else {
          // Normal tag
          const propName = tagName
          let value: any = ''
          
          if (child.children && child.children.length > 0) {
            if (child.children.length === 1 && !child.children[0].tag) {
              value = castValue(child.children[0].text)
            } else {
              value = child.children
            }
          } else if (Object.keys(attrs).length > 0) {
            value = { ...attrs }
          }
          props[propName] = value
          
          // Even if not a field, check children for nested fields
          // (Though this is less common for non-field tags)
          if (child.children) {
            collectFields(child.children)
          }
        }
      })
    }
    
    collectFields(propChildren)
  }

  // Remove the <props> node from children so it's not rendered in the slot
  children.splice(propsNodeIndex, 1)

  return Object.keys(props).length > 0 ? props : undefined
}

/**
 * Flexible evaluator for Odoo-style expressions
 * Converts [a, 'b', c] to ["a", "b", "c"] by treating undefined variables as strings
 */
function parseOdooExpression(str: string): any {
  const trimmed = str.trim()
  try {
    // Use a Proxy to catch any undefined variable access and return it as a string
    // 'has' trap is critical for 'with' block to intercept all variable lookups
    const handler = {
      has: () => true,
      get: (target: any, prop: string) => {
        // Don't intercept symbols or internal properties
        if (typeof prop === 'symbol' || prop.startsWith('__')) {
          return undefined
        }
        // Return the property name itself as the value
        return prop
      }
    }
    const proxy = new Proxy({}, handler)
    
    // Create a function that executes the expression with our proxy as the scope
    // We normalize single quotes to double quotes for the evaluation
    const expression = trimmed.replace(/'/g, '"')
    const evaluator = new Function('proxy', `with(proxy) { return ${expression} }`)
    return evaluator(proxy)
  } catch (e) {
    // If complex evaluation fails, fall back to the original string
    return str
  }
}
