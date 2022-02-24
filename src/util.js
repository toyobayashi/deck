export function toggleAutoPlayOnClick (delay) {
  if (typeof document !== 'undefined') {
    let timer = 0
    let interval = false
    document.addEventListener('click', () => {
      if (!interval) {
        clearInterval(timer)
        timer = setInterval(() => {
          const e = new KeyboardEvent("keydown", { keyCode: 39 })
          window.dispatchEvent(e)
        }, delay)
        interval = true
      } else {
        clearInterval(timer)
        interval = false
      }
    })
  }
}
