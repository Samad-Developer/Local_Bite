// Order alert audio.
//
// Browsers block audio until the user has interacted with the page, so we
// "unlock" a single reused Audio element on the first click/keypress and
// replay that same element for every order after that.
//
// Swap the alert by pointing this at another file in public/sounds/.
// Options generated so far: order-soft-chime, order-doorbell,
// order-double-beep, order-warm-bell, order-notify-pop.
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

// Play + immediately pause while muted. Counts as the gesture-initiated play
// the autoplay policy wants, so later calls from the realtime handler are allowed.
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
    // still locked — the next user gesture will retry
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
    // Surface it instead of failing silently — NotAllowedError means the page
    // has not been interacted with yet, NotSupportedError means a bad src.
    console.warn("[order-alert] could not play:", (err as Error).name, err)
  }
}
