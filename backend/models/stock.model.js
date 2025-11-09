const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    total_stock: {
      type: Number,
      required: [true, "Please enter total stock"],
      min: [0, "Total stock cannot be negative"],
    },
    selling_stock: {
      type: Number,
      default: 0,
      min: [0, "Selling stock cannot be negative"],
    },
    pending_stock: {
      type: Number,
      default: 0,
      min: [0, "Pending stock cannot be negative"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock", stockSchema);
