class AuthManager {
  constructor() {
    this.currentUser = null
    this.token = localStorage.getItem("authToken")
    this.init()
  }

  init() {
    this.bindEvents()
    this.checkAuthStatus()
  }

  bindEvents() {
    const userProfileBtn = document.getElementById("userProfileBtn")
    const closeAuthModal = document.getElementById("closeAuthModal")
    const loginBtn = document.getElementById("loginBtn")
    const registerBtn = document.getElementById("registerBtn")
    const showRegisterBtn = document.getElementById("showRegisterBtn")
    const showLoginBtn = document.getElementById("showLoginBtn")

    if (userProfileBtn) {
      userProfileBtn.addEventListener("click", () => {
        if (!this.currentUser) {
          this.showAuthModal()
        }
      })
    }

    if (closeAuthModal) {
      closeAuthModal.addEventListener("click", () => this.hideAuthModal())
    }

    if (loginBtn) {
      loginBtn.addEventListener("click", () => this.handleLogin())
    }

    if (registerBtn) {
      registerBtn.addEventListener("click", () => this.handleRegister())
    }

    if (showRegisterBtn) {
      showRegisterBtn.addEventListener("click", () => this.toggleAuthForm("register"))
    }

    if (showLoginBtn) {
      showLoginBtn.addEventListener("click", () => this.toggleAuthForm("login"))
    }
  }

  showAuthModal() {
    const modal = document.getElementById("authModal")
    if (modal) modal.classList.remove("hidden")
  }

  hideAuthModal() {
    const modal = document.getElementById("authModal")
    if (modal) modal.classList.add("hidden")
  }

  toggleAuthForm(form) {
    const loginForm = document.getElementById("loginForm")
    const registerForm = document.getElementById("registerForm")

    if (form === "register") {
      loginForm.classList.add("hidden")
      registerForm.classList.remove("hidden")
    } else {
      registerForm.classList.add("hidden")
      loginForm.classList.remove("hidden")
    }
  }

  async handleLogin() {
    const email = document.getElementById("loginEmail").value
    const password = document.getElementById("loginPassword").value

    if (!email || !password) {
      alert("กรุณากรอกอีเมลและรหัสผ่าน")
      return
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        this.token = data.token
        this.currentUser = data.user
        localStorage.setItem("authToken", data.token)
        this.updateUI()
        this.hideAuthModal()
        alert("เข้าสู่ระบบสำเร็จ!")
      } else {
        alert(data.message || "เข้าสู่ระบบไม่สำเร็จ")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
    }
  }

  async handleRegister() {
    const name = document.getElementById("registerName").value
    const email = document.getElementById("registerEmail").value
    const phone = document.getElementById("registerPhone").value
    const password = document.getElementById("registerPassword").value
    const confirmPassword = document.getElementById("registerConfirmPassword").value

    if (!name || !email || !password || !confirmPassword) {
      alert("กรุณากรอกข้อมูลให้ครบทุกช่อง")
      return
    }

    if (password !== confirmPassword) {
      alert("รหัสผ่านไม่ตรงกัน")
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, phone, password }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ")
        this.toggleAuthForm("login")
      } else {
        alert(data.message || "สมัครสมาชิกไม่สำเร็จ")
      }
    } catch (error) {
      console.error("Register error:", error)
      alert("เกิดข้อผิดพลาดในการสมัครสมาชิก")
    }
  }

  async checkAuthStatus() {
    if (!this.token) return

    try {
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        this.currentUser = data.user
        this.updateUI()
      } else {
        this.logout()
      }
    } catch (error) {
      console.error("Auth check error:", error)
    }
  }

  updateUI() {
    const userName = document.getElementById("userName")
    const userAvatar = document.getElementById("userAvatar")

    if (this.currentUser) {
      if (userName) userName.textContent = this.currentUser.name
      if (userAvatar && this.currentUser.avatar) {
        userAvatar.src = this.currentUser.avatar
      }
    }
  }

  logout() {
    this.currentUser = null
    this.token = null
    localStorage.removeItem("authToken")
    this.updateUI()
    window.location.reload()
  }

  getAuthHeader() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {}
  }
}

const authManager = new AuthManager()
