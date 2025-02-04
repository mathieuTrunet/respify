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

const getCheckboxInitalizer = (checkboxId, storageKey, eventMEssageKey) => () => {
  const checkbox = document.getElementById(checkboxId)

  chrome.storage.local.get(storageKey, ({ [storageKey]: storageValue }) => (checkbox.checked = storageValue))

  checkbox.addEventListener('change', () => {
    const checkBoxIsChecked = checkbox.checked

    chrome.storage.local.set({ [storageKey]: checkBoxIsChecked })

    sendMessageToContentScript({ event: eventMEssageKey, value: checkBoxIsChecked })
  })
}

const initalizeTailwindOnlyCheckbox = getCheckboxInitalizer(
  'tailwind-only-checkbox',
  'tailwindOnly',
  'tailwindOnlyChanged'
)
const initializeDevOnlyCheckbox = getCheckboxInitalizer('dev-only-checkbox', 'devOnly', 'devOnlyChanged')
