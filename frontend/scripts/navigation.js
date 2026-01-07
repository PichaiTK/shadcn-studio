class NavigationManager {
  constructor() {
    this.currentPage = "home"
    this.sidebarExpanded = true
    this.init()
  }

  init() {
    this.bindEvents()
  }

  bindEvents() {
    const sidebarToggle = document.getElementById("sidebarToggle")
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => this.toggleSidebar())
    }

    document.querySelectorAll(".sidebar-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        const page = item.getAttribute("data-page")
        this.navigateTo(page)
      })
    })
  }

  toggleSidebar() {
    this.sidebarExpanded = !this.sidebarExpanded
    const sidebar = document.getElementById("sidebar")
    const mainContent = document.getElementById("mainContent")

    if (this.sidebarExpanded) {
      sidebar.classList.remove("sidebar-collapsed")
      sidebar.classList.add("sidebar-expanded")
      mainContent.classList.remove("main-content-collapsed")
      mainContent.classList.add("main-content-expanded")
      document.querySelectorAll(".sidebar-text").forEach((el) => el.classList.remove("hidden"))
    } else {
      sidebar.classList.remove("sidebar-expanded")
      sidebar.classList.add("sidebar-collapsed")
      mainContent.classList.remove("main-content-expanded")
      mainContent.classList.add("main-content-collapsed")
      document.querySelectorAll(".sidebar-text").forEach((el) => el.classList.add("hidden"))
    }
  }

  navigateTo(page) {
    document.querySelectorAll(".page-content").forEach((p) => p.classList.add("hidden"))

    const pageElement = document.getElementById(page + "Page")
    if (pageElement) {
      pageElement.classList.remove("hidden")
    }

    document.querySelectorAll(".sidebar-item").forEach((item) => {
      item.classList.remove("active")
      if (item.getAttribute("data-page") === page) {
        item.classList.add("active")
      }
    })

    this.currentPage = page
  }
}

const navigationManager = new NavigationManager()
