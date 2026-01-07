// Global State
let currentPage = "home"
let sidebarExpanded = true
let carouselIndex = 0
let carouselInterval
let posCart = []
const workspaceContext = {
  files: [],
  variables: {},
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  initializeNavigation()
  initializeCarousel()
  initializePOS()
  initializeModals()
  initializeAI()
  initializeInlineChat()
  initializeCodeEditor()
  initializeFileDropZone()
})

// Navigation Functions
function initializeNavigation() {
  document.getElementById("sidebarToggle").addEventListener("click", () => {
    sidebarExpanded = !sidebarExpanded
    const sidebar = document.getElementById("sidebar")
    const mainContent = document.getElementById("mainContent")

    if (sidebarExpanded) {
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
  })

  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault()
      const page = this.getAttribute("data-page")
      navigateToPage(page)
    })
  })

  document.querySelectorAll("[data-page]").forEach((el) => {
    el.addEventListener("click", function (e) {
      if (this.classList.contains("sidebar-item")) return
      e.preventDefault()
      const page = this.getAttribute("data-page")
      navigateToPage(page)
    })
  })
}

function navigateToPage(page) {
  document.querySelectorAll(".page-content").forEach((p) => p.classList.add("hidden"))

  const pageElement = document.getElementById(page + "Page")
  if (pageElement) {
    pageElement.classList.remove("hidden")
  }

  document.querySelectorAll(".sidebar-item").forEach((item) => {
    item.classList.remove("bg-purple-600")
    if (item.getAttribute("data-page") === page) {
      item.classList.add("bg-purple-600")
    }
  })

  currentPage = page
}

// Carousel Functions
function initializeCarousel() {
  const carousel = document.getElementById("carousel")
  if (!carousel) return

  const items = carousel.querySelectorAll(".carousel-item")
  const indicators = document.querySelectorAll(".carousel-indicator")

  function showSlide(index) {
    carouselIndex = index
    carousel.style.transform = `translateX(-${index * 100}%)`

    indicators.forEach((indicator, i) => {
      if (i === index) {
        indicator.classList.remove("bg-white/50")
        indicator.classList.add("bg-white", "active")
      } else {
        indicator.classList.remove("bg-white", "active")
        indicator.classList.add("bg-white/50")
      }
    })
  }

  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      carouselIndex = (carouselIndex - 1 + items.length) % items.length
      showSlide(carouselIndex)
      resetCarouselInterval()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      carouselIndex = (carouselIndex + 1) % items.length
      showSlide(carouselIndex)
      resetCarouselInterval()
    })
  }

  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index)
      resetCarouselInterval()
    })
  })

  function autoSlide() {
    carouselIndex = (carouselIndex + 1) % items.length
    showSlide(carouselIndex)
  }

  function resetCarouselInterval() {
    clearInterval(carouselInterval)
    carouselInterval = setInterval(autoSlide, 5000)
  }

  carouselInterval = setInterval(autoSlide, 5000)
}

// POS System Functions
function initializePOS() {
  document.querySelectorAll(".pos-product-item").forEach((item) => {
    item.addEventListener("click", function () {
      const product = {
        id: this.getAttribute("data-id"),
        name: this.getAttribute("data-name"),
        price: Number.parseInt(this.getAttribute("data-price")),
      }
      addToCart(product)
    })
  })

  const clearCartBtn = document.getElementById("clearCart")
  const checkoutBtn = document.getElementById("checkoutBtn")

  if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart)
  if (checkoutBtn) checkoutBtn.addEventListener("click", checkout)
}

function addToCart(product) {
  const existingItem = posCart.find((item) => item.id === product.id)

  if (existingItem) {
    existingItem.quantity++
  } else {
    posCart.push({ ...product, quantity: 1 })
  }

  updateCartDisplay()
}

