const getBreakpointValue = async () => {
  const { breakpoints } = await chrome.storage.local.get('breakpoints')
  const screenWidth = window.screen.width

  const sortedBreakpoints = [...breakpoints].sort((a, b) => a.value - b.value).reverse()
  const breakpoint = sortedBreakpoints.find(breakpoint => screenWidth >= breakpoint.value)

  return breakpoint?.key || 'xs'
}

const createTooltipElement = () => {
  const tooltip = document.createElement('div')

  tooltip.id = 'respify-tooltip'
  tooltip.style.zIndex = 9999
  tooltip.style.position = 'fixed'

  tooltip.style.bottom = '0'
  tooltip.style.right = '0'

  tooltip.style.display = 'none'
  tooltip.style.paddingTop = '0.125rem'
  tooltip.style.paddingBottom = '0.125rem'
  tooltip.style.paddingLeft = '0.625rem'
  tooltip.style.paddingRight = '0.625rem'
  tooltip.style.alignItems = 'center'
  tooltip.style.backgroundColor = '#7579e7'
  tooltip.style.borderTopLeftRadius = '0.25rem'
  tooltip.style.borderStroke = '0px'
  tooltip.style.fontSize = '1.25rem'
  tooltip.style.lineHeight = '1rem'
  tooltip.style.fontWeight = 600
  tooltip.style.color = 'black'
  tooltip.style.userSelect = 'none'

  const resizeObserver = new ResizeObserver(
    async () => (tooltip.textContent = `breakpoint: ${await getBreakpointValue()}`)
  )

  resizeObserver.observe(document.documentElement)

  return tooltip
}

const tooltipElement = createTooltipElement()

document.body.appendChild(tooltipElement)

getBreakpointValue().then(breakpoint => (tooltipElement.textContent = `breakpoint: ${breakpoint}`))
