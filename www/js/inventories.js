const btnGuardar = document.querySelector("#btnGuardar")
const tbody = document.querySelector("#inventoriesTableBody")

if(tbody){
  fetch("../php/inventories.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "list" })
  })
  .then(res => res.json())
  .then(json => {
    if (json.status === "success") {
      json.data.forEach(inventory => {
        tbody.innerHTML += `
          <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Almacén / Lote #${inventory.id_inventory}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">${inventory.arrival_date}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${inventory.username || "Usuario #" + inventory.user_id}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <a href="editar.html">editar</a>
              <a href="eliminar.html">eliminar</a>
            </td>
          </tr>
        `;
      });
    } else {
      console.error(json.message);
    }
  });
}

if(!tbody){
  const UserId = document.querySelector("#UserId")
  const ArrivalDate = document.querySelector("#ArrivalDate")

  btnGuardar.addEventListener("click", ()=>{
    if(UserId.value && ArrivalDate.value){
      const payload = {
        action: "insert",
        user_id: UserId.value,
        arrival_date: ArrivalDate.value
      }
      console.log("Enviado:",payload)
      
    fetch("../php/inventories.php", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload)})
    .then(res => res.json())
    .then(json => {
      console.log("Respuesta:",json)
      if(json.status === "success"){
        window.location.href = "inventories.html"
      }
    })
  }else{
    console.error("Por favor, complete todos los campos requeridos.") 
   }
  })
}