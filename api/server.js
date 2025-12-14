import cors from "cors";
import express from "express";

import { logger } from "./logger.js";

const server = express();
server.use(cors());
server.use(express.json());

server.use((req, res, next) => {
  res.on("finish", () => {
    logger.info(`${req.method} ${req.url} ${res.statusCode}`);
  });
  next();
});

export default server;
