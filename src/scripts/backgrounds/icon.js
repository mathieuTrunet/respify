const updateExtensionIcon = enabled => {
  if (enabled) return chrome.action.setBadgeText({ text: '' })

  chrome.action.setBadgeBackgroundColor({ color: '#888888' })
  chrome.action.setBadgeText({ text: 'OFF' })
}

chrome.storage.local.get('extensionEnabled', ({ extensionEnabled = true }) =>
  updateExtensionIcon(extensionEnabled)
)

chrome.storage.onChanged.addListener(({ extensionEnabled: { newValue } }) => updateExtensionIcon(newValue))
