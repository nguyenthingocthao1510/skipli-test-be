const admin = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");

const db = admin.firestore();

async function getUserIdFromToken(req, res) {
  const tokenHeader = req.headers.authorization;
  if (!tokenHeader || !tokenHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  try {
    const idToken = tokenHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.uid;
  } catch (err) {
    console.error("Token error:", err);
    res.status(401).json({ message: "Invalid token" });
    return null;
  }
}

exports.getAllBoards = async (req, res) => {
  const uid = await getUserIdFromToken(req, res);
  if (!uid) return;

  try {
    const snapshot = await db
      .collection("boards")
      .where("userId", "==", uid)
      .get();

    const boards = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json({ boards });
  } catch (err) {
    console.error("Error: ", err);
    res.status(500).json({ message: "Error" });
  }
};

exports.getBoardById = async (req, res) => {
  const uid = await getUserIdFromToken(req, res);
  if (!uid) return;

  const { id } = req.params;
  try {
    const snapshot = await db.collection("boards").where("id", "==", id).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Board not found" });
    }

    const boardDoc = snapshot.docs[0];
    const board = boardDoc.data();

    if (board.userId !== uid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.status(200).json({ id: boardDoc.id, ...board });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error" });
  }
};

exports.createBoard = async (req, res) => {
  const uid = await getUserIdFromToken(req, res);
  if (!uid) return;

  const { name, description } = req.body;
  const newId = uuidv4();

  try {
    const newBoard = {
      id: newId,
      name,
      description,
      userId: uid,
    };

    const ref = await db.collection("boards").add(newBoard);
    res.status(200).json({ id: ref.id, ...newBoard });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error" });
  }
};

exports.updateBoard = async (req, res) => {
  const uid = await getUserIdFromToken(req, res);
  if (!uid) return;

  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const snapshot = await db.collection("boards").where("id", "==", id).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Board not found" });
    }

    const boardDoc = snapshot.docs[0];
    const board = boardDoc.data();

    if (board.userId !== uid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await boardDoc.ref.update({ name, description });

    res.status(200).json({
      id,
      name,
      description,
      userId: uid,
    });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error" });
  }
};

exports.deleteBoard = async (req, res) => {
  const uid = await getUserIdFromToken(req, res);
  if (!uid) return;

  const { id } = req.params;

  try {
    const snapshot = await db.collection("boards").where("id", "==", id).get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Board not found" });
    }

    const boardDoc = snapshot.docs[0];
    const board = boardDoc.data();

    if (board.userId !== uid) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await boardDoc.ref.delete();
    res.status(204).json({ message: "Board deleted successfully" });
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ message: "Error" });
  }
};
