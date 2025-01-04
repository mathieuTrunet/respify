function checkTailwind() {
  // Check for TailwindCSS classes
  const hasTailwindClasses = !!document.querySelector(
    '[class*="tw-"], [class*="sm:"], [class*="md:"], [class*="lg:"], [class*="xl:"]'
  )

  // Check for TailwindCSS stylesheet
  const hasTailwindStylesheet = Array.from(document.styleSheets).some(
    sheet => sheet.href && sheet.href.includes('tailwind')
  )

  chrome.runtime.sendMessage({
    tailwindDetected: hasTailwindClasses || hasTailwindStylesheet,
  })
}

// Listen for messages from the background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkTailwind') checkTailwind()
})

// Optionally, run the check when the content script is first loaded
checkTailwind()
