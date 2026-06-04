const btnLogin = document.querySelector("#btnLogin")
btnLogin.addEventListener("click", e => {
  e.preventDefault()
  const email = document.querySelector("#email").value
  const password = document.querySelector("#password").value

  alert(`Email: ${email}\nPassword: ${password}`)
})
