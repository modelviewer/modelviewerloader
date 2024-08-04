const inputName = document.querySelector("#auth-username")
const inputToken = document.querySelector("#auth-token")

const AuthStorage = () => {
  const storedUsername = localStorage.getItem("auth-username")
  const storedToken = localStorage.getItem("auth-token")

  if (storedUsername) {
    inputName.value = storedUsername
  }

  if (storedToken) {
    inputToken.value = storedToken
  }

  inputName.addEventListener("input", () => {
    localStorage.setItem("auth-username", inputName.value)
  })

  inputToken.addEventListener("input", () => {
    localStorage.setItem("auth-token", inputToken.value)
  })
}
