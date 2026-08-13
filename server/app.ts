import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

/** The Express app is exported for Vercel Functions; it deliberately never calls listen(). */
export function createApp() {
  const app = express();
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ limit: "8mb", extended: true }));
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  return app;
}

export default createApp();
