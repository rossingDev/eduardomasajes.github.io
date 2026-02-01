import { supabase } from "./supabase.js"

document
  .getElementById("btnLogin")
  .addEventListener("click", async () => {

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      alert("Login incorrecto")
      console.error(error)
    } else {
      window.location.href = "../admin/"
    }
})
