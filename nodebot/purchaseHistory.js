const Markup = require("telegraf/markup"); // Get the markup module
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const settings = require("./settings");
const { telegramSession } = require("./models/telegram_session.js");
const logger = require("./logger");
const common = require("./common");

const axios = require("axios");

const consumerBot = new Telegraf(
    "1163164171:AAEd7Jzw9BxeFvyHsNqWdAohniwpWW9zHvk"
  );

const purchaseHistoryWizard = new WizardScene(
  "purchase-history-wizard",
  (ctx) => {
    ctx.reply("Purchase History");
    ctx.wizard.state.data = {};

    logger.info("Write to mongodb OK");

    return ctx.scene.leave();
  }
);

module.exports.purchaseHistoryWizard = purchaseHistoryWizard;
