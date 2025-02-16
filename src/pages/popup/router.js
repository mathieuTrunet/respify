document.addEventListener('DOMContentLoaded', () => {
  setWhitelistLink()
  setBlacklistLink()
  setDevUrlListLink()

  setTooltipSettingsLink()

  setListMainPageLink()
  setTooltipSettingsMainLink()
})

const getListLinkSetter = listHrefId => () => {
  document.getElementById(listHrefId).addEventListener('click', () => {
    const listDiv = document.getElementById('list-div')
    const mainDiv = document.getElementById('main-div')

    listDiv.style.display = 'block'
    mainDiv.style.display = 'none'
  })
}

const setWhitelistLink = getListLinkSetter('manage-whitelist')
const setBlacklistLink = getListLinkSetter('manage-blacklist')
const setDevUrlListLink = getListLinkSetter('manage-dev-url-list')

const setTooltipSettingsLink = () => {
  const tooltipSettingsDiv = document.getElementById('tooltip-settings-div')
  const mainDiv = document.getElementById('main-div')

  document.getElementById('manage-tooltip-settings').addEventListener('click', () => {
    tooltipSettingsDiv.style.display = 'block'
    mainDiv.style.display = 'none'
  })
}

const getMainPageLinkSetter = (closeButtonId, currentDivId) => () => {
  document.getElementById(closeButtonId).addEventListener('click', () => {
    const currentDiv = document.getElementById(currentDivId)
    const mainDiv = document.getElementById('main-div')

    mainDiv.style.display = 'block'
    currentDiv.style.display = 'none'
  })
}

const setListMainPageLink = getMainPageLinkSetter('close-list', 'list-div')
const setTooltipSettingsMainLink = getMainPageLinkSetter('close-tooltip-settings', 'tooltip-settings-div')
