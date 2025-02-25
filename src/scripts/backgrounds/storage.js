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
      { key: 'localhost:* & 127.*.*.*', value: '/(localhost(:d{1,5})?|127.(d{1,3}).(d{1,3}).(d{1,3}))/' },
    ],
    breakpointsList: [
      { key: 'sm', value: 640 },
      { key: 'md', value: 768 },
      { key: 'lg', value: 1024 },
      { key: 'xl', value: 1280 },
      { key: '2xl', value: 1536 },
    ],
    tooltipSize: 100,
  })
})
