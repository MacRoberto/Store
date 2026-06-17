const btnLogin = document.querySelector("#btnLogin")
btnLogin.addEventListener("click", e => {
  e.preventDefault()
  const email = document.querySelector("#email").value
  const password = document.querySelector("#password").value

  alert(`Email: ${email}\nPassword: ${password}`)
})

const button = document.querySelector("#loginButton");
const email = document.querySelector("#email_field");
const password = document.querySelector("#password_field");

button.addEventListener("clik", e =>{
  e.preventDefault()
  fetch("php/user.php",{
    method: "POST",
    ""
  })
})