const express = require("express");

const {
  getAllCards,
  createNewCard,
  getCardDetails,
  getCardsByUser,
  updateCard,
  inviteMemberToBoard,
  respondToCardInvite,
  deleteCard,
  getAllCardsByStatus,
} = require("../controller/card");

const authMiddleware = require("../middleware/authMiddleware");

const cardsRouter = express.Router();

cardsRouter.get("/boards/:boardId/cards", authMiddleware, getAllCards);
cardsRouter.post("/boards/:boardId/cards", authMiddleware, createNewCard);
cardsRouter.get("/boards/:boardId/cards/:id", authMiddleware, getCardDetails);
cardsRouter.get(
  "/boards/:boardId/cards/user/:user_id",
  authMiddleware,
  getCardsByUser
);
cardsRouter.put("/boards/:boardId/cards/:id", authMiddleware, updateCard);
cardsRouter.post(
  "/boards/:boardId/invite",
  authMiddleware,
  inviteMemberToBoard
);
cardsRouter.post(
  "/boards/:boardId/cards/:id/invite/accept",
  authMiddleware,
  respondToCardInvite
);
cardsRouter.delete("/boards/:boardId/cards/:id", authMiddleware, deleteCard);
cardsRouter.post(
  "/boards/:boardId/cards-by-status",
  authMiddleware,
  getAllCardsByStatus
);

module.exports = cardsRouter;
