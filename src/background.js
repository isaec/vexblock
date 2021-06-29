let targets

chrome.runtime.onInstalled.addListener(async () => {
  console.log('reading vexa.json...')
  const resp = await (await fetch('config/vexa.json')).json()
  targets = new Map(Object.entries(resp))
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, { url, /*...tab*/ }) => {
  if (
    changeInfo.status === 'complete'
    && /^http/.test(url)
    && targets !== undefined
    && targets.has(url.match(/(?<=\/\/).*?(?=\/)/)[0])
  ) {
    chrome.scripting.executeScript({
      target: { tabId },
      files: ['./foreground.js'],
    })
      .then(() => {
        console.log('injected.')
        chrome.tabs.sendMessage(tabId, 'browser barrier breached')
        console.log('task assigned.')
      })
      .catch(e => console.log(e))
  }
})