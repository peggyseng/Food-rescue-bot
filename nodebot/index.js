const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const logger = require("./logger");
const Markup = require("telegraf/markup"); // Get the markup module
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const { loginWizard } = require("./login");
const { viewListingWizard } = require("./viewListing");
const { consumerTransaction } = require("./models/consumer_transaction");
const { telegramSession } = require("./models/telegram_session");
const { chooseItemFromMenuWizard } = require("./chooseItemFromMenu");
const { findFoodDealsWizard } = require("./findFoodDeals");
const { purchaseHistoryWizard } = require("./purchaseHistory");

const common = require("./common");

const app = express();
const { Telegraf } = require("telegraf");
const dotenv = require("dotenv");
dotenv.config();

process.env.TZ = "Asia/Singapore";
if (!process.env.BOT_TOKEN) {
  console.log("[BOT TOKEN] bot token is not found");
}
const businessBot = new Telegraf(process.env.BOT_TOKEN);
const consumerBot = new Telegraf(
  "1163164171:AAEd7Jzw9BxeFvyHsNqWdAohniwpWW9zHvk"
);
common.bot = businessBot;

var CronJob = require("cron").CronJob;

const stage = new Stage([
  loginWizard,
  viewListingWizard,
  chooseItemFromMenuWizard,
  findFoodDealsWizard,
  purchaseHistoryWizard,
]);
const loginMiddlware = require("./middlewares/login");
const authMiddleware = require("./middlewares/login");

mongoose
  .connect(
    "mongodb+srv://nodebot:lrBfvw9qWTBkXuvZ@secondmunch-uat.wrw2o.mongodb.net/secondmunch-uat?retryWrites=true&w=majority"
  )
  .then(() => logger.info("Connected to MongoDB"))
  .catch((err) => logger.error("Could not connect to MongoDB: ", err));

businessBot.use(session());
businessBot.use(stage.middleware());

consumerBot.use(session());
consumerBot.use(stage.middleware());

businessBot.command("login", (ctx) => {
  ctx.scene.enter("login-wizard");
});

businessBot.command("top_up", async (ctx) => {
  let txn = new consumerTransaction({
    telegram_id: ctx.message.from.id,
    amount: 5,
  });
  let telegram_session = await telegramSession.findOrCreate({
    telegram_id: ctx.message.from.id,
  });
  telegram_session.credits += 5;
  ctx.reply("Topped up $5");
  await txn.save();
  await telegram_session.save();
});

businessBot.command("my_money", (ctx) => {});

businessBot.use(authMiddleware());

businessBot.command("dashboard", (ctx) => {
  ctx.reply(
    `Hi, *Demouser*!

Welcome back to branch: {}
Tap on:
📝 Choose item from menu or Create new item to upload your listing
🍪 View Listing or Edit / Delete Listing to manage your listings
📊 View my history to track your sales

If it takes longer than ten seconds to load, please /exit  and come back to the /dashboard again.

Feel free to contact @____ if you have any questions`,
    Markup.inlineKeyboard(
      [
        Markup.callbackButton(
          "📝 Choose item from menu",
          "inline_dashboard_choose_item_from_menu"
        ),
        Markup.callbackButton(
          "📝 Create new item",
          "inline_dashboard_create_new_item"
        ),
        Markup.callbackButton(
          "🍪 View my listing",
          "inline_dashboard_view_listings"
        ),
        Markup.callbackButton("🍪 View my listing", "fake"),
      ],
      { columns: 2 }
    ).extra()
  );
});

businessBot.action(/^inline_dashboard/i, (ctx) => {
  console.log(ctx);
  if (ctx.update.callback_query.data == "inline_dashboard_view_listings") {
    console.log("###########");
    ctx.scene.enter("view-listing-wizard");
  }

  if (
    ctx.update.callback_query.data == "inline_dashboard_choose_item_from_menu"
  ) {
    console.log("Choosing Item");
    ctx.scene.enter("choose-item-from-menu-wizard");
  }
});

businessBot.command("custom", ({ reply }) => {
  return reply(
    "Custom buttons keyboard",
    Markup.keyboard([
      ["🔍 Search", "😎 Popular"], // Row1 with 2 buttons
      ["☸ Setting", "📞 Feedback"], // Row2 with 2 buttons
      ["📢 Ads", "⭐️ Rate us", "👥 Share"], // Row3 with 3 buttons
    ])
      .oneTime()
      .resize()
      .extra()
  );
});

businessBot.help((ctx) =>
  ctx.reply(`
Here are the following functionalities:
1. Updates on "offline" machines every 10 minutes
2. Updates on machines that don't generate sales every 1 hour (possible machine jam)
3. Updates on machines that just finishes maintenance every 10 minutes
`)
);

businessBot.launch();

// Consumer Bot

consumerBot.command("start", (ctx) => {
  ctx.replyWithMarkdown(
    `Hi! Welcome to SecondMunch. 

Tap on: 
🍪 *Find food deals* to browse bundles that are up for grabs
🛒 *Purchase history* to check your current purchases
    
If it takes longer than ten seconds to load, please /exit  and come back to the /start again. 
    
Feel free to contact @____ if you have any questions.`,
    Markup.inlineKeyboard(
      [
        Markup.callbackButton(
          "🍪 Find food deals",
          "inline_dashboard_find_food_deals"
        ),
        Markup.callbackButton(
          "🛒 Purchase history",
          "inline_dashboard_purchase_history"
        ),
      ],
      { columns: 1 }
    ).extra()
  );
});

consumerBot.action(/^inline_dashboard/i, (ctx) => {
  console.log(ctx);
  if (ctx.update.callback_query.data == "inline_dashboard_find_food_deals") {
    console.log("Find food deals selected");
    ctx.scene.enter("find-food-deals-wizard");
  }

  if (ctx.update.callback_query.data == "inline_dashboard_purchase_history") {
    console.log("Purchase history selected");
    ctx.scene.enter("purchase-history-wizard");
  }
});

consumerBot.launch();

app.listen(3000, () => {
  console.log("server started");
});
