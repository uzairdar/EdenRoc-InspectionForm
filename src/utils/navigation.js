export const navigateToHash = (hash) => {
  window.history.pushState(null, '', hash)
  window.dispatchEvent(new Event('hashchange'))
}
