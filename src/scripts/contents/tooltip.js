const getBreakpointValue = () => {
  const screenWidth = window.screen.width
  if (screenWidth >= 1536) return '2xl'
  if (screenWidth >= 1280) return 'xl'
  if (screenWidth >= 1024) return 'lg'
  if (screenWidth >= 768) return 'md'
  if (screenWidth >= 640) return 'sm'
  return 'xs'
}

const createTooltipElement = () => {
  const tooltip = document.createElement('div')

  tooltip.id = 'respify-tooltip'
  tooltip.style.zIndex = 9999
  tooltip.style.position = 'fixed'

  tooltip.textContent = `breakpoint: ${getBreakpointValue()}`
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

  setInterval(() => (tooltip.textContent = `breakpoint: ${getBreakpointValue()}`), 50)

  return tooltip
}

const tooltipElement = createTooltipElement()

document.body.appendChild(tooltipElement)
