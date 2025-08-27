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

exports.getAllTasks = async (req, res) => {
  const uid = await getUserId(req, res);
  const { boardId, id } = req.params;

  if (!uid) return;

  try {
    const snap = await db
      .collection("tasks")
      .where("ownerId", "==", uid)
      .where("boardId", "==", boardId)
      .where("cardId", "==", id)
      .get();

    const tasks = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: data.id,
        cardId: data.cardId,
        title: data.title,
        description: data.description,
        status: data.status,
      };
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch task" });
  }
};

exports.createNewTask = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId, id } = req.params;
  const { title, description, status } = req.body;
  const taskId = uuidv4();

  try {
    const newTask = {
      id: taskId,
      cardId: id,
      boardId: boardId,
      ownerId: uid,
      title,
      description,
      status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection("tasks").doc(taskId).set(newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Could not create task" });
  }
};

exports.getTaskDetails = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId, id, taskId } = req.params;

  try {
    const snap = await db
      .collection("tasks")
      .where("ownerId", "==", uid)
      .where("boardId", "==", boardId)
      .where("cardId", "==", id)
      .where("id", "==", taskId)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ message: "Not found" });
    }

    const data = snap.docs[0].data();

    res.json({
      id: data.id,
      cardId: data.cardId,
      title: data.title,
      description: data.description,
      status: data.status,
    });
  } catch (error) {
    console.error("error:", error);
    res.status(500).json({ message: "Could not fetch task" });
  }
};

exports.updateTaskDetail = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId, id: cardId, taskId } = req.params;
  const { id, card_owner_id, card_id } = req.body;

  try {
    const taskRef = db.collection("tasks").doc(taskId);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Not found" });
    }

    const data = doc.data();

    if (
      data.ownerId !== uid ||
      data.boardId !== boardId ||
      data.cardId !== cardId
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updateData = {};
    if (id !== undefined) updateData.id = id;
    if (card_owner_id !== undefined) updateData.ownerId = card_owner_id;
    if (card_id !== undefined) updateData.cardId = card_id;

    await taskRef.update(updateData);

    res.status(200).json({
      id: id || data.id,
      cardId: card_id || data.cardId,
    });
  } catch (error) {
    console.error("updateTaskDetail error:", error);
    res.status(500).json({ message: "Could not update task" });
  }
};

exports.deleteTask = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { boardId, id, taskId } = req.params;

  try {
    const snap = await db
      .collection("tasks")
      .where("ownerId", "==", uid)
      .where("boardId", "==", boardId)
      .where("cardId", "==", id)
      .where("id", "==", taskId)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ message: "Task not found" });
    }

    await snap.docs[0].ref.delete();
    res.status(204).send();
  } catch (err) {
    console.error("error:", err);
    res.status(500).json({ message: "Could not delete task" });
  }
};

exports.assignMemberToTask = async (req, res) => {
  const { taskId } = req.params;
  const id = uuidv4();

  const uid = await getUserId(req, res);
  if (!uid) return;

  const { memberId } = req.body;

  try {
    const newData = {
      id: id,
      taskId: taskId,
      memberId: memberId,
    };
    await db.collection("assignees").doc(taskId).set(newData);
    res.status(201).json(newData);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Could not assignee" });
  }
};

exports.getAllAssignees = async (req, res) => {
  const uid = await getUserId(req, res);
  const { taskId } = req.params;

  if (!uid) return;

  try {
    const snap = await db
      .collection("assignees")
      .where("taskId", "==", taskId)
      .get();

    const assignees = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        taskId: data.taskId,
        memberId: data.memberId,
      };
    });

    res.status(200).json(assignees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not fetch assignee" });
  }
};

exports.deleteAssignee = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { taskId, memberId } = req.params;

  try {
    const snap = await db
      .collection("assignees")
      .where("taskId", "==", taskId)
      .where("memberId", "==", memberId)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ message: "Assignee not found" });
    }

    await snap.docs[0].ref.delete();
    res.status(204).send();
  } catch (err) {
    console.error("error:", err);
    res.status(500).json({ message: "Could not delete assignee" });
  }
};

exports.getRepositoryGithubInfo = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { repositoryId } = req.params;

  const branches = [
    { name: "main", lastCommitSha: uuidv4() },
    { name: "dev", lastCommitSha: uuidv4() },
  ];

  const pulls = [
    { title: "Fix bug", pullNumber: Math.floor(Math.random() * 1000) },
    { title: "Add feature", pullNumber: Math.floor(Math.random() * 1000) },
  ];

  const issues = [
    { title: "Issue 1", issueNumber: Math.floor(Math.random() * 1000) },
    { title: "Issue 2", issueNumber: Math.floor(Math.random() * 1000) },
  ];

  const commits = [
    { sha: uuidv4(), message: "Initial commit" },
    { sha: uuidv4(), message: "Update README" },
  ];

  res.status(200).json({ repositoryId, branches, pulls, issues, commits });
};

exports.attachGithubToTask = async (req, res) => {
  const { taskId, cardId, boardId } = req.params;
  const id = uuidv4();
  const uid = await getUserId(req, res);
  if (!uid) return;

  const { type, number, sha } = req.body;
  if (!["pull_request", "commit", "issue"].includes(type)) {
    return res.status(400).json({ message: "Invalid type" });
  }
  if ((type === "commit" && !sha) || (type !== "commit" && !number)) {
    return res.status(400).json({ message: "Missing number or sha" });
  }

  const newData = {
    id,
    taskId,
    cardId,
    boardId,
    type,
    number: number || null,
    sha: sha || null,
    attachedBy: uid,
    attachedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await db.collection("githubAttachments").doc(id).set(newData);
  res.status(201).json(newData);
};

exports.getGithubAttachments = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;
  const { taskId } = req.params;

  const snap = await db
    .collection("githubAttachments")
    .where("taskId", "==", taskId)
    .get();

  const attachments = snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.id,
      taskId: data.taskId,
      type: data.type,
      number: data.number || undefined,
      sha: data.sha || undefined,
    };
  });

  res.status(200).json(attachments);
};

exports.deleteGithubAttachment = async (req, res) => {
  const uid = await getUserId(req, res);
  if (!uid) return;
  const { attachmentId } = req.params;

  const docRef = db.collection("githubAttachments").doc(attachmentId);
  const doc = await docRef.get();
  if (!doc.exists)
    return res.status(404).json({ message: "Attachment not found" });

  await docRef.delete();
  res.status(204).send();
};
