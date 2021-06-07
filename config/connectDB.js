const mongoose = require("mongoose");
const connectDB = async () => {
  await mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log("Connect DB success !");
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = connectDB;
