console.log('foreground, awaiting task')
chrome.runtime.onMessage.addListener((task) => {
  console.log(task)
})