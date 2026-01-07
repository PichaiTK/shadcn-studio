import { Injectable } from "@nestjs/common"

@Injectable()
export class LineNotifyService {
  private readonly lineToken = process.env.LINE_NOTIFY_TOKEN

  async sendNotification(message: string): Promise<void> {
    if (!this.lineToken) {
      console.warn("LINE_NOTIFY_TOKEN not configured")
      return
    }

    try {
      const response = await fetch("https://notify-api.line.me/api/notify", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${this.lineToken}`,
        },
        body: new URLSearchParams({ message }),
      })

      if (!response.ok) {
        throw new Error(`LINE Notify failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to send LINE notification:", error)
    }
  }

  async notifyAlert(title: string, details: string): Promise<void> {
    const message = `
🚨 Alert: ${title}
${details}
Time: ${new Date().toISOString()}
    `.trim()

    await this.sendNotification(message)
  }
}
