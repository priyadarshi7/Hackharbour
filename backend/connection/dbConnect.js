const mongoose = require("mongoose");

async function dbConnect(url) {
    await mongoose.connect(url);
}

module.exports = {dbConnect}