document.addEventListener('DOMContentLoaded', () => {
  loadWhitelistContent()
  loadBlacklistContent()
  loadDevSitesListContent()
})

const sendListChangedEvent = () =>
  chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) =>
    chrome.tabs.sendMessage(currentTab.id, { event: 'listChanged' })
  )

const getListContentLoader = (listDivId, storageKey) => async () => {
  const { [storageKey]: storageList } = await chrome.storage.local.get(storageKey)

  for (const entry of storageList.entries()) {
    const row = createRowElement(storageKey, entry)

    document.getElementById(listDivId).appendChild(row)
  }

  const inputRowElement = createInputRowElement(storageKey)

  document.getElementById(listDivId).appendChild(inputRowElement)
}

const createRowElement = (storageKey, entry) => {
  const [index, { key: name, value: rule }] = entry

  const rowElement = document.createElement('div')
  rowElement.id = index
  rowElement.className = 'flex space-x-2 border'

  const nameText = document.createElement('div')
  nameText.textContent = name

  const ruleText = document.createElement('div')
  ruleText.textContent = rule

  const deleteButton = createDeleteButtonElement(storageKey, index)

  rowElement.appendChild(nameText)
  rowElement.appendChild(ruleText)
  rowElement.appendChild(deleteButton)

  return rowElement
}

const createDeleteButtonElement = (storageKey, index) => {
  const deleteButton = document.createElement('div')
  deleteButton.textContent = '❌'

  deleteButton.addEventListener('click', async () => {
    const { [storageKey]: storageList } = await chrome.storage.local.get(storageKey)

    const updatedList = storageList.filter((_, i) => i !== index)

    chrome.storage.local.set({ [storageKey]: updatedList })
    sendListChangedEvent()

    const listDiv = deleteButton.parentElement.parentElement
    const listDivId = listDiv.id

    listDiv.innerHTML = ''

    getListContentLoader(listDivId, storageKey)()
  })

  return deleteButton
}

const createInputRowElement = storageKey => {
  const inputRowElement = document.createElement('div')
  inputRowElement.className = 'flex space-x-2'

  const nameInput = document.createElement('input')
  const ruleInput = document.createElement('input')

  nameInput.placeholder = 'Name'
  ruleInput.placeholder = 'Rule'

  const createButton = document.createElement('div')
  createButton.textContent = '➕'
  createButton.addEventListener('click', async () => {
    if (nameInput.value.length === 0 || ruleInput.value.length === 0) return

    const { [storageKey]: storageList } = await chrome.storage.local.get(storageKey)

    chrome.storage.local.set({ [storageKey]: [...storageList, { key: nameInput.value, value: ruleInput.value }] })
    sendListChangedEvent()

    const listDiv = inputRowElement.parentElement
    const listDivId = listDiv.id

    listDiv.innerHTML = ''

    getListContentLoader(listDivId, storageKey)()
  })

  inputRowElement.appendChild(nameInput)
  inputRowElement.appendChild(ruleInput)
  inputRowElement.appendChild(createButton)

  return inputRowElement
}

const loadWhitelistContent = getListContentLoader('whitelist-div', 'whitelist')
const loadBlacklistContent = getListContentLoader('blacklist-div', 'blacklist')
const loadDevSitesListContent = getListContentLoader('dev-url-div', 'devSitesList')
