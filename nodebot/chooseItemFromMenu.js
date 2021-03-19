const Markup = require("telegraf/markup"); // Get the markup module
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const settings = require("./settings");
const { telegramSession } = require("./models/telegram_session.js");
const logger = require("./logger");
const common = require("./common");

const axios = require("axios");

const chooseItemFromMenuWizard = new WizardScene(
  "choose-item-from-menu-wizard",
  async (ctx) => {
    ctx.wizard.state.data = {};
    try {
      console.log("########");
      console.log(ctx.from.id);
      let telegram_session = await telegramSession.findOne({
        telegram_id: ctx.from.id,
      });
      console.log(telegram_session);

      let resp = await axios({
        url: settings.REST_API_ROOT_URL + "/api/item",
        headers: {
          Authorization: `Token ${telegram_session.authorization_token}`,
        },
        method: "get",
      });

      await ctx.reply(`Please enter the id of the item you want to list`);

      for (const [key, value] of Object.entries(resp.data)) {
        console.log(key, value);
        await ctx.reply(`id: ${key}, ${value.item_name}, \$${value.price}`);
      }

      ctx.wizard.state.data.items_dict = resp.data;

      return ctx.wizard.next();
    } catch (err) {
      logger.info("Error fetching item");
      console.log(err);
    }
  },

  async (ctx) => {
    ctx.wizard.state.data.item = ctx.message.text;
    ctx.reply("Enter the quantity of this listing:");
    return ctx.wizard.next();
  },

  (ctx) => {
    ctx.wizard.state.data.quantity = ctx.message.text;
    ctx.reply("Enter the discount percentage:");
    return ctx.wizard.next();
  },

  async (ctx) => {
    ctx.wizard.state.data.price =
      ctx.wizard.state.data.items_dict[ctx.wizard.state.data.item]["price"];
    ctx.wizard.state.data.discounted_price =
      Number(ctx.message.text) * Number(ctx.wizard.state.data.price);

    post_data = {
      listing_name:
        ctx.wizard.state.data.items_dict[ctx.wizard.state.data.item][
          "item_name"
        ],
      quantity: ctx.wizard.state.data.quantity,
      discounted_price: ctx.wizard.state.data.discounted_price,
      date_of_listing: new Date().toISOString(),
      telegram_message_id: 100,
      branch: "http://127.0.0.1:8000/api/branch/3/",
      price: ctx.wizard.state.data.price,
      telegram_message_id: 00000,
    };

    let telegram_session = await telegramSession.findOne({
      telegram_id: ctx.from.id,
    });

    console.log(post_data);

    let resp = await axios({
      url: settings.REST_API_ROOT_URL + "/api/listing/",
      headers: {
        Authorization: `Token ${telegram_session.authorization_token}`,
      },
      data: post_data,
      method: "post",
    });

    ctx.replyWithMarkdown(
      `Your listing for *${ctx.wizard.state.data.quantity}* of *${post_data.listing_name}* at *\$${ctx.wizard.state.data.discounted_price}* has been posted into the SecondMunch Channel`
    );
    console.log(ctx);

    const extra = require("telegraf/extra");
    const markup = extra.markdown();

    common.bot.telegram.sendMessage(
      `@secondmunch_uat`,
      `Item: *${post_data.listing_name}* \nQuantity: *${post_data.quantity}* \nPrice: *\$${post_data.discounted_price}*`,
      markup
    );
    return ctx.scene.leave();
  }
);

module.exports.chooseItemFromMenuWizard = chooseItemFromMenuWizard;
