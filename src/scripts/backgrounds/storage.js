chrome.runtime.onInstalled.addListener(
  ({ reason }) => reason === 'install' && chrome.storage.local.set({ toggled: true })
)
