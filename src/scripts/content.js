const TAILWIND_CLASSES_RULE = '[class*="tw-"], [class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]'

const checkTailwind = () => {
  if (document.querySelector(TAILWIND_CLASSES_RULE)) return true

  const hasTailwindCdn = Array.from(document.styleSheets).some(sheet => {
    if (sheet.ref && (sheet.href.includes('index-') || sheet.href.includes('tailwind'))) return true

    return false
  })

  if (hasTailwindCdn) return true

  const hasTailwindStylesheet = Array.from(document.styleSheets).some(sheet =>
    Array.from(sheet.cssRules).some(rule => rule.cssText.includes('--tw-'))
  )

  if (hasTailwindStylesheet) return true

  return false
}

const getBreakpointValue = () => {
  screenWidth = window.screen.width

  if (screenWidth >= 1536) return '2xl'

  if (screenWidth >= 1280) return 'xl'

  if (screenWidth >= 1024) return 'lg'

  if (screenWidth >= 768) return 'md'

  if (screenWidth >= 640) return 'sm'

  return 'xs'
}

const generateElement = element => {
  element.id = 'respify-tooltip'
  element.style.zIndex = 9999
  element.style.position = 'fixed'

  element.textContent = `breakpoint: ${getBreakpointValue()}`
  element.style.bottom = '0'
  element.style.right = '0'

  element.style.display = 'inline-flex'
  element.style.paddingTop = '0.125rem'
  element.style.paddingBottom = '0.125rem'
  element.style.paddingLeft = '0.625rem'
  element.style.paddingRight = '0.625rem'
  element.style.margin = '0.5rem'
  element.style.alignItems = 'center'
  element.style.backgroundImage =
    'linear-gradient(to left top, rgb(254, 249, 195), rgb(253, 224, 71), rgb(234, 179, 8))'
  element.style.borderRadius = '9999px'
  element.style.borderWidth = '1px'
  element.style.fontSize = '1.25rem'
  element.style.lineHeight = '1rem'
  element.style.fontWeight = 600
  element.style.borderColor = 'black'
  element.style.color = 'black'

  document.body.appendChild(element)

  setInterval(() => (element.textContent = `breakpoint: ${getBreakpointValue()}`), 50)
}

const hasTailwind = checkTailwind()

if (hasTailwind) {
  const element = document.createElement('div')

  generateElement(element)
}

chrome.runtime.onMessage.addListener(request => {
  if (request.event === 'toggleChanged') {
    const tooltip = document.getElementById('respify-tooltip')

    request.toggled ? (tooltip.style.display = 'none') : (tooltip.style.display = 'inline-flex')
  }
})
