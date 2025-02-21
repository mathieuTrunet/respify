chrome.tabs.onActivated.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) =>
    chrome.tabs.sendMessage(currentTab.id, { event: 'tabChanged' })
  )
})
