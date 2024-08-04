const notifications = document.querySelector(".notifications")

const GetIcon = (type) => {
  switch (type) {
    case "success":
      return "fa-circle-check"
    case "error":
      return "fa-circle-xmark"
    case "warning":
      return "fa-triangle-exclamation"
    case "info":
      return "fa-circle-info"
    default:
      return "fa-circle-info"
  }
}

const removeToast = (toast) => {
  toast.classList.add("hide")
  if (toast.timeoutId) clearTimeout(toast.timeoutId)
  setTimeout(() => toast.remove(), 500)
}

const showToast = (message = "", type = "info", time = 12000) => {
  const icon = GetIcon(type)
  const text = message
  const toast = document.createElement("li")
  toast.className = `toast ${type}`
  toast.innerHTML = `<div class="column">
                         <i class="fa-solid ${icon}"></i>
                         <span id="toast-text" >${text}</span>
                      </div>
                      <i class="fa-solid fa-xmark" onclick="removeToast(this.parentElement)"></i>`
  notifications.appendChild(toast)
  toast.timeoutId = setTimeout(() => removeToast(toast), time)
}
