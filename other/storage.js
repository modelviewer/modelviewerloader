const inputName = document.querySelector("#auth-username")
const inputToken = document.querySelector("#auth-token")
const statusIcon = document.querySelector("#status-icon")
const statusIconX = document.querySelector("#status-icon-img")

let authenticated = false

const AuthStorage = () => {
  const storedUsername = localStorage.getItem("auth-username")
  const storedToken = localStorage.getItem("auth-token")

  if (storedUsername) {
    inputName.value = storedUsername
  }

  if (storedToken) {
    inputToken.value = storedToken
  }

  checkAuth()

  inputName.addEventListener("input", () => {
    localStorage.setItem("auth-username", inputName.value)
  })

  inputToken.addEventListener("input", () => {
    localStorage.setItem("auth-token", inputToken.value)
  })

  inputName.addEventListener("blur", () => {
    checkAuth()
  })

  inputToken.addEventListener("blur", () => {
    checkAuth()
  })
}

const checkAuth = async () => {
  const username = inputName.value
  const token = inputToken.value

  if (username && token) {
    const existingFileResponse = await fetch(
      `https://api.github.com/repos/${username}/modelviewerloader/contents/index.html`,
      {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
        },
      }
    )
    if (existingFileResponse.ok) {
      authenticated = true
      statusIconX.classList.add("hide")
      statusIcon.style.backgroundColor = "var(--success)"

      inputName.style.borderBottomColor = "#fff"
      inputName.style.color = "#fff"

      inputToken.style.borderBottomColor = "#fff"
      inputToken.style.color = "#fff"

      renderProjectsPanel()
    } else {
      authenticated = false
      statusIconX.classList.remove("hide")
      statusIcon.style.backgroundColor = "var(--error)"

      // if 404 means username wrong
      if (existingFileResponse.status === 404) {
        inputName.style.borderBottomColor = "var(--error)"
        inputName.style.color = "var(--error)"
      }

      // if 401 means token wrong
      if (existingFileResponse.status === 401) {
        inputToken.style.borderBottomColor = "var(--error)"
        inputToken.style.color = "var(--error)"
      }
    }
  }
}
