const mongoose = require("mongoose");
const home = require("./home");

const favouriteSchema = new mongoose.Schema({
  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "home",
    required: true,
    unique: true,
  },
});

module.exports = mongoose.model("Favourite", favouriteSchema);
