// Custom code that lived in Webflow "Embed" elements, loaded as raw strings.
// Pages render them with <Fragment set:html={embeds.name} />.
import logo from '../embeds/logo.svg?raw'
import footerLogo from '../embeds/footer-logo.svg?raw'
import arrowCircle from '../embeds/arrow-circle.svg?raw'
import arrowSmall from '../embeds/arrow-small.svg?raw'
import sayHiPill from '../embeds/say-hi-pill.svg?raw'
import loopCss from '../embeds/loop.css?raw'
import sliderDotsCss from '../embeds/slider-dots.css?raw'
import channelsCss from '../embeds/channels.css?raw'

const style = (css: string) => `<style>${css}</style>`

export {logo, footerLogo, arrowCircle, arrowSmall, sayHiPill}
export const loopKeyframes = style(loopCss)
export const sliderDots = style(sliderDotsCss)
export const channelsPanels = style(channelsCss)
