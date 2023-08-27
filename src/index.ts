import { Message } from "typegram";
import { Telegraf } from "telegraf";

import config from "./config";

import { toEscapeHTMLMsg } from "./utils/messageHandler";
import { printBotInfo } from "./utils/consolePrintUsername";

import bot from "./lib/bot";
import { fetchWebpageContent } from "./utils/scrape";
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
  printBotInfo(bot);

  // Store the initial content of the webpage
  let initialContent: string | null = null;
  schedule("6,26,46 * * * *", async () => {
    const newContent = await fetchWebpageContent();
    // console.log(newContent);
    console.log("Running scrape");
    await sendNotification("Scraping..");
    if (newContent !== null) {
      if (initialContent === null) {
        console.log("Setting initial content");
        initialContent = newContent;
      } else if (newContent !== initialContent) {
        console.log("Content Diff!");
        await sendNotification(
          "@" +
            config.OWNER_USERNAME +
            " Webpage content has changed!",
        );
        initialContent = newContent;
      }
    }
  });
};

index();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
