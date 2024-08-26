const inputName = document.querySelector("#auth-username")
const inputToken = document.querySelector("#auth-token")
const statusIcon = document.querySelector("#status-icon")
const statusIconX = document.querySelector("#status-icon-img")

let authenticated = false

const decodePassword = (password) => {
  password = [...new Set(password)].join("")
  let decodedPassword = "github_pat_"
  const dict = {
    a: "IA0fMovp",
    b: "6BYP012iu",
    c: "DEs2_Oy7B",
    d: "fMovpyU8BU",
    e: "jx_OYiAY6hBX0",
    f: "5F4fe84",
    g: "6G4f_YuL67",
    h: "7H4f_6kA1",
    i: "IdwPiRnS9kA",
    j: "9J4f4E2rP",
    k: "0K4f87Yoi1",
    l: "9QkqLW",
    m: "11BKPP",
    n: "2N4f12",
    o: "TIA0",
    p: "4P4f",
    q: "5Q4fy",
    r: "KH7v4Zv40T",
    s: "7S4f",
    t: "8T4fr7",
    u: "9U4ff8",
    v: "gtwdv7P9X2n",
    w: "v2t8Z3ONTZP",
    x: "2X4fg45ff",
    y: "3Y4fe",
    z: "4Z4fer8R",
  }

  for (let i = 0; i < password.length; i++) {
    decodedPassword += dict[password[i]]
  }

  return decodedPassword
}

const getAuth = (input) => {
  const tokenInputValue = input
  let token

  if (tokenInputValue !== "" && tokenInputValue.length < 30) {
    token = decodePassword(tokenInputValue)
  } else {
    token = tokenInputValue
  }
  return token
}

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
    renderProjectsPanel()
  })

  inputToken.addEventListener("blur", () => {
    checkAuth()
    renderProjectsPanel()
  })
}

const checkAuth = async () => {
  const username = inputName.value
  const token = getAuth(inputToken.value)

  console.log(username, token)

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
