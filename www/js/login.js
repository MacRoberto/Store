const button = document.querySelector("#btnLogin");
const email = document.querySelector("#email");
const password = document.querySelector("#password");

button.addEventListener("click", (e) => {
  e.preventDefault();

  fetch("php/users.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      action: "login",
      email: email.value,
      password: password.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

       if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "users/index.html";
      } else {
        const msg = data.message ?? data.msg ?? "Respuesta inválida del servido...";
        alert(msg);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Ocurrió un error al iniciar sesión");
    });
});
