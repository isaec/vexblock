chrome.runtime.onInstalled.addListener(() => {
  console.log('woot')
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