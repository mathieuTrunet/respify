chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason !== 'install') return

  chrome.storage.local.set({
    extensionEnabled: true,
    whitelistEnabled: false,
    whitelist: [],
    blacklistEnabled: false,
    blacklist: [],
    tailwindOnly: true,
    devOnly: false,
    devSitesList: [
      { key: 'localhost:*', value: '/(localhost(:d{1,5})?|127.(d{1,3}).(d{1,3}).(d{1,3}))/' },
      { key: '127.*.*.*', value: '/(localhost(:d{1,5})?|127.(d{1,3}).(d{1,3}).(d{1,3}))/' },
    ],
  })
})
