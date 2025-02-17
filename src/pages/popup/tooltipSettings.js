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
    rowElement.className = 'flex space-x-2 border-b border-gray-200'

    const nameText = document.createElement('div')
    nameText.textContent = breakpointKey

    const ruleText = document.createElement('div')
    ruleText.textContent = breakpointValue

    const deleteButton = document.createElement('div')
    deleteButton.textContent = '❌'

    deleteButton.addEventListener('click', async () => {
      const { breakpointsList } = await chrome.storage.local.get('breakpointsList')

      const updatedList = breakpointsList.filter((_, i) => i !== index)

      chrome.storage.local.set({ breakpointsList: updatedList })

      const breakpointsDiv = deleteButton.parentElement.parentElement

      breakpointsDiv.innerHTML = ''

      loadBreakpointsList()
    })

    rowElement.appendChild(nameText)
    rowElement.appendChild(ruleText)
    rowElement.appendChild(deleteButton)

    breakpointsDiv.appendChild(rowElement)
  }

  const inputRowElement = document.createElement('div')
  inputRowElement.className = 'flex space-x-2 border-b border-gray-200'

  const keyInput = document.createElement('input')
  const breakpointInput = document.createElement('input')

  keyInput.placeholder = 'Breakpoint key'
  breakpointInput.placeholder = 'Breakpoint value'

  const addButton = document.createElement('div')
  addButton.textContent = '➕'

  addButton.addEventListener('click', async () => {
    if (keyInput.value.length === 0 || breakpointInput.value.length === 0) return

    const { breakpointsList } = await chrome.storage.local.get('breakpointsList')

    chrome.storage.local.set({
      breakpointsList: [...breakpointsList, { key: keyInput.value, value: breakpointInput.value }],
    })

    breakpointsDiv.innerHTML = ''

    loadBreakpointsList()
  })

  inputRowElement.appendChild(keyInput)
  inputRowElement.appendChild(breakpointInput)
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
