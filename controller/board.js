const admin = require("../config/firebase");
const db = admin.firestore();
const { v4: uuidv4 } = require("uuid");

async function getUserId(req, res) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }

  try {
    const token = auth.replace("Bearer ", "");
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (err) {
    console.error("Auth error:", err.message);
    res.status(401).json({ message: "Invalid token" });
    return null;
  }
}

exports.getAllBoards = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  try {
    const snap = await db
      .collection("boards")
      .where("ownerId", "==", uid)
      .get();
    const boards = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.status(200).json(boards);
  } catch (err) {
    console.error("getAllBoards error:", err);
    res.status(500).json({ message: "Could not fetch boards" });
  }
};

exports.getBoardById = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  try {
    const doc = await db.collection("boards").doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ message: "Board not found" });
    }

    const board = doc.data();
    if (!board.members.includes(uid)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ id: doc.id, ...board });
  } catch (err) {
    console.error("getBoardById error:", err);
    res.status(500).json({ message: "Could not fetch board" });
  }
};

exports.createBoard = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { name, description } = req.body;
  const boardId = uuidv4();

  const newBoard = {
    id: boardId,
    name,
    description,
    ownerId: uid,
    members: [uid],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    await db.collection("boards").doc(boardId).set(newBoard);
    res.status(201).json({ id: boardId, ...newBoard });
  } catch (err) {
    console.error("createBoard error:", err);
    res.status(500).json({ message: "Could not create board" });
  }
};

exports.updateBoard = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const ref = db.collection("boards").doc(id);
    const doc = await ref.get();

    if (!doc.exists)
      return res.status(404).json({ message: "Board not found" });

    const board = doc.data();
    if (board.ownerId !== uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await ref.update({
      name,
      description,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).json({ id, name, description });
  } catch (err) {
    console.error("updateBoard error:", err);
    res.status(500).json({ message: "Could not update board" });
  }
};

exports.deleteBoard = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { id } = req.params;

  try {
    const ref = db.collection("boards").doc(id);
    const doc = await ref.get();

    if (!doc.exists)
      return res.status(404).json({ message: "Board not found" });

    const board = doc.data();
    if (board.ownerId !== uid) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await ref.delete();
    res.status(204).send();
  } catch (err) {
    console.error("deleteBoard error:", err);
    res.status(500).json({ message: "Could not delete board" });
  }
};
