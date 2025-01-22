document.addEventListener('DOMContentLoaded', () => {
  const checkbox = document.getElementById('toggle-checkbox')

  const toggleIcon = document.getElementById('toggle-icon')

  chrome.storage.local.get('toggled', data => {
    checkbox.checked = data.toggled

    toggleIcon.src = data.toggled ? '../../images/eye.svg' : '../../images/eye-off.svg'
  })

  checkbox.addEventListener('change', () => {
    const isChecked = checkbox.checked

    chrome.storage.local.set({ toggled: isChecked })

    chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) =>
      chrome.tabs.sendMessage(currentTab.id, { event: 'toggleChanged', toggled: isChecked })
    )

    toggleIcon.src = isChecked ? '../../images/eye.svg' : '../../images/eye-off.svg'
  })
})
