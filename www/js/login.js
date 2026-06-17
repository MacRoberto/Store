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
      email: email.value,
      password: password.value,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);

      if (data.status === "success") {
        window.location.href = "users/index.html";
      } else {
        alert(data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("Ocurrió un error al iniciar sesión");
    });
});
