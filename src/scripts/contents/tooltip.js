let translateX = 0
let translateY = 0

const getBreakpointValue = async () => {
  const { breakpoints } = await chrome.storage.local.get('breakpoints')
  const screenWidth = window.screen.width

  const sortedBreakpoints = [...breakpoints].sort((a, b) => a.value - b.value).reverse()
  const breakpoint = sortedBreakpoints.find(breakpoint => screenWidth >= breakpoint.value)

  return breakpoint?.key || 'xs'
}

const createTooltipContainer = () => {
  const container = document.createElement('div')
  container.id = 'respify-tooltip'
  container.style.display = 'none'

  container.attachShadow({ mode: 'open' })

  return container
}

const tooltipContainer = createTooltipContainer()

document.body.appendChild(tooltipContainer)
;(async () => {
  const shadow = document.getElementById('respify-tooltip').shadowRoot
  if (!shadow) return

  const style = document.createElement('style')
  const styleResponse = await fetch(chrome.runtime.getURL('src/templates/tooltip/tooltip.css'))
  const css = await styleResponse.text()

  style.textContent =
    `
    :host {
      all: initial;
      display: block;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    #tooltip-main-div {
      --zoom-scale: 1;
      transform-origin: bottom left;
    }
  ` + css
  shadow.appendChild(style)

  const content = document.createElement('div')
  const htmlResponse = await fetch(chrome.runtime.getURL('src/templates/tooltip/tooltip.html'))
  const html = await htmlResponse.text()
  content.innerHTML = html
  shadow.appendChild(content)

  let isDragging = false
  let startX
  let startY

  const tooltip = shadow.querySelector('#tooltip-main-div')

  const updateZoomNormalization = () => {
    const zoomLevel = window.devicePixelRatio || 1
    tooltip.style.setProperty('--zoom-scale', `${1 / zoomLevel}`)
    tooltip.style.transformOrigin = 'bottom left'
    updateTooltipTransform()
  }

  const updateTooltipTransform = () => {
    tooltip.style.transform = `scale(var(--zoom-scale, 1)) translate(${translateX}px, ${translateY}px)`
  }

  updateZoomNormalization()

  window.addEventListener('resize', updateZoomNormalization)
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', updateZoomNormalization)
  }

  tooltip.addEventListener('mousedown', element => {
    tooltip.style.transition = 'none'
    isDragging = true
    startX = element.clientX - translateX
    startY = element.clientY - translateY
  })

  document.addEventListener('mousemove', element => {
    if (isDragging === false) return

    element.preventDefault()
    translateX = element.clientX - startX
    translateY = element.clientY - startY
    updateTooltipTransform()
  })

  document.addEventListener('mouseup', () => {
    isDragging = false
    setTimeout(() => (tooltip.style.transition = 'none'), 500)
  })

  const resizeObserver = new ResizeObserver(
    async () => (tooltip.querySelector('#tooltip-breakpoint').textContent = await getBreakpointValue())
  )

  const resolutionObserver = new ResizeObserver(
    async () =>
      (tooltip.querySelector('#tooltip-resolution').textContent = `${window.screen.width}x${window.screen.height}`)
  )

  resizeObserver.observe(document.documentElement)
  resolutionObserver.observe(document.documentElement)

  chrome.runtime.onMessage.addListener(({ event }) => {
    if (event !== 'resetTooltipPosition') return

    translateX = 0
    translateY = 0
    updateTooltipTransform()
  })

  tooltip
    .querySelector('#tooltip-eye-off')
    .addEventListener('click', () => document.getElementById('respify-tooltip').remove())
})()
