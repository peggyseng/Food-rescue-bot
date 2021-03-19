const { telegramSession} = require("../models/telegram_session");

const authMiddleware = () => async (ctx, next) => {
    if (ctx.updateType === 'message') {
        console.log("hi");
        let telegram_session = await telegramSession.findOne({
            telegram_id: ctx.message.from.id
        })
        if (!telegram_session) {
            ctx.reply("You are not logged in");
        }
        else {
            return next()
        }
    }
    else {
        return next()
    }
}
module.exports = authMiddleware;
