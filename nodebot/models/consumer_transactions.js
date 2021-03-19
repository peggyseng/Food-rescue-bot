const mongoose = require("mongoose");
const consumerTransactionSchema = new mongoose.Schema({
  telegram_id: {
      type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  amount: {
    type: Number,
  },
});

const consumerTransaction = mongoose.model("ConsumerTransaction", consumerTransactionSchema);
exports.consumerTransaction = consumerTransaction;
