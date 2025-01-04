chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    console.log('User switched to tab:', tab.url)
    chrome.tabs.sendMessage(activeInfo.tabId, { action: 'checkTailwind' })
  })
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tailwindDetected !== undefined) {
    console.log('TailwindCSS detected:', message.tailwindDetected)
    chrome.notifications.create({
      type: 'basic',
      iconUrl: '48.png',
      title: 'TailwindCSS Detection',
      message: message.tailwindDetected && 'TailwindCSS is used on this page.',
    })
  }
})
