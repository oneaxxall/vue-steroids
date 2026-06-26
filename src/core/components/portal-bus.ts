/**
 * Portal Bus
 * A simple internal state manager to transfer VNodes between components.
 * We use a plain object here and handle reactivity within the components.
 */
export const portalBus = {
  portals: {} as Record<string, any>
}
