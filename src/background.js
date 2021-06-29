let targets


const validSubDomain = url => (
  new URL(url).hostname
    .split('.')
    .map((sub, i, arr) => (
      arr
        .slice(i)
        .join('.')
    ))
    .slice(0, -1)
    .find(sub => targets.has(sub))
)


const onUpdated = (tabId, changeInfo, { url }) => {
  const domain = validSubDomain(url)
  console.log(targets, domain)
  if (
    domain !== undefined
    && changeInfo.status === 'complete'
    && /^http/.test(url)
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

