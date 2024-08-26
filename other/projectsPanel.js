let deletingProject = false

const renderProjectsPanel = async () => {
  const projectsPanel = document.querySelector("#projects-panel")
  const projectsList = document.querySelector("#projects-list")

  const projectsNames = await getProjectsNames()

  if (!projectsNames) {
    projectsPanel.classList.add("hide")
    return
  }

  const projectItems = projectsNames.map((projectName, idx) => {
    return `<li id="project-${idx}" class="project-item">
                <p>${projectName}</p>
                <button data-project-name="${projectName}" class="btn-delete-project">
                  <img src="images/icon-trash.svg" alt="delete" />
                  
                </button>
                <div class="spinner hide">
                    <img class="spinner-wheel" src="images/spinner-wheel.png" alt="spinner" />
                    <img class="spinner-fill" src="images/spinner-fill.png" alt="spinner" />
                  </div>
              </li>`
  })

  projectsList.innerHTML = projectItems.join("")

  projectsPanel.classList.remove("hide")

  // Add event listeners to the delete buttons
  const deleteButtons = document.querySelectorAll(".btn-delete-project")
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      if (deletingProject) {
        return
      }
      const projectName = event.target
        .closest(".btn-delete-project")
        .getAttribute("data-project-name")
      console.log(`Delete project: ${projectName}`)

      // remove hide class from spinner
      const spinner = event.target
        .closest(".project-item")
        .querySelector(".spinner")
      spinner.classList.remove("hide")
      deleteProject(projectName)
    })
  })
}

const getProjectsNames = async () => {
  const inputName = document.querySelector("#auth-username")
  const inputToken = document.querySelector("#auth-token")

  const username = inputName.value
  const token = getAuth(inputToken.value)

  try {
    const existingFileResponse = await fetch(
      `https://api.github.com/repos/${username}/modelviewerloader/contents/projects/names.txt`,
      {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
        },
      }
    )

    if (existingFileResponse.ok) {
      const data = await existingFileResponse.json()
      const content = atob(data.content)
      return content.split("\n").filter((name) => name.trim() !== "")
    }
  } catch (error) {
    console.error(error)
    return []
  }
}

const deleteProject = async (projectName) => {
  deletingProject = true
  const inputName = document.querySelector("#auth-username")
  const inputToken = document.querySelector("#auth-token")

  const username = inputName.value
  const token = getAuth(inputToken.value)

  // console.log(`Deleting project: ${projectName}`)

  // // delete all chunks of the project
  let chunkID = 1
  let allChunksDeleted = false

  while (!allChunksDeleted) {
    const path = `${projectName.replace(/\s/g, "%20")}/Project-Chunk-${chunkID}`
    let sha = await checkFileSha(path, username, "modelviewerloader", token)
    console.log(sha)
    if (!sha) {
      allChunksDeleted = true

      break
    }

    await deleteFileFromGitHub(path, username, "modelviewerloader", token, sha)
    chunkID++
  }

  // delete the project name from the names.txt file

  console.log(`Deleting project: ${projectName}`)

  await updateNamesFile(projectName, username, "modelviewerloader", token, true)

  await renderProjectsPanel()

  showToast(`Project ${projectName} deleted successfully`, "success")
  deletingProject = false
}
