const { default: axios } = require("axios");
const admin = require("../config/firebase");

exports.registerUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });
    res.status(201).json({
      message: "User created successfully",
      userId: userRecord.uid,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const apiKey = process.env.API_KEY;
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        email,
        password,
        returnSecureToken: true,
      }
    );

    res.status(200).json({
      message: "Login success",
      idToken: response.data.idToken,
      refreshToken: response.data.refreshToken,
      userId: response.data.localId,
    });
  } catch (error) {
    res.status(400).json({
      message: "Login failed",
      error: error.response?.data?.error || error.message,
    });
  }
};

exports.getUser = async (req, res) => {
  const { uid } = req.user;

  try {
    const userRecord = await admin.auth().getUser(uid);
    res.status(200).json({ user: userRecord });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
