import express from "express";

const userRoutes = express.Router();

userRoutes.get("", ((req, res) => {
  res.status(200).send();
}));

export default userRoutes;