function updateCartDisplay() {
  const cartItemsContainer = document.getElementById("cartItems")
  if (!cartItemsContainer) return

  if (posCart.length === 0) {
    cartItemsContainer.innerHTML = `
            <div class="text-center text-gray-400 py-8">
                <i class="fas fa-shopping-cart text-4xl mb-2"></i>
                <p>ยังไม่มีสินค้าในตะกร้า</p>
            </div>
        `
    const checkoutBtn = document.getElementById("checkoutBtn")
    if (checkoutBtn) checkoutBtn.disabled = true
  } else {
    cartItemsContainer.innerHTML = posCart
      .map(
        (item) => `
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div class="flex-1">
                    <p class="font-semibold text-sm">${item.name}</p>
                    <p class="text-xs text-gray-600">฿${item.price.toLocaleString()} x ${item.quantity}</p>
                </div>
                <div class="flex items-center space-x-2">
                    <button class="bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 text-sm" onclick="removeFromCart('${item.id}')">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="font-bold">${item.quantity}</span>
                    <button class="bg-green-100 text-green-600 px-2 py-1 rounded hover:bg-green-200 text-sm" onclick="addToCart({id: '${item.id}', name: '${item.name}', price: ${item.price}})">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            </div>
        `,
      )
      .join("")
    const checkoutBtn = document.getElementById("checkoutBtn")
    if (checkoutBtn) checkoutBtn.disabled = false
  }

  updateCartTotals()
}

function updateCartTotals() {
  const subtotal = posCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const discount = 0
  const vat = subtotal * 0.07
  const total = subtotal - discount + vat

  const subtotalEl = document.getElementById("subtotal")
  const discountEl = document.getElementById("discount")
  const vatEl = document.getElementById("vat")
  const totalEl = document.getElementById("total")

  if (subtotalEl) subtotalEl.textContent = `฿${subtotal.toLocaleString()}`
  if (discountEl) discountEl.textContent = `-฿${discount.toLocaleString()}`
  if (vatEl) vatEl.textContent = `฿${Math.round(vat).toLocaleString()}`
  if (totalEl) totalEl.textContent = `฿${Math.round(total).toLocaleString()}`
}

function removeFromCart(id) {
  const item = posCart.find((item) => item.id === id)
  if (item) {
    item.quantity--
    if (item.quantity === 0) {
      posCart = posCart.filter((item) => item.id !== id)
    }
  }
  updateCartDisplay()
}

function clearCart() {
  if (confirm("ต้องการล้างรายการสินค้าทั้งหมดหรือไม่?")) {
    posCart = []
    updateCartDisplay()
  }
}

function checkout() {
  if (posCart.length === 0) return

  const totalEl = document.getElementById("total")
  const total = totalEl ? totalEl.textContent : "฿0"

  alert(`ชำระเงินสำเร็จ!\n\nยอดรวม: ${total}\n\nขอบคุณที่ใช้บริการ`)
  posCart = []
  updateCartDisplay()
}

// Modal Functions
function initializeModals() {
  const notificationBtn = document.getElementById("notificationBtn")
  const closeNotifications = document.getElementById("closeNotifications")
  const chatBtn = document.getElementById("chatBtn")
  const closeChat = document.getElementById("closeChat")
  const cartBtn = document.getElementById("cartBtn")
  const closeCartPanel = document.getElementById("closeCartPanel")
  const themeBtn = document.getElementById("themeBtn")
  const closeThemeModal = document.getElementById("closeThemeModal")
  const aiAssistantBtn = document.getElementById("aiAssistantBtn")
  const closeAIModal = document.getElementById("closeAIModal")

  if (notificationBtn) {
    notificationBtn.addEventListener("click", () => togglePanel("notificationPanel"))
  }
  if (closeNotifications) {
    closeNotifications.addEventListener("click", () => {
      document.getElementById("notificationPanel").classList.add("hidden")
    })
  }

  if (chatBtn) {
    chatBtn.addEventListener("click", () => togglePanel("chatPanel"))
  }
  if (closeChat) {
    closeChat.addEventListener("click", () => {
      document.getElementById("chatPanel").classList.add("hidden")
    })
  }

  if (cartBtn) {
    cartBtn.addEventListener("click", () => togglePanel("cartPanel"))
  }
  if (closeCartPanel) {
    closeCartPanel.addEventListener("click", () => {
      document.getElementById("cartPanel").classList.add("hidden")
    })
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      document.getElementById("themeModal").classList.remove("hidden")
    })
  }
  if (closeThemeModal) {
    closeThemeModal.addEventListener("click", () => {
      document.getElementById("themeModal").classList.add("hidden")
    })
  }

  document.querySelectorAll(".theme-option").forEach((btn) => {
    btn.addEventListener("click", function () {
      const theme = this.getAttribute("data-theme")
      document.body.className = `theme-${theme} transition-colors duration-300`
      document.getElementById("themeModal").classList.add("hidden")
    })
  })

  if (aiAssistantBtn) {
    aiAssistantBtn.addEventListener("click", () => {
      document.getElementById("aiModal").classList.remove("hidden")
    })
  }
  if (closeAIModal) {
    closeAIModal.addEventListener("click", () => {
      document.getElementById("aiModal").classList.add("hidden")
    })
  }
}

