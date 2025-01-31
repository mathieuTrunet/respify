document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('toggle-checkbox')

  chrome.storage.local.get('toggled', data => (checkbox.checked = data.toggled))

  checkbox.addEventListener('change', () => {
    const isChecked = checkbox.checked

    chrome.storage.local.set({ toggled: isChecked })

    chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) =>
      chrome.tabs.sendMessage(currentTab.id, { event: 'toggleChanged', toggled: isChecked })
    )
  })
})
