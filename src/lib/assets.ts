// Webflow asset id → hosted URL (run `npm run localize-images` to switch to local copies).
import assets from './webflow-assets.json'
const map = assets as Record<string, {url: string; alt: string}>
export const asset = (id: string) => map[id]?.url ?? ''
