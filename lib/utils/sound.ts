  export function playOrderAlert() {
    try {
      const audio = new Audio("/sounds/order-alert.mp3")
      audio.play()
    } catch (e) {
      // silently fail if audio not available
    }
  }