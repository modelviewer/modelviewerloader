document.addEventListener("DOMContentLoaded", () => {
  //dom elements
  const authButton = document.querySelector("#btn-summon-aside-auth")
  const bodyWrapper = document.querySelector("#body-wrapper")
  const dropZone = document.querySelector("#drop-zone")
  const btnBrowse = document.querySelector("#btn-browse")
  const fileInput = document.querySelector("#file-input")
  const githubUsername = document.querySelector("#auth-username")
  const githubToken = document.querySelector("#auth-token")
  const loadingBarLabel = document.querySelector("#loading-bar-label")

  // variables
  let showAuthPanel = false
  let owner = undefined
  const repo = "modelviewerloader"
  let projectName = ""
  let auth = getAuth(githubToken.value)
  const CHUNK_SIZE = 20 * 1024 * 1024 // 20MB
  // let additionalCleaning = true
  let loading = false
  let progress = {
    current: 0,
    total: 1,
  }

  // functions
  const preventDefaults = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleFiles = async (files) => {
    loading = true
    toggleLoadingScreen()

    for (const [idx, file] of Array.from(files).entries()) {
      loadingBarLabel.innerText = `Uploading ${idx + 1} of ${
        files.length
      }... Please wait :)`
      await handleFile(file)
    }

    loading = false
    toggleLoadingScreen()
  }

  const handleFile = async (file) => {
    progress.current = 0.1
    progress.total = 1
    setProgress(progress)

    owner = githubUsername.value
    auth = getAuth(githubToken.value)
    // additionalCleaning = true
    // check authorization
    if (!authenticated) {
      showToast(
        "In order to upload projects, you need to provide your authentication details.",
        "error"
      )

      setTimeout(() => {
        showToast(
          "You can enter you authentication details in the top right corner.",
          "info"
        )
      }, 1000)
      return
    }

    // check if file is a .dxf file
    if (file.name.endsWith(".dxf")) {
      projectName = file.name.replace(".dxf", "")
      const arrayBuffer = await readFileAsArrayBuffer(file)
      const totalChunks = Math.ceil(arrayBuffer.byteLength / CHUNK_SIZE)

      // set progress total steps to chunks + 1
      progress.total = totalChunks + 1

      // split the file into chunks and upload them
      for (let i = 0; i < totalChunks; i++) {
        const chunk = arrayBuffer.slice(
          i * CHUNK_SIZE,
          i * CHUNK_SIZE + CHUNK_SIZE
        )
        const content = btoa(
          new Uint8Array(chunk).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        )
        const message = `Upload chunk ${i + 1} of ${totalChunks}`

        // await uploadFileToGitHub(
        //   `${projectName}/Project-Chunk-${i + 1}`,
        //   message,
        //   content
        // )

        let sha = await checkFileSha(
          `${projectName}/Project-Chunk-${i + 1}`,
          owner,
          repo,
          auth
        )
        await uploadFileToGitHub(
          `${projectName}/Project-Chunk-${i + 1}`,
          owner,
          repo,
          auth,
          message,
          content,
          sha
        )

        progress.current = i + 1
        setProgress(progress)
      }

      // // clean up the leftover chunks if any
      // if (additionalCleaning) {
      //   await cleanUpLeftoverChunks(totalChunks)
      // }

      // update names.txt
      // const namesResponse = await fetch(
      //   `https://api.github.com/repos/${owner}/${repo}/contents/projects/names.txt`,
      //   {
      //     method: "GET",
      //     headers: {
      //       Accept: "application/vnd.github+json",
      //       Authorization: `Bearer ${auth}`,
      //     },
      //   }
      // )

      // if (namesResponse.ok) {
      //   const namesFile = await namesResponse.json()
      //   const namesContent = atob(namesFile.content)
      //   const names = namesContent.split("\n")
      //   if (!names.includes(projectName)) {
      //     names.push(projectName)
      //     const newNamesContent = names.join("\n")
      //     const newNamesContentEncoded = btoa(newNamesContent)
      //     await uploadFileToGitHub(
      //       "names.txt",
      //       "Update names.txt",
      //       newNamesContentEncoded
      //     )
      //   }
      // } else {
      //   const newNamesContent = projectName
      //   const newNamesContentEncoded = btoa(newNamesContent)
      //   await uploadFileToGitHub(
      //     "names.txt",
      //     "Create names.txt",
      //     newNamesContentEncoded
      //   )
      // }

      await updateNamesFile(projectName, owner, repo, auth)

      progress.current = progress.total
      setProgress(progress)

      // render projects panel
      renderProjectsPanel()

      showToast(
        `Upload complete, ${projectName} is ready for viewing in VR :)`,
        "success"
      )
    } else {
      showToast(`${file.name} in not a .dxf file, uploading aborted.`, "error")
    }
  }

  async function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  // const cleanUpLeftoverChunks = async (lastChunkID) => {
  //   let chunkID = lastChunkID + 1
  //   while (additionalCleaning) {
  //     // Check if the file exists
  //     let sha = await checkFileSha(
  //       `${projectName}/Project-Chunk-${chunkID}`,
  //       owner,
  //       repo,
  //       auth
  //     )

  //     if (sha === undefined) {
  //       // no chunks further
  //       additionalCleaning = false
  //       return
  //     }

  //     await deleteFileFromGitHub(
  //       `${projectName}/Project-Chunk-${chunkID}`,
  //       owner,
  //       repo,
  //       auth,
  //       sha
  //     )

  //     // try {
  //     //   const existingFileResponse = await fetch(
  //     //     `https://api.github.com/repos/${owner}/${repo}/contents/projects/${projectName}/Project-Chunk-${chunkID}`,
  //     //     {
  //     //       method: "GET",
  //     //       headers: {
  //     //         Accept: "application/vnd.github+json",
  //     //         Authorization: `Bearer ${auth}`,
  //     //       },
  //     //     }
  //     //   )
  //     //   if (existingFileResponse.ok) {
  //     //     const existingFile = await existingFileResponse.json()
  //     //     sha = existingFile.sha
  //     //   } else {
  //     //     // File does not exist, so no sha is needed
  //     //     sha = undefined
  //     //     // no chunks further
  //     //     // showToast(`No more chunks left`, "info")

  //     //     additionalCleaning = false
  //     //     return
  //     //   }
  //     // } catch (error) {
  //     //   // File does not exist, so no sha is needed
  //     //   sha = undefined
  //     //   // no chunks further
  //     //   // showToast(`No more chunks left`, "info")
  //     //   additionalCleaning = false
  //     //   return
  //     // }

  //     // Delete the file

  //     // const response = await fetch(
  //     //   `https://api.github.com/repos/${owner}/${repo}/contents/projects/${projectName}/Project-Chunk-${chunkID}`,
  //     //   {
  //     //     method: "DELETE",
  //     //     headers: {
  //     //       Accept: "application/vnd.github+json",
  //     //       Authorization: `Bearer ${auth}`,
  //     //     },
  //     //     body: JSON.stringify({
  //     //       message: `Clean up leftover chunks`,
  //     //       sha: sha,
  //     //     }),
  //     //   }
  //     // )

  //     // if (response.ok) {
  //     //   // showToast(`Cleaned up leftover chunk`, "info")
  //     //   console.log(`Cleaned up leftover chunk ${chunkID}`)
  //     // } else {
  //     //   // showToast(`Failed to clean up leftover chunk`, "error")
  //     //   console.log(`Failed to clean up leftover chunk ${chunkID}`)
  //     // }

  //     chunkID++
  //   }
  // }

  // const uploadFileToGitHub = async (path, message, content) => {
  //   try {
  //     // Check if the file already exists
  //     let sha
  //     try {
  //       const existingFileResponse = await fetch(
  //         `https://api.github.com/repos/${owner}/${repo}/contents/projects/${path}`,
  //         {
  //           method: "GET",
  //           headers: {
  //             Accept: "application/vnd.github+json",
  //             Authorization: `Bearer ${auth}`,
  //           },
  //         }
  //       )
  //       if (existingFileResponse.ok) {
  //         const existingFile = await existingFileResponse.json()
  //         sha = existingFile.sha
  //       }
  //     } catch (error) {
  //       // File does not exist, so no sha is needed
  //       sha = undefined
  //       // no chunks further, so no need to clean up
  //       additionalCleaning = false
  //     }

  //     // Upload the file
  //     const response = await fetch(
  //       `https://api.github.com/repos/${owner}/${repo}/contents/projects/${path}`,
  //       {
  //         method: "PUT",
  //         headers: {
  //           Accept: "application/vnd.github+json",
  //           Authorization: `Bearer ${auth}`,
  //         },
  //         body: JSON.stringify({
  //           message: message,
  //           content: content,
  //           sha: sha,
  //         }),
  //       }
  //     )
  //     if (response.ok) {
  //       // showToast(
  //       //   `${fileName} is successfully uploaded and ready for viewing`,
  //       //   "success"
  //       // )
  //     } else {
  //       showToast(`Failed to upload ${fileName}`, "error")
  //     }
  //   } catch (error) {
  //     showToast(`Failed to upload ${fileName}`, "error")
  //   }
  // }

  // listeners
  authButton.addEventListener("click", () => {
    showAuthPanel = !showAuthPanel
    if (showAuthPanel) {
      bodyWrapper.classList.add("show-auth")
    } else {
      bodyWrapper.classList.remove("show-auth")
    }
  })

  btnBrowse.addEventListener("click", () => {
    if (loading) return
    fileInput.value = null
    fileInput.click()
  })

  fileInput.addEventListener("change", (event) => {
    const files = event.target.files
    handleFiles(files)
  })
  ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, preventDefaults, false)
  })
  ;["dragenter", "dragover"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add("highlight")
    })
  })
  ;["dragleave", "drop"].forEach((eventName) => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove("highlight")
    })
  })

  dropZone.addEventListener("drop", (event) => {
    const files = event.dataTransfer.files

    handleFiles(files)
  })

  AuthStorage()
})
