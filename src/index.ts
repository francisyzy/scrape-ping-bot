import { Message } from "typegram";
import { Telegraf } from "telegraf";

import config from "./config";

import { toEscapeHTMLMsg } from "./utils/messageHandler";
import { printBotInfo } from "./utils/consolePrintUsername";

import bot from "./lib/bot";
import { fetchWebpageContent, findIphone } from "./utils/scrape";
import { sendNotification } from "./utils/send";
import { schedule } from "node-cron";

const index = async () => {
  bot.use(Telegraf.log());
  bot.use((ctx, next) => {
    if (
      ctx.message &&
      config.LOG_GROUP_ID &&
      ctx.message.from.username != config.OWNER_USERNAME
    ) {
      let userInfo: string;
      if (ctx.message.from.username) {
        userInfo = `name: <a href="tg://user?id=${
          ctx.message.from.id
        }">${toEscapeHTMLMsg(ctx.message.from.first_name)}</a> (@${
          ctx.message.from.username
        })`;
      } else {
        userInfo = `name: <a href="tg://user?id=${
          ctx.message.from.id
        }">${toEscapeHTMLMsg(ctx.message.from.first_name)}</a>`;
      }
      const text = `\ntext: ${
        (ctx.message as Message.TextMessage).text
      }`;
      const logMessage = userInfo + toEscapeHTMLMsg(text);
      bot.telegram.sendMessage(config.LOG_GROUP_ID, logMessage, {
        parse_mode: "HTML",
      });
    }
    return next();
  });
  bot.launch();
  console.log("starting");
  await sendNotification("starting");
  printBotInfo(bot);

  // Store the initial content of the webpage
  let initialContent: string = findIphone(
    await fetchWebpageContent(),
  );
  console.log(initialContent);
  await sendNotification(initialContent);
  if (
    initialContent.includes("Natural Titanium: stock-yes") ||
    initialContent.includes("Natural Titanium: stock-low")
  ) {
    await sendNotification(
      "@" +
        config.OWNER_USERNAME +
        "\n Your iphone has stock!!",
    );
  }
  schedule("*/5 8-23 * * *", async () => {
    const newContent = findIphone(await fetchWebpageContent());
    if (newContent !== null) {
      if (newContent !== initialContent) {
        console.log("Content Diff!");
        await sendNotification(newContent);
        initialContent = newContent;
        if (
          initialContent.includes("Natural Titanium: stock-yes") ||
          initialContent.includes("Natural Titanium: stock-low")
        ) {
          await sendNotification(
            "@" +
              config.OWNER_USERNAME +
              "\n Your iphone has stock!!",
          );
        }
      }
    }
  });
};

index();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
