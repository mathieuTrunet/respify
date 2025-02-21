document.addEventListener('DOMContentLoaded', () => {
  loadBreakpointsList()

  restoreDefaultBreakpoints()
})

const DEFAULT_BREAKPOINTS = [
  { key: 'sm', value: 640 },
  { key: 'md', value: 768 },
  { key: 'lg', value: 1024 },
  { key: 'xl', value: 1280 },
  { key: '2xl', value: 1536 },
]

const loadBreakpointsList = async () => {
  const breakpointsDiv = document.getElementById('breakpoints-div')

  const { breakpointsList } = await chrome.storage.local.get('breakpointsList')

  for (const [index, { key: breakpointKey, value: breakpointValue }] of breakpointsList.entries()) {
    const rowElement = document.createElement('div')
    rowElement.id = index
    rowElement.className = 'flex items-center justify-between py-2 border-b border-gray-200'

    const contentWrapper = document.createElement('div')
    contentWrapper.className = 'flex items-center gap-8 flex-1'

    const nameText = document.createElement('span')
    nameText.textContent = breakpointKey
    nameText.className = 'font-medium w-16'

    const ruleText = document.createElement('span')
    ruleText.textContent = breakpointValue
    ruleText.className = 'text-gray-600 w-16 text-right'

    const deleteButton = document.createElement('button')
    deleteButton.className = 'hover:opacity-80 ml-4'

    const deleteIcon = document.createElement('img')
    deleteIcon.src = '../../assets/x.svg'
    deleteIcon.alt = 'Delete'
    deleteIcon.className = 'w-4 h-4'

    deleteButton.appendChild(deleteIcon)

    deleteButton.addEventListener('click', async () => {
      const { breakpointsList } = await chrome.storage.local.get('breakpointsList')

      const updatedList = breakpointsList.filter((_, i) => i !== index)

      chrome.storage.local.set({ breakpointsList: updatedList })

      const breakpointsDiv = deleteButton.parentElement.parentElement

      breakpointsDiv.innerHTML = ''

      loadBreakpointsList()
    })

    contentWrapper.appendChild(nameText)
    contentWrapper.appendChild(ruleText)
    rowElement.appendChild(contentWrapper)
    rowElement.appendChild(deleteButton)

    breakpointsDiv.appendChild(rowElement)
  }

  const inputRowElement = document.createElement('div')
  inputRowElement.className = 'flex items-center justify-between py-2'

  const inputWrapper = document.createElement('div')
  inputWrapper.className = 'flex items-center gap-8 flex-1'

  const keyInput = document.createElement('input')
  const breakpointInput = document.createElement('input')

  const inputClass = 'border rounded px-2 py-1 text-sm w-16'
  keyInput.className = inputClass
  breakpointInput.className = inputClass

  keyInput.placeholder = 'Key'
  breakpointInput.placeholder = 'Value'

  const addButton = document.createElement('button')
  addButton.className = 'hover:opacity-80 ml-4'

  const addIcon = document.createElement('img')
  addIcon.src = '../../assets/plus.svg'
  addIcon.alt = 'Add'
  addIcon.className = 'w-4 h-4'

  addButton.appendChild(addIcon)

  addButton.addEventListener('click', async () => {
    if (keyInput.value.length === 0 || breakpointInput.value.length === 0) return

    const { breakpointsList } = await chrome.storage.local.get('breakpointsList')

    chrome.storage.local.set({
      breakpointsList: [...breakpointsList, { key: keyInput.value, value: breakpointInput.value }],
    })

    breakpointsDiv.innerHTML = ''

    loadBreakpointsList()
  })

  inputWrapper.appendChild(keyInput)
  inputWrapper.appendChild(breakpointInput)
  inputRowElement.appendChild(inputWrapper)
  inputRowElement.appendChild(addButton)

  breakpointsDiv.appendChild(inputRowElement)
}

const restoreDefaultBreakpoints = () => {
  document.getElementById('restore-default-breakpoints').addEventListener('click', () => {
    chrome.storage.local.set({ breakpointsList: DEFAULT_BREAKPOINTS })

    const breakpointsDiv = document.getElementById('breakpoints-div')

    breakpointsDiv.innerHTML = ''

    loadBreakpointsList()
  })
}
