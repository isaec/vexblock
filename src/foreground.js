console.log('foreground, awaiting task')
chrome.runtime.onMessage.addListener((task) => {
  document.querySelectorAll(task.default)
    .forEach(
      el => { el.remove() }
    )
  console.log('task is done')
})