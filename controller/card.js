const admin = require("../config/firebase");
const { v4: uuidv4 } = require("uuid");

const db = admin.firestore();

async function getUserId(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Unauthorized" });
    return null;
  }
  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded.uid;
  } catch (err) {
    console.error("Token verify failed:", err);
    res.status(401).json({ message: "Invalid token" });
    return null;
  }
}

exports.getAllCards = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId } = req.params;

  try {
    const snap = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .get();

    const cards = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        list_member: data.list_member || [],
      };
    });

    res.json(cards);
  } catch (err) {
    console.error("getAllCards error:", err);
    res.status(500).json({ message: "Could not fetch cards" });
  }
};

exports.getAllCardsByStatus = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId } = req.params;
  const { status } = req.body;

  try {
    const snap = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .where("status", "==", status)
      .get();

    const cards = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        list_member: data.list_member || [],
      };
    });

    res.json(cards);
  } catch (err) {
    console.error("getAllCards error:", err);
    res.status(500).json({ message: "Could not fetch cards" });
  }
};

exports.createNewCard = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId } = req.params;
  const { name, description, status, members } = req.body; // ✅ add 'members' from body
  const cardId = uuidv4();

  try {
    const ensuredMembers = members?.includes(uid)
      ? members
      : [...(members || []), uid]; // ✅ ensure owner is in list

    const newCard = {
      id: cardId,
      name,
      description,
      ownerId: uid,
      boardId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status,
      list_member: ensuredMembers,
    };

    await db.collection("cards").doc(cardId).set(newCard);

    res.status(201).json(newCard);
  } catch (err) {
    console.error("createNewCard error:", err);
    res.status(500).json({ message: "Could not create card" });
  }
};

exports.getCardDetails = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId, id } = req.params;

  try {
    const snap = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .where("id", "==", id)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ message: "Card not found" });
    }

    const data = snap.docs[0].data();
    res.json({
      id: data.id,
      name: data.name,
      description: data.description,
    });
  } catch (err) {
    console.error("getCardDetails error:", err);
    res.status(500).json({ message: "Could not fetch card" });
  }
};

exports.getCardsByUser = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId, user_id } = req.params;
  if (uid !== user_id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  try {
    const snap = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .where("ownerId", "==", uid)
      .get();

    const cards = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        tasks_count: data.tasks ? data.tasks.length : 0,
        list_member: data.members || [ownerId],
        createdAt: data.createdAt ? data.createdAt.toDate() : null,
      };
    });

    res.json(cards);
  } catch (err) {
    console.error("getCardsByUser error:", err);
    res.status(500).json({ message: "Could not fetch cards" });
  }
};

exports.updateCard = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId, id } = req.params;
  const { name, description, ...extra } = req.body;

  try {
    const snap = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .where("id", "==", id)
      .where("ownerId", "==", uid)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ message: "Card not found or not allowed" });
    }

    const ref = snap.docs[0].ref;
    const updateData = {
      ...(name && { name }),
      ...(description && { description }),
      ...extra,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await ref.update(updateData);
    const updated = (await ref.get()).data();

    res.json(updated);
  } catch (err) {
    console.error("updateCard error:", err);
    res.status(500).json({ message: "Could not update card" });
  }
};

exports.inviteMemberToBoard = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId } = req.params;
  const { card_id, member_id, email_member } = req.body;

  try {
    const inviteId = uuidv4();
    const invite = {
      invite_id: inviteId,
      board_id: boardId,
      card_id: card_id || null,
      board_owner_id: uid,
      member_id,
      email_member: email_member || null,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("invites").doc(inviteId).set(invite);

    res.json({ success: true });
  } catch (err) {
    console.error("inviteMemberToBoard error:", err);
    res.status(500).json({ message: "Could not send invite" });
  }
};

exports.respondToCardInvite = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { invite_id, status } = req.body;
  if (!["accepted", "declined"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const ref = db.collection("invites").doc(invite_id);
    const doc = await ref.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Invite not found" });
    }

    await ref.update({
      status,
      respondedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, status });
  } catch (err) {
    console.error("respondToCardInvite error:", err);
    res.status(500).json({ message: "Could not update invite" });
  }
};

exports.deleteCard = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId, id } = req.params;

  try {
    const snap = await db
      .collection("cards")
      .where("boardId", "==", boardId)
      .where("id", "==", id)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ message: "Card not found" });
    }

    await snap.docs[0].ref.delete();
    res.status(204).send();
  } catch (err) {
    console.error("deleteCard error:", err);
    res.status(500).json({ message: "Could not delete card" });
  }
};
