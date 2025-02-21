const DEFAULT_DEV_URLS = [
  { key: 'localhost:*', value: '/(localhost(:d{1,5})?|127.(d{1,3}).(d{1,3}).(d{1,3}))/' },
  { key: '127.*.*.*', value: '/(localhost(:d{1,5})?|127.(d{1,3}).(d{1,3}).(d{1,3}))/' },
]

document.addEventListener('DOMContentLoaded', () => {
  loadWhitelistContent()
  loadBlacklistContent()
  loadDevSitesListContent()
  addDefaultDevSitesListContent()
})

const sendListChangedEvent = () =>
  chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) =>
    chrome.tabs.sendMessage(currentTab.id, { event: 'listChanged' })
  )

const sendGetCurrentSiteEvent = async () =>
  new Promise(resolve =>
    chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) =>
      chrome.tabs.sendMessage(currentTab.id, { event: 'getCurrentSite' }, resolve)
    )
  )

const getListContentLoader =
  ({ listDivId, storageKey }) =>
  async () => {
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
  rowElement.className = 'flex items-center justify-between py-2 border-b border-gray-200'

  const contentWrapper = document.createElement('div')
  contentWrapper.className = 'flex items-center gap-8 flex-1'

  const nameText = document.createElement('span')
  nameText.textContent = name
  nameText.className = 'font-medium w-24 truncate'
  nameText.title = name

  const ruleText = document.createElement('span')
  ruleText.textContent = rule
  ruleText.className = 'text-gray-600 w-24 truncate text-right'
  ruleText.title = rule

  const deleteButton = createDeleteButtonElement(storageKey, index)
  deleteButton.className = 'hover:opacity-80 ml-4'

  contentWrapper.appendChild(nameText)
  contentWrapper.appendChild(ruleText)
  rowElement.appendChild(contentWrapper)
  rowElement.appendChild(deleteButton)

  return rowElement
}

const createDeleteButtonElement = (storageKey, index) => {
  const deleteButton = document.createElement('button')
  deleteButton.className = 'hover:opacity-80'

  const deleteIcon = document.createElement('img')
  deleteIcon.src = '../../assets/x.svg'
  deleteIcon.alt = 'Delete'
  deleteIcon.className = 'w-4 h-4'

  deleteButton.appendChild(deleteIcon)

  deleteButton.addEventListener('click', async () => {
    const { [storageKey]: storageList } = await chrome.storage.local.get(storageKey)

    const updatedList = storageList.filter((_, i) => i !== index)

    chrome.storage.local.set({ [storageKey]: updatedList })
    sendListChangedEvent()

    const listDiv = deleteButton.parentElement.parentElement
    const listDivId = listDiv.id

    listDiv.innerHTML = ''

    getListContentLoader({ listDivId, storageKey })()
  })

  return deleteButton
}

const createInputRowElement = storageKey => {
  const inputRowElement = document.createElement('div')
  inputRowElement.className = 'flex items-center justify-between py-2'

  const inputWrapper = document.createElement('div')
  inputWrapper.className = 'flex items-center gap-4 flex-1'

  const nameInput = document.createElement('input')
  const ruleInput = document.createElement('input')

  const inputClass = 'border rounded px-2 py-1 text-sm w-20 focus:outline-[#1DAAAA]'
  nameInput.className = inputClass
  ruleInput.className = inputClass

  nameInput.placeholder = 'Name'
  ruleInput.placeholder = 'Rule'

  const buttonWrapper = document.createElement('div')
  buttonWrapper.className = 'flex items-center gap-2'

  const addButton = document.createElement('button')
  addButton.className = 'hover:opacity-80'

  const addIcon = document.createElement('img')
  addIcon.src = '../../assets/plus.svg'
  addIcon.alt = 'Add'
  addIcon.className = 'w-4 h-4'

  addButton.appendChild(addIcon)

  addButton.addEventListener('click', async () => {
    if (nameInput.value.length === 0 || ruleInput.value.length === 0) return

    const { [storageKey]: storageList } = await chrome.storage.local.get(storageKey)

    chrome.storage.local.set({ [storageKey]: [...storageList, { key: nameInput.value, value: ruleInput.value }] })
    sendListChangedEvent()

    const listDiv = inputRowElement.parentElement
    const listDivId = listDiv.id

    listDiv.innerHTML = ''

    getListContentLoader({ listDivId, storageKey })()
  })

  const addCurrentButton = document.createElement('button')
  addCurrentButton.className = 'hover:opacity-80'

  const addCurrentIcon = document.createElement('img')
  addCurrentIcon.src = '../../assets/map-pin-plus.svg'
  addCurrentIcon.alt = 'Add Current Site'
  addCurrentIcon.className = 'w-4 h-4'

  addCurrentButton.appendChild(addCurrentIcon)

  addCurrentButton.addEventListener('click', async () => {
    const currentSite = await sendGetCurrentSiteEvent()
    const currentSiteName = currentSite.split('.').slice(0, -1).join('.') || currentSite
    const { [storageKey]: storageList } = await chrome.storage.local.get(storageKey)

    chrome.storage.local.set({ [storageKey]: [...storageList, { key: currentSiteName, value: currentSite }] })
    sendListChangedEvent()

    const listDiv = inputRowElement.parentElement
    const listDivId = listDiv.id

    listDiv.innerHTML = ''

    getListContentLoader({ listDivId, storageKey })()
  })

  inputWrapper.appendChild(nameInput)
  inputWrapper.appendChild(ruleInput)
  buttonWrapper.appendChild(addButton)
  buttonWrapper.appendChild(addCurrentButton)
  inputRowElement.appendChild(inputWrapper)
  inputRowElement.appendChild(buttonWrapper)

  return inputRowElement
}

const loadWhitelistContent = getListContentLoader({ listDivId: 'whitelist-div', storageKey: 'whitelist' })
const loadBlacklistContent = getListContentLoader({ listDivId: 'blacklist-div', storageKey: 'blacklist' })
const loadDevSitesListContent = getListContentLoader({ listDivId: 'dev-url-div', storageKey: 'devSitesList' })

const addDefaultDevSitesListContent = () => {
  document.getElementById('add-default-dev-url').addEventListener('click', async () => {
    const { devSitesList } = await chrome.storage.local.get('devSitesList')

    chrome.storage.local.set({ devSitesList: [...DEFAULT_DEV_URLS, ...devSitesList] })
    sendListChangedEvent()

    const listDiv = document.getElementById('dev-url-div')
    listDiv.innerHTML = ''
    loadDevSitesListContent()
  })
}
