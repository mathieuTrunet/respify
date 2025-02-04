document.addEventListener('DOMContentLoaded', () => {
  initializeExtensionEnable()
  initalizeTailwindOnlyCheckbox()
  initializeDevOnlyCheckbox()
})

const sendMessageToContentScript = ({ event, value }) =>
  chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) =>
    chrome.tabs.sendMessage(currentTab.id, { event: event, value: value })
  )

const initializeExtensionEnable = () => {
  const checkbox = document.getElementById('extension-enable-checkbox')

  chrome.storage.local.get('extensionEnabled', ({ extensionEnabled }) => {
    checkbox.checked = extensionEnabled
    if (extensionEnabled === false) document.getElementById('extension-enabled-div').style.display = 'none'
  })

  checkbox.addEventListener('change', () => {
    const checkBoxIsChecked = checkbox.checked

    chrome.storage.local.set({ extensionEnabled: checkBoxIsChecked })

    sendMessageToContentScript({ event: 'extensionEnableChanged', value: checkBoxIsChecked })

    const tooltip = document.getElementById('extension-enabled-div')

    if (checkBoxIsChecked) tooltip.style.display = 'block'
    else tooltip.style.display = 'none'
  })
}

const initalizeTailwindOnlyCheckbox = () => {
  const checkbox = document.getElementById('tailwind-only-checkbox')

  chrome.storage.local.get('tailwindOnly', data => (checkbox.checked = data.tailwindOnly))

  checkbox.addEventListener('change', () => {
    const checkBoxIsChecked = checkbox.checked

    chrome.storage.local.set({ tailwindOnly: checkBoxIsChecked })

    sendMessageToContentScript({ event: 'tailwindOnlyChanged', value: checkBoxIsChecked })
  })
}

const initializeDevOnlyCheckbox = () => {
  const checkbox = document.getElementById('dev-only-checkbox')

  chrome.storage.local.get('devOnly', data => (checkbox.checked = data.devOnly))

  checkbox.addEventListener('change', () => {
    const checkBoxIsChecked = checkbox.checked

    chrome.storage.local.set({ devOnly: checkBoxIsChecked })

    sendMessageToContentScript({ event: 'devOnlyChanged', value: checkBoxIsChecked })
  })
}
