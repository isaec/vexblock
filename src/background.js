let targets

const onUpdated = (tabId, changeInfo, { url }) => {
  const domain = new URL(url).hostname
  console.log(targets, domain)
  if (
    changeInfo.status === 'complete'
    && /^http/.test(url)
    && targets.has(domain)
  ) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['./foreground.js'],
    })
      .then(() => {
        console.log('injected.')
        chrome.tabs.sendMessage(tabId, targets.get(domain))
        console.log('task assigned.')
      })
      .catch(e => console.log(e))
  }
}


chrome.runtime.onInstalled.addListener(async () => {
  console.log('reading vexa.json...')
  const resp = await (await fetch('config/vexa.json')).json()
  targets = new Map(Object.entries(resp))
  chrome.tabs.onUpdated.addListener(onUpdated)
})

