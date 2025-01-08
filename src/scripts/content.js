const TAILWIND_CLASSES_RULE = '[class*="tw-"], [class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]'

const checkTailwind = () => {
  if (document.querySelector(TAILWIND_CLASSES_RULE)) return true

  const hasTailwindCdn = Array.from(document.styleSheets).some(sheet => {
    if (sheet.ref && (sheet.href.includes('index-') || sheet.href.includes('tailwind'))) return true

    return false
  })

  if (hasTailwindCdn) return true

  const hasTailwindStylesheet = Array.from(document.styleSheets).some(sheet =>
    Array.from(sheet.cssRules).some(rule => rule.cssText.includes('--tw'))
  )

  if (hasTailwindStylesheet) return true

  return false
}

const hasTailwind = checkTailwind()

if (hasTailwind) {
  const element = document.createElement('div')
  element.style.backgroundColor = 'red'
  element.textContent = `dfgs`
  element.style.position = 'fixed'
  element.style.top = '0'
  element.className = 'respify'

  if (true) {
    element.style.top = '1000'
  }

  element.style.left = '0'
  element.style.zIndex = 9999

  document.body.appendChild(element)
}
