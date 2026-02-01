import { supabase } from "./supabase.js"

// ======================
// AUTH (Login / Panel)
// ======================
const { data: { user } } = await supabase.auth.getUser()

const btnLogin = document.getElementById("menu-login")
const btnPanel = document.getElementById("menu-panel")

if (user) {
  btnLogin?.classList.add("hiddenLogin")
  btnPanel?.classList.remove("hiddenLogin")
} else {
  btnPanel?.classList.add("hiddenLogin")
  btnLogin?.classList.remove("hiddenLogin")
}

// ======================
// MENU SLIDE
// ======================
const menuBtn = document.getElementById("menu-toggle")
const menuPopover = document.getElementById("menu-popover")
const overlay = document.getElementById("menu-overlay")
const closeBtn = document.getElementById("menu-close")

menuBtn?.addEventListener("click", e => {
  e.stopPropagation()
  menuPopover.classList.add("open")
  overlay.classList.add("show")
})

closeBtn?.addEventListener("click", () => {
  menuPopover.classList.remove("open")
  overlay.classList.remove("show")
})

overlay?.addEventListener("click", () => {
  menuPopover.classList.remove("open")
  overlay.classList.remove("show")
})

document.addEventListener("click", e => {
  if (
    menuPopover &&
    !menuPopover.contains(e.target) &&
    !menuBtn.contains(e.target)
  ) {
    menuPopover.classList.remove("open")
    overlay.classList.remove("show")
  }
})

document.querySelectorAll("#menu-popover a").forEach(link => {
  link.addEventListener("click", () => {
    menuPopover.classList.remove("open")
    overlay.classList.remove("show")
  })
})
