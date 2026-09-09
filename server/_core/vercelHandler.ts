import type { IncomingMessage, ServerResponse } from "http";
import { buildApp } from "./app";

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
) {
  const app = await buildApp();
  app(req, res);
}
