const Markup = require("telegraf/markup"); // Get the markup module
const Stage = require("telegraf/stage");
const session = require("telegraf/session");
const WizardScene = require("telegraf/scenes/wizard");
const settings = require("./settings");

const axios = require("axios");

const loginWizard = new WizardScene(
    'login-wizard',
    ctx => {
      ctx.reply("Hello!\nPlease enter your SecondMunchBiz username:")
      ctx.wizard.state.data = {};
      return ctx.wizard.next();
    },
    ctx => {
      ctx.wizard.state.data.username = ctx.message.text;
      ctx.reply('Enter your password');
      return ctx.wizard.next();
    },
    async ctx => {
      ctx.wizard.state.data.password = ctx.message.text;
      ctx.reply(`Your username is ${ctx.wizard.state.data.username}`);
      ctx.reply(`Your password ${ctx.wizard.state.data.password}`);

      try {
          let resp = await axios({
          url: settings.REST_API_ROOT_URL + "/api/token/login/",
          data: {
              username: ctx.wizard.state.data.username,
              password: ctx.wizard.state.data.password,
          },
          method: "post",
      });
      console.log(resp.data);
    }
    catch (err) {
        console.log(err);
    }
       
 

      return ctx.scene.leave();
    }
  );

  module.exports.loginWizard = loginWizard;