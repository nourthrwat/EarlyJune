// Replaces the parts of webflow.js the site relies on, plus the site-wide custom code from Webflow.

/** Navbar: open/close the mobile menu (Webflow "Navbar" element, collapse at tablet). */
function initNav() {
  document.querySelectorAll<HTMLElement>('.w-nav').forEach((nav) => {
    const button = nav.querySelector<HTMLElement>('.w-nav-button')
    const menu = nav.querySelector<HTMLElement>('.w-nav-menu')
    if (!button || !menu) return
    const set = (open: boolean) => {
      button.classList.toggle('w--open', open)
      menu.classList.toggle('w--open', open)
      menu.toggleAttribute('data-nav-menu-open', open)
      button.setAttribute('aria-expanded', String(open))
      document.documentElement.classList.toggle('nav-open', open)
    }
    button.addEventListener('click', () => set(button.getAttribute('aria-expanded') !== 'true'))
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        button.click()
      }
    })
    window.addEventListener('resize', () => window.innerWidth > 991 && set(false))
  })
}

/** Site footer custom code from Webflow: recolours logo / hamburger / button when the menu opens. */
function initMenuColors() {
  const menuButton = document.querySelector('#navbar2_menu-button')
  const header = document.querySelector('[data-wf--header--variant]')
  const navbarButton = document.querySelector<HTMLElement>('#is-navbar2-button')
  const logoLinks = document.querySelectorAll<HTMLElement>('.navbar2_logo-link')
  const lines = document.querySelectorAll<HTMLElement>('.menu-icon2_line-top, .menu-icon2_line-middle, .menu-icon2_line-bottom')
  if (!menuButton || !header) return
  const variant = header.getAttribute('data-wf--header--variant')

  const setLogo = (color: string) =>
    logoLinks.forEach((logo) => {
      logo.style.setProperty('color', color, 'important')
      logo.querySelector('svg')?.style.setProperty('color', color, 'important')
      logo.querySelectorAll('path').forEach((p) => p.style.setProperty('fill', 'currentColor', 'important'))
    })
  const setMenuButton = (color: string) => {
    ;(menuButton as HTMLElement).style.setProperty('border-color', color, 'important')
    lines.forEach((l) => l.style.setProperty('background-color', color, 'important'))
  }
  const setNavbarButton = (open: boolean) => {
    if (!navbarButton || variant !== 'base') return
    navbarButton.style.setProperty('background-color', open ? '#F4F1DC' : '#2C2C2C', 'important')
    navbarButton.style.setProperty('color', open ? '#1E1E1E' : '#F4F1DC', 'important')
  }
  const update = () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true'
    if (open) {
      setLogo('#F4F1DC')
      setMenuButton('#F4F1DC')
    } else if (variant === 'base') {
      setLogo('#2C2C2C')
      setMenuButton('#2C2C2C')
    } else if (variant === 'white-light') {
      setLogo('#F4F1DC')
      setMenuButton('#F4F1DC')
    }
    setNavbarButton(open)
  }
  new MutationObserver(update).observe(menuButton, {attributes: true, attributeFilter: ['aria-expanded']})
  update()
}

/** FAQ accordions (Webflow Dropdown elements). */
function initFaqs() {
  document.querySelectorAll<HTMLElement>('[data-faq]').forEach((faq) => {
    const toggle = faq.querySelector<HTMLElement>('.w-dropdown-toggle')
    const body = faq.querySelector<HTMLElement>('.w-dropdown-list')
    if (!toggle || !body) return
    const set = (open: boolean) => {
      faq.classList.toggle('is-open', open)
      toggle.classList.toggle('w--open', open)
      body.classList.toggle('w--open', open)
      toggle.setAttribute('aria-expanded', String(open))
      body.style.height = open ? `${body.scrollHeight}px` : '0px'
    }
    toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'))
    toggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle.click()
      }
    })
  })
}

/** Home "Core Channels" panels (Webflow page custom code). */
function initChannels() {
  document.querySelectorAll('.channels').forEach((root) => {
    const panels = Array.from(root.querySelectorAll<HTMLElement>('.panel'))
    if (!panels.length) return
    const hoverable = window.matchMedia('(hover: hover)').matches
    const open = (target: HTMLElement) =>
      panels.forEach((p) => {
        const on = p === target
        p.classList.toggle('is-open', on)
        p.setAttribute('aria-expanded', on ? 'true' : 'false')
      })
    panels.forEach((p) => {
      if (hoverable) p.addEventListener('mouseenter', () => open(p))
      p.addEventListener('click', () => open(p))
      p.addEventListener('focus', () => open(p))
      p.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault()
          open(p)
        }
      })
    })
  })
}

/** Forms: show Webflow's success / error blocks (forms are handled by Netlify Forms). */
function initForms() {
  document.querySelectorAll<HTMLFormElement>('.w-form form').forEach((form) => {
    const wrap = form.closest('.w-form')!
    const done = wrap.querySelector<HTMLElement>('.w-form-done')
    const fail = wrap.querySelector<HTMLElement>('.w-form-fail')
    form.addEventListener('submit', async (e) => {
      e.preventDefault()
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: {'Content-Type': 'application/x-www-form-urlencoded'},
          body: new URLSearchParams(new FormData(form) as any).toString(),
        })
        if (!res.ok) throw new Error(String(res.status))
        form.style.display = 'none'
        if (done) done.style.display = 'block'
      } catch {
        if (fail) fail.style.display = 'block'
      }
    })
  })
}

/** Home case-study slider (Webflow page custom code used Swiper 8; same options). */
async function initSliders() {
  const sliders = document.querySelectorAll<HTMLElement>('.slider-component')
  if (!sliders.length) return
  const [{default: Swiper}, {Autoplay, Keyboard, Mousewheel, Navigation, Pagination, Scrollbar}] = await Promise.all([
    import('swiper'),
    import('swiper/modules'),
  ])
  sliders.forEach((root) => {
    root.querySelectorAll('.swiper-next, .swiper-prev').forEach((b) => b.addEventListener('click', (e) => e.preventDefault()))
    const swiper = new Swiper(root.querySelector<HTMLElement>('.swiper')!, {
      modules: [Autoplay, Keyboard, Mousewheel, Navigation, Pagination, Scrollbar],
      speed: 750,
      loop: true,
      slidesPerView: 'auto',
      autoplay: {delay: 1500, disableOnInteraction: false},
      mousewheel: {forceToAxis: true},
      keyboard: {enabled: true, onlyInViewport: true},
      pagination: {
        el: root.querySelector<HTMLElement>('.swiper-bullet-wrapper'),
        bulletActiveClass: 'is-active',
        bulletClass: 'swiper-bullet',
        bulletElement: 'button',
        clickable: true,
      },
      navigation: {
        nextEl: root.querySelector<HTMLElement>('.swiper-next'),
        prevEl: root.querySelector<HTMLElement>('.swiper-prev'),
        disabledClass: 'is-disabled',
      },
      scrollbar: {el: root.querySelector<HTMLElement>('.swiper-drag-wrapper'), draggable: true, dragClass: 'swiper-drag', snapOnRelease: true},
      slideActiveClass: 'is-active',
    })
    swiper.on('activeIndexChange', (sw) => {
      const slide = sw.slides[sw.activeIndex]
      document.querySelectorAll<HTMLElement>('.active-card-label').forEach((label) => {
        label.textContent = slide?.dataset.cardLabel ?? ''
        label.style.color = slide?.dataset.cardColor ?? ''
      })
    })
  })
}

export function initSite() {
  initNav()
  initMenuColors()
  initFaqs()
  initChannels()
  initForms()
  initSliders()
}