function togglePanel(panelId) {
  const panel = document.getElementById(panelId)
  const allPanels = ["notificationPanel", "chatPanel", "cartPanel"]

  allPanels.forEach((id) => {
    if (id !== panelId) {
      const otherPanel = document.getElementById(id)
      if (otherPanel) otherPanel.classList.add("hidden")
    }
  })

  if (panel) panel.classList.toggle("hidden")
}

// AI Functions
function initializeAI() {
  const generateAIBriefBtn = document.getElementById("generateAIBrief")
  const copyAIResponseBtn = document.getElementById("copyAIResponse")
  const generateAIBriefModalBtn = document.getElementById("generateAIBriefModal")
  const copyAIResponseModalBtn = document.getElementById("copyAIResponseModal")

  if (generateAIBriefBtn) generateAIBriefBtn.addEventListener("click", generateAIBrief)
  if (copyAIResponseBtn) copyAIResponseBtn.addEventListener("click", copyAIResponse)
  if (generateAIBriefModalBtn) generateAIBriefModalBtn.addEventListener("click", generateAIBriefModal)
  if (copyAIResponseModalBtn) copyAIResponseModalBtn.addEventListener("click", copyAIResponseModal)
}

function generateAIBrief() {
  const promptEl = document.getElementById("aiPrompt")
  if (!promptEl) return

  const prompt = promptEl.value.trim()

  if (!prompt) {
    alert("กรุณากรอกความต้องการของคุณ")
    return
  }

  const response = {
    style: "สไตล์มินิมัล, สะอาดตา, ทันสมัย",
    colors: "สีน้ำตาล, ครีม, ขาว, สีเขียวอ่อน",
    elements: "โลโก้แบบ simple, ฟอนต์ sans-serif, ไอคอนแก้วกาแฟ",
    brief: "ออกแบบโลโก้สำหรับร้านกาแฟสไตล์มินิมัล โดยใช้สีน้ำตาลและครีมเป็นหลัก มีความรู้สึกอบอุ่นและเรียบง่าย สามารถใช้ได้ทั้งแบบสีและขาวดำ",
  }

  displayAIResponse(response, "aiResponse", "aiResponseContent")
}

function generateAIBriefModal() {
  const promptEl = document.getElementById("aiModalPrompt")
  if (!promptEl) return

  const prompt = promptEl.value.trim()

  if (!prompt) {
    alert("กรุณากรอกความต้องการของคุณ")
    return
  }

  const response = {
    style: "สไตล์โมเดิร์น, สดใส, น่าดึงดูด",
    colors: "สีชมพู, เหลืองอ่อน, ขาว, เขียวมิ้นท์",
    elements: "แสงธรรมชาติ, มุมถ่ายสูง, พื้นหลังสะอาด",
    brief: "ถ่ายภาพขนมไทยในสไตล์โมเดิร์น ให้ความสำคัญกับแสงธรรมชาติ ใช้สีสันสดใส จัดองค์ประกอบแบบมินิมัล เน้นความสวยงามและรสชาติ",
  }

  displayAIResponse(response, "aiModalResponse", "aiModalResponseContent")
}

