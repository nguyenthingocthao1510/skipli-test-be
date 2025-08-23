const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoute = require("./routes/authRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoute);

app.listen(PORT, () => {
  console.log("Server is running on port:", PORT);
});
