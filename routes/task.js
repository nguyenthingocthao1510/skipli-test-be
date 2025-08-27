const express = require("express");

const {
  getAllTasks,
  createNewTask,
  getTaskDetails,
  updateTaskDetail,
  deleteTask,
  assignMemberToTask,
  getAllAssignees,
  deleteAssignee,
  getRepositoryGithubInfo,
  attachGithubToTask,
  getGithubAttachments,
  deleteGithubAttachment,
} = require("../controller/task");

const authMiddleware = require("../middleware/authMiddleware");

const taskRouter = express.Router();

taskRouter.get("/boards/:boardId/cards/:id/tasks", authMiddleware, getAllTasks);
taskRouter.post(
  "/boards/:boardId/cards/:id/tasks",
  authMiddleware,
  createNewTask
);
taskRouter.get(
  "/boards/:boardId/cards/:id/tasks/:taskId",
  authMiddleware,
  getTaskDetails
);
taskRouter.put(
  "/boards/:boardId/cards/:id/tasks/:taskId",
  authMiddleware,
  updateTaskDetail
);
taskRouter.delete(
  "/boards/:boardId/cards/:id/tasks/:taskId",
  authMiddleware,
  deleteTask
);
taskRouter.post(
  "/boards/:boardId/cards/:id/tasks/:taskId/assign",
  authMiddleware,
  assignMemberToTask
);
taskRouter.get(
  "/boards/:boardId/cards/:id/tasks/:taskId/assign",
  authMiddleware,
  getAllAssignees
);
taskRouter.delete(
  "/boards/:boardId/cards/:id/tasks/:taskId/assign/:memberId",
  authMiddleware,
  deleteAssignee
);

taskRouter.get(
  "/repositories/:repositoryId/github-info",
  authMiddleware,
  getRepositoryGithubInfo
);

taskRouter.post(
  "/boards/:boardId/cards/:cardId/tasks/:taskId/github-attach",
  authMiddleware,
  attachGithubToTask
);

taskRouter.get(
  "/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments",
  authMiddleware,
  getGithubAttachments
);

taskRouter.delete(
  "/boards/:boardId/cards/:cardId/tasks/:taskId/github-attachments/:attachmentId",
  authMiddleware,
  deleteGithubAttachment
);
module.exports = taskRouter;
