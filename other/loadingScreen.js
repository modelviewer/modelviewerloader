const toggleLoadingScreen = () => {
  const loadingScreen = document.querySelector("#loading-screen")
  const dropZone = document.querySelector("#drop-zone")

  if (!loadingScreen.classList.contains("hide")) {
    loadingScreen.classList.add("hide")
    dropZone.classList.remove("hide")
    return
  } else {
    loadingScreen.classList.remove("hide")
    dropZone.classList.add("hide")
    loadFunFact()
  }
}

const loadFunFact = () => {
  const funFact = document.querySelector("#fun-fact")
  fetch("https://uselessfacts.jsph.pl/api/v2/facts/random?language=en")
    .then((response) => response.json())
    .then((data) => {
      funFact.innerHTML = "<b>Fun fact:</b> " + data.text
    })
}

const setProgress = ({ current, total }) => {
  const progress = Math.floor((current / total) * 100)
  const progressBar = document.querySelector("#loading-bar-fill")
  progressBar.style.width = `${progress}%`
}
