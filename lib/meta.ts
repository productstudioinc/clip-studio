interface MetaEventData {
  event_name: string
  event_time: number
  action_source: string
  event_source_url: string
  user_data: {
    client_ip_address: string
    client_user_agent: string
  }
  custom_data: Record<string, any>
}

export class MetaPixelService {
  private static pixelId = process.env.META_PIXEL_ID
  private static accessToken = process.env.META_ACCESS_TOKEN
  private static apiVersion = 'v12.0'
  private static baseUrl = `https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events`

  static async sendEvent(eventData: MetaEventData): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}?access_token=${this.accessToken}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: [eventData] })
        }
      )

      if (!response.ok) {
        throw new Error(`Meta Pixel API request failed: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Failed to send Meta Pixel event:', error)
      // Implement proper error logging here
    }
  }
}
