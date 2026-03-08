export async function sendTelegramMessage(params: {
  botToken: string;
  chatId: string;
  text: string;
}) {
  const response = await fetch(
    `https://api.telegram.org/bot${params.botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(5000),
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.text,
        disable_web_page_preview: true,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Telegram send failed with status ${response.status}.`);
  }
}

export function formatAutomationTelegramMessage(params: {
  source: "manual" | "cron";
  status: string;
  message: string;
  amountUsdc: string;
  currentChainId: number;
  routeId?: string;
}) {
  return [
    "Agent Lily Update",
    "",
    `Source: ${params.source}`,
    `Status: ${params.status}`,
    `Position: ${params.amountUsdc} USDC`,
    `Chain: ${params.currentChainId}`,
    "",
    params.message,
    params.routeId ? `Route ID: ${params.routeId}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}
