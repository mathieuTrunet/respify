document.addEventListener('DOMContentLoaded', () => {
  loadBreakpointsList()

  restoreDefaultBreakpoints()

  // Initialize tooltip size controls
  initTooltipSizeControls()
  restoreDefaultTooltipSize()
})

const DEFAULT_BREAKPOINTS = [
  { key: 'sm', value: 640 },
  { key: 'md', value: 768 },
  { key: 'lg', value: 1024 },
  { key: 'xl', value: 1280 },
  { key: '2xl', value: 1536 },
]

// Default tooltip size (100%)
const DEFAULT_TOOLTIP_SIZE = 100

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
    nameText.className = 'font-medium w-24 truncate'
    nameText.title = breakpointKey

    const ruleText = document.createElement('span')
    ruleText.textContent = breakpointValue
    ruleText.className = 'text-gray-600 w-24 truncate text-right'
    ruleText.title = breakpointValue

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

  const inputClass = 'border rounded px-2 py-1 text-sm w-24 focus:outline-[#1DAAAA]'
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

// Initialize tooltip size controls
const initTooltipSizeControls = async () => {
  const sizeSlider = document.getElementById('tooltip-size-slider')
  const sizeValueDisplay = document.getElementById('tooltip-size-value')

  // Get stored size or use default
  const { tooltipSize = DEFAULT_TOOLTIP_SIZE } = await chrome.storage.local.get('tooltipSize')

  // Set initial slider value
  sizeSlider.value = tooltipSize
  sizeValueDisplay.textContent = `${tooltipSize}%`

  // Update size when slider changes
  sizeSlider.addEventListener('input', () => {
    const newSize = parseInt(sizeSlider.value)
    sizeValueDisplay.textContent = `${newSize}%`

    // Store the new size
    chrome.storage.local.set({ tooltipSize: newSize })

    // Notify content script about the size change
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { event: 'tooltipSizeChanged', size: newSize })
      }
    })
  })
}

// Restore default tooltip size
const restoreDefaultTooltipSize = () => {
  document.getElementById('restore-default-tooltip-size').addEventListener('click', () => {
    // Reset to default size
    chrome.storage.local.set({ tooltipSize: DEFAULT_TOOLTIP_SIZE })

    // Update UI
    const sizeSlider = document.getElementById('tooltip-size-slider')
    const sizeValueDisplay = document.getElementById('tooltip-size-value')
    sizeSlider.value = DEFAULT_TOOLTIP_SIZE
    sizeValueDisplay.textContent = `${DEFAULT_TOOLTIP_SIZE}%`

    // Notify content script
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { event: 'tooltipSizeChanged', size: DEFAULT_TOOLTIP_SIZE })
      }
    })
  })
}
