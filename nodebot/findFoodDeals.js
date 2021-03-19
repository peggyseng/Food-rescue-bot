const Markup = require("telegraf/markup"); // Get the markup module
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const settings = require("./settings");
const { telegramSession } = require("./models/telegram_session.js");
const logger = require("./logger");

const { Telegraf } = require("telegraf");
const dotenv = require("dotenv");
dotenv.config();

const axios = require("axios");
const consumerBot = new Telegraf(
  "1163164171:AAEd7Jzw9BxeFvyHsNqWdAohniwpWW9zHvk"
);

const findFoodDealsWizard = new WizardScene("find-food-deals-wizard", (ctx) => {
  ctx.reply("Find food deals");
  ctx.wizard.state.data = {};

  logger.info("Write to mongodb OK");

  consumerBot.on("inline_query", async ({ inlineQuery, answerInlineQuery }) => {
    const offset = parseInt(inlineQuery.offset) || 0;
    items = [];
    query = ctx.inlineQuery.query;

    results = items.slice(offset, offset + 10).map((item) => ({
      type: "article",
      id: "1",
      title: "Listing 1",
      description: "Description 1",
      input_message_content: {
        message_text: "*" + item.title + "*\n" + item.desc,
        parse_mode: "Markdown",
      },
      reply_markup: {
        inline_keyboard: [[{ text: "More info", callback_data: "moreinfo" }]],
      },
      //hide_url: true,
      //url: settings.REST_API_ROOT_URL + "/api/listing",
    }));
    return answerInlineQuery(results, {
      is_personal: true,
      next_offset: offset + results.length,
      cache_time: 10,
    });
  });

  ctx.answerInlineQuery(result);

  return ctx.scene.leave();
});

module.exports.findFoodDealsWizard = findFoodDealsWizard;
