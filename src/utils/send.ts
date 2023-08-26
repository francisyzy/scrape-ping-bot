import config from "../config";
import bot from "../lib/bot";

// Function to send a notification to Telegram
export async function sendNotification(message: string) {
  if (config.LOG_GROUP_ID) {
    await bot.telegram.sendMessage(config.LOG_GROUP_ID, message);
  }
}
