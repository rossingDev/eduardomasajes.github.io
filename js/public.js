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

const contenedor = document.getElementById("productos")

const { data: servicios, error } = await supabase
  .from("servicios")
  .select("*")
  .order("id", { ascending: false })

if (error) {
  console.error(error)
} else {
  servicios.forEach(s => {
    const card = document.createElement("div")
    card.className = "card servicio"
    card.setAttribute("data-animate", "")

    card.innerHTML = `
      <img src="${s.imagen_url}" class="img-principal">

      <div class="card-content">
        <h3>${s.nombre}</h3>
        <p>${s.descripcion}</p>
        <p><strong>Duración:</strong> ${s.duracion}</p>
        <div class="price">$${s.precio}</div>

        <a href="https://wa.me/59897795422?text=Hola, quiero reservar el masaje: ${encodeURIComponent(s.nombre)}"
           target="_blank">
          <button>Reservar por WhatsApp</button>
        </a>

        ${isLogged ? `
          <button class="btn-editar"
            onclick="window.location.href='admin'">
            Editar
          </button>
` : ""}

      </div>
    `

    contenedor.appendChild(card)
  })
}

const blogContainer = document.getElementById("blog-posts")

if (blogContainer) {
  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  posts.forEach(post => {
    const card = document.createElement("article")
    card.className = "blog-card"
    card.setAttribute("data-animate", "")

    card.innerHTML = `
      <img src="${post.imagen_url}">
      <h3>${post.titulo}</h3>
      <p>${post.contenido.substring(0, 120)}...</p>

      ${isLogged ? `
        <button class="btn-editar"
          onclick="window.location.href='admin'">
           Editar
        </button>
` : ""}


    `

    blogContainer.appendChild(card)
  })
}

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible")
        observer.unobserve(entry.target)
      }
    })
  },
  { threshold: 0.4 }
)

document.querySelectorAll("[data-animate]").forEach(el => {
  observer.observe(el)
})

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

async function cargarComentarios(postId, container) {
  const { data, error } = await supabase
    .from("comentarios")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  container.innerHTML = ""

  data.forEach(c => {
    const div = document.createElement("div")
    div.className = "comment"

    div.innerHTML = `
      <strong>${c.nombre || "Anónimo"}</strong>
      <span>${new Date(c.created_at).toLocaleDateString()}</span>
      <p>${c.contenido}</p>
    `

    container.appendChild(div)
  })
}

document.addEventListener("submit", async e => {
  const form = e.target
  if (!form.classList.contains("comment-form")) return

  e.preventDefault()

  const postId = form.dataset.postId
  const nombre = form.nombre.value
  const contenido = form.contenido.value

  const { error } = await supabase.from("comentarios").insert({
    post_id: postId,
    nombre,
    contenido
  })

  if (error) {
    alert("Error al enviar comentario")
    console.error(error)
    return
  }

  form.reset()

  const list = form
    .closest(".comments")
    .querySelector(".comments-list")

  cargarComentarios(postId, list)
})

const slides = document.querySelectorAll(".hero-slide");
let currentSlide = 0;

function showSlide(index) {
  slides.forEach((slide, i) => {
    slide.classList.toggle("active", i === index);
  });
}

setInterval(() => {
  currentSlide = (currentSlide + 1) % slides.length;
  showSlide(currentSlide);
}, 5000);