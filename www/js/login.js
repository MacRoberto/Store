const button = document.querySelector("#btnLogin");
const email = document.querySelector("#email");
const password = document.querySelector("#password");

button.addEventListener("click", (e) => {
  e.preventDefault();

  if (email.value.trim() === "" || password.value === "") {
    Swal.fire({
      icon: "warning",
      title: "Required fields",
      text: "Email and password are required",
    });

    return;
  }

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
      if (data.status === "success") {
        window.location.href = "views/enviroment.html";
      } else {
        Swal.fire({
          icon: "error",
          title: "Login failed",
          text: data.message,
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Connection error",
        text: "An error occurred while trying to sign in",
      });
    });
});
