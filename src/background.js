// service worker!
let targets

const ensureTargets = async () => {
  if (!targets) targets = new Map(Object.entries(await (await fetch('config/vexa.json')).json()))
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

chrome.webNavigation.onCommitted.addListener(async ({ tabId, url }) => {
  await ensureTargets()
  const domain = validSubDomain(url)
  if (
    domain !== undefined
    && /^http/.test(url)
  ) {

    const target = targets.get(domain)

    if (target.css) {
      chrome.scripting.insertCSS({
        css: `${target.css} { display: none !important; }`,
        origin: 'AUTHOR',
        target: {
          tabId
        }
      })
    }

    //to eventually use on change ect, use args for script injection
  }
})

chrome.runtime.onInstalled.addListener(async () => {
  console.log('alive')
})