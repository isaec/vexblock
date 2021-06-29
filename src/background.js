const targets = new Map()

chrome.runtime.onInstalled.addListener(async () => {
  console.log('reading vexa.json...')
  const resp = await (await fetch('config/vexa.json')).json()
  console.log(resp)
})

chrome.tabs.onUpdated.addListener((tabId, changeInfo, { url, /*...tab*/ }) => {
  if (changeInfo.status === 'complete' && /^http/.test(url)) {
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