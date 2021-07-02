// service worker!
let targets

const ensureTargets = async () => {
  targets = new Map(Object.entries(await (await fetch('config/vexa.json')).json()))
}

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

chrome.webNavigation.onCompleted.addListener(async ({ tabId, url }) => {
  await ensureTargets()
  const domain = validSubDomain(url)
  console.log(targets, domain)
  if (
    domain !== undefined
    && /^http/.test(url)
  ) {

    const target = targets.get(domain)

    if (target.css) {
      // css injection goes here
    }
    if (target.load) {
      chrome.scripting.executeScript({
        target: { tabId },
        files: ['./foreground.js'],
      })
        .then(() => {
          console.log('injected.')
          chrome.tabs.sendMessage(tabId, target.load)
          console.log('task assigned.')
        })
        .catch(e => console.error(e))
    }
    if (target.update) {
      console.log('update is not yet supported')
    }
  }
})

chrome.runtime.onInstalled.addListener(async () => {
  console.log('alive')
})

