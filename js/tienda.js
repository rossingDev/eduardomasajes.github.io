import { supabase } from "./supabase.js"

const contenedor = document.getElementById("tienda-productos")

if (contenedor) {
  cargarProductos()
}

async function cargarProductos() {
  const { data, error } = await supabase
    .from("productos_tienda")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error(error)
    return
  }

  contenedor.innerHTML = ""

  data.forEach(p => {
    const card = document.createElement("div")
    card.className = "card"

    card.innerHTML = `
      ${p.imagen_url ? `<img src="${p.imagen_url}">` : ""}

      <div class="card-content">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>

        ${p.precio ? `<div class="price">$${p.precio}</div>` : ""}

        <a 
            href="https://wa.me/59897795422?text=Hola!%20Quiero%20consultar%20por%20el%20producto:%20${encodeURIComponent(p.nombre)}"
            target="_blank"
            class="btn-consultar"
        >
            Consultar
        </a>

      </div>
    `

    requestAnimationFrame(() => {
        card.classList.add("visible")
    })

    contenedor.appendChild(card)
  })
}