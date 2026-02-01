import { supabase } from "./supabase.js"

document.addEventListener("DOMContentLoaded", async () => {

  const { data } = await supabase.auth.getUser()

  if (!data.user) {
    window.location.href = "../login/"
    return
  }

  document.getElementById("logout").addEventListener("click", async () => {
    await supabase.auth.signOut()
    window.location.href = "../login/"
  })

  function showToast(message, type = "success") {
    let toast = document.querySelector(".toast")

    if (!toast) {
      toast = document.createElement("div")
      toast.className = "toast"
      document.body.appendChild(toast)
    }

    toast.textContent = message
    toast.classList.add("show")
    toast.classList.toggle("error", type === "error")

    setTimeout(() => {
      toast.classList.remove("show")
    }, 3000)
  }

  const serviciosContainer = document.getElementById("productos-admin")
  const formServicio = document.getElementById("form-servicio")

  const nombreInput = document.getElementById("nombreInput")
  const precioInput = document.getElementById("precioInput")
  const descripcionInput = document.getElementById("descripcionInput")
  const duracionInput = document.getElementById("duracion")
  const imagenInput = document.getElementById("imagenInput")

  const { data: servicios } = await supabase
    .from("servicios")
    .select("*")
    .order("id", { ascending: false })

  servicios.forEach(renderServicio)

  function renderServicio(s) {
    const div = document.createElement("div")
    div.className = "producto-admin"

    div.innerHTML = `
      <input id="nombre-${s.id}" value="${s.nombre}">
      <input id="duracion-${s.id}" value="${s.duracion || ""}">
      <input id="precio-${s.id}" type="number" value="${s.precio}">
      <textarea id="desc-${s.id}">${s.descripcion}</textarea>
      <img src="${s.imagen_url}">
      <input type="file" id="img-${s.id}">
      <button data-save="${s.id}">Guardar</button>
      <button class="danger" data-del="${s.id}">Borrar</button>
    `

    div.querySelector("[data-save]").onclick = () => guardarServicio(s.id)
    div.querySelector("[data-del]").onclick = () => borrarServicio(s.id, s.imagen_url)

    serviciosContainer.appendChild(div)
  }

  formServicio.addEventListener("submit", async e => {
    e.preventDefault()

    const file = imagenInput.files[0]
    if (!file) {
      showToast("Seleccioná una imagen", "error")
      return
    }

    const fileName = `${Date.now()}_${file.name}`
    await supabase.storage.from("imagenes").upload(fileName, file)

    const imagen_url = supabase.storage
      .from("imagenes")
      .getPublicUrl(fileName).data.publicUrl

    await supabase.from("servicios").insert({
      nombre: nombreInput.value,
      duracion: duracionInput.value,
      precio: Number(precioInput.value),
      descripcion: descripcionInput.value,
      imagen_url
    })

    showToast("Servicio creado")
    location.reload()
  })

  async function guardarServicio(id) {
    const nombre = document.getElementById(`nombre-${id}`).value
    const duracion = document.getElementById(`duracion-${id}`).value
    const precio = Number(document.getElementById(`precio-${id}`).value)
    const descripcion = document.getElementById(`desc-${id}`).value
    const fileInput = document.getElementById(`img-${id}`)

    let imagen_url = null

    if (fileInput && fileInput.files.length > 0) {
      const file = fileInput.files[0]
      const fileName = `${Date.now()}_${file.name}`

      const { error: uploadError } = await supabase
        .storage
        .from("imagenes")
        .upload(fileName, file)

      if (uploadError) {
        console.error(uploadError)
        showToast("Error al subir la imagen")
        return
      }

      imagen_url = supabase
        .storage
        .from("imagenes")
        .getPublicUrl(fileName).data.publicUrl
    }

    const updateData = {
      nombre,
      duracion,
      precio,
      descripcion
    }

    if (imagen_url) {
      updateData.imagen_url = imagen_url
    }

    const { error } = await supabase
      .from("servicios")
      .update(updateData)
      .eq("id", id)

    if (error) {
      console.error(error)
      showToast("Error al guardar cambios")
    } else {
      showToast("Servicio actualizado correctamente")
      setTimeout(() => location.reload(), 800)
    }
  }



  const postsContainer = document.getElementById("posts-admin")
  const formPost = document.getElementById("form-post")

  const postTitulo = document.getElementById("post-titulo")
  const postContenido = document.getElementById("post-contenido")
  const postImagen = document.getElementById("post-imagen")

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false })

  posts.forEach(renderPost)

  function renderPost(p) {
    const div = document.createElement("div")
    div.className = "producto-admin"

    div.innerHTML = `
      <input id="post-title-${p.id}" value="${p.titulo}">
      <textarea id="post-content-${p.id}">${p.contenido}</textarea>
      <img src="${p.imagen_url}">
      <button data-save="${p.id}">Guardar</button>
      <button class="danger" data-del="${p.id}">Borrar</button>
    `

    div.querySelector("[data-save]").onclick = () => guardarPost(p.id)
    div.querySelector("[data-del]").onclick = () => borrarPost(p.id, p.imagen_url)

    postsContainer.appendChild(div)
  }

  formPost.addEventListener("submit", async e => {
    e.preventDefault()

    const file = postImagen.files[0]
    if (!file) {
      showToast("Seleccioná una imagen", "error")
      return
    }

    const fileName = `${Date.now()}_${file.name}`
    await supabase.storage.from("imagenes").upload(fileName, file)

    const imagen_url = supabase.storage
      .from("imagenes")
      .getPublicUrl(fileName).data.publicUrl

    await supabase.from("posts").insert({
      titulo: postTitulo.value,
      contenido: postContenido.value,
      imagen_url
    })

    showToast("Nota publicada")
    location.reload()
  })

  async function guardarPost(id) {
    const titulo = document.getElementById(`post-title-${id}`).value
    const contenido = document.getElementById(`post-content-${id}`).value

    await supabase.from("posts").update({ titulo, contenido }).eq("id", id)
    showToast("Nota actualizada")
  }

  async function borrarPost(id, img) {
    await supabase.from("posts").delete().eq("id", id)

    const fileName = img.split("/imagenes/")[1]
    await supabase.storage.from("imagenes").remove([fileName])

    showToast("Nota eliminada")
    location.reload()
  }

})

