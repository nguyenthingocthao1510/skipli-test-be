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

exports.getUsersByUids = async (req, res) => {
  const { uids } = req.body;

  if (!Array.isArray(uids)) {
    return res.status(400).json({ message: "uids must be an array" });
  }

  try {
    const userRecords = await Promise.all(
      uids.map((uid) => admin.auth().getUser(uid))
    );

    const users = userRecords.map((user) => ({
      uid: user.uid,
      displayName: user.displayName || user.email || "Unnamed",
      email: user.email,
    }));

    res.status(200).json({ users });
  } catch (error) {
    console.error("getUsersByUids error:", error);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
};
