const TAILWIND_CLASSES_RULE = '[class*="tw-"], [class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]'

const hasTailwindStylesheet = () =>
  Array.from(document.styleSheets).some(sheet =>
    Array.from(sheet.cssRules).some(rule => rule.cssText.includes('--tw-'))
  )

const hasTailwindCdn = () =>
  Array.from(document.styleSheets).some(sheet => {
    if (sheet.ref && (sheet.href.includes('index-') || sheet.href.includes('tailwind'))) return true
    return false
  })

const pageUseTailwind = () => {
  try {
    if (document.querySelector(TAILWIND_CLASSES_RULE)) return true
    if (hasTailwindCdn() || hasTailwindStylesheet()) return true

    return false
  } catch {
    return false
  }
}

const URL_REGEX = /(localhost(:\d{1,5})?|127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3}))/

const pageUseDevelopmentUrl = () => {
  if (URL_REGEX.test(document.URL)) return true

  return false
}

const getBreakpointValue = () => {
  const screenWidth = window.screen.width
  if (screenWidth >= 1536) return '2xl'
  if (screenWidth >= 1280) return 'xl'
  if (screenWidth >= 1024) return 'lg'
  if (screenWidth >= 768) return 'md'
  if (screenWidth >= 640) return 'sm'
  return 'xs'
}

const generateTooltip = () => {
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

const displayTooltip = () => (document.getElementById('respify-tooltip').style.display = 'block')

const hideTooltip = () => (document.getElementById('respify-tooltip').style.display = 'none')

const getTooltipDisplayState = () => document.getElementById('respify-tooltip').style.display === 'block'

const getStorageItems = async (...storageItems) => chrome.storage.local.get(storageItems)

document.body.appendChild(generateTooltip())

const loadOrNotTooltip = async () => {
  const { extensionEnabled, tailwindOnly, devOnly } = await getStorageItems(
    'extensionEnabled',
    'tailwindOnly',
    'devOnly'
  )

  if (extensionEnabled === false) return
  if (tailwindOnly && pageUseTailwind() === false) return
  if (devOnly && pageUseDevelopmentUrl() === false) return

  displayTooltip()
}

loadOrNotTooltip()

chrome.runtime.onMessage.addListener(async ({ event, value: extensionEnabled }) => {
  if (event !== 'extensionEnableChanged') return
  if (extensionEnabled === false) return hideTooltip()

  const { tailwindOnly, devOnly } = await getStorageItems('tailwindOnly', 'devOnly')

  if (tailwindOnly && pageUseTailwind() === false) return
  if (devOnly && pageUseDevelopmentUrl() === false) return

  displayTooltip()
})

chrome.runtime.onMessage.addListener(async ({ event, value: tailwindOnly }) => {
  if (event !== 'tailwindOnlyChanged') return

  const { devOnly } = await getStorageItems('devOnly')
  const tooltipIsDisplayed = getTooltipDisplayState()

  if (tailwindOnly && pageUseTailwind() === false) {
    if (tooltipIsDisplayed) hideTooltip()
    return
  }

  if (devOnly && pageUseDevelopmentUrl() === false) {
    if (tooltipIsDisplayed) hideTooltip()
    return
  }

  if (tooltipIsDisplayed === false) displayTooltip()
})

chrome.runtime.onMessage.addListener(async ({ event, value: devOnly }) => {
  if (event !== 'devOnlyChanged') return

  const { tailwindOnly } = await getStorageItems('tailwindOnly')
  const tooltipIsDisplayed = getTooltipDisplayState()

  if (devOnly && pageUseDevelopmentUrl() === false) {
    if (tooltipIsDisplayed) hideTooltip()
    return
  }

  if (tailwindOnly && pageUseTailwind() === false) {
    if (tooltipIsDisplayed) hideTooltip()
    return
  }

  if (tooltipIsDisplayed === false) displayTooltip()
})
