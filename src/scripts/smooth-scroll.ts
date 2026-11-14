// Webflow "LENIS SMOOTH SCROLL" component, same settings.
import Lenis from 'lenis'

export function initSmoothScroll() {
  const lenis = new Lenis({lerp: 0.1, wheelMultiplier: 0.7, gestureOrientation: 'vertical', smoothWheel: true})
  const raf = (time: number) => {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)
  document.querySelectorAll('[data-lenis-start]').forEach((el) => el.addEventListener('click', () => lenis.start()))
  document.querySelectorAll('[data-lenis-stop]').forEach((el) => el.addEventListener('click', () => lenis.stop()))
  document.querySelectorAll('[data-lenis-toggle]').forEach((el) =>
    el.addEventListener('click', () => {
      el.classList.toggle('stop-scroll')
      el.classList.contains('stop-scroll') ? lenis.stop() : lenis.start()
    }),
  )
}
