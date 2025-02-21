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

const isSiteUsingTailwind = () => {
  try {
    if (document.querySelector(TAILWIND_CLASSES_RULE)) return true
    if (hasTailwindCdn() || hasTailwindStylesheet()) return true

    return false
  } catch {
    return false
  }
}

const normalizeUrl = url => url.replace(/^https?:\/\//, '').replace(/\/$/, '')

const matchRegexRule = (rule, domain) => {
  try {
    const regex = new RegExp(rule.slice(1, -1))
    return regex.test(domain)
  } catch {
    return false
  }
}

const matchWildcardRule = (rule, domain) => {
  try {
    const normalizedRule = normalizeUrl(rule)
    const pattern = normalizedRule
      .split('*')
      .map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('.*')

    return domain === normalizedRule || new RegExp(`^${pattern}$`).test(domain)
  } catch {
    return false
  }
}

const isSiteUsingDevelopmentUrl = async () => {
  const { devSitesList } = await chrome.storage.local.get('devSitesList')
  const currentUrl = new URL(document.URL)
  const normalizedCurrentDomain = currentUrl.host.replace(/\/$/, '')

  return devSitesList.some(({ value: rule }) =>
    rule.startsWith('/') && rule.endsWith('/')
      ? matchRegexRule(rule, normalizedCurrentDomain)
      : matchWildcardRule(rule, normalizedCurrentDomain)
  )
}

const isSiteBlacklisted = async () => {
  const { blacklist } = await chrome.storage.local.get('blacklist')
  const currentUrl = new URL(document.URL)
  const normalizedCurrentDomain = currentUrl.host.replace(/\/$/, '')

  return blacklist.some(({ value: rule }) =>
    rule.startsWith('/') && rule.endsWith('/')
      ? matchRegexRule(rule, normalizedCurrentDomain)
      : matchWildcardRule(rule, normalizedCurrentDomain)
  )
}

const isSiteWhitelisted = async () => {
  const { whitelist } = await chrome.storage.local.get('whitelist')
  const currentUrl = new URL(document.URL)
  const normalizedCurrentDomain = currentUrl.host.replace(/\/$/, '')

  return whitelist.some(({ value: rule }) =>
    rule.startsWith('/') && rule.endsWith('/')
      ? matchRegexRule(rule, normalizedCurrentDomain)
      : matchWildcardRule(rule, normalizedCurrentDomain)
  )
}

const displayTooltip = () => (document.getElementById('respify-tooltip').style.display = 'block')

const hideTooltip = () => (document.getElementById('respify-tooltip').style.display = 'none')

const getTooltipDisplayState = () => document.getElementById('respify-tooltip').style.display === 'block'

const getStorageItems = async (...storageItems) => chrome.storage.local.get(storageItems)

const loadOrNotTooltip = async () => {
  const { extensionEnabled, whitelistEnabled, tailwindOnly, devOnly } = await getStorageItems(
    'extensionEnabled',
    'whitelistEnabled',
    'tailwindOnly',
    'devOnly'
  )

  if (extensionEnabled === false) return
  if (whitelistEnabled) return (await isSiteWhitelisted()) ? displayTooltip() : null
  if (tailwindOnly && isSiteUsingTailwind() === false) return
  if (devOnly && (await isSiteUsingDevelopmentUrl()) === false) return

  displayTooltip()
}

loadOrNotTooltip()

chrome.runtime.onMessage.addListener(async ({ event, value: extensionEnabled }) => {
  if (event !== 'extensionEnableChanged') return
  if (extensionEnabled === false) return hideTooltip()

  const { whitelistEnabled, tailwindOnly, devOnly, blacklistEnabled } = await getStorageItems(
    'whitelistEnabled',
    'tailwindOnly',
    'devOnly',
    'blacklistEnabled'
  )

  if (whitelistEnabled) return (await isSiteWhitelisted()) ? displayTooltip() : hideTooltip()
  if (tailwindOnly && isSiteUsingTailwind() === false) return
  if (devOnly && (await isSiteUsingDevelopmentUrl()) === false) return
  if (blacklistEnabled && (await isSiteBlacklisted())) return

  displayTooltip()
})

chrome.runtime.onMessage.addListener(async ({ event, value: tailwindOnly }) => {
  if (event !== 'tailwindOnlyChanged') return

  const isTooltipDisplayed = getTooltipDisplayState()

  if (tailwindOnly && isSiteUsingTailwind() === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  const { devOnly, blacklistEnabled } = await getStorageItems('devOnly', 'blacklistEnabled')

  if (devOnly && (await isSiteUsingDevelopmentUrl()) === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (blacklistEnabled && (await isSiteBlacklisted())) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (isTooltipDisplayed === false) displayTooltip()
})

chrome.runtime.onMessage.addListener(async ({ event, value: devOnly }) => {
  if (event !== 'devOnlyChanged') return

  const isTooltipDisplayed = getTooltipDisplayState()

  if (devOnly && (await isSiteUsingDevelopmentUrl()) === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  const { tailwindOnly, blacklistEnabled } = await getStorageItems('tailwindOnly', 'blacklistEnabled')

  if (tailwindOnly && isSiteUsingTailwind() === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (blacklistEnabled && (await isSiteBlacklisted())) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (isTooltipDisplayed === false) displayTooltip()
})

chrome.runtime.onMessage.addListener(async ({ event, value: blacklistEnabled }) => {
  if (event !== 'blacklistChanged') return

  const isTooltipDisplayed = getTooltipDisplayState()

  if (blacklistEnabled && (await isSiteBlacklisted())) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  const { tailwindOnly, devOnly } = await getStorageItems('tailwindOnly', 'devOnly')

  if (devOnly && (await isSiteUsingDevelopmentUrl()) === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (tailwindOnly && isSiteUsingTailwind() === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (isTooltipDisplayed === false) displayTooltip()
})

chrome.runtime.onMessage.addListener(async ({ event }) => {
  if (event !== 'listChanged') return

  const { tailwindOnly, devOnly, blacklistEnabled } = await getStorageItems(
    'tailwindOnly',
    'devOnly',
    'blacklistEnabled'
  )

  const isTooltipDisplayed = getTooltipDisplayState()

  if (devOnly && (await isSiteUsingDevelopmentUrl()) === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (tailwindOnly && isSiteUsingTailwind() === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (blacklistEnabled && (await isSiteBlacklisted())) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (isTooltipDisplayed === false) displayTooltip()
})

chrome.runtime.onMessage.addListener(async ({ event, value: whitelistEnabled }) => {
  if (event !== 'whitelistChanged') return

  const isTooltipDisplayed = getTooltipDisplayState()

  if (whitelistEnabled) {
    const isWhitelisted = await isSiteWhitelisted()
    return isWhitelisted ? displayTooltip() : hideTooltip()
  }

  const { tailwindOnly, devOnly, blacklistEnabled } = await getStorageItems(
    'tailwindOnly',
    'devOnly',
    'blacklistEnabled'
  )

  if (tailwindOnly && isSiteUsingTailwind() === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (devOnly && (await isSiteUsingDevelopmentUrl()) === false) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (blacklistEnabled && (await isSiteBlacklisted())) {
    if (isTooltipDisplayed) hideTooltip()
    return
  }

  if (isTooltipDisplayed === false) displayTooltip()
})

chrome.runtime.onMessage.addListener(async ({ event }, _, sendResponse) => {
  if (event !== 'getCurrentSite') return

  const currentSite = window.location.hostname

  sendResponse(currentSite)
})

chrome.runtime.onMessage.addListener(async ({ event }) => {
  if (event !== 'tabChanged') return

  document.getElementById('respify-tooltip').style.display = 'none'

  loadOrNotTooltip()
})
