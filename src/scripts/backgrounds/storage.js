chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason !== 'install') return

  chrome.storage.local.set({
    extensionEnabled: true,
    whiteListEnabled: false,
    whiteList: [],
    blackListEnabled: false,
    blackList: [],
    tailwindOnly: true,
    devOnly: false,
    devSitesList: [],
  })
})
