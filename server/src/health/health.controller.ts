import { Controller, Get } from "@nestjs/common"

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }
  }

  @Get("liveness")
  liveness() {
    return { status: "alive" }
  }

  @Get("readiness")
  readiness() {
    return { status: "ready" }
  }
}
