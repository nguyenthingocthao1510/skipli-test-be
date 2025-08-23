const admin = require("firebase-admin");
const dotenv = require("dotenv");

dotenv.config();

const serviceAccount = require("./skipli-test-f7dc6-firebase-adminsdk-fbsvc-f44ff4c323.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://default.firebaseio.com",
});

module.exports = admin;
