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

const getCheckboxEventSetter =
  ({ checkboxId, storageKey, eventMessageKey, overload }) =>
  () => {
    const checkbox = document.getElementById(checkboxId)

    chrome.storage.local.get(storageKey, ({ [storageKey]: storageValue }) => {
      checkbox.checked = storageValue
      if (overload) overload(storageValue)
    })

    checkbox.addEventListener('change', () => {
      const checkBoxIsChecked = checkbox.checked

      chrome.storage.local.set({ [storageKey]: checkBoxIsChecked })

      sendEvent({ event: eventMessageKey, value: checkBoxIsChecked })

      if (overload) overload(checkBoxIsChecked)
    })
  }

const toggleOtherCheckboxes = value => {
  const devOnlyCheckbox = document.getElementById('dev-only-checkbox')
  const tailwindOnlyCheckbox = document.getElementById('tailwind-only-checkbox')
  const blacklistCheckbox = document.getElementById('blacklist-checkbox')

  devOnlyCheckbox.disabled = value
  tailwindOnlyCheckbox.disabled = value
  blacklistCheckbox.disabled = value

  const manageBlacklistButton = document.getElementById('manage-blacklist')
  const manageDevUrlButton = document.getElementById('manage-dev-url-list')

  manageBlacklistButton.disabled = value
  manageDevUrlButton.disabled = value

  manageBlacklistButton.style.opacity = value ? 0.5 : 1
  manageDevUrlButton.style.opacity = value ? 0.5 : 1
}

const setWhitelistCheckboxEvent = getCheckboxEventSetter({
  checkboxId: 'whitelist-checkbox',
  storageKey: 'whitelistEnabled',
  eventMessageKey: 'whitelistChanged',
  overload: value => toggleOtherCheckboxes(value),
})
const setBlacklistCheckboxEvent = getCheckboxEventSetter({
  checkboxId: 'blacklist-checkbox',
  storageKey: 'blacklistEnabled',
  eventMessageKey: 'blacklistChanged',
})
const setDevOnlyCheckboxEvent = getCheckboxEventSetter({
  checkboxId: 'dev-only-checkbox',
  storageKey: 'devOnly',
  eventMessageKey: 'devOnlyChanged',
})
const setTailwindOnlyCheckboxEvent = getCheckboxEventSetter({
  checkboxId: 'tailwind-only-checkbox',
  storageKey: 'tailwindOnly',
  eventMessageKey: 'tailwindOnlyChanged',
})

const setResetTooltipPositionEvent = () => {
  const resetTooltipPosition = document.getElementById('reset-tooltip-position')

  resetTooltipPosition.addEventListener('click', () => sendEvent({ event: 'resetTooltipPosition' }))
}
