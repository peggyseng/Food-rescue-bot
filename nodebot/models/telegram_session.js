const mongoose = require("mongoose");

const findOrCreate = require('mongoose-findorcreate')

//Telegram Session Schema
const telegramSessionSchema = new mongoose.Schema({
    telegram_id: {
        type: String,
        unique: true,
    },
    type: {
        type: String,
        enum: ["staff", "customer", "admin"],
    },
    authorization_token: {
        type: String,
        unique: true,
    },
    expiry: {
        type: Date,
    },
    credits: {
        type: Number,
        default: 0,
    }
});

telegramSessionSchema.index({telegram_id: 1});
telegramSessionSchema.statics.findOrCreate = async (conditions, opt_attr) => {
    let document = await telegramSession.findOne(conditions);
  
    return document || await new telegramSession({ ...conditions, ...opt_attr }).save();
  }

const telegramSession = mongoose.model("TelegramSession", telegramSessionSchema);

exports.telegramSession = telegramSession;
exports.telegramSessionSchema = telegramSessionSchema;