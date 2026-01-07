import { Injectable } from "@nestjs/common"

@Injectable()
export class TelegramBotService {
  private readonly botToken = process.env.TELEGRAM_BOT_TOKEN
  private readonly chatId = process.env.TELEGRAM_CHAT_ID

  async sendMessage(text: string): Promise<void> {
    if (!this.botToken || !this.chatId) {
      console.warn("Telegram credentials not configured")
      return
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: "HTML",
        }),
      })

      if (!response.ok) {
        throw new Error(`Telegram API failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Failed to send Telegram message:", error)
    }
  }

  async notifyAlert(title: string, details: string, severity: "info" | "warning" | "critical" = "info"): Promise<void> {
    const emoji = severity === "critical" ? "🔴" : severity === "warning" ? "⚠️" : "ℹ️"

    const message = `
${emoji} <b>${title}</b>

${details}

<i>Time: ${new Date().toLocaleString("th-TH")}</i>
    `.trim()

    await this.sendMessage(message)
  }
}
