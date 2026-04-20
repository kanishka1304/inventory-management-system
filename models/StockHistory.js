const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  oldQuantity: {
    type: Number,
    required: true
  },
  newQuantity: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('StockHistory', stockHistorySchema);