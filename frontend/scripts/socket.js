const io = window.io // Declare the io variable before using it

class SocketManager {
  constructor() {
    this.socket = null
    this.connected = false
    this.init()
  }

  init() {
    if (typeof io !== "undefined") {
      this.connect()
    } else {
      console.error("Socket.IO client library not loaded")
    }
  }

  connect() {
    const token = localStorage.getItem("authToken")

    this.socket = io("http://localhost:3001", {
      auth: {
        token: token,
      },
    })

    this.socket.on("connect", () => {
      console.log("[v0] Socket connected")
      this.connected = true
    })

    this.socket.on("disconnect", () => {
      console.log("[v0] Socket disconnected")
      this.connected = false
    })

    this.socket.on("notification", (data) => {
      this.handleNotification(data)
    })

    this.socket.on("chat:message", (data) => {
      this.handleChatMessage(data)
    })
  }

  handleNotification(data) {
    const notificationCount = document.getElementById("notificationCount")
    if (notificationCount) {
      const current = Number.parseInt(notificationCount.textContent) || 0
      notificationCount.textContent = current + 1
    }
  }

  handleChatMessage(data) {
    console.log("[v0] Chat message received:", data)
  }

  emit(event, data) {
    if (this.socket && this.connected) {
      this.socket.emit(event, data)
    }
  }
}

const socketManager = new SocketManager()