function displayAIResponse(response, containerId, contentId) {
  const container = document.getElementById(containerId)
  const content = document.getElementById(contentId)

  if (!container || !content) return

  content.innerHTML = `
        <div class="mb-4">
            <p class="font-bold text-purple-600 mb-2">
                <i class="fas fa-palette mr-2"></i>สไตล์แนะนำ:
            </p>
            <p>${response.style}</p>
        </div>
        <div class="mb-4">
            <p class="font-bold text-pink-600 mb-2">
                <i class="fas fa-fill-drip mr-2"></i>คู่สี:
            </p>
            <p>${response.colors}</p>
        </div>
        <div class="mb-4">
            <p class="font-bold text-blue-600 mb-2">
                <i class="fas fa-magic mr-2"></i>สิ่งที่ควรมี:
            </p>
            <p>${response.elements}</p>
        </div>
        <div class="mb-4">
            <p class="font-bold text-green-600 mb-2">
                <i class="fas fa-file-alt mr-2"></i>ร่างประกาศหางาน:
            </p>
            <p class="bg-white/50 p-3 rounded-lg">${response.brief}</p>
        </div>
    `

  container.classList.remove("hidden")
}

function copyAIResponse() {
  const content = document.getElementById("aiResponseContent")
  if (!content) return

  navigator.clipboard.writeText(content.innerText).then(() => {
    alert("คัดลอกเรียบร้อยแล้ว!")
  })
}

function copyAIResponseModal() {
  const content = document.getElementById("aiModalResponseContent")
  if (!content) return

  navigator.clipboard.writeText(content.innerText).then(() => {
    alert("คัดลอกเรียบร้อยแล้ว!")
  })
}

// Inline Chat Functions
function initializeInlineChat() {
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "i") {
      e.preventDefault()
      toggleInlineChat()
    }
  })
}

function toggleInlineChat() {
  const panel = document.getElementById("inlineChatPanel")
  if (panel) {
    panel.classList.toggle("hidden")
  }
}

function closeInlineChat() {
  const panel = document.getElementById("inlineChatPanel")
  if (panel) {
    panel.classList.add("hidden")
  }
}

// Code Editor Functions
function initializeCodeEditor() {
  // Code editor initialization logic
}

// File Drop Zone Functions
function initializeFileDropZone() {
  const dropZone = document.getElementById("fileDropZone")
  const fileInput = document.getElementById("fileInput")

  if (!dropZone || !fileInput) return

  dropZone.addEventListener("click", () => {
    fileInput.click()
  })

  dropZone.addEventListener("dragover", (e) => {
    e.preventDefault()
    dropZone.classList.add("drag-over")
  })

  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over")
  })

  dropZone.addEventListener("drop", (e) => {
    e.preventDefault()
    dropZone.classList.remove("drag-over")
    handleFiles(e.dataTransfer.files)
  })
}

function handleFileSelect(event) {
  handleFiles(event.target.files)
}

function handleFiles(files) {
  for (const file of files) {
    workspaceContext.files.push({
      name: file.name,
      size: file.size,
      type: file.type,
    })
  }
  updateContextFilesList()
}

function updateContextFilesList() {
  const listEl = document.getElementById("contextFilesList")
  if (!listEl) return

  if (workspaceContext.files.length === 0) {
    listEl.innerHTML = ""
    return
  }

  listEl.innerHTML = workspaceContext.files
    .map(
      (file, index) => `
        <div class="context-file flex items-center justify-between bg-white p-2 rounded border border-purple-200">
            <div class="flex items-center space-x-2">
                <i class="fas fa-file-code text-purple-600"></i>
                <span class="text-sm">${file.name}</span>
            </div>
            <button onclick="removeContextFile(${index})" class="text-red-500 hover:text-red-700">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `,
    )
    .join("")
}

function removeContextFile(index) {
  workspaceContext.files.splice(index, 1)
  updateContextFilesList()
}

function clearWorkspaceContext() {
  workspaceContext.files = []
  workspaceContext.variables = {}
  updateContextFilesList()
}

function saveTestFile() {
  alert("ไฟล์ทดสอบถูกบันทึกที่ /tests/main.test.js")
}
