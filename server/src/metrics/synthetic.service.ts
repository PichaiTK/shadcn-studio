import { Injectable } from "@nestjs/common"
import type { Model } from "mongoose"
import { Cron, CronExpression } from "@nestjs/schedule"

interface SyntheticResult {
  check: string
  status: number
  latencyMs: number
  timestamp: Date
  error?: string
}

@Injectable()
export class SyntheticService {
  private syntheticResultModel: Model<SyntheticResult>

  constructor(syntheticResultModel: Model<SyntheticResult>) {
    this.syntheticResultModel = syntheticResultModel
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async runSyntheticChecks(): Promise<void> {
    const checks = [this.checkLogin(), this.checkChat(), this.checkAPI()]

    const results = await Promise.allSettled(checks)

    for (const result of results) {
      if (result.status === "fulfilled") {
        await this.syntheticResultModel.create(result.value)
      }
    }
  }

  private async checkLogin(): Promise<SyntheticResult> {
    const start = Date.now()
    try {
      const response = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "test@example.com",
          password: "testpassword",
        }),
      })

      const latencyMs = Date.now() - start
      return {
        check: "LOGIN",
        status: response.ok ? 1 : 0,
        latencyMs,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        check: "LOGIN",
        status: 0,
        latencyMs: Date.now() - start,
        timestamp: new Date(),
        error: error.message,
      }
    }
  }

  private async checkChat(): Promise<SyntheticResult> {
    const start = Date.now()
    try {
      const response = await fetch("http://localhost:3001/socket.io/")
      const latencyMs = Date.now() - start

      return {
        check: "CHAT",
        status: response.ok ? 1 : 0,
        latencyMs,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        check: "CHAT",
        status: 0,
        latencyMs: Date.now() - start,
        timestamp: new Date(),
        error: error.message,
      }
    }
  }

  private async checkAPI(): Promise<SyntheticResult> {
    const start = Date.now()
    try {
      const response = await fetch("http://localhost:3001/api/health")
      const latencyMs = Date.now() - start

      return {
        check: "API",
        status: response.ok ? 1 : 0,
        latencyMs,
        timestamp: new Date(),
      }
    } catch (error) {
      return {
        check: "API",
        status: 0,
        latencyMs: Date.now() - start,
        timestamp: new Date(),
        error: error.message,
      }
    }
  }

  async getMetrics(): Promise<string> {
    const recentResults = await this.syntheticResultModel.find().sort({ timestamp: -1 }).limit(100)

    let metrics = ""

    for (const result of recentResults) {
      metrics += `synthetic_status{check="${result.check}"} ${result.status}\n`
      metrics += `synthetic_latency_ms{check="${result.check}"} ${result.latencyMs}\n`
    }

    return metrics
  }
}
