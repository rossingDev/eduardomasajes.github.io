import { supabase } from "./supabase.js"


const { data: { user } } = await supabase.auth.getUser()
const isLogged = !!user

const btnLogin = document.getElementById("menu-login")
const btnPanel = document.getElementById("menu-panel")

if (user) {
  btnLogin?.classList.add("hiddenLogin")
  btnPanel?.classList.remove("hiddenLogin")
} else {
  btnPanel?.classList.add("hiddenLogin")
  btnLogin?.classList.remove("hiddenLogin")
}

const container = document.getElementById("blog-posts")

async function loadPosts() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  container.innerHTML = ""

  posts.forEach(post => {
    container.appendChild(createPostCard(post))
  })
}

loadPosts()

function createPostCard(post) {
  const card = document.createElement("div")
  card.className = "card"

  card.innerHTML = `
    ${post.imagen_url ? `<img src="${post.imagen_url}">` : ""}

    <div class="card-content">
      <h3>${post.titulo}</h3>

      <p class="blog-excerpt">${post.contenido}</p>

      <div class="blog-actions">
        <button class="read-toggle">Leer más</button>
        ${user ? `<button class="btn-editar">Editar</button>` : ""}
      </div>

      <section class="comments" style="display:none">
        <h4>Comentarios</h4>

        <div class="comments-list"></div>

        <form class="comment-form">
          <input placeholder="Nombre (opcional)">
          <input type="email" placeholder="Email (opcional)">
          <textarea placeholder="Escribí tu comentario" required></textarea>
          <button class="btn-submit">Enviar</button>
        </form>
      </section>
    </div>
  `

  setupReadToggle(card, post)
  setupComments(card, post.id)

  if (user) {
    card.querySelector(".btn-editar").addEventListener("click", () => {
      window.location.href = `../admin?editPost=${post.id}`
    })
  }

  return card
}

function setupReadToggle(card, post) {
  const btn = card.querySelector(".read-toggle")
  const text = card.querySelector(".blog-excerpt")
  const comments = card.querySelector(".comments")

  let expanded = false

  btn.addEventListener("click", () => {
    expanded = !expanded

    if (expanded) {
      text.classList.add("expanded")
      btn.textContent = "Leer menos"
      comments.style.display = "block"
      loadComments(post.id, card)
    } else {
      text.classList.remove("expanded")
      btn.textContent = "Leer más"
      comments.style.display = "none"
    }
  })
}

async function loadComments(postId, card) {
  const list = card.querySelector(".comments-list")

  const { data, error } = await supabase
    .from("comentarios")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  list.innerHTML = ""

  data.forEach(c => {
    const div = document.createElement("div")
    div.className = "comment"
    div.innerHTML = `
      <strong>${c.nombre || "Anónimo"}</strong>
      ${user ? `<small class="comment-email">${c.email}</small>` : ""}
      <p>${c.contenido}</p>
      ${user ? `<button class="btn-delete" data-id="${c.id}">Borrar</button>` : ""}
    `
    list.appendChild(div)
  })
}

function setupComments(card, postId) {
  const form = card.querySelector(".comment-form")

  form.addEventListener("submit", async e => {
    e.preventDefault()

    const inputs = form.querySelectorAll("input")
    const textarea = form.querySelector("textarea")

    const nombre = inputs[0].value
    const email = inputs[1].value
    const contenido = textarea.value

    const { error } = await supabase
      .from("comentarios")
      .insert({
        post_id: postId,
        nombre,
        email,
        contenido
      })

    if (error) {
      console.error(error)
      return
    }

    form.reset()
    loadComments(postId, card)
  })
}

const menuBtn = document.getElementById("menu-toggle")
const menuPopover = document.getElementById("menu-popover")
const overlay = document.getElementById("menu-overlay")
const closeBtn = document.getElementById("menu-close")

menuBtn.addEventListener("click", e => {
  e.stopPropagation()
  menuPopover.classList.toggle("open")
  overlay.classList.toggle("show")
})

overlay.addEventListener("click", () => {
  menuPopover.classList.remove("open")
  overlay.classList.remove("show")
})

document.addEventListener("click", e => {
  if (!menuPopover.contains(e.target) && !menuBtn.contains(e.target)) {
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

closeBtn.addEventListener("click", () => {
  menuPopover.classList.remove("open")
  overlay.classList.remove("show")
})

document.addEventListener("click", async e => {
  if (!e.target.classList.contains("btn-delete")) return

  const id = e.target.dataset.id
  const ok = confirm("¿Borrar comentario?")

  if (!ok) return

  await supabase
    .from("comentarios")
    .delete()
    .eq("id", id)

  e.target.closest(".comment").remove()
})





