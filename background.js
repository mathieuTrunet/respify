chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, _ => {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '48.png',
      title: 'TailwindCSS Detection',
      message: 'TailwindCSS is used on this page.',
    })
  })
})
