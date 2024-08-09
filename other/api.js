const checkFileSha = async (path, owner, repo, auth) => {
  let sha
  try {
    console.log(path)
    const existingFileResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/projects/${path}`,
      {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${auth}`,
        },
      }
    )
    if (existingFileResponse.ok) {
      const existingFile = await existingFileResponse.json()
      sha = existingFile.sha
      return sha
    }
  } catch (error) {
    return false
  }
  return undefined
}

const deleteFileFromGitHub = async (
  path,
  owner,
  repo,
  auth,
  sha = undefined
) => {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/projects/${path}`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${auth}`,
      },
      body: JSON.stringify({
        message: `delete file`,
        sha: sha,
      }),
    }
  )
  return response.ok
}

const uploadFileToGitHub = async (
  path,
  owner,
  repo,
  auth,
  message,
  content,
  sha = undefined
) => {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/projects/${path}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message,
        content: content,
        sha: sha,
      }),
    }
  )
  return response.ok
}

const updateNamesFile = async (
  projectName,
  owner,
  repo,
  auth,
  deleteName = false
) => {
  const namesResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/projects/names.txt`,
    {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${auth}`,
      },
    }
  )

  if (namesResponse.ok) {
    const namesFile = await namesResponse.json()
    const namesContent = atob(namesFile.content)
    let names = namesContent.split("\n")

    // delete names.txt file from github
    await deleteFileFromGitHub("names.txt", owner, repo, auth, namesFile.sha)

    if (!names.includes(projectName) && !deleteName) {
      names.push(projectName)
    } else if (names.includes(projectName) && deleteName) {
      const newNames = names.filter((name) => name !== projectName)
      names = newNames
    }

    const newNamesContent = names.join("\n")
    console.log(newNamesContent)
    await uploadFileToGitHub(
      "names.txt",
      owner,
      repo,
      auth,
      deleteName ? "Delete project name" : "Add project name",
      btoa(newNamesContent)
    )
  } else {
    if (deleteName) {
      return
    }
    const newNamesContent = projectName
    await uploadFileToGitHub(
      "names.txt",
      owner,
      repo,
      auth,
      "Add project name",
      newNamesContent
    )
  }
}
