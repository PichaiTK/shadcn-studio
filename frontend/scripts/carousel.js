class CarouselManager {
  constructor() {
    this.index = 0
    this.interval = null
    this.init()
  }

  init() {
    this.bindEvents()
    this.start()
  }

  bindEvents() {
    const prevBtn = document.getElementById("prevBtn")
    const nextBtn = document.getElementById("nextBtn")

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        this.prev()
        this.reset()
      })
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        this.next()
        this.reset()
      })
    }
  }

  show(index) {
    const carousel = document.getElementById("carousel")
    if (!carousel) return

    const items = carousel.querySelectorAll(".carousel-item")
    this.index = (index + items.length) % items.length
    carousel.style.transform = `translateX(-${this.index * 100}%)`
  }

  next() {
    this.show(this.index + 1)
  }

  prev() {
    this.show(this.index - 1)
  }

  start() {
    this.interval = setInterval(() => this.next(), 5000)
  }

  reset() {
    clearInterval(this.interval)
    this.start()
  }
}

const carouselManager = new CarouselManager()