const tiendaList = document.getElementById("tienda-admin-list")
const formTienda = document.getElementById("form-tienda")

if (tiendaList && formTienda) {
  cargarTienda()
}

async function cargarTienda() {
  const { data, error } = await supabase
    .from("productos_tienda")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  tiendaList.innerHTML = ""

  data.forEach(p => {
    const div = document.createElement("div")
    div.className = "card producto-admin"

    div.innerHTML = `
      <input value="${p.nombre}" data-nombre>
      <input type="number" value="${p.precio ?? ""}" data-precio>
      <textarea data-descripcion>${p.descripcion ?? ""}</textarea>

      ${p.imagen_url ? `<img src="${p.imagen_url}" width="120">` : ""}

      <input type="file" data-imagen>

      <button data-guardar>Guardar</button>
      <button data-borrar class="danger">Borrar</button>
      <hr>
    `

    div.querySelector("[data-guardar]").addEventListener("click", () =>
      actualizarProductoTienda(p.id, div, p.imagen_url)
    )

    div.querySelector("[data-borrar]").addEventListener("click", () =>
      borrarProductoTienda(p.id, p.imagen_url)
    )

    tiendaList.appendChild(div)
  })
}

formTienda.addEventListener("submit", async e => {
  e.preventDefault()

  const nombre = document.getElementById("tienda-nombre").value
  const precio = Number(document.getElementById("tienda-precio").value)
  const descripcion = document.getElementById("tienda-descripcion").value
  const imagenInput = document.getElementById("tienda-imagen")
  const file = imagenInput.files[0]

  if (!file) return

  const fileName = `${Date.now()}_${file.name}`

  const { error: uploadError } = await supabase
    .storage
    .from("imagenes")
    .upload(fileName, file)

  if (uploadError) {
    console.error(uploadError)
    return
  }

  const imagen_url = supabase
    .storage
    .from("imagenes")
    .getPublicUrl(fileName).data.publicUrl

  const { error } = await supabase
    .from("productos_tienda")
    .insert({ nombre, precio, descripcion, imagen_url })

  if (!error) {
    formTienda.reset()
    cargarTienda()
  }
})

async function actualizarProductoTienda(id, card, oldImage) {
  const nombre = card.querySelector("[data-nombre]").value
  const precio = Number(card.querySelector("[data-precio]").value)
  const descripcion = card.querySelector("[data-descripcion]").value
  const imagenInput = card.querySelector("[data-imagen]")

  let imagen_url = oldImage

  if (imagenInput.files.length > 0) {
    const file = imagenInput.files[0]
    const fileName = `${Date.now()}_${file.name}`

    await supabase.storage.from("imagenes").upload(fileName, file)
    imagen_url = supabase.storage.from("imagenes").getPublicUrl(fileName).data.publicUrl
  }

  await supabase
    .from("productos_tienda")
    .update({ nombre, precio, descripcion, imagen_url })
    .eq("id", id)

  cargarTienda()
}

async function borrarProductoTienda(id, imagenUrl) {
  const ok = confirm("¿Borrar producto?")
  if (!ok) return

  await supabase.from("productos_tienda").delete().eq("id", id)

  if (imagenUrl) {
    const fileName = imagenUrl.split("/imagenes/")[1]
    await supabase.storage.from("imagenes").remove([fileName])
  }

  cargarTienda()
}

async function borrarServicio(id, imagenUrl) {
  if (!confirm("¿Borrar servicio?")) return

  await supabase.from("servicios").delete().eq("id", id)

  if (imagenUrl) {
    const fileName = imagenUrl.split("/imagenes/")[1]
    await supabase.storage.from("imagenes").remove([fileName])
  }

  location.reload()
}