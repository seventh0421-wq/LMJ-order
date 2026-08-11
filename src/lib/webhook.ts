export interface DiscordEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  footer?: { text: string; icon_url?: string };
  timestamp?: string;
}

export interface DiscordWebhookPayload {
  username?: string;
  avatar_url?: string;
  content?: string;
  embeds?: DiscordEmbed[];
}

export async function sendDiscordWebhook(
  webhookUrl: string,
  payload: DiscordWebhookPayload
): Promise<{ success: boolean; error?: string }> {
  if (!webhookUrl || !webhookUrl.trim()) {
    return { success: false, error: '未設定 Webhook 網址' };
  }

  try {
    const response = await fetch(webhookUrl.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: payload.username || '復古點餐系統通知',
        avatar_url: payload.avatar_url || 'https://cdn-icons-png.flaticon.com/512/1046/1046784.png',
        content: payload.content,
        embeds: payload.embeds,
      }),
    });

    if (response.ok || response.status === 204) {
      return { success: true };
    } else {
      const text = await response.text();
      return { success: false, error: `Discord 回傳錯誤 (${response.status}): ${text}` };
    }
  } catch (err: any) {
    return { success: false, error: err?.message || '發送失敗，請檢查網路連線或網址' };
  }
}

export async function sendNewOrderDiscordNotification(
  webhookUrl: string,
  order: {
    shortId: string;
    items: { name: string; price: number }[];
    total: number;
    timeStr: string;
  }
) {
  if (!webhookUrl) return;

  // Group items
  const itemCounts: Record<string, { count: number; price: number }> = {};
  order.items.forEach((item) => {
    if (!itemCounts[item.name]) {
      itemCounts[item.name] = { count: 0, price: item.price };
    }
    itemCounts[item.name].count += 1;
  });

  const itemListFormatted = Object.entries(itemCounts)
    .map(([name, info]) => `• **${name}** x${info.count} ($${info.price * info.count} G)`)
    .join('\n');

  const embed: DiscordEmbed = {
    title: '🔔 收到新訂單通知！',
    description: `有人剛剛下了新的餐點訂單，請工作人員儘速處理！`,
    color: 0xef4444, // Red
    fields: [
      {
        name: '👤 玩家遊戲 ID',
        value: `\`${order.shortId}\``,
        inline: true,
      },
      {
        name: '💰 訂單總金額',
        value: `**$${order.total.toLocaleString()} G**`,
        inline: true,
      },
      {
        name: '⏰ 點餐時間',
        value: order.timeStr,
        inline: true,
      },
      {
        name: '📋 訂購餐點內容',
        value: itemListFormatted || '無餐點細節',
        inline: false,
      },
    ],
    footer: {
      text: '復古點餐系統 • Discord 自動通知',
    },
    timestamp: new Date().toISOString(),
  };

  return sendDiscordWebhook(webhookUrl, {
    content: `🚨 **【新訂單通知】** 玩家 **${order.shortId}** 已送出點餐請求 ($${order.total} G)`,
    embeds: [embed],
  });
}

export async function sendTestDiscordNotification(webhookUrl: string) {
  const embed: DiscordEmbed = {
    title: '🎉 Discord Webhook 測試成功！',
    description: '恭喜！復古點餐系統已成功與您的 Discord 頻道連線。',
    color: 0x22c55e, // Green
    fields: [
      {
        name: '狀態',
        value: '✅ 連線正常',
        inline: true,
      },
      {
        name: '通知類型',
        value: '新訂單即時推送',
        inline: true,
      },
    ],
    footer: {
      text: '復古點餐系統 • Discord 機器人測試',
    },
    timestamp: new Date().toISOString(),
  };

  return sendDiscordWebhook(webhookUrl, {
    content: '✅ **Discord Webhook 連線測試發送成功！**',
    embeds: [embed],
  });
}
