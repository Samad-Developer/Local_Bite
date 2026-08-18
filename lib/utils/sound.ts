const ORDER_ALERT_SRC = "/sounds/order-soft-chime.wav"

let audio: HTMLAudioElement | null = null
let unlocked = false

function getAudio() {
  if (typeof window === "undefined") return null
  if (!audio) {
    audio = new Audio(ORDER_ALERT_SRC)
    audio.preload = "auto"
  }
  return audio
}

export function isAudioUnlocked() {
  return unlocked
}

export async function unlockOrderAlert() {
  const a = getAudio()
  if (!a || unlocked) return

  a.muted = true
  try {
    await a.play()
    a.pause()
    a.currentTime = 0
    unlocked = true
  } catch {
  } finally {
    a.muted = false
  }
}

export async function playOrderAlert() {
  const a = getAudio()
  if (!a) return

  a.currentTime = 0
  try {
    await a.play()
  } catch (err) {
    console.warn("[order-alert] could not play:", (err as Error).name, err)
  }
}
