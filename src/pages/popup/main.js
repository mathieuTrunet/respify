document.addEventListener('DOMContentLoaded', () => {
  setExtensionEnableCheckboxEvent()

  setDevOnlyCheckboxEvent()
  setTailwindOnlyCheckboxEvent()
  setWhitelistCheckboxEvent()
  setBlacklistCheckboxEvent()

  setResetTooltipPositionEvent()
})

const sendEvent = ({ event, value }) =>
  chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) =>
    chrome.tabs.sendMessage(currentTab.id, { event: event, value: value })
  )

const setExtensionEnableCheckboxEvent = () => {
  const checkbox = document.getElementById('extension-enable-checkbox')

  chrome.storage.local.get('extensionEnabled', ({ extensionEnabled }) => {
    checkbox.checked = extensionEnabled
    if (extensionEnabled === false) document.getElementById('extension-enabled-div').style.display = 'none'
  })

  checkbox.addEventListener('change', () => {
    const checkBoxIsChecked = checkbox.checked

    chrome.storage.local.set({ extensionEnabled: checkBoxIsChecked })

    sendEvent({ event: 'extensionEnableChanged', value: checkBoxIsChecked })

    const tooltip = document.getElementById('extension-enabled-div')

    if (checkBoxIsChecked) tooltip.style.display = 'block'
    else tooltip.style.display = 'none'
  })
}

const getCheckboxEventSetter = (checkboxId, storageKey, eventMessageKey) => () => {
  const checkbox = document.getElementById(checkboxId)

  chrome.storage.local.get(storageKey, ({ [storageKey]: storageValue }) => (checkbox.checked = storageValue))

  checkbox.addEventListener('change', () => {
    const checkBoxIsChecked = checkbox.checked

    chrome.storage.local.set({ [storageKey]: checkBoxIsChecked })

    sendEvent({ event: eventMessageKey, value: checkBoxIsChecked })
  })
}

const setDevOnlyCheckboxEvent = getCheckboxEventSetter('dev-only-checkbox', 'devOnly', 'devOnlyChanged')
const setTailwindOnlyCheckboxEvent = getCheckboxEventSetter(
  'tailwind-only-checkbox',
  'tailwindOnly',
  'tailwindOnlyChanged'
)
const setWhitelistCheckboxEvent = getCheckboxEventSetter(
  'whitelist-checkbox',
  'whitelistEnabled',
  'whitelistChanged'
)
const setBlacklistCheckboxEvent = getCheckboxEventSetter(
  'blacklist-checkbox',
  'blacklistEnabled',
  'blacklistChanged'
)

const setResetTooltipPositionEvent = () => {
  const resetTooltipPosition = document.getElementById('reset-tooltip-position')

  resetTooltipPosition.addEventListener('click', () => sendEvent({ event: 'resetTooltipPosition' }))
}
