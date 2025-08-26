const express = require("express");

const {
  getAllBoards,
  getBoardById,
  createBoard,
  updateBoard,
  deleteBoard,
} = require("../controller/board");

const authMiddleware = require("../middleware/authMiddleware");

const boardsRouter = express.Router();

boardsRouter.get("/boards", authMiddleware, getAllBoards);
boardsRouter.get("/boards/:id", authMiddleware, getBoardById);
boardsRouter.post("/boards", authMiddleware, createBoard);
boardsRouter.put("/boards/:id", authMiddleware, updateBoard);
boardsRouter.delete("/boards/:id", authMiddleware, deleteBoard);

module.exports = boardsRouter;
