document.addEventListener('DOMContentLoaded', () => {
  setExtensionEnableCheckboxEvent()

  setDevOnlyCheckboxEvent()
  setTailwindOnlyCheckboxEvent()
  setWhitelistCheckboxEvent()
  setBlacklistCheckboxEvent()

  setWhitelistLink()
  setBlacklistLink()
  setDevUrlListLink()
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

const getListLinkSetter = listHrefId => () => {
  document.getElementById(listHrefId).addEventListener('click', () => {
    const list = document.getElementById('list-div')
    const main = document.getElementById('main-div')

    list.style.display = 'block'
    main.style.display = 'none'
  })
}

const setWhitelistLink = getListLinkSetter('manage-whitelist')
const setBlacklistLink = getListLinkSetter('manage-blacklist')
const setDevUrlListLink = getListLinkSetter('manage-dev-url-list')
